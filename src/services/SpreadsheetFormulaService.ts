import type {
    SpreadsheetCellOverride,
    SpreadsheetCellValue,
    SpreadsheetOriginalCell
} from "../models/SpreadsheetFormula";

type TokenType =
    "number"
    | "identifier"
    | "plus"
    | "minus"
    | "multiply"
    | "divide"
    | "left-parenthesis"
    | "right-parenthesis"
    | "comma"
    | "colon"
    | "end";

interface Token {

    type: TokenType;

    text: string;

}

type FormulaNode =
    | { type: "number"; value: number }
    | { type: "cell"; address: string }
    | { type: "range"; start: string; end: string }
    | {
        type: "binary";
        operator: "+" | "-" | "*" | "/";
        left: FormulaNode;
        right: FormulaNode;
    }
    | {
        type: "unary";
        operator: "+" | "-";
        operand: FormulaNode;
    }
    | {
        type: "function";
        name: "SUM" | "MIN" | "MAX" | "ROUND" | "COUNT";
        arguments: FormulaNode[];
    };

type EvaluatedValue =
    SpreadsheetCellValue
    | SpreadsheetCellValue[];

interface EvaluationContext {

    worksheetName: string;

    affected: Set<string>;

    visiting: Set<string>;

    memo: Map<string, number>;

    depth: number;

    referenceCount: number;

}

const maximumDepth = 100;
const maximumFormulaLength = 2_000;
const maximumReferenceCount = 10_000;

class SpreadsheetFormulaError extends Error {}

class FormulaParser {

    private position = 0;

    private nestingDepth = 0;

    private readonly tokens: Token[];

    public constructor(
        tokens: Token[]
    ) {
        this.tokens = tokens;
    }

    public parse(): FormulaNode {

        const result =
            this.parseAddition();

        if (this.current().type !== "end") {
            throw new SpreadsheetFormulaError("Nem támogatott képletszintaxis.");
        }

        return result;

    }

    private parseAddition(): FormulaNode {

        let left =
            this.parseMultiplication();

        while (
            this.current().type === "plus"
            || this.current().type === "minus"
        ) {
            const operator =
                this.consume().type === "plus" ? "+" : "-";

            left = {
                type: "binary",
                operator,
                left,
                right: this.parseMultiplication()
            };
        }

        return left;

    }

    private parseMultiplication(): FormulaNode {

        let left =
            this.parseUnary();

        while (
            this.current().type === "multiply"
            || this.current().type === "divide"
        ) {
            const operator =
                this.consume().type === "multiply" ? "*" : "/";

            left = {
                type: "binary",
                operator,
                left,
                right: this.parseUnary()
            };
        }

        return left;

    }

    private parseUnary(): FormulaNode {

        if (
            this.current().type === "plus"
            || this.current().type === "minus"
        ) {
            const operator =
                this.consume().type === "plus" ? "+" : "-";

            this.enterNesting();

            try {
                return {
                    type: "unary",
                    operator,
                    operand: this.parseUnary()
                };
            } finally {
                this.nestingDepth -= 1;
            }
        }

        return this.parsePrimary();

    }

    private parsePrimary(): FormulaNode {

        const token =
            this.current();

        if (token.type === "number") {
            this.consume();
            const value = Number(token.text);

            if (!Number.isFinite(value)) {
                throw new SpreadsheetFormulaError("Érvénytelen szám.");
            }

            return {
                type: "number",
                value
            };
        }

        if (token.type === "left-parenthesis") {
            this.consume();
            this.enterNesting();

            try {
                const expression = this.parseAddition();
                this.expect("right-parenthesis");
                return expression;
            } finally {
                this.nestingDepth -= 1;
            }
        }

        if (token.type !== "identifier") {
            throw new SpreadsheetFormulaError("Hiányzó képletkifejezés.");
        }

        this.consume();

        if (this.current().type === "left-parenthesis") {
            return this.parseFunction(token.text);
        }

        const start =
            normalizeCellAddress(token.text);

        if (this.current().type !== "colon") {
            return {
                type: "cell",
                address: start
            };
        }

        this.consume();
        const endToken = this.expect("identifier");

        return {
            type: "range",
            start,
            end: normalizeCellAddress(endToken.text)
        };

    }

