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
    | "separator"
    | "colon"
    | "string"
    | "equal"
    | "not-equal"
    | "less-than"
    | "less-than-or-equal"
    | "greater-than"
    | "greater-than-or-equal"
    | "end";

interface Token {

    type: TokenType;

    text: string;

}

type FormulaNode =
    | { type: "number"; value: number }
    | { type: "string"; value: string }
    | { type: "boolean"; value: boolean }
    | { type: "cell"; address: string }
    | { type: "range"; start: string; end: string }
    | {
        type: "binary";
        operator: "+" | "-" | "*" | "/";
        left: FormulaNode;
        right: FormulaNode;
    }
    | {
        type: "comparison";
        operator: "=" | "<>" | "<" | "<=" | ">" | ">=";
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
        name: FormulaFunctionName;
        arguments: FormulaNode[];
    };

type FormulaFunctionName =
    "SUM"
    | "MIN"
    | "MAX"
    | "ROUND"
    | "COUNT"
    | "VLOOKUP"
    | "IF";

type EvaluatedValue =
    SpreadsheetCellValue
    | SpreadsheetCellValue[];

interface EvaluationContext {

    worksheetName: string;

    affected: Set<string>;

    visiting: Set<string>;

    memo: Map<string, SpreadsheetCellValue>;

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

    private argumentSeparator: string | undefined;

    private readonly tokens: Token[];

    public constructor(
        tokens: Token[]
    ) {
        this.tokens = tokens;
    }

    public parse(): FormulaNode {

        const result =
            this.parseComparison();

        if (this.current().type !== "end") {
            throw new SpreadsheetFormulaError("Nem támogatott képletszintaxis.");
        }

        return result;

    }

