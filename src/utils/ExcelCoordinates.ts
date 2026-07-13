export function getExcelColumnCode(
    columnIndex: number
): string {

    if (!Number.isInteger(columnIndex) || columnIndex < 0) {
        throw new RangeError("Az Excel-oszlopindex nem lehet negatív.");
    }

    let value = columnIndex + 1;
    let result = "";

    while (value > 0) {
        const remainder = (value - 1) % 26;
        result = String.fromCharCode(65 + remainder) + result;
        value = Math.floor((value - 1) / 26);
    }

    return result;

}