    private parseFunction(functionName: string): FormulaNode {

        const name =
            functionName.toUpperCase();

        if (!isWhitelistedFunction(name)) {
            throw new SpreadsheetFormulaError("Nem támogatott függvény.");
        }

        this.expect("left-parenthesis");
        this.enterNesting();
        const args: FormulaNode[] = [];

        try {
            if (this.current().type !== "right-parenthesis") {
                args.push(this.parseAddition());

                while (this.current().type === "comma") {
                    this.consume();
                    args.push(this.parseAddition());
                }
            }

            this.expect("right-parenthesis");
        } finally {
            this.nestingDepth -= 1;
        }

        if (name === "ROUND" && args.length !== 2) {
            throw new SpreadsheetFormulaError("A ROUND két argumentumot vár.");
        }

        if (name !== "ROUND" && args.length === 0) {
            throw new SpreadsheetFormulaError("A függvény argumentumot vár.");
        }

        return {
            type: "function",
            name,
            arguments: args
        };

    }

    private current(): Token {

        return this.tokens[this.position];

    }

    private consume(): Token {

        const token =
            this.current();

        this.position += 1;
        return token;

    }

    private expect(type: TokenType): Token {

        if (this.current().type !== type) {
            throw new SpreadsheetFormulaError("Hibás képlet.");
        }

        return this.consume();

    }

    private enterNesting() {

        this.nestingDepth += 1;

        if (this.nestingDepth > maximumDepth) {
            throw new SpreadsheetFormulaError("Túl mély képlet.");
        }

    }

}

export class SpreadsheetFormulaService {

    private readonly originals =
        new Map<string, SpreadsheetCellValue>();

    private readonly overrides =
        new Map<string, SpreadsheetCellOverride>();

    private readonly compiled =
        new Map<string, FormulaNode>();

    private readonly dependencies =
        new Map<string, Set<string>>();

    private readonly reverseDependencies =
        new Map<string, Set<string>>();

    public constructor(
        originalCells: Iterable<SpreadsheetOriginalCell>
    ) {
        for (const cell of originalCells) {
            this.originals.set(
                createCellKey(
                    cell.worksheetName,
                    normalizeCellAddress(cell.cellAddress)
                ),
                cell.value
            );
        }
    }

    public setCellInput(
        worksheetName: string,
        cellAddress: string,
        input: string
    ): SpreadsheetCellOverride {

        const address =
            normalizeCellAddress(cellAddress);

        const key =
            createCellKey(worksheetName, address);

        const affected =
            this.collectDependents(key);

        this.removeFormula(key);

        const override: SpreadsheetCellOverride = {
            worksheetName,
            cellAddress: address,
            input
        };

        this.overrides.set(key, override);

        if (input.startsWith("=")) {
            try {
                const formula = parseFormula(input);
                const formulaDependencies =
                    collectDependencies(
                        worksheetName,
                        formula
                    );

                this.compiled.set(key, formula);
                this.dependencies.set(key, formulaDependencies);
                this.addReverseDependencies(key, formulaDependencies);
            } catch (error) {
                override.error = getFormulaErrorMessage(error);
            }
        } else {
            override.calculatedValue = parseInputValue(input);
        }

        this.collectDependents(key).forEach(dependent =>
            affected.add(dependent)
        );

        affected.add(key);
        this.recalculate(affected);

        return { ...override };

    }

    public resetCell(
        worksheetName: string,
        cellAddress: string
    ) {

        const key =
            createCellKey(
                worksheetName,
                normalizeCellAddress(cellAddress)
            );

        const affected =
            this.collectDependents(key);

        this.removeFormula(key);
        this.overrides.delete(key);
        affected.delete(key);
        this.recalculate(affected);

    }

    public getOverride(
        worksheetName: string,
        cellAddress: string
    ): SpreadsheetCellOverride | undefined {

        const override =
            this.overrides.get(
                createCellKey(
                    worksheetName,
                    normalizeCellAddress(cellAddress)
                )
            );

        return override
            ? { ...override }
            : undefined;

    }

    public getOverridesForWorksheet(
        worksheetName: string
    ): SpreadsheetCellOverride[] {

        return Array.from(this.overrides.values())
            .filter(override => override.worksheetName === worksheetName)
            .map(override => ({ ...override }));

    }

