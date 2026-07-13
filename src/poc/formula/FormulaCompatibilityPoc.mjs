import {
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    writeFileSync
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

import { DetailedCellError, HyperFormula } from "hyperformula";
import * as XLSX from "xlsx";

const numericTolerance = 1e-9;

const pocDirectory =
    dirname(fileURLToPath(import.meta.url));

const outputPath =
    resolve(pocDirectory, "output/formula-validation-report.json");

const localWorkbookDirectory = resolve("datatable");

function setFormula(worksheet, address, formula, cachedValue, options = {}) {

    const cell = {
        f: formula,
        t: options.type
            ?? (typeof cachedValue === "number" ? "n" : "s")
    };

    if (options.hasCachedValue !== false) {
        cell.v = cachedValue;
    } else {
        cell.v = "";
        cell.t = "s";
    }

    if (options.format) {
        cell.z = options.format;
    }

    worksheet[address] = cell;

}

function createCoreWorkbook() {

    const workbook = XLSX.utils.book_new();
    const data = XLSX.utils.aoa_to_sheet([
        ["Kod", "Ertek", "Csoport", "Megjegyzes"],
        ["A", 10.1, "X", "elso"],
        ["B", 20.2, "Y", "masodik"],
        ["C", 30.3, "X", "harmadik"],
        ["D", null, "X", ""]
    ]);

    const summary = XLSX.utils.aoa_to_sheet([
        ["Teszt", "Eredmeny"],
        ["SUM", null],
        ["COUNT", null],
        ["COUNTA", null],
        ["SUMIF", null],
        ["COUNTIF", null],
        ["ROUND", null],
        ["MIN", null],
        ["MAX", null],
        ["IF", null],
        ["Szoveg", null],
        ["Datum", null],
        ["Azonos lap", null],
        ["Hianyzo cache", null]
    ]);

    setFormula(summary, "B2", "SUM(Adatok!B2:B5)", 60.6);
    setFormula(summary, "B3", "COUNT(Adatok!B2:B5)", 3);
    setFormula(summary, "B4", "COUNTA(Adatok!D2:D5)", 3);
    setFormula(
        summary,
        "B5",
        'SUMIF(Adatok!C2:C5,"X",Adatok!B2:B5)',
        40.4
    );
    setFormula(summary, "B6", 'COUNTIF(Adatok!C2:C5,"X")', 3);
    setFormula(summary, "B7", "ROUND(B2,1)", 60.6);
    setFormula(summary, "B8", "MIN(Adatok!B2:B5)", 10.1);
    setFormula(summary, "B9", "MAX(Adatok!B2:B5)", 30.3);
    setFormula(summary, "B10", 'IF(B3=3,"OK","HIBAS")', "OK");
    setFormula(summary, "B11", 'Adatok!A2&"-"&Adatok!D2', "A-elso");
    setFormula(
        summary,
        "B12",
        "DATE(2026,1,1)+1",
        excelDateSerial(2026, 1, 2),
        { format: "yyyy-mm-dd" }
    );
    setFormula(summary, "B13", "B2+$B$3", 63.6);
    setFormula(
        summary,
        "B14",
        "Adatok!B2*2",
        undefined,
        { hasCachedValue: false }
    );

    XLSX.utils.book_append_sheet(workbook, data, "Adatok");
    XLSX.utils.book_append_sheet(workbook, summary, "Osszesites");

    return workbook;

}

function createVlookupWorkbook() {

    const workbook = XLSX.utils.book_new();
    const lookup = XLSX.utils.aoa_to_sheet([
        ["Kulcs", "Ertek"],
        [1, "A"],
        [2, "B"],
        [3, "C"],
        [5, "E"]
    ]);

    const tests = XLSX.utils.aoa_to_sheet([
        ["Alak", "Eredmeny"],
        ["Exact 0", null],
        ["Exact FALSE", null],
        ["Approximate 1", null],
        ["Approximate TRUE", null],
        ["Negyedik argumentum nelkul", null],
        ["Masik lap abszolut tartomany", null],
        ["Nem talalhato", null]
    ]);

    setFormula(tests, "B2", "VLOOKUP(2,Lookup!$A$2:$B$5,2,0)", "B");
    setFormula(tests, "B3", "VLOOKUP(2,Lookup!$A$2:$B$5,2,FALSE)", "B");
    setFormula(tests, "B4", "VLOOKUP(4,Lookup!$A$2:$B$5,2,1)", "C");
    setFormula(tests, "B5", "VLOOKUP(4,Lookup!$A$2:$B$5,2,TRUE)", "C");
    setFormula(tests, "B6", "VLOOKUP(4,Lookup!$A$2:$B$5,2)", "C");
    setFormula(tests, "B7", "VLOOKUP(5,Lookup!$A$2:$B$5,2,0)", "E");
    setFormula(
        tests,
        "B8",
        "VLOOKUP(9,Lookup!$A$2:$B$5,2,0)",
        42,
        { type: "e" }
    );

    XLSX.utils.book_append_sheet(workbook, lookup, "Lookup");
    XLSX.utils.book_append_sheet(workbook, tests, "VlookupTeszt");

    return workbook;

}

function createFallbackWorkbook() {

    const workbook = XLSX.utils.book_new();
    const dataRows = [["Azonosito", "Ertek"]];

    for (let row = 1; row <= 1000; row += 1) {
        dataRows.push([row, row % 10]);
    }

    const data = XLSX.utils.aoa_to_sheet(dataRows);
    const tests = XLSX.utils.aoa_to_sheet([
        ["Teszt", "Eredmeny"],
        ["Teljes oszlop", null],
        ["Nagy tartomany", null],
        ["Excel hibakod", null],
        ["Hibas keplet", null],
        ["Nem tamogatott", null],
        ["Elavult cache", null],
        ["Floating point tolerancia", null],
        ["Kulso workbook", null]
    ]);

    setFormula(tests, "B2", "SUM(Adatok!B:B)", 4500);
    setFormula(tests, "B3", "SUM(Adatok!B2:B10001)", 4500);
    setFormula(tests, "B4", "NA()", 42, { type: "e" });
    setFormula(tests, "B5", "SUM(", 777);
    setFormula(tests, "B6", "NOT_A_REAL_FUNCTION(1)", 888);
    setFormula(tests, "B7", "SUM(Adatok!B2:B11)", 999);
    setFormula(tests, "B8", "0.1+0.2", 0.3000000001);
    setFormula(tests, "B9", "[external.xlsx]Lap1!A1", 123);

    XLSX.utils.book_append_sheet(workbook, data, "Adatok");
    XLSX.utils.book_append_sheet(workbook, tests, "FallbackTeszt");

    return workbook;

}

function excelDateSerial(year, month, day) {

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const epoch = Date.UTC(1899, 11, 30);

    return (Date.UTC(year, month - 1, day) - epoch) / millisecondsPerDay;

}

function serializeWorkbook(workbook) {

    return XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
        compression: true
    });

}