    private parseComparison(): FormulaNode {

        let left = this.parseAddition();
        const comparisonTypes: TokenType[] = [
            "equal",
            "not-equal",
            "less-than",
            "less-than-or-equal",
            "greater-than",
            "greater-than-or-equal"
        ];

        if (comparisonTypes.includes(this.current().type)) {
            const operator = this.consume().text as
                "=" | "<>" | "<" | "<=" | ">" | ">=";

            left = {
                type: "comparison",
                operator,
                left,
                right: this.parseAddition()
            };
        }

        return left;

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

        if (token.type === "string") {
            this.consume();
            return {
                type: "string",
                value: token.text
            };
        }

        if (token.type === "left-parenthesis") {
            this.consume();
            this.enterNesting();

            try {
                const expression = this.parseComparison();
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

        const booleanValue = parseBooleanLiteral(token.text);

        if (
            booleanValue !== undefined
            && this.current().type !== "left-parenthesis"
        ) {
            return {
                type: "boolean",
                value: booleanValue
            };
        }

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

        const name = normalizeFunctionName(functionName);

        if (!name) {
            throw new SpreadsheetFormulaError("Nem támogatott függvény.");
        }

        this.expect("left-parenthesis");
        this.enterNesting();
        const args: FormulaNode[] = [];

        try {
            if (this.current().type !== "right-parenthesis") {
                args.push(this.parseComparison());

                while (this.current().type === "separator") {
                    const separator = this.consume().text;

                    if (
                        this.argumentSeparator
                        && this.argumentSeparator !== separator
                    ) {
                        throw new SpreadsheetFormulaError(
                            "A képlet argumentumelválasztói nem keverhetők."
                        );
                    }

                    this.argumentSeparator = separator;
                    args.push(this.parseComparison());
                }
            }

            this.expect("right-parenthesis");
        } finally {
            this.nestingDepth -= 1;
        }

        if (name === "ROUND" && args.length !== 2) {
            throw new SpreadsheetFormulaError("A ROUND két argumentumot vár.");
        }

        if (name === "IF" && args.length !== 3) {
            throw new SpreadsheetFormulaError("A HA/IF három argumentumot vár.");
        }

        if (
            name === "VLOOKUP"
            && (args.length < 3 || args.length > 4)
        ) {
            throw new SpreadsheetFormulaError(
                "Az FKERES/VLOOKUP három vagy négy argumentumot vár."
            );
        }

        if (
            name !== "ROUND"
            && name !== "IF"
            && name !== "VLOOKUP"
            && args.length === 0
        ) {
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
    ): SpreadsheetCellValue {

        if (context.depth > maximumDepth) {
            throw new SpreadsheetFormulaError("Túl mély függőségi lánc.");
        }

        if (context.memo.has(key)) {
            return context.memo.get(key) as SpreadsheetCellValue;
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
            const value = toFormulaValue(
                this.evaluateNode(formula, context)
            );

            if (typeof value === "number" && !Number.isFinite(value)) {
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
            case "string":
            case "boolean":
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
            case "comparison":
                return this.evaluateComparison(node, context);
            case "function":
                return this.evaluateFunction(node, context);
        }

    }

    private evaluateComparison(
        node: Extract<FormulaNode, { type: "comparison" }>,
        context: EvaluationContext
    ): boolean {

        context.depth += 1;

        try {
            const left = toFormulaValue(
                this.evaluateNode(node.left, context)
            );
            const right = toFormulaValue(
                this.evaluateNode(node.right, context)
            );

            if (node.operator === "=") {
                return valuesEqual(left, right);
            }

            if (node.operator === "<>") {
                return !valuesEqual(left, right);
            }

            const comparison = compareValues(left, right);

            if (node.operator === "<") {
                return comparison < 0;
            }

            if (node.operator === "<=") {
                return comparison <= 0;
            }

            if (node.operator === ">") {
                return comparison > 0;
            }

            return comparison >= 0;
        } finally {
            context.depth -= 1;
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
    ): SpreadsheetCellValue {

        context.depth += 1;

        try {
            if (node.name === "IF") {
                const condition = toBoolean(
                    toFormulaValue(
                        this.evaluateNode(node.arguments[0], context)
                    )
                );

                return toFormulaValue(
                    this.evaluateNode(
                        node.arguments[condition ? 1 : 2],
                        context
                    )
                );
            }

            if (node.name === "VLOOKUP") {
                return this.evaluateVlookup(node.arguments, context);
            }

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

    private evaluateVlookup(
        args: FormulaNode[],
        context: EvaluationContext
    ): SpreadsheetCellValue {

        const range = args[1];

        if (range.type !== "range") {
            throw new SpreadsheetFormulaError(
                "Az FKERES/VLOOKUP táblatartománya érvénytelen."
            );
        }

        const start = decodeCellAddress(range.start);
        const end = decodeCellAddress(range.end);

        validateForwardRange(start, end);

        const columnIndex = toScalar(
            this.evaluateNode(args[2], context)
        );
        const width = end.column - start.column + 1;

        if (
            !Number.isInteger(columnIndex)
            || columnIndex < 1
            || columnIndex > width
        ) {
            throw new SpreadsheetFormulaError(
                "Az FKERES/VLOOKUP oszlopindexe kívül esik a tartományon."
            );
        }

        const lookupValue = toFormulaValue(
            this.evaluateNode(args[0], context)
        );
        const approximate = args.length === 3
            ? true
            : parseLookupMode(
                toFormulaValue(this.evaluateNode(args[3], context))
            );
        let matchingRow: number | undefined;

        for (let row = start.row; row <= end.row; row += 1) {
            const candidate = this.readCell(
                encodeCellAddress(row, start.column),
                context
            );

            if (valuesEqual(candidate, lookupValue)) {
                matchingRow = row;
                break;
            }

            if (candidate === null || candidate === "") {
                continue;
            }

            if (
                approximate
                && compareValues(candidate, lookupValue) <= 0
            ) {
                matchingRow = row;
            }
        }

        if (matchingRow === undefined) {
            throw new SpreadsheetFormulaError(
                "Az FKERES/VLOOKUP nem talált egyező értéket."
            );
        }

        return this.readCell(
            encodeCellAddress(
                matchingRow,
                start.column + columnIndex - 1
            ),
            context
        );

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
                    && override.calculatedValue !== undefined
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

        if (character === '"') {
            position += 1;
            let value = "";
            let closed = false;

            while (position < source.length) {
                if (source[position] !== '"') {
                    value += source[position];
                    position += 1;
                    continue;
                }

                if (source[position + 1] === '"') {
                    value += '"';
                    position += 2;
                    continue;
                }

                position += 1;
                closed = true;
                break;
            }

            if (!closed) {
                throw new SpreadsheetFormulaError("Lezáratlan szöveg.");
            }

            tokens.push({
                type: "string",
                text: value
            });
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

        if (/[\p{L}_$]/u.test(character)) {
            const start = position;

            while (
                position < source.length
                && /[\p{L}0-9_$]/u.test(source[position])
            ) {
                position += 1;
            }

            tokens.push({
                type: "identifier",
                text: source.slice(start, position)
            });
            continue;
        }

        const comparison =
            source.slice(position, position + 2);
        const comparisonType =
            ({
                "<>": "not-equal",
                "<=": "less-than-or-equal",
                ">=": "greater-than-or-equal"
            } as Record<string, TokenType>)[comparison];

        if (comparisonType) {
            tokens.push({
                type: comparisonType,
                text: comparison
            });
            position += 2;
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
                ",": "separator",
                ";": "separator",
                ":": "colon",
                "=": "equal",
                "<": "less-than",
                ">": "greater-than"
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
        case "comparison":
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

function normalizeFunctionName(
    name: string
): FormulaFunctionName | undefined {

    return ({
        SUM: "SUM",
        SZUM: "SUM",
        MIN: "MIN",
        MAX: "MAX",
        ROUND: "ROUND",
        KEREKÍTÉS: "ROUND",
        KEREKITES: "ROUND",
        COUNT: "COUNT",
        DARAB: "COUNT",
        VLOOKUP: "VLOOKUP",
        FKERES: "VLOOKUP",
        IF: "IF",
        HA: "IF"
    } as Record<string, FormulaFunctionName>)[name.toLocaleUpperCase("hu-HU")];

}

function parseBooleanLiteral(
    value: string
): boolean | undefined {

    const normalized = value.toUpperCase();

    if (normalized === "TRUE" || normalized === "IGAZ") {
        return true;
    }

    if (normalized === "FALSE" || normalized === "HAMIS") {
        return false;
    }

    return undefined;

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
    validateForwardRange(startPosition, endPosition);
    const firstRow = startPosition.row;
    const lastRow = endPosition.row;
    const firstColumn = startPosition.column;
    const lastColumn = endPosition.column;
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

function validateForwardRange(
    start: { row: number; column: number },
    end: { row: number; column: number }
) {

    if (start.row > end.row || start.column > end.column) {
        throw new SpreadsheetFormulaError("Fordított cellatartomány.");
    }

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

function toFormulaValue(
    value: EvaluatedValue
): SpreadsheetCellValue {

    if (Array.isArray(value)) {
        throw new SpreadsheetFormulaError("A tartomány itt nem használható.");
    }

    return value;

}

function toBoolean(
    value: SpreadsheetCellValue
): boolean {

    if (typeof value === "boolean") {
        return value;
    }

    if (isFiniteNumber(value)) {
        return value !== 0;
    }

    throw new SpreadsheetFormulaError("A HA/IF feltétele nem logikai érték.");

}

function parseLookupMode(
    value: SpreadsheetCellValue
): boolean {

    if (typeof value === "boolean") {
        return value;
    }

    if (value === 0) {
        return false;
    }

    if (value === 1) {
        return true;
    }

    throw new SpreadsheetFormulaError(
        "Az FKERES/VLOOKUP egyezési módja csak 0/FALSE vagy 1/TRUE lehet."
    );

}

function valuesEqual(
    left: SpreadsheetCellValue,
    right: SpreadsheetCellValue
): boolean {

    if (
        (left === null || left === "")
        && (right === null || right === "")
    ) {
        return true;
    }

    if (typeof left === "string" && typeof right === "string") {
        return left.toLocaleUpperCase("hu-HU")
            === right.toLocaleUpperCase("hu-HU");
    }

    return left === right;

}

function compareValues(
    left: SpreadsheetCellValue,
    right: SpreadsheetCellValue
): number {

    if (isFiniteNumber(left) && isFiniteNumber(right)) {
        return left - right;
    }

    if (typeof left === "string" && typeof right === "string") {
        return left.localeCompare(right, "hu-HU", {
            sensitivity: "base"
        });
    }

    if (typeof left === "boolean" && typeof right === "boolean") {
        return Number(left) - Number(right);
    }

    throw new SpreadsheetFormulaError("Nem összehasonlítható értékek.");

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
