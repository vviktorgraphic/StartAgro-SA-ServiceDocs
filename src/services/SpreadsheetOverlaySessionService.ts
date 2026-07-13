import { SpreadsheetFormulaService } from "./SpreadsheetFormulaService.ts";

export function hasSessionSpreadsheetOverrides(
    service: SpreadsheetFormulaService | null
): boolean {

    return service?.hasOverrides() ?? false;

}

export function clearSessionSpreadsheetOverrides(
    service: SpreadsheetFormulaService | null,
    confirmed: boolean
): boolean {

    if (!service || !confirmed || !service.hasOverrides()) {
        return false;
    }

    service.clearOverrides();
    return true;

}

export function resolveSessionFormulaInput(
    service: SpreadsheetFormulaService | null,
    worksheetName: string,
    cellAddress: string,
    originalInput: string
): string {

    return service?.getOverride(
        worksheetName,
        cellAddress
    )?.input ?? originalInput;

}