function buildInputs() {

    const inputs = [
        {
            id: "synthetic-core",
            kind: "synthetic",
            buffer: serializeWorkbook(createCoreWorkbook()),
            missingCacheCells: new Set(["Osszesites!B14"])
        },
        {
            id: "synthetic-vlookup",
            kind: "synthetic",
            buffer: serializeWorkbook(createVlookupWorkbook())
        },
        {
            id: "synthetic-fallback",
            kind: "synthetic",
            buffer: serializeWorkbook(createFallbackWorkbook())
        }
    ];

    discoverLocalWorkbooks().forEach((path, index) => {
        inputs.push({
            id: `local-${String(index + 1).padStart(2, "0")}`,
            kind: "local-anonymized",
            buffer: readFileSync(path)
        });
    });

    return inputs;

}

function discoverLocalWorkbooks() {

    if (!existsSync(localWorkbookDirectory)) {
        return [];
    }

    return readdirSync(localWorkbookDirectory, { withFileTypes: true })
        .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith(".xlsx"))
        .map(entry => join(localWorkbookDirectory, entry.name))
        .slice(0, 2);

}

function evaluateWorkbook(input) {

    const memoryBefore = process.memoryUsage().rss;
    const totalStarted = performance.now();
    const parseStarted = performance.now();
    const workbook = XLSX.read(input.buffer, {
        type: "buffer",
        cellFormula: true,
        cellNF: true,
        cellText: true
    });
    const parseMs = performance.now() - parseStarted;
    const sheetAliases = createSheetAliases(workbook, input.kind);
    const engineStarted = performance.now();
    const engine = HyperFormula.buildFromSheets(
        buildEngineSheets(workbook),
        { licenseKey: "gpl-v3" }
    );
    const engineBuildMs = performance.now() - engineStarted;
    const readStarted = performance.now();
    const cells = readFormulaCells(
        workbook,
        engine,
        sheetAliases,
        input.missingCacheCells ?? new Set()
    );
    const resultReadMs = performance.now() - readStarted;
    const memoryAfter = process.memoryUsage().rss;

    const result = {
        id: input.id,
        kind: input.kind,
        fileBytes: input.buffer.byteLength,
        sheetCount: workbook.SheetNames.length,
        usedCellCount: countUsedCells(workbook),
        formulaCount: cells.length,
        engineSuccessfulFormulaCount:
            cells.filter(cell => cell.engineSucceeded).length,
        vlookupSyntaxCounts: countBy(
            cells.filter(cell => cell.vlookupSyntax),
            cell => cell.vlookupSyntax
        ),
        statusCounts: countBy(cells, cell => cell.status),
        inventory: buildInventory(cells),
        fallbacks: evaluateFallbacks(cells),
        sampleIssues: cells
            .filter(cell => cell.status !== "MATCH")
            .slice(0, 50)
            .map(cell => ({
                sheet: cell.sheet,
                cell: cell.cell,
                status: cell.status,
                errorType: cell.errorType
            })),
        timings: {
            parseMs,
            engineBuildMs,
            resultReadMs,
            totalMs: performance.now() - totalStarted
        },
        approximateRssDeltaBytes: Math.max(0, memoryAfter - memoryBefore)
    };

    engine.destroy();

    return result;

}

