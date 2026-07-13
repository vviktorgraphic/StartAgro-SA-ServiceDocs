import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";

import * as XLSX from "xlsx";
import { createServer } from "vite";

import { SpreadsheetFormulaService } from "./SpreadsheetFormulaService.ts";
import { getExcelColumnCode } from "../utils/ExcelCoordinates.ts";

assert.deepEqual(
    [0, 25, 26, 27, 51, 52].map(getExcelColumnCode),
    ["A", "Z", "AA", "AB", "AZ", "BA"]
);

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

const lookupOriginals = [
    ["A1", 20],
    ["A2", 25],
    ["A3", "alma"],
    ["I2", 10], ["J2", "tíz"], ["K2", 100], ["L2", "eredmény-10"],
    ["I3", 20], ["J3", "húsz"], ["K3", 200], ["L3", "eredmény-20"],
    ["I4", 30], ["J4", "harminc"], ["K4", 300], ["L4", "eredmény-30"],
    ["I5", "alma"], ["J5", "gyümölcs"], ["K5", 400], ["L5", "szöveges-találat"]
].map(([cellAddress, value]) => ({
    worksheetName: "Lookup",
    cellAddress,
    value
}));

const lookupService = new SpreadsheetFormulaService(lookupOriginals);

assert.equal(
    lookupService.setCellInput(
        "Lookup",
        "B1",
        "=FKERES(A1;I2:L5;4;0)"
    ).calculatedValue,
    "eredmény-20"
);

assert.equal(
    lookupService.setCellInput(
        "Lookup",
        "B2",
        "=FKERES(A1;I2:L5;4;FALSE)"
    ).calculatedValue,
    "eredmény-20"
);

assert.equal(
    lookupService.setCellInput(
        "Lookup",
        "B3",
        "=VLOOKUP(A1,I2:L5,4,FALSE)"
    ).calculatedValue,
    "eredmény-20"
);

assert.equal(
    lookupService.setCellInput(
        "Lookup",
        "B4",
        "=FKERES(A2;$I$2:$L$4;4;1)"
    ).calculatedValue,
    "eredmény-20"
);

assert.equal(
    lookupService.setCellInput(
        "Lookup",
        "B5",
        "=VLOOKUP(A2,$I$2:$L$4,4,TRUE)"
    ).calculatedValue,
    "eredmény-20"
);

assert.equal(
    lookupService.setCellInput(
        "Lookup",
        "B10",
        "=VLOOKUP(A2,I2:L4,4)"
    ).calculatedValue,
    "eredmény-20"
);

assert.equal(
    lookupService.setCellInput(
        "Lookup",
        "B6",
        "=FKERES(A3;$I$2:$L$5;4;0)"
    ).calculatedValue,
    "szöveges-találat"
);

assert.match(
    lookupService.setCellInput(
        "Lookup",
        "B7",
        '=FKERES("nincs";I2:L5;4;0)'
    ).error,
    /nem talált/i
);

assert.match(
    lookupService.setCellInput(
        "Lookup",
        "B8",
        "=FKERES(A1;I2:L5;5;0)"
    ).error,
    /oszlopindex/i
);

assert.match(
    lookupService.setCellInput(
        "Lookup",
        "B9",
        "=FKERES(A1;L5:I2;1;0)"
    ).error,
    /Fordított/i
);

lookupService.setCellInput("Lookup", "C1", "20");
lookupService.setCellInput("Lookup", "D1", "=FKERES(C1;I2:L4;4;0)");
assert.equal(
    lookupService.getOverride("Lookup", "D1").calculatedValue,
    "eredmény-20"
);

lookupService.setCellInput("Lookup", "C1", "30");
assert.equal(
    lookupService.getOverride("Lookup", "D1").calculatedValue,
    "eredmény-30"
);

assert.equal(
    lookupService.setCellInput(
        "Lookup",
        "E1",
        '=HA(A1>10;"igen";"nem")'
    ).calculatedValue,
    "igen"
);

assert.equal(
    lookupService.setCellInput(
        "Lookup",
        "E2",
        '=HA(A1<10;"igen";"nem")'
    ).calculatedValue,
    "nem"
);

assert.equal(
    lookupService.setCellInput(
        "Lookup",
        "E3",
        '=IF(A1>=20,"yes","no")'
    ).calculatedValue,
    "yes"
);

