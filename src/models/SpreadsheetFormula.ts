export type SpreadsheetCellValue =
    string
    | number
    | boolean
    | null;

export interface SpreadsheetOriginalCell {

    worksheetName: string;

    cellAddress: string;

    value: SpreadsheetCellValue;

}

export interface SpreadsheetCellOverride {

    worksheetName: string;

    cellAddress: string;

    input: string;

    calculatedValue?: SpreadsheetCellValue;

    error?: string;

}
