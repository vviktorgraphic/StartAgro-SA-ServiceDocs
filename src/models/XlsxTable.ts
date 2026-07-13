export interface XlsxCellValue {

    cellAddress: string;

    displayValue: string;

    isDate: boolean;

    originalInput: string;

    originalValue: string | number | boolean | null;

}

export interface XlsxTableColumn {

    excelColumnCode: string;

    field: string;

    headerName: string;

    type: XlsxColumnType;

}

export type XlsxColumnType =
    "text"
    | "number"
    | "date";

export interface XlsxTableRow {

    excelRowNumber: number;

    id: number;

    cells: Record<string, XlsxCellValue>;

    searchText: string;

}

export interface XlsxTableData {

    worksheetName: string;

    headerRowNumber: number;

    columns: XlsxTableColumn[];

    rows: XlsxTableRow[];

}

export interface XlsxWorkbookData {

    sourceName: string;

    worksheets: XlsxTableData[];

}
