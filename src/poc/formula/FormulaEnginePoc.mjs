import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

import { DetailedCellError, HyperFormula } from "hyperformula";
import * as XLSX from "xlsx";

const pocDirectory =
    dirname(fileURLToPath(import.meta.url));

const fixturePath =
    `${pocDirectory}/fixtures/formula-engine-poc.xlsx`;

const expectedFixtureErrors =
    new Set(["Kimutatas!B10"]);

const expectedFixtureMismatches =
    new Set(["Kimutatas!B9"]);

function createFixtureWorkbook() {

    const workbook =
        XLSX.utils.book_new();

    const data =
        XLSX.utils.aoa_to_sheet([
            ["Termek", "Ertek", "Kategoria", "Szamitas"],
            ["Alma", 10, "A", null],
            ["Korte", 20, "B", null],
            ["Szilva", 30, "A", null],
            ["Barack", 40, "B", null],
            ["Ures", null, "A", null]
        ]);

    setFormula(data, "D2", "B2*2", 20);
    setFormula(data, "D3", "B3+$B$2", 30);

    const summary =
        XLSX.utils.aoa_to_sheet([
            ["Teszt", "Eredmeny"],
            ["SUM", null],
            ["VLOOKUP", null],
            ["IF", null],
            ["COUNT", null],
            ["SUMIF", null],
            ["Azonos munkalap", null],
            ["Masik munkalap", null],
            ["Szandekosan elavult cache", null],
            ["Nem tamogatott fuggveny", null]
        ]);

    setFormula(summary, "B2", "SUM(Adatok!B2:B6)", 100);
    setFormula(
        summary,
        "B3",
        'VLOOKUP("Korte",Adatok!A2:B5,2,0)',
        20
    );
    setFormula(summary, "B4", 'IF(B3=20,"OK","HIBAS")', "OK");
    setFormula(summary, "B5", "COUNT(Adatok!B2:B6)", 4);
    setFormula(
        summary,
        "B6",
        'SUMIF(Adatok!C2:C6,"A",Adatok!B2:B6)',
        40
    );
    setFormula(summary, "B7", "B2+B3", 120);
    setFormula(summary, "B8", "Adatok!B4", 30);
    setFormula(summary, "B9", "Adatok!B2+$B$3", 31);
    setFormula(summary, "B10", "NOT_A_REAL_FUNCTION(1)", 999);

    XLSX.utils.book_append_sheet(workbook, data, "Adatok");
    XLSX.utils.book_append_sheet(workbook, summary, "Kimutatas");

    return workbook;

}

function createLargeWorkbook(rowCount = 5000) {

    const workbook =
        XLSX.utils.book_new();

    const dataRows =
        [["Azonosito", "Ertek", "Kategoria"]];

    const calculationRows =
        [["Azonosito", "Duplazott ertek"]];

    for (let row = 1; row <= rowCount; row += 1) {
        const value = row % 100;

        dataRows.push([
            row,
            value,
            row % 2 === 0 ? "Paros" : "Paratlan"
        ]);

        calculationRows.push([row, null]);
    }

    const data =
        XLSX.utils.aoa_to_sheet(dataRows);

    const calculations =
        XLSX.utils.aoa_to_sheet(calculationRows);

    for (let row = 2; row <= rowCount + 1; row += 1) {
        const value = (row - 1) % 100;

        setFormula(
            calculations,
            `B${row}`,
            `Adatok!B${row}*2`,
            value * 2
        );
    }

    XLSX.utils.book_append_sheet(workbook, data, "Adatok");
    XLSX.utils.book_append_sheet(workbook, calculations, "Szamitasok");

    return workbook;

}

function setFormula(worksheet, address, formula, cachedValue) {

    worksheet[address] = {
        t: typeof cachedValue === "number" ? "n" : "s",
        f: formula,
        v: cachedValue
    };

}

function writeFixture() {

    mkdirSync(dirname(fixturePath), { recursive: true });

    XLSX.writeFile(
        createFixtureWorkbook(),
        fixturePath,
        {
            bookType: "xlsx",
            compression: true
        }
    );

}

function evaluateWorkbook(buffer, name) {

    const totalStarted =
        performance.now();

    const parseStarted =
        performance.now();

    const workbook =
        XLSX.read(buffer, {
            type: "buffer",
            cellFormula: true,
            cellNF: true,
            cellText: true
        });

    const parseMs =
        performance.now() - parseStarted;

    const sheets =
        buildEngineSheets(workbook);

    const engineStarted =
        performance.now();

    const engine =
        HyperFormula.buildFromSheets(
            sheets,
            {
                licenseKey: "gpl-v3"
            }
        );

    const engineBuildMs =
        performance.now() - engineStarted;

    const readStarted =
        performance.now();

    const comparisons =
        readFormulaResults(workbook, engine);

    const resultReadMs =
        performance.now() - readStarted;

    const report = {
        name,
        workbookBytes: buffer.byteLength,
        sheetNames: [...workbook.SheetNames],
        dimensions: readDimensions(workbook),
        formulaCount: comparisons.length,
        functionNames: readFunctionNames(comparisons),
        timings: {
            parseMs,
            engineBuildMs,
            resultReadMs,
            totalMs: performance.now() - totalStarted
        },
        comparisons
    };

    engine.destroy();

    return report;

}