    private recalculate(
        affected: Set<string>
    ) {

        affected.forEach(key => {
            if (!this.compiled.has(key)) {
                return;
            }

            const override = this.overrides.get(key);

            if (!override) {
                return;
            }

            delete override.calculatedValue;
            delete override.error;

            try {
                override.calculatedValue = this.evaluateFormula(
                    key,
                    {
                        worksheetName: override.worksheetName,
                        affected,
                        visiting: new Set(),
                        memo: new Map(),
                        depth: 0,
                        referenceCount: 0
                    }
                );
            } catch (error) {
                override.error = getFormulaErrorMessage(error);
            }
        });

    }

    private evaluateFormula(
        key: string,
        context: EvaluationContext
    ): number {

        if (context.depth > maximumDepth) {
            throw new SpreadsheetFormulaError("Túl mély függőségi lánc.");
        }

        const memoized =
            context.memo.get(key);

        if (memoized !== undefined) {
            return memoized;
        }

        if (context.visiting.has(key)) {
            throw new SpreadsheetFormulaError("Ciklikus hivatkozás.");
        }

        const formula =
            this.compiled.get(key);

        if (!formula) {
            throw new SpreadsheetFormulaError("A képlet nem számolható.");
        }

        context.visiting.add(key);
        context.depth += 1;

        try {
            const value = toScalar(
                this.evaluateNode(formula, context)
            );

            if (!Number.isFinite(value)) {
                throw new SpreadsheetFormulaError("Nem véges képleteredmény.");
            }

            context.memo.set(key, value);
            return value;
        } finally {
            context.depth -= 1;
            context.visiting.delete(key);
        }

    }

    private evaluateNode(
        node: FormulaNode,
        context: EvaluationContext
    ): EvaluatedValue {

        if (context.depth > maximumDepth) {
            throw new SpreadsheetFormulaError("Túl mély képlet.");
        }

        switch (node.type) {
            case "number":
                return node.value;
            case "cell":
                return this.readCell(node.address, context);
            case "range":
                return this.readRange(node.start, node.end, context);
            case "unary": {
                context.depth += 1;

                try {
                    const value = toScalar(
                        this.evaluateNode(node.operand, context)
                    );

                    return node.operator === "-" ? -value : value;
                } finally {
                    context.depth -= 1;
                }
            }
            case "binary":
                return this.evaluateBinary(node, context);
            case "function":
                return this.evaluateFunction(node, context);
        }

    }

    private evaluateBinary(
        node: Extract<FormulaNode, { type: "binary" }>,
        context: EvaluationContext
    ): number {

        context.depth += 1;

        try {
            const left = toScalar(this.evaluateNode(node.left, context));
            const right = toScalar(this.evaluateNode(node.right, context));

            if (node.operator === "+") {
                return left + right;
            }

            if (node.operator === "-") {
                return left - right;
            }

            if (node.operator === "*") {
                return left * right;
            }

            if (right === 0) {
                throw new SpreadsheetFormulaError("Nullával osztás.");
            }

            return left / right;
        } finally {
            context.depth -= 1;
        }

    }

    private evaluateFunction(
        node: Extract<FormulaNode, { type: "function" }>,
        context: EvaluationContext
    ): number {

        context.depth += 1;

        try {
            if (node.name === "ROUND") {
                const value = toScalar(
                    this.evaluateNode(node.arguments[0], context)
                );

                const digits = toScalar(
                    this.evaluateNode(node.arguments[1], context)
                );

                if (!Number.isInteger(digits) || Math.abs(digits) > 15) {
                    throw new SpreadsheetFormulaError("Érvénytelen ROUND pontosság.");
                }

                const factor = 10 ** digits;

                return Math.sign(value)
                    * Math.round((Math.abs(value) + Number.EPSILON) * factor)
                    / factor;
            }

            const values =
                node.arguments.flatMap(argument => {
                    const value = this.evaluateNode(argument, context);
                    return Array.isArray(value) ? value : [value];
                });

            const numbers =
                values.filter(isFiniteNumber);

            if (node.name === "COUNT") {
                return numbers.length;
            }

            if (node.name === "SUM") {
                return numbers.reduce((sum, value) => sum + value, 0);
            }

            if (numbers.length === 0) {
                throw new SpreadsheetFormulaError("Nincs numerikus argumentum.");
            }

            return node.name === "MIN"
                ? Math.min(...numbers)
                : Math.max(...numbers);
        } finally {
            context.depth -= 1;
        }

    }