function createSheetAliases(workbook, kind) {

    return new Map(
        workbook.SheetNames.map((sheetName, index) => [
            sheetName,
            kind === "local-anonymized"
                ? `sheet-${String(index + 1).padStart(2, "0")}`
                : sheetName
        ])
    );

}

function buildEngineSheets(workbook) {

    return Object.fromEntries(
        workbook.SheetNames.map(sheetName => {
            const worksheet = workbook.Sheets[sheetName];

            if (!worksheet?.["!ref"]) {
                return [sheetName, []];
            }

            const range = XLSX.utils.decode_range(worksheet["!ref"]);
            const rows = [];

            for (let row = 0; row <= range.e.r; row += 1) {
                const values = [];

                for (let column = 0; column <= range.e.c; column += 1) {
                    const address = XLSX.utils.encode_cell({ r: row, c: column });
                    values.push(toEngineValue(worksheet[address]));
                }

                rows.push(values);
            }

            return [sheetName, rows];
        })
    );

}

function toEngineValue(cell) {

    if (!cell) {
        return null;
    }

    if (typeof cell.f === "string") {
        return `=${cell.f}`;
    }

    return ["string", "number", "boolean"].includes(typeof cell.v)
        ? cell.v
        : null;

}

function readFormulaCells(workbook, engine, sheetAliases, missingCacheCells) {

    const cells = [];

    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet?.["!ref"]) {
            return;
        }

        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        const sheetId = engine.getSheetId(sheetName);

        for (let row = range.s.r; row <= range.e.r; row += 1) {
            for (let column = range.s.c; column <= range.e.c; column += 1) {
                const address = XLSX.utils.encode_cell({ r: row, c: column });
                const cell = worksheet[address];

                if (!cell || typeof cell.f !== "string") {
                    continue;
                }

                const calculated = engine.getCellValue({
                    sheet: sheetId,
                    row,
                    col: column
                });

                cells.push(compareFormulaCell(
                    cell,
                    calculated,
                    sheetAliases.get(sheetName),
                    address,
                    missingCacheCells.has(`${sheetName}!${address}`)
                ));
            }
        }
    });

    return cells;

}