function buildEngineSheets(workbook) {

    return Object.fromEntries(
        workbook.SheetNames.map(sheetName => {
            const worksheet = workbook.Sheets[sheetName];

            if (!worksheet?.["!ref"]) {
                return [sheetName, []];
            }

            const range =
                XLSX.utils.decode_range(worksheet["!ref"]);

            const rows = [];

            for (let row = 0; row <= range.e.r; row += 1) {
                const values = [];

                for (
                    let column = 0;
                    column <= range.e.c;
                    column += 1
                ) {
                    const address =
                        XLSX.utils.encode_cell({ r: row, c: column });

                    const cell =
                        worksheet[address];

                    values.push(toEngineValue(cell));
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

    if (
        typeof cell.v === "string"
        || typeof cell.v === "number"
        || typeof cell.v === "boolean"
    ) {
        return cell.v;
    }

    return null;

}

function readFormulaResults(workbook, engine) {

    const comparisons = [];

    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet?.["!ref"]) {
            return;
        }

        const sheetId =
            engine.getSheetId(sheetName);

        const range =
            XLSX.utils.decode_range(worksheet["!ref"]);

        for (let row = range.s.r; row <= range.e.r; row += 1) {
            for (let column = range.s.c; column <= range.e.c; column += 1) {
                const cellAddress =
                    XLSX.utils.encode_cell({ r: row, c: column });

                const cell =
                    worksheet[cellAddress];

                if (!cell || typeof cell.f !== "string") {
                    continue;
                }

                const calculated =
                    engine.getCellValue({
                        sheet: sheetId,
                        row,
                        col: column
                    });

                const error =
                    calculated instanceof DetailedCellError
                        ? `${calculated.type}: ${calculated.message}`
                        : null;

                comparisons.push({
                    sheet: sheetName,
                    cell: cellAddress,
                    formula: `=${cell.f}`,
                    cached: cell.v ?? null,
                    calculated: error ? calculated.value : calculated,
                    difference: calculateDifference(cell.v, calculated),
                    error,
                    status: error
                        ? "ERROR"
                        : valuesEqual(cell.v, calculated)
                            ? "MATCH"
                            : "MISMATCH"
                });
            }
        }
    });

    return comparisons;

}

function calculateDifference(cached, calculated) {

    if (
        typeof cached === "number"
        && typeof calculated === "number"
    ) {
        return calculated - cached;
    }

    return valuesEqual(cached, calculated)
        ? null
        : `${String(cached)} -> ${String(calculated)}`;

}

function valuesEqual(left, right) {

    if (
        typeof left === "number"
        && typeof right === "number"
    ) {
        return Math.abs(left - right) < 1e-9;
    }

    return left === right;

}

function readDimensions(workbook) {

    return workbook.SheetNames.map(sheetName => {
        const reference =
            workbook.Sheets[sheetName]?.["!ref"];

        if (!reference) {
            return {
                sheet: sheetName,
                rows: 0,
                columns: 0
            };
        }

        const range =
            XLSX.utils.decode_range(reference);

        return {
            sheet: sheetName,
            rows: range.e.r - range.s.r + 1,
            columns: range.e.c - range.s.c + 1
        };
    });

}

function readFunctionNames(comparisons) {

    const names =
        comparisons.flatMap(comparison =>
            [...comparison.formula.matchAll(/\b([A-Z][A-Z0-9_.]*)\s*\(/g)]
                .map(match => match[1])
        );

    return [...new Set(names)];

}

function printFixtureReport(report) {

    console.log("\n=== Minimalis formula fixture ===");
    console.log(`Workbook: ${report.name}`);
    console.log(`Munkalapsorrend: ${report.sheetNames.join(" -> ")}`);
    console.log(
        `Belso fuggvenynevek: ${report.functionNames.join(", ")} (angol)`
    );

    report.comparisons.forEach(comparison => {
        console.log("\n---");
        console.log(`Sheet: ${comparison.sheet}`);
        console.log(`Cell: ${comparison.cell}`);
        console.log(`Formula: ${comparison.formula}`);
        console.log(`Cached: ${formatValue(comparison.cached)}`);
        console.log(`Calculated: ${formatValue(comparison.calculated)}`);
        console.log(`Difference: ${formatValue(comparison.difference)}`);
        console.log(`Status: ${comparison.status}`);

        if (comparison.error) {
            console.log(`HyperFormula error: ${comparison.error}`);
        }
    });

    printPerformance(report);

}

function printLargeReport(report) {

    const counts =
        countStatuses(report.comparisons);

    console.log("\n=== Nagy szintetikus workbook ===");
    console.log(`Workbook: ${report.name}`);
    console.log(`Munkalapsorrend: ${report.sheetNames.join(" -> ")}`);
    console.log(
        `Kepletek: ${report.formulaCount}; MATCH: ${counts.MATCH}; `
        + `MISMATCH: ${counts.MISMATCH}; ERROR: ${counts.ERROR}`
    );

    printPerformance(report);

}

function printPerformance(report) {

    const cells =
        report.dimensions.reduce(
            (total, sheet) => total + sheet.rows * sheet.columns,
            0
        );

    console.log("\nTeljesitmeny:");
    console.log(`Meret: ${formatBytes(report.workbookBytes)}`);
    console.log(
        `Munkalapok: ${report.dimensions.length}; `
        + `cellatartomany: ~${cells}; kepletek: ${report.formulaCount}`
    );
    report.dimensions.forEach(sheet =>
        console.log(
            `- ${sheet.sheet}: ${sheet.rows} sor x ${sheet.columns} oszlop`
        )
    );
    console.log(`SheetJS parse: ${report.timings.parseMs.toFixed(1)} ms`);
    console.log(
        `HyperFormula engine build: ${report.timings.engineBuildMs.toFixed(1)} ms`
    );
    console.log(
        `Eredmenyek egyszeri kiolvasasa: ${report.timings.resultReadMs.toFixed(1)} ms`
    );
    console.log(`Teljes futas: ${report.timings.totalMs.toFixed(1)} ms`);

}

function validateFixture(report) {

    const failures = [];

    if (report.sheetNames.join("|") !== "Adatok|Kimutatas") {
        failures.push("A munkalapok sorrendje megvaltozott.");
    }

    const requiredFunctions =
        ["SUM", "VLOOKUP", "IF", "COUNT", "SUMIF"];

    requiredFunctions.forEach(functionName => {
        if (!report.functionNames.includes(functionName)) {
            failures.push(`Hianyzik a ${functionName} formula validacioja.`);
        }
    });

    report.comparisons.forEach(comparison => {
        const key =
            `${comparison.sheet}!${comparison.cell}`;

        const expectedStatus =
            expectedFixtureErrors.has(key)
                ? "ERROR"
                : expectedFixtureMismatches.has(key)
                    ? "MISMATCH"
                    : "MATCH";

        if (comparison.status !== expectedStatus) {
            failures.push(
                `${key}: ${expectedStatus} helyett ${comparison.status}.`
            );
        }
    });

    if (report.comparisons.length !== 11) {
        failures.push(
            `11 kepletes cella helyett ${report.comparisons.length} talalhato.`
        );
    }

    return failures;

}

function validateLargeReport(report) {

    const counts =
        countStatuses(report.comparisons);

    const failures = [];

    if (report.formulaCount !== 5000) {
        failures.push(
            `5000 nagyteszt-keplet helyett ${report.formulaCount} talalhato.`
        );
    }

    if (counts.MATCH !== 5000 || counts.MISMATCH !== 0 || counts.ERROR !== 0) {
        failures.push(
            `A nagyteszt eredmenye nem teljes egyezes: ${JSON.stringify(counts)}.`
        );
    }

    return failures;

}

function countStatuses(comparisons) {

    return comparisons.reduce(
        (counts, comparison) => {
            counts[comparison.status] += 1;
            return counts;
        },
        {
            MATCH: 0,
            MISMATCH: 0,
            ERROR: 0
        }
    );

}

function formatValue(value) {

    if (value === null || value === undefined) {
        return "<ures>";
    }

    return JSON.stringify(value);

}

function formatBytes(bytes) {

    return `${(bytes / 1024).toFixed(1)} KiB (${bytes} byte)`;

}

function run() {

    if (!existsSync(fixturePath)) {
        writeFixture();
    }

    const fixtureBuffer =
        readFileSync(fixturePath);

    const fixtureReport =
        evaluateWorkbook(fixtureBuffer, "formula-engine-poc.xlsx");

    printFixtureReport(fixtureReport);

    const largeBuffer =
        XLSX.write(
            createLargeWorkbook(),
            {
                type: "buffer",
                bookType: "xlsx",
                compression: true
            }
        );

    const largeReport =
        evaluateWorkbook(largeBuffer, "synthetic-5000-rows.xlsx");

    printLargeReport(largeReport);

    const failures = [
        ...validateFixture(fixtureReport),
        ...validateLargeReport(largeReport)
    ];

    if (failures.length > 0) {
        console.error("\nPOC RESULT: FAIL");
        failures.forEach(failure => console.error(`- ${failure}`));
        process.exitCode = 1;
        return;
    }

    console.log("\nPOC RESULT: PASS");
    console.log(
        "A vart cache-elteres es a cellaszintu nem tamogatott formula hiba "
        + "jelentve lett; a tobbi validacio egyezik."
    );

}

run();