    private readCell(
        address: string,
        context: EvaluationContext
    ): SpreadsheetCellValue {

        this.incrementReferences(context, 1);
        const key = createCellKey(context.worksheetName, address);
        const override = this.overrides.get(key);

        if (override) {
            if (this.compiled.has(key)) {
                if (context.affected.has(key)) {
                    return this.evaluateFormula(key, context);
                }

                if (
                    !override.error
                    && isFiniteNumber(override.calculatedValue)
                ) {
                    return override.calculatedValue;
                }
            } else if (
                !override.error
                && override.calculatedValue !== undefined
            ) {
                return override.calculatedValue;
            }
        }

        return this.originals.get(key) ?? null;

    }

    private readRange(
        start: string,
        end: string,
        context: EvaluationContext
    ): SpreadsheetCellValue[] {

        const addresses =
            expandRange(start, end);

        this.incrementReferences(context, addresses.length);

        return addresses.map(address => {
            const previousCount = context.referenceCount;
            const value = this.readCell(address, context);
            context.referenceCount = previousCount;
            return value;
        });

    }

    private incrementReferences(
        context: EvaluationContext,
        amount: number
    ) {

        context.referenceCount += amount;

        if (context.referenceCount > maximumReferenceCount) {
            throw new SpreadsheetFormulaError("Túl sok cellahivatkozás.");
        }

    }

    private collectDependents(
        key: string
    ): Set<string> {

        const result = new Set<string>();
        const queue = [key];

        while (queue.length > 0) {
            const current = queue.shift() as string;

            this.reverseDependencies.get(current)?.forEach(dependent => {
                if (!result.has(dependent)) {
                    result.add(dependent);
                    queue.push(dependent);
                }
            });
        }

        return result;

    }

    private addReverseDependencies(
        key: string,
        dependencies: Set<string>
    ) {

        dependencies.forEach(dependency => {
            const dependents =
                this.reverseDependencies.get(dependency) ?? new Set();

            dependents.add(key);
            this.reverseDependencies.set(dependency, dependents);
        });

    }

    private removeFormula(
        key: string
    ) {

        this.dependencies.get(key)?.forEach(dependency => {
            const dependents =
                this.reverseDependencies.get(dependency);

            dependents?.delete(key);

            if (dependents?.size === 0) {
                this.reverseDependencies.delete(dependency);
            }
        });

        this.dependencies.delete(key);
        this.compiled.delete(key);

    }

}

function tokenize(input: string): Token[] {

    const source =
        input.startsWith("=") ? input.slice(1) : input;

    if (source.length > maximumFormulaLength) {
        throw new SpreadsheetFormulaError("Túl hosszú képlet.");
    }

    const tokens: Token[] = [];
    let position = 0;

    while (position < source.length) {
        const character = source[position];

        if (/\s/.test(character)) {
            position += 1;
            continue;
        }

        if (/\d/.test(character) || character === ".") {
            const start = position;
            let hasDecimalPoint = false;

            while (position < source.length) {
                const current = source[position];

                if (current === "." && !hasDecimalPoint) {
                    hasDecimalPoint = true;
                    position += 1;
                } else if (/\d/.test(current)) {
                    position += 1;
                } else {
                    break;
                }
            }

            tokens.push({
                type: "number",
                text: source.slice(start, position)
            });
            continue;
        }

        if (/[A-Za-z_$]/.test(character)) {
            const start = position;

            while (
                position < source.length
                && /[A-Za-z0-9_$]/.test(source[position])
            ) {
                position += 1;
            }

            tokens.push({
                type: "identifier",
                text: source.slice(start, position)
            });
            continue;
        }

        const tokenType =
            ({
                "+": "plus",
                "-": "minus",
                "*": "multiply",
                "/": "divide",
                "(": "left-parenthesis",
                ")": "right-parenthesis",
                ",": "comma",
                ":": "colon"
            } as Record<string, TokenType>)[character];

        if (!tokenType) {
            throw new SpreadsheetFormulaError("Nem támogatott képlet.");
        }

        tokens.push({
            type: tokenType,
            text: character
        });
        position += 1;
    }

    tokens.push({
        type: "end",
        text: ""
    });

    return tokens;

}