function compareFormulaCell(cell, calculated, sheet, address, forcedMissingCache) {

    const functions = extractFunctions(cell.f);
    const ignored = isIgnoredFormula(cell.f);
    const hasCachedValue = !forcedMissingCache
        && Object.hasOwn(cell, "v")
        && cell.v !== undefined
        && cell.v !== null;
    const cached = readCachedValue(cell);
    const engineError = calculated instanceof DetailedCellError;
    const errorType = engineError ? calculated.type : null;
    const engineValue = engineError ? calculated.value : calculated;
    const unsupported = engineError
        && calculated.type === "NAME"
        && calculated.message.startsWith("Function name ");

    let status;

    if (ignored) {
        status = "IGNORED";
    } else if (engineError && hasCachedValue && valuesEqual(cached, engineValue)) {
        status = "MATCH";
    } else if (unsupported) {
        status = "UNSUPPORTED";
    } else if (engineError) {
        status = "ENGINE_ERROR";
    } else if (!hasCachedValue) {
        status = "NO_CACHED_VALUE";
    } else if (valuesEqual(cached, engineValue)) {
        status = "MATCH";
    } else {
        status = "MISMATCH";
    }

    return {
        sheet,
        cell: address,
        functions: functions.length > 0 ? functions : ["OPERATOR_ONLY"],
        vlookupSyntax: readVlookupSyntax(cell.f),
        status,
        hasCachedValue,
        engineSucceeded: !engineError,
        supported: !unsupported && !ignored,
        errorType
    };

}

function readVlookupSyntax(formula) {

    const upperFormula = formula.toUpperCase();
    const functionStart = upperFormula.indexOf("VLOOKUP(");

    if (functionStart < 0) {
        return null;
    }

    const argumentsText = readFunctionArguments(
        formula,
        functionStart + "VLOOKUP".length
    );

    if (argumentsText === null) {
        return "OTHER";
    }

    const args = splitTopLevelArguments(argumentsText);

    if (args.length < 4) {
        return "OMITTED";
    }

    const mode = args[3].trim().toUpperCase();

    return {
        "0": "EXACT_0",
        "FALSE": "EXACT_FALSE",
        "1": "APPROXIMATE_1",
        "TRUE": "APPROXIMATE_TRUE"
    }[mode] ?? "OTHER";

}

function readFunctionArguments(formula, openingParenthesisIndex) {

    let depth = 0;
    let quoted = false;

    for (let index = openingParenthesisIndex; index < formula.length; index += 1) {
        const character = formula[index];

        if (character === '"') {
            quoted = !quoted;
            continue;
        }

        if (quoted) {
            continue;
        }

        if (character === "(") {
            depth += 1;
        } else if (character === ")") {
            depth -= 1;

            if (depth === 0) {
                return formula.slice(openingParenthesisIndex + 1, index);
            }
        }
    }

    return null;

}

function splitTopLevelArguments(argumentsText) {

    const args = [];
    let start = 0;
    let depth = 0;
    let quoted = false;

    for (let index = 0; index < argumentsText.length; index += 1) {
        const character = argumentsText[index];

        if (character === '"') {
            quoted = !quoted;
        } else if (!quoted && character === "(") {
            depth += 1;
        } else if (!quoted && character === ")") {
            depth -= 1;
        } else if (!quoted && depth === 0 && character === ",") {
            args.push(argumentsText.slice(start, index));
            start = index + 1;
        }
    }

    args.push(argumentsText.slice(start));

    return args;

}

function extractFunctions(formula) {

    return [...formula.toUpperCase().matchAll(/\b([A-Z][A-Z0-9_.]*)\s*\(/g)]
        .map(match => match[1]);

}

function isIgnoredFormula(formula) {

    return /\[[^\]]+\][^!]*!/.test(formula);

}

function readCachedValue(cell) {

    if (cell.t === "e") {
        return cell.w ?? XLSX.utils.format_cell(cell);
    }

    return cell.v;

}

function valuesEqual(left, right) {

    if (typeof left === "number" && typeof right === "number") {
        const scale = Math.max(1, Math.abs(left), Math.abs(right));
        return Math.abs(left - right) <= numericTolerance * scale;
    }

    if (left instanceof Date && right instanceof Date) {
        return left.getTime() === right.getTime();
    }

    return left === right;

}

