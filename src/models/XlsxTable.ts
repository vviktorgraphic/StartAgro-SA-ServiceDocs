export interface XlsxCellValue {

    displayValue: string;

    rawValue: unknown;

    isDate: boolean;

}

export interface XlsxTableColumn {

    field: string;

    headerName: string;

    type: XlsxColumnType;

}

export type XlsxColumnType =
    "text"
    | "number"
    | "date";

export interface XlsxTableRow {

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