function parseFormula(input: string): FormulaNode {

    return new FormulaParser(tokenize(input)).parse();

}

function collectDependencies(
    worksheetName: string,
    node: FormulaNode,
    result = new Set<string>()
): Set<string> {

    switch (node.type) {
        case "cell":
            result.add(createCellKey(worksheetName, node.address));
            break;
        case "range":
            expandRange(node.start, node.end).forEach(address =>
                result.add(createCellKey(worksheetName, address))
            );
            break;
        case "unary":
            collectDependencies(worksheetName, node.operand, result);
            break;
        case "binary":
            collectDependencies(worksheetName, node.left, result);
            collectDependencies(worksheetName, node.right, result);
            break;
        case "function":
            node.arguments.forEach(argument =>
                collectDependencies(worksheetName, argument, result)
            );
            break;
    }

    return result;

}

function isWhitelistedFunction(
    name: string
): name is "SUM" | "MIN" | "MAX" | "ROUND" | "COUNT" {

    return ["SUM", "MIN", "MAX", "ROUND", "COUNT"].includes(name);

}

function normalizeCellAddress(
    address: string
): string {

    const normalized =
        address.replace(/\$/g, "").toUpperCase();

    if (!/^[A-Z]{1,3}[1-9]\d*$/.test(normalized)) {
        throw new SpreadsheetFormulaError("Érvénytelen cellahivatkozás.");
    }

    return normalized;

}

function expandRange(
    start: string,
    end: string
): string[] {

    const startPosition = decodeCellAddress(start);
    const endPosition = decodeCellAddress(end);
    const firstRow = Math.min(startPosition.row, endPosition.row);
    const lastRow = Math.max(startPosition.row, endPosition.row);
    const firstColumn = Math.min(startPosition.column, endPosition.column);
    const lastColumn = Math.max(startPosition.column, endPosition.column);
    const size =
        (lastRow - firstRow + 1)
        * (lastColumn - firstColumn + 1);

    if (size > maximumReferenceCount) {
        throw new SpreadsheetFormulaError("Túl nagy cellatartomány.");
    }

    const addresses: string[] = [];

    for (let row = firstRow; row <= lastRow; row += 1) {
        for (let column = firstColumn; column <= lastColumn; column += 1) {
            addresses.push(encodeCellAddress(row, column));
        }
    }

    return addresses;

}

function decodeCellAddress(
    address: string
): { row: number; column: number } {

    const match = /^([A-Z]{1,3})([1-9]\d*)$/.exec(address);

    if (!match) {
        throw new SpreadsheetFormulaError("Érvénytelen cellahivatkozás.");
    }

    let column = 0;

    for (const character of match[1]) {
        column = column * 26 + character.charCodeAt(0) - 64;
    }

    return {
        row: Number(match[2]) - 1,
        column: column - 1
    };

}

function encodeCellAddress(
    row: number,
    column: number
): string {

    let value = column + 1;
    let letters = "";

    while (value > 0) {
        const remainder = (value - 1) % 26;
        letters = String.fromCharCode(65 + remainder) + letters;
        value = Math.floor((value - 1) / 26);
    }

    return `${letters}${row + 1}`;

}

function toScalar(
    value: EvaluatedValue
): number {

    if (Array.isArray(value)) {
        throw new SpreadsheetFormulaError("A tartomány itt nem használható.");
    }

    if (value === null || value === "") {
        return 0;
    }

    if (!isFiniteNumber(value)) {
        throw new SpreadsheetFormulaError("Nem numerikus cellahivatkozás.");
    }

    return value;

}

function isFiniteNumber(
    value: unknown
): value is number {

    return typeof value === "number" && Number.isFinite(value);

}

function parseInputValue(
    input: string
): string | number {

    const normalized =
        input.trim().replace(",", ".");

    if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
        const value = Number(normalized);

        if (Number.isFinite(value)) {
            return value;
        }
    }

    return input;

}

function createCellKey(
    worksheetName: string,
    cellAddress: string
): string {

    return `${worksheetName}\u0000${cellAddress}`;

}

function getFormulaErrorMessage(
    error: unknown
): string {

    return error instanceof SpreadsheetFormulaError
        ? error.message
        : "A képlet nem számolható.";

}