function buildInventory(cells) {

    const inventory = new Map();

    cells.forEach(cell => {
        cell.functions.forEach(functionName => {
            const entry = inventory.get(functionName) ?? {
                function: functionName,
                occurrences: 0,
                sheets: new Set(),
                calculated: 0,
                mismatch: 0,
                errors: {}
            };

            entry.occurrences += 1;
            entry.sheets.add(cell.sheet);

            if (cell.engineSucceeded) {
                entry.calculated += 1;
            }

            if (cell.status === "MISMATCH") {
                entry.mismatch += 1;
            }

            if (cell.errorType) {
                entry.errors[cell.errorType] =
                    (entry.errors[cell.errorType] ?? 0) + 1;
            }

            inventory.set(functionName, entry);
        });
    });

    return [...inventory.values()]
        .map(entry => ({
            function: entry.function,
            occurrences: entry.occurrences,
            sheetCount: entry.sheets.size,
            support: supportState(cells, entry.function),
            calculated: entry.calculated,
            mismatch: entry.mismatch,
            errors: entry.errors
        }))
        .sort((left, right) => left.function.localeCompare(right.function));

}

function supportState(cells, functionName) {

    const relevant = cells.filter(cell => cell.functions.includes(functionName));
    const supportedCount = relevant.filter(cell => cell.supported).length;

    if (supportedCount === relevant.length) {
        return "SUPPORTED";
    }

    if (supportedCount === 0) {
        return "UNSUPPORTED";
    }

    return "MIXED";

}

function evaluateFallbacks(cells) {

    return {
        engineFirst: countSources(cells, cell =>
            cell.engineSucceeded
                ? "engine"
                : cell.hasCachedValue ? "cache" : "unavailable"
        ),
        cacheFirst: countSources(cells, cell =>
            cell.hasCachedValue
                ? "cache"
                : cell.engineSucceeded ? "engine" : "unavailable"
        ),
        explicitHybrid: countSources(cells, cell => {
            if (
                cell.supported
                && cell.engineSucceeded
                && ["MATCH", "NO_CACHED_VALUE"].includes(cell.status)
            ) {
                return "engine";
            }

            if (cell.hasCachedValue) {
                return cell.status === "MISMATCH"
                    ? "cache-with-warning"
                    : "cache";
            }

            return "unavailable";
        })
    };

}

function countSources(cells, selectSource) {

    return countBy(cells, selectSource);

}

function countBy(items, selectKey) {

    return items.reduce((counts, item) => {
        const key = selectKey(item);
        counts[key] = (counts[key] ?? 0) + 1;
        return counts;
    }, {});

}

function countUsedCells(workbook) {

    return workbook.SheetNames.reduce((total, sheetName) => {
        const reference = workbook.Sheets[sheetName]?.["!ref"];

        if (!reference) {
            return total;
        }

        const range = XLSX.utils.decode_range(reference);
        return total
            + (range.e.r - range.s.r + 1)
            * (range.e.c - range.s.c + 1);
    }, 0);

}

function aggregate(results) {

    const statusCounts = {};
    let formulas = 0;
    let engineSuccessfulFormulas = 0;

    results.forEach(result => {
        formulas += result.formulaCount;
        engineSuccessfulFormulas += result.engineSuccessfulFormulaCount;
        Object.entries(result.statusCounts).forEach(([status, count]) => {
            statusCounts[status] = (statusCounts[status] ?? 0) + count;
        });
    });

    const comparable =
        (statusCounts.MATCH ?? 0) + (statusCounts.MISMATCH ?? 0);

    return {
        workbookCount: results.length,
        syntheticWorkbookCount:
            results.filter(result => result.kind === "synthetic").length,
        anonymizedLocalWorkbookCount:
            results.filter(result => result.kind === "local-anonymized").length,
        formulaCount: formulas,
        engineSuccessfulFormulaCount: engineSuccessfulFormulas,
        engineSuccessRate:
            formulas === 0 ? null : engineSuccessfulFormulas / formulas,
        statusCounts,
        exactMatchRate:
            formulas === 0 ? null : (statusCounts.MATCH ?? 0) / formulas,
        comparableMatchRate:
            comparable === 0 ? null : (statusCounts.MATCH ?? 0) / comparable,
        uniqueFunctions: [
            ...new Set(
                results.flatMap(result =>
                    result.inventory.map(entry => entry.function)
                )
            )
        ].sort(),
        vlookupSyntaxCounts: mergeCountObjects(
            results.map(result => result.vlookupSyntaxCounts)
        ),
        fallbacks: aggregateFallbacks(results),
        numericTolerance
    };

}