assert.equal(
    lookupService.setCellInput(
        "Lookup",
        "E4",
        "=IF(A1<>20,1,A1+2)"
    ).calculatedValue,
    22
);

assert.equal(
    lookupService.setCellInput(
        "Lookup",
        "E5",
        '=HA(A1=20;FKERES(A1;I2:L4;4;0);"nincs")'
    ).calculatedValue,
    "eredmény-20"
);

assert.equal(
    lookupService.setCellInput(
        "Lookup",
        "E6",
        '=IF(A1<=19,"yes","no")'
    ).calculatedValue,
    "no"
);

assert.equal(
    lookupService.setCellInput("Lookup", "F1", "=SZUM(I2;I3)").calculatedValue,
    30
);
assert.equal(
    lookupService.setCellInput("Lookup", "F2", "=KEREKÍTÉS(10/3;2)").calculatedValue,
    3.33
);
assert.equal(
    lookupService.setCellInput("Lookup", "F3", "=DARAB(I2:I4)").calculatedValue,
    3
);
assert.match(
    lookupService.setCellInput(
        "Lookup",
        "F4",
        "=IF(A1>10;1,0)"
    ).error,
    /nem keverhetők/i
);

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

    const secondWorksheet = {
        C5: { t: "s", v: "Bal" },
        D5: { t: "s", v: "Jobb" },
        C6: { t: "n", v: 7 },
        D6: { t: "n", v: 8 },
        "!ref": "C5:D6"
    };

    XLSX.utils.book_append_sheet(workbook, secondWorksheet, "Második");

    const bytes = XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx"
    });

    const started = performance.now();
    const parsed = xlsxTableService.parse(bytes, "large-synthetic.xlsx");
    largeWorkbookParseMs = performance.now() - started;
    const formulaCell = parsed.worksheets[0].rows[0].cells.c1;

    assert.deepEqual(
        parsed.worksheets[0].columns.map(column => column.excelColumnCode),
        ["A", "B"]
    );

    assert.equal(formulaCell.cellAddress, "B2");
    assert.equal(formulaCell.displayValue, "999");
    assert.equal(formulaCell.originalInput, "=SUM(A2:A3)");
    assert.equal(formulaCell.originalValue, 999);
    assert.equal(parsed.worksheets[0].rows.length, 3);
    assert.equal(parsed.worksheets[0].headerRowNumber, 1);
    assert.equal(parsed.worksheets[0].rows[0].excelRowNumber, 2);

    const sortedRows =
        [...parsed.worksheets[0].rows]
            .sort((a, b) => b.excelRowNumber - a.excelRowNumber);

    assert.deepEqual(
        sortedRows.map(row => row.excelRowNumber),
        [50001, 3, 2]
    );

    const filteredRows =
        parsed.worksheets[0].rows.filter(row =>
            row.cells.c0.displayValue === "2"
        );

    assert.equal(filteredRows[0].excelRowNumber, 3);

    const pagedRows =
        parsed.worksheets[0].rows.slice(1, 2);

    assert.equal(pagedRows[0].excelRowNumber, 3);

    const parsedFormulaService =
        new SpreadsheetFormulaService(
            parsed.worksheets.flatMap(parsedWorksheet =>
                parsedWorksheet.rows.flatMap(row =>
                    Object.values(row.cells).map(cell => ({
                        worksheetName: parsedWorksheet.worksheetName,
                        cellAddress: cell.cellAddress,
                        value: cell.originalValue
                    }))
                )
            )
        );

    const selectedAfterSortAndFilter = filteredRows[0].cells.c1;

    assert.equal(selectedAfterSortAndFilter.cellAddress, "B3");
    assert.equal(
        parsedFormulaService.setCellInput(
            "Nagy",
            selectedAfterSortAndFilter.cellAddress,
            "=A3*10"
        ).calculatedValue,
        20
    );

    assert.equal(parsed.worksheets[1].headerRowNumber, 5);
    assert.equal(parsed.worksheets[1].rows[0].excelRowNumber, 6);
    assert.deepEqual(
        parsed.worksheets[1].columns.map(column => column.excelColumnCode),
        ["C", "D"]
    );
    assert.equal(parsed.worksheets[1].rows[0].cells.c0.cellAddress, "C6");
} finally {
    await vite.close();
}

console.log("Spreadsheet formula layer tests: PASS");
console.log(`100,002-cell cached workbook parse: ${largeWorkbookParseMs.toFixed(1)} ms`);
