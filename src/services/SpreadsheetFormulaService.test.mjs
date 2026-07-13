import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";

import * as XLSX from "xlsx";
import { createServer } from "vite";

import { SpreadsheetFormulaService } from "./SpreadsheetFormulaService.ts";

const originals = [
    ["Lap1", "A1", 10],
    ["Lap1", "A2", 2],
    ["Lap1", "A3", "szöveg"],
    ["Lap1", "B1", 5],
    ["Lap1", "B2", 7],
    ["Lap1", "B3", null],
    ["Lap1", "A4", 1],
    ["Lap1", "B4", 2],
    ["Lap1", "N1", 50],
    ["Lap2", "A1", 100]
].map(([worksheetName, cellAddress, value]) => ({
    worksheetName,
    cellAddress,
    value
}));

const service = new SpreadsheetFormulaService(originals);

assert.equal(
    service.setCellInput("Lap1", "C1", "42").calculatedValue,
    42
);

assert.equal(
    service.setCellInput("Lap1", "D1", "alma").calculatedValue,
    "alma"
);

assert.equal(
    service.setCellInput("Lap1", "E1", "=A1+B1").calculatedValue,
    15
);

assert.equal(
    service.setCellInput("Lap1", "F1", "=A1+B1*2").calculatedValue,
    20
);

assert.equal(
    service.setCellInput("Lap1", "G1", "=(A1+B1)*2").calculatedValue,
    30
);

assert.equal(
    service.setCellInput("Lap1", "H1", "=SUM(A1:A3)").calculatedValue,
    12
);

assert.equal(
    service.setCellInput("Lap1", "I1", "=MIN(A1:A2)").calculatedValue,
    2
);

assert.equal(
    service.setCellInput("Lap1", "J1", "=MAX(A1:A2)").calculatedValue,
    10
);

assert.equal(
    service.setCellInput("Lap1", "K1", "=ROUND(A1/3,2)").calculatedValue,
    3.33
);

assert.equal(
    service.setCellInput("Lap1", "L1", "=COUNT(A1:A3)").calculatedValue,
    2
);

assert.equal(
    service.setCellInput("Lap1", "M1", "=$A$1+A$2+$B1").calculatedValue,
    17
);

service.setCellInput("Lap1", "C2", "3");
service.setCellInput("Lap1", "D2", "=C2*2");

assert.equal(
    service.getOverride("Lap1", "D2").calculatedValue,
    6
);

service.setCellInput("Lap1", "C2", "4");

assert.equal(
    service.getOverride("Lap1", "D2").calculatedValue,
    8
);

service.setCellInput("Lap1", "C2", "=D2");

assert.match(service.getOverride("Lap1", "C2").error, /Ciklikus/);
assert.match(service.getOverride("Lap1", "D2").error, /Ciklikus/);

assert.match(
    service.setCellInput(
        "Lap1",
        "N1",
        "=VLOOKUP(A1,A1:B2,2,FALSE)"
    ).error,
    /Nem támogatott/
);

assert.equal(
    service.setCellInput("Lap1", "R1", "=N1+1").calculatedValue,
    51
);

assert.ok(
    service.setCellInput("Lap1", "O1", "=SUM(").error
);

assert.ok(
    service.setCellInput("Lap1", "P1", "=Lap2!A1").error
);

service.setCellInput("Lap1", "B2", "9");
service.setCellInput("Lap1", "Q1", "=B2*2");
assert.equal(service.getOverride("Lap1", "Q1").calculatedValue, 18);

service.resetCell("Lap1", "B2");
assert.equal(service.getOverride("Lap1", "B2"), undefined);
assert.equal(service.getOverride("Lap1", "Q1").calculatedValue, 14);

service.setCellInput("Lap1", "A1", "11");
service.setCellInput("Lap2", "A1", "101");
assert.equal(service.getOverride("Lap1", "A1").calculatedValue, 11);
assert.equal(service.getOverride("Lap2", "A1").calculatedValue, 101);
assert.equal(service.getOverridesForWorksheet("Lap1").some(
    override => override.worksheetName === "Lap2"
), false);

const vite = await createServer({
    appType: "custom",
    logLevel: "silent",
    ssr: {
        noExternal: ["xlsx"]
    },
    server: {
        middlewareMode: true
    }
});

let largeWorkbookParseMs = 0;

try {
    const { xlsxTableService } =
        await vite.ssrLoadModule("/src/services/XlsxTableService.ts");

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
        ["Érték", "Cache"],
        [1, null],
        [2, null]
    ]);

    worksheet.B2 = {
        t: "n",
        f: "SUM(A2:A3)",
        v: 999
    };

    worksheet.B50001 = {
        t: "s",
        v: "tartomány vége"
    };

    worksheet["!ref"] = "A1:B50001";
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nagy");

    const bytes = XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx"
    });

    const started = performance.now();
    const parsed = xlsxTableService.parse(bytes, "large-synthetic.xlsx");
    largeWorkbookParseMs = performance.now() - started;
    const formulaCell = parsed.worksheets[0].rows[0].cells.c1;

    assert.equal(formulaCell.cellAddress, "B2");
    assert.equal(formulaCell.displayValue, "999");
    assert.equal(formulaCell.originalInput, "=SUM(A2:A3)");
    assert.equal(formulaCell.originalValue, 999);
    assert.equal(parsed.worksheets[0].rows.length, 3);
} finally {
    await vite.close();
}

console.log("Spreadsheet formula layer tests: PASS");
console.log(`100,002-cell cached workbook parse: ${largeWorkbookParseMs.toFixed(1)} ms`);