function mergeCountObjects(objects) {

    return objects.reduce((merged, counts) => {
        Object.entries(counts).forEach(([key, count]) => {
            merged[key] = (merged[key] ?? 0) + count;
        });
        return merged;
    }, {});

}

function aggregateFallbacks(results) {

    const strategyNames = ["engineFirst", "cacheFirst", "explicitHybrid"];

    return Object.fromEntries(strategyNames.map(strategyName => {
        const counts = {};

        results.forEach(result => {
            Object.entries(result.fallbacks[strategyName]).forEach(([source, count]) => {
                counts[source] = (counts[source] ?? 0) + count;
            });
        });

        return [strategyName, counts];
    }));

}

function printResult(result) {

    console.log(`\n=== ${result.id} (${result.kind}) ===`);
    console.log(
        `Meret: ${(result.fileBytes / 1024).toFixed(1)} KiB; `
        + `lapok: ${result.sheetCount}; hasznalt cellak: ${result.usedCellCount}; `
        + `kepletek: ${result.formulaCount}`
    );
    console.log(`Statuszok: ${JSON.stringify(result.statusCounts)}`);
    if (Object.keys(result.vlookupSyntaxCounts).length > 0) {
        console.log(
            `VLOOKUP szintaxis: ${JSON.stringify(result.vlookupSyntaxCounts)}`
        );
    }
    console.log("Formula inventory:");
    result.inventory.forEach(entry => console.log(
        `- ${entry.function}: occurrences=${entry.occurrences}, `
        + `sheets=${entry.sheetCount}, support=${entry.support}, `
        + `calculated=${entry.calculated}, mismatch=${entry.mismatch}, `
        + `errors=${JSON.stringify(entry.errors)}`
    ));
    console.log(
        `Idok (ms): parse=${result.timings.parseMs.toFixed(1)}, `
        + `engine=${result.timings.engineBuildMs.toFixed(1)}, `
        + `read=${result.timings.resultReadMs.toFixed(1)}, `
        + `total=${result.timings.totalMs.toFixed(1)}; `
        + `RSS delta~${(result.approximateRssDeltaBytes / 1024 / 1024).toFixed(1)} MiB`
    );

}

function run() {

    const inputs = buildInputs();
    const results = [];
    const failures = [];

    inputs.forEach(input => {
        try {
            const result = evaluateWorkbook(input);
            results.push(result);
            printResult(result);
        } catch (error) {
            failures.push({
                id: input.id,
                message: error instanceof Error ? error.message : String(error)
            });
            console.error(`\n${input.id}: workbook-szintu hiba.`);
        }
    });

    const summary = aggregate(results);
    const report = {
        generatedAt: new Date().toISOString(),
        hyperFormulaVersion: HyperFormula.version,
        license: "GPL-3.0-only (PoC only; production not approved)",
        privacy:
            "No file names, paths, formulas, cached values or business cell values included.",
        comparison: {
            numericTolerance,
            statuses: [
                "MATCH",
                "MISMATCH",
                "ENGINE_ERROR",
                "NO_CACHED_VALUE",
                "UNSUPPORTED",
                "IGNORED"
            ]
        },
        summary,
        workbooks: results,
        workbookFailures: failures
    };

    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

    console.log("\n=== Osszesites ===");
    console.log(JSON.stringify(summary, null, 2));
    console.log("Fallback A/B/C workbookonkent a JSON reportban.");
    console.log(`JSON report: ${outputPath}`);

    const syntheticResults =
        results.filter(result => result.kind === "synthetic");

    if (syntheticResults.length !== 3) {
        console.error("COMPATIBILITY POC RESULT: FAIL");
        process.exitCode = 1;
        return;
    }

    console.log("COMPATIBILITY POC RESULT: PASS");

}

run();
