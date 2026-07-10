import * as XLSX from "xlsx";

import {
    XlsxCellValue,
    XlsxColumnType,
    XlsxTableColumn,
    XlsxTableData,
    XlsxTableRow,
    XlsxWorkbookData
} from "../models/XlsxTable";

type WorksheetCell = XLSX.CellObject & {
    w?: string;
    z?: string;
};

class XlsxTableService {

    public parse(
        data: ArrayBuffer,
        sourceName: string
    ): XlsxWorkbookData {

        const workbook =
            XLSX.read(
                data,
                {
                    type: "array",
                    cellDates: true,
                    cellFormula: true,
                    cellNF: true,
                    cellText: true
                }
            );

        if (workbook.SheetNames.length === 0) {
            throw new Error("A munkafüzet nem tartalmaz munkalapot.");
        }

        return {
            sourceName,
            worksheets: workbook.SheetNames.map(worksheetName =>
                this.parseWorksheet(
                    workbook,
                    worksheetName
                )
            )
        };

    }

    private parseWorksheet(
        workbook: XLSX.WorkBook,
        worksheetName: string
    ): XlsxTableData {

        const worksheet =
            workbook.Sheets[worksheetName];

        if (!worksheet || !worksheet["!ref"]) {
            return {
                worksheetName,
                headerRowNumber: 0,
                columns: [],
                rows: []
            };
        }

        const range =
            XLSX.utils.decode_range(worksheet["!ref"]);

        const headerRow =
            this.findHeaderRow(
                worksheet,
                range
            );

        if (headerRow === null) {
            return {
                worksheetName,
                headerRowNumber: 0,
                columns: [],
                rows: []
            };
        }

        const columns =
            this.readColumns(
                worksheet,
                range,
                headerRow
            );

        const rows =
            this.readRows(
                worksheet,
                range,
                headerRow,
                columns
            );

        return {
            worksheetName,
            headerRowNumber: headerRow + 1,
            columns: this.withColumnTypes(
                columns,
                rows
            ),
            rows
        };

    }

    private findHeaderRow(
        worksheet: XLSX.WorkSheet,
        range: XLSX.Range
    ): number | null {

        for (let row = range.s.r; row <= range.e.r; row += 1) {

            for (let column = range.s.c; column <= range.e.c; column += 1) {

                const cell =
                    worksheet[XLSX.utils.encode_cell({
                        r: row,
                        c: column
                    })] as WorksheetCell | undefined;

                if (this.getDisplayValue(cell).length > 0) {
                    return row;
                }

            }

        }

        return null;

    }

    private readColumns(
        worksheet: XLSX.WorkSheet,
        range: XLSX.Range,
        headerRow: number
    ): XlsxTableColumn[] {

        const usedNames =
            new Map<string, number>();

        const columns: XlsxTableColumn[] = [];

        for (let column = range.s.c; column <= range.e.c; column += 1) {

            const cell =
                worksheet[XLSX.utils.encode_cell({
                    r: headerRow,
                    c: column
                })] as WorksheetCell | undefined;

            const baseName =
                this.getDisplayValue(cell)
                || `Oszlop ${column - range.s.c + 1}`;

            const headerName =
                this.getUniqueHeaderName(
                    baseName,
                    usedNames
                );

            columns.push({
                field: `c${column - range.s.c}`,
                headerName,
                type: "text"
            });

        }

        return columns;

    }

    private readRows(
        worksheet: XLSX.WorkSheet,
        range: XLSX.Range,
        headerRow: number,
        columns: XlsxTableColumn[]
    ): XlsxTableRow[] {

        const rows: XlsxTableRow[] = [];

        for (let row = headerRow + 1; row <= range.e.r; row += 1) {

            const cells: Record<string, XlsxCellValue> = {};
            const searchValues: string[] = [];
            let hasValue = false;

            columns.forEach((column, index) => {

                const worksheetCell =
                    worksheet[XLSX.utils.encode_cell({
                        r: row,
                        c: range.s.c + index
                    })] as WorksheetCell | undefined;

                const displayValue =
                    this.getDisplayValue(worksheetCell);

                if (displayValue.length > 0) {
                    hasValue = true;
                    searchValues.push(displayValue.toLocaleLowerCase("hu-HU"));
                }

                cells[column.field] = {
                    displayValue,
                    rawValue: worksheetCell?.v ?? null,
                    isDate: this.isDateCell(worksheetCell)
                };

            });

            if (hasValue) {
                rows.push({
                    id: row - headerRow,
                    cells,
                    searchText: searchValues.join(" ")
                });
            }

        }

        return rows;

    }

    private withColumnTypes(
        columns: XlsxTableColumn[],
        rows: XlsxTableRow[]
    ): XlsxTableColumn[] {

        return columns.map(column => ({
            ...column,
            type: this.detectColumnType(
                column.field,
                rows
            )
        }));

    }

    private detectColumnType(
        field: string,
        rows: XlsxTableRow[]
    ): XlsxColumnType {

        const values =
            rows
                .map(row => row.cells[field])
                .filter(cell => cell.displayValue.length > 0);

        if (values.length === 0) {
            return "text";
        }

        const dateCount =
            values.filter(cell =>
                cell.isDate || this.parseDate(cell.displayValue) !== null
            ).length;

        if (dateCount === values.length) {
            return "date";
        }

        const numericCount =
            values.filter(cell =>
                this.parseNumber(cell.displayValue) !== null
            ).length;

        if (numericCount === values.length) {
            return "number";
        }

        return "text";

    }

    private getDisplayValue(
        cell: WorksheetCell | undefined
    ): string {

        if (!cell) {
            return "";
        }

        if (typeof cell.w === "string") {
            return cell.w.trim();
        }

        if (cell.v === undefined || cell.v === null) {
            return "";
        }

        const formattedValue =
            XLSX.utils.format_cell(cell);

        return (formattedValue || String(cell.v)).trim();

    }

    private getUniqueHeaderName(
        headerName: string,
        usedNames: Map<string, number>
    ): string {

        const normalized =
            headerName.toLocaleLowerCase("hu-HU");

        const count =
            usedNames.get(normalized) ?? 0;

        usedNames.set(
            normalized,
            count + 1
        );

        return count === 0
            ? headerName
            : `${headerName} ${count + 1}`;

    }

    private isDateCell(
        cell: WorksheetCell | undefined
    ): boolean {

        if (!cell) {
            return false;
        }

        if (cell.v instanceof Date || cell.t === "d") {
            return true;
        }

        const isDateFormat =
            (XLSX.SSF as { is_date?: (format: string) => boolean }).is_date;

        return typeof cell.v === "number"
            && typeof cell.z === "string"
            && isDateFormat
            ? isDateFormat(cell.z)
            : false;

    }

    private parseNumber(
        value: string
    ): number | null {

        const normalized =
            value
                .replace(/\s/g, "")
                .replace(",", ".");

        if (!normalized) {
            return null;
        }

        const parsed =
            Number(normalized);

        return Number.isFinite(parsed)
            ? parsed
            : null;

    }

    private parseDate(
        value: string
    ): number | null {

        const normalized =
            value
                .trim()
                .replace(/\.$/, "")
                .replace(/[./]/g, "-");

        const parsed =
            Date.parse(normalized);

        return Number.isNaN(parsed)
            ? null
            : parsed;

    }

}

export const xlsxTableService =
    new XlsxTableService();
