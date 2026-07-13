import ClearAllIcon from "@mui/icons-material/ClearAll";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    Paper,
    Popover,
    Select,
    Stack,
    TextField,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";
import {
    DataGrid,
    GridColDef,
    GridColumnVisibilityModel,
    GridLocaleText,
    GridPaginationModel,
    GridSortModel
} from "@mui/x-data-grid";
import { huHU } from "@mui/x-data-grid/locales";
import { useEffect, useMemo, useRef, useState } from "react";

import { XlsxTableColumn, XlsxTableRow, XlsxWorkbookData } from "../../models/XlsxTable";
import { dialogService } from "../../services/DialogService";
import { SpreadsheetFormulaService } from "../../services/SpreadsheetFormulaService";
import { xlsxTableService } from "../../services/XlsxTableService";
import { tauriService } from "../../tauri/TauriService";

type FilterOperator =
    "contains"
    | "equals"
    | "startsWith"
    | "greaterThan"
    | "greaterThanOrEqual"
    | "lessThan"
    | "lessThanOrEqual"
    | "dateEquals"
    | "dateBefore"
    | "dateAfter"
    | "empty"
    | "notEmpty";

interface ColumnFilter {

    operator: FilterOperator;

    value: string;

    selectedValues: string[];

}

interface ActiveSpreadsheetCell {

    worksheetName: string;

    cellAddress: string;

    field: string;

    rowId: number;

}

const defaultFilter: ColumnFilter = {
    operator: "contains",
    value: "",
    selectedValues: []
};

const lastWorkbookPathStorageKey =
    "startagro.lastXlsxWorkbookPath";

const dataGridLocaleText = {
    ...huHU.components.MuiDataGrid.defaultProps.localeText,
    paginationDisplayedRows: ({
        from,
        to,
        count,
        estimated
    }) => {
        if (count !== -1) {
            return `${from}–${to} / ${count}`;
        }

        if (estimated && estimated > to) {
            return `${from}–${to} / körülbelül ${estimated}`;
        }

        return `${from}–${to} / több mint ${to}`;
    }
} satisfies Partial<GridLocaleText>;

export default function WorkOrderTableView() {

    const hasStartedAutomaticLoad =
        useRef(false);

    const isMounted =
        useRef(true);

    const loadRequestId =
        useRef(0);

    const spreadsheetFormulaService =
        useRef<SpreadsheetFormulaService | null>(null);

    const [workbookData, setWorkbookData] =
        useState<XlsxWorkbookData | null>(null);

    const [activeWorksheetIndex, setActiveWorksheetIndex] =
        useState(0);

    const [isLoading, setIsLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [globalSearch, setGlobalSearch] =
        useState("");

    const [filters, setFilters] =
        useState<Record<string, ColumnFilter>>({});

    const [filterAnchor, setFilterAnchor] =
        useState<HTMLElement | null>(null);

    const [activeFilterField, setActiveFilterField] =
        useState<string | null>(null);

    const [sortModel, setSortModel] =
        useState<GridSortModel>([]);

    const [columnVisibilityModel, setColumnVisibilityModel] =
        useState<GridColumnVisibilityModel>({});

    const [paginationModel, setPaginationModel] =
        useState<GridPaginationModel>({
            page: 0,
            pageSize: 100
        });

    const [activeCell, setActiveCell] =
        useState<ActiveSpreadsheetCell | null>(null);

    const [formulaInput, setFormulaInput] =
        useState("");

    const [overlayRevision, setOverlayRevision] =
        useState(0);

    const tableData =
        workbookData?.worksheets[activeWorksheetIndex] ?? null;

    useEffect(() => {

        isMounted.current = true;

        if (!hasStartedAutomaticLoad.current) {
            hasStartedAutomaticLoad.current = true;

            const savedPath =
                localStorage.getItem(lastWorkbookPathStorageKey);

            if (savedPath) {
                void loadWorkbook(savedPath, true);
            }
        }

        return () => {
            isMounted.current = false;
        };

    }, []);

    async function handleBrowse() {

        const path =
            await dialogService.selectXlsxFile();

        if (!path) {
            return;
        }

        await loadWorkbook(path, false);

    }

    async function loadWorkbook(
        path: string,
        isAutomatic: boolean
    ) {

        const requestId =
            ++loadRequestId.current;

        setIsLoading(true);
        setError(null);

        try {

            const bytes =
                await tauriService.readXlsxBytes(path);

            const parsedWorkbook =
                xlsxTableService.parse(
                    bytes.buffer.slice(
                        bytes.byteOffset,
                        bytes.byteOffset + bytes.byteLength
                    ),
                    getFileName(path)
                );

            if (
                !isMounted.current
                || requestId !== loadRequestId.current
            ) {
                return;
            }

            setParsedWorkbook(parsedWorkbook);

            if (!isAutomatic) {
                localStorage.setItem(
                    lastWorkbookPathStorageKey,
                    path
                );
            }

        } catch (err) {

            console.error(err);

            if (
                !isMounted.current
                || requestId !== loadRequestId.current
            ) {
                return;
            }

            if (isAutomatic) {
                localStorage.removeItem(lastWorkbookPathStorageKey);
            } else {
                setError("A kiválasztott XLSX fájl nem olvasható vagy érvénytelen.");
            }

            setWorkbookData(null);
            setActiveWorksheetIndex(0);
            spreadsheetFormulaService.current = null;
            clearActiveCell();

        } finally {

            if (
                isMounted.current
                && requestId === loadRequestId.current
            ) {
                setIsLoading(false);
            }

        }

    }

    function setParsedWorkbook(data: XlsxWorkbookData) {

        spreadsheetFormulaService.current =
            createSpreadsheetFormulaService(data);

        setWorkbookData(data);
        setActiveWorksheetIndex(0);
        setOverlayRevision(0);
        clearActiveCell();
        resetTableState();

    }

    function handleWorksheetChange(index: number) {

        setActiveWorksheetIndex(index);
        clearActiveCell();
        closeColumnFilter();
        resetTableState();

    }

    function resetTableState() {

        setGlobalSearch("");
        setFilters({});
        setSortModel([]);
        setColumnVisibilityModel({});
        setPaginationModel(current => ({
            ...current,
            page: 0
        }));

    }

    const displayedRows =
        useMemo(
            () => applySpreadsheetOverrides(
                tableData?.rows ?? [],
                tableData?.worksheetName ?? "",
                spreadsheetFormulaService.current
            ),
            [
                tableData,
                overlayRevision
            ]
        );

    const filteredRows =
        useMemo(
            () => filterRows(
                displayedRows,
                globalSearch,
                filters
            ),
            [
                displayedRows,
                globalSearch,
                filters
            ]
        );

    const gridColumns =
        useMemo(
            () => buildGridColumns(
                tableData?.columns ?? [],
                filters,
                openColumnFilter,
                activeCell
            ),
            [
                tableData,
                filters,
                activeCell
            ]
        );

    const activeColumn =
        tableData?.columns.find(column =>
            column.field === activeFilterField
        ) ?? null;

    const activeFilter =
        activeFilterField
            ? filters[activeFilterField] ?? defaultFilter
            : defaultFilter;

    const visibleValues =
        useMemo(
            () => getVisibleValues(
                displayedRows,
                globalSearch,
                filters,
                activeFilterField
            ),
            [
                displayedRows,
                globalSearch,
                filters,
                activeFilterField
            ]
        );

    function openColumnFilter(
        field: string,
        anchor: HTMLElement
    ) {

        setActiveFilterField(field);
        setFilterAnchor(anchor);

    }

    function closeColumnFilter() {

        setFilterAnchor(null);
        setActiveFilterField(null);

    }

    function updateActiveFilter(
        patch: Partial<ColumnFilter>
    ) {

        if (!activeFilterField) {
            return;
        }

        setFilters(current => ({
            ...current,
            [activeFilterField]: {
                ...defaultFilter,
                ...current[activeFilterField],
                ...patch
            }
        }));

    }

    function clearActiveFilter() {

        if (!activeFilterField) {
            return;
        }

        setFilters(current => {
            const next = { ...current };
            delete next[activeFilterField];
            return next;
        });

        closeColumnFilter();

    }

    function clearAllFilters() {

        setFilters({});
        setGlobalSearch("");

    }

    function handleCellClick(
        row: XlsxTableRow,
        field: string
    ) {

        const cell = row.cells[field];

        if (!cell || !tableData) {
            return;
        }

        const selection: ActiveSpreadsheetCell = {
            worksheetName: tableData.worksheetName,
            cellAddress: cell.cellAddress,
            field,
            rowId: row.id
        };

        setActiveCell(selection);
        setFormulaInput(
            spreadsheetFormulaService.current?.getOverride(
                selection.worksheetName,
                selection.cellAddress
            )?.input
            ?? cell.originalInput
        );

    }

    function commitFormulaInput() {

        if (!activeCell || !spreadsheetFormulaService.current || !tableData) {
            return;
        }

        const originalCell =
            findCell(tableData.rows, activeCell);

        if (formulaInput === originalCell?.originalInput) {
            spreadsheetFormulaService.current.resetCell(
                activeCell.worksheetName,
                activeCell.cellAddress
            );
        } else {
            spreadsheetFormulaService.current.setCellInput(
                activeCell.worksheetName,
                activeCell.cellAddress,
                formulaInput
            );
        }

        setOverlayRevision(current => current + 1);

    }

    function cancelFormulaInput() {

        if (!activeCell || !tableData) {
            return;
        }

        const originalCell =
            findCell(tableData.rows, activeCell);

        setFormulaInput(
            spreadsheetFormulaService.current?.getOverride(
                activeCell.worksheetName,
                activeCell.cellAddress
            )?.input
            ?? originalCell?.originalInput
            ?? ""
        );

    }

    function resetActiveCell() {

        if (!activeCell || !spreadsheetFormulaService.current || !tableData) {
            return;
        }

        spreadsheetFormulaService.current.resetCell(
            activeCell.worksheetName,
            activeCell.cellAddress
        );

        const originalCell =
            findCell(tableData.rows, activeCell);

        setFormulaInput(originalCell?.originalInput ?? "");
        setOverlayRevision(current => current + 1);

    }

    function clearActiveCell() {

        setActiveCell(null);
        setFormulaInput("");

    }

    const hasFilters =
        globalSearch.length > 0
        || Object.keys(filters).length > 0;

    const activeOverride =
        activeCell
            ? spreadsheetFormulaService.current?.getOverride(
                activeCell.worksheetName,
                activeCell.cellAddress
            )
            : undefined;

    return (

        <Box
            sx={{
                width: "100%",
                maxWidth: "100%",
                height: "100%",
                minWidth: 0,
                minHeight: 0,
                display: "grid",
                gridTemplateRows: "auto auto minmax(0, 1fr)",
                boxSizing: "border-box",
                overflow: "hidden",
                bgcolor: "background.default"
            }}
        >

            <Toolbar
                sx={{
                    gap: 1.5,
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    flexWrap: "wrap",
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper"
                }}
            >

                <Typography
                    variant="h6"
                    noWrap
                    sx={{
                        fontWeight: 600,
                        minWidth: 0
                    }}
                >
                    Munkalapok táblázat
                </Typography>

                {workbookData && (

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        title={workbookData.sourceName}
                        sx={{
                            maxWidth: 220,
                            minWidth: 0
                        }}
                    >
                        {workbookData.sourceName}
                    </Typography>

                )}

                {workbookData && (

                    <FormControl
                        size="small"
                        sx={{
                            flex: "0 1 240px",
                            minWidth: 160,
                            maxWidth: 320
                        }}
                    >
                        <InputLabel>Munkalap</InputLabel>
                        <Select
                            label="Munkalap"
                            value={activeWorksheetIndex}
                            disabled={workbookData.worksheets.length === 1}
                            onChange={event =>
                                handleWorksheetChange(
                                    Number(event.target.value)
                                )
                            }
                        >
                            {workbookData.worksheets.map((worksheet, index) => (
                                <MenuItem
                                    key={worksheet.worksheetName}
                                    value={index}
                                >
                                    {worksheet.worksheetName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                )}

                <TextField
                    size="small"
                    label="Globális keresés"
                    value={globalSearch}
                    onChange={event => setGlobalSearch(event.target.value)}
                    sx={{
                        flex: "1 1 240px",
                        width: 320,
                        maxWidth: 420,
                        minWidth: 0
                    }}
                />

                <Button
                    variant="outlined"
                    startIcon={<ClearAllIcon />}
                    onClick={clearAllFilters}
                    disabled={!hasFilters}
                >
                    Szűrők törlése
                </Button>

                <Box sx={{ flex: "1 1 0", minWidth: 0 }} />

                {tableData && (

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                    >
                        {filteredRows.length} / {tableData.rows.length} sor
                    </Typography>

                )}

                <Button
                    variant="contained"
                    startIcon={<FolderOpenIcon />}
                    onClick={handleBrowse}
                    disabled={isLoading}
                >
                    Tallózás
                </Button>

            </Toolbar>

            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{
                    px: 2,
                    py: 1,
                    minWidth: 0,
                    alignItems: { xs: "stretch", sm: "center" },
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper"
                }}
            >

                <Typography
                    variant="body2"
                    sx={{
                        minWidth: 92,
                        fontWeight: 600
                    }}
                >
                    Cella: {activeCell?.cellAddress ?? "–"}
                </Typography>

                <TextField
                    size="small"
                    fullWidth
                    placeholder="Jelöljön ki egy cellát"
                    value={formulaInput}
                    disabled={!activeCell}
                    error={Boolean(activeOverride?.error)}
                    helperText={activeOverride?.error ?? " "}
                    onChange={event => setFormulaInput(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            commitFormulaInput();
                        } else if (event.key === "Escape") {
                            event.preventDefault();
                            cancelFormulaInput();
                        }
                    }}
                    slotProps={{
                        formHelperText: {
                            sx: {
                                minHeight: 18,
                                my: 0,
                                lineHeight: "18px"
                            }
                        }
                    }}
                />

                <Button
                    variant="outlined"
                    startIcon={<RestartAltIcon />}
                    disabled={!activeOverride}
                    onClick={resetActiveCell}
                    sx={{ whiteSpace: "nowrap" }}
                >
                    Eredeti érték
                </Button>

            </Stack>

            <Box
                sx={{
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    minHeight: 0,
                    p: 2,
                    boxSizing: "border-box",
                    overflow: "hidden"
                }}
            >

                <Paper
                    square
                    sx={{
                        width: "100%",
                        maxWidth: "100%",
                        height: "100%",
                        minWidth: 0,
                        minHeight: 0,
                        boxSizing: "border-box",
                        overflow: "hidden"
                    }}
                >

                    {renderContent()}

                </Paper>

            </Box>

            <Popover
                open={Boolean(filterAnchor && activeColumn)}
                anchorEl={filterAnchor}
                onClose={closeColumnFilter}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right"
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right"
                }}
            >

                {activeColumn && (

                    <Stack
                        spacing={2}
                        sx={{
                            width: 320,
                            p: 2
                        }}
                    >

                        <Typography
                            variant="subtitle2"
                            noWrap
                        >
                            {activeColumn.headerName}
                        </Typography>

                        <FormControl size="small">
                            <InputLabel>Művelet</InputLabel>
                            <Select
                                label="Művelet"
                                value={activeFilter.operator}
                                onChange={event =>
                                    updateActiveFilter({
                                        operator: event.target.value as FilterOperator
                                    })
                                }
                            >
                                {getOperatorOptions(activeColumn).map(option => (
                                    <MenuItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {!isEmptyOperator(activeFilter.operator) && (

                            <TextField
                                size="small"
                                label="Érték"
                                type={
                                    activeColumn.type === "date"
                                        ? "date"
                                        : "text"
                                }
                                value={activeFilter.value}
                                onChange={event =>
                                    updateActiveFilter({
                                        value: event.target.value
                                    })
                                }
                                slotProps={{
                                    inputLabel: {
                                        shrink: activeColumn.type === "date"
                                            ? true
                                            : undefined
                                    }
                                }}
                            />

                        )}

                        <FormControl size="small">
                            <InputLabel>Látható értékek</InputLabel>
                            <Select
                                multiple
                                label="Látható értékek"
                                value={activeFilter.selectedValues}
                                renderValue={selected =>
                                    selected.length === 0
                                        ? "Mind"
                                        : `${selected.length} érték`
                                }
                                onChange={event =>
                                    updateActiveFilter({
                                        selectedValues: typeof event.target.value === "string"
                                            ? event.target.value.split(",")
                                            : event.target.value
                                    })
                                }
                            >
                                {visibleValues.slice(0, 500).map(value => (
                                    <MenuItem
                                        key={value}
                                        value={value}
                                    >
                                        <Checkbox
                                            checked={
                                                activeFilter.selectedValues.includes(value)
                                            }
                                        />
                                        <ListItemText
                                            primary={value || "(üres)"}
                                        />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {visibleValues.length > 500 && (

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Az értéklista első 500 eleme látható.
                            </Typography>

                        )}

                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                justifyContent: "flex-end"
                            }}
                        >

                            <Button
                                onClick={clearActiveFilter}
                            >
                                Szűrő törlése
                            </Button>

                            <Button
                                variant="contained"
                                onClick={closeColumnFilter}
                            >
                                Kész
                            </Button>

                        </Stack>

                    </Stack>

                )}

            </Popover>

        </Box>

    );

    function renderContent() {

        if (isLoading) {
            return (
                <Stack
                    spacing={2}
                    sx={{
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <CircularProgress />
                    <Typography>Táblázat betöltése...</Typography>
                </Stack>
            );
        }

        if (error) {
            return (
                <Box sx={{ p: 2 }}>
                    <Alert severity="error">
                        {error}
                    </Alert>
                </Box>
            );
        }

        if (!tableData) {
            return (
                <Box sx={{ p: 2 }}>
                    <Alert severity="info">
                        A Tallózás gombbal válassza ki a megnyitni kívánt táblázatot!
                    </Alert>
                </Box>
            );
        }

        if (tableData.columns.length === 0) {
            return (
                <Box sx={{ p: 2 }}>
                    <Alert severity="warning">
                        A(z) „{tableData.worksheetName}” munkalap üres.
                    </Alert>
                </Box>
            );
        }

        return (

            <DataGrid
                key={`${workbookData?.sourceName}:${tableData.worksheetName}`}
                rows={filteredRows}
                columns={gridColumns}
                getRowId={row => row.id}
                density="compact"
                disableRowSelectionOnClick
                onCellClick={params =>
                    handleCellClick(params.row, params.field)
                }
                sortModel={sortModel}
                onSortModelChange={setSortModel}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={setColumnVisibilityModel}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[25, 50, 100]}
                localeText={dataGridLocaleText}
                showToolbar
                sx={{
                    width: "100%",
                    maxWidth: "100%",
                    height: "100%",
                    minWidth: 0,
                    minHeight: 0,
                    boxSizing: "border-box",
                    border: 0,
                    "& .MuiDataGrid-cell": {
                        alignItems: "center"
                    },
                    "& .spreadsheet-active-cell": {
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: -2,
                        bgcolor: "action.selected"
                    }
                }}
            />

        );

    }

}

function buildGridColumns(
    columns: XlsxTableColumn[],
    filters: Record<string, ColumnFilter>,
    openColumnFilter: (
        field: string,
        anchor: HTMLElement
    ) => void,
    activeCell: ActiveSpreadsheetCell | null
): GridColDef<XlsxTableRow>[] {

    return columns.map(column => ({
        field: column.field,
        headerName: column.headerName,
        width: 180,
        minWidth: 120,
        sortable: true,
        hideable: true,
        resizable: true,
        valueGetter: (_value, row) =>
            row.cells[column.field]?.displayValue ?? "",
        cellClassName: params =>
            activeCell?.rowId === params.row.id
            && activeCell.field === column.field
                ? "spreadsheet-active-cell"
                : "",
        sortComparator: (a, b) =>
            compareValues(
                String(a ?? ""),
                String(b ?? ""),
                column.type
            ),
        renderHeader: () => (
            <Stack
                direction="row"
                spacing={0.5}
                sx={{
                    minWidth: 0,
                    width: "100%",
                    alignItems: "center"
                }}
            >
                <Typography
                    variant="body2"
                    noWrap
                    title={column.headerName}
                    sx={{
                        fontWeight: 600,
                        flexGrow: 1,
                        minWidth: 0
                    }}
                >
                    {column.headerName}
                </Typography>
                <Tooltip title="Oszlopszűrő">
                    <Button
                        size="small"
                        color={filters[column.field] ? "primary" : "inherit"}
                        onClick={event => {
                            event.stopPropagation();
                            openColumnFilter(
                                column.field,
                                event.currentTarget
                            );
                        }}
                        sx={{
                            minWidth: 28,
                            width: 28,
                            height: 28,
                            p: 0
                        }}
                    >
                        <FilterAltIcon fontSize="small" />
                    </Button>
                </Tooltip>
            </Stack>
        )
    }));

}

function createSpreadsheetFormulaService(
    workbook: XlsxWorkbookData
): SpreadsheetFormulaService {

    return new SpreadsheetFormulaService(
        iterateSpreadsheetOriginalCells(workbook)
    );

}

function* iterateSpreadsheetOriginalCells(
    workbook: XlsxWorkbookData
) {

    for (const worksheet of workbook.worksheets) {
        for (const row of worksheet.rows) {
            for (const cell of Object.values(row.cells)) {
                yield {
                    worksheetName: worksheet.worksheetName,
                    cellAddress: cell.cellAddress,
                    value: cell.originalValue
                };
            }
        }
    }

}

function applySpreadsheetOverrides(
    rows: XlsxTableRow[],
    worksheetName: string,
    service: SpreadsheetFormulaService | null
): XlsxTableRow[] {

    const overrides =
        service?.getOverridesForWorksheet(worksheetName) ?? [];

    const displayedOverrides =
        new Map(
            overrides
                .filter(override =>
                    !override.error
                    && override.calculatedValue !== undefined
                )
                .map(override => [
                    override.cellAddress,
                    formatSpreadsheetValue(override.calculatedValue)
                ])
        );

    if (displayedOverrides.size === 0) {
        return rows;
    }

    return rows.map(row => {
        let changed = false;

        const cells =
            Object.fromEntries(
                Object.entries(row.cells).map(([field, cell]) => {
                    const displayValue =
                        displayedOverrides.get(cell.cellAddress);

                    if (displayValue === undefined) {
                        return [field, cell];
                    }

                    changed = true;

                    return [
                        field,
                        {
                            ...cell,
                            displayValue
                        }
                    ];
                })
            );

        if (!changed) {
            return row;
        }

        return {
            ...row,
            cells,
            searchText: Object.values(cells)
                .map(cell => cell.displayValue)
                .filter(value => value.length > 0)
                .map(value => value.toLocaleLowerCase("hu-HU"))
                .join(" ")
        };
    });

}

function formatSpreadsheetValue(
    value: unknown
): string {

    return value === null || value === undefined
        ? ""
        : String(value);

}

function findCell(
    rows: XlsxTableRow[],
    activeCell: ActiveSpreadsheetCell
) {

    return rows.find(row => row.id === activeCell.rowId)
        ?.cells[activeCell.field];

}

function filterRows(
    rows: XlsxTableRow[],
    globalSearch: string,
    filters: Record<string, ColumnFilter>
): XlsxTableRow[] {

    const normalizedSearch =
        globalSearch.trim().toLocaleLowerCase("hu-HU");

    if (
        !normalizedSearch
        && Object.keys(filters).length === 0
    ) {
        return rows;
    }

    return rows.filter(row => {

        if (
            normalizedSearch
            && !row.searchText.includes(normalizedSearch)
        ) {
            return false;
        }

        return Object.entries(filters).every(([field, filter]) =>
            matchesFilter(
                row.cells[field]?.displayValue ?? "",
                filter
            )
        );

    });

}

function getVisibleValues(
    rows: XlsxTableRow[],
    globalSearch: string,
    filters: Record<string, ColumnFilter>,
    activeField: string | null
): string[] {

    if (!activeField) {
        return [];
    }

    const filtersWithoutActive =
        { ...filters };

    delete filtersWithoutActive[activeField];

    const rowsForValues =
        filterRows(
            rows,
            globalSearch,
            filtersWithoutActive
        );

    return Array.from(
        new Set(
            rowsForValues.map(row =>
                row.cells[activeField]?.displayValue ?? ""
            )
        )
    ).sort((a, b) =>
        a.localeCompare(
            b,
            "hu-HU",
            {
                numeric: true,
                sensitivity: "base"
            }
        )
    );

}

function matchesFilter(
    value: string,
    filter: ColumnFilter
): boolean {

    if (
        filter.selectedValues.length > 0
        && !filter.selectedValues.includes(value)
    ) {
        return false;
    }

    if (filter.operator === "empty") {
        return value.length === 0;
    }

    if (filter.operator === "notEmpty") {
        return value.length > 0;
    }

    if (!filter.value.trim()) {
        return true;
    }

    const normalizedValue =
        value.toLocaleLowerCase("hu-HU");

    const normalizedFilter =
        filter.value.toLocaleLowerCase("hu-HU");

    switch (filter.operator) {
        case "equals":
            return normalizedValue === normalizedFilter;
        case "startsWith":
            return normalizedValue.startsWith(normalizedFilter);
        case "greaterThan":
            return compareNumbers(value, filter.value, (a, b) => a > b);
        case "greaterThanOrEqual":
            return compareNumbers(value, filter.value, (a, b) => a >= b);
        case "lessThan":
            return compareNumbers(value, filter.value, (a, b) => a < b);
        case "lessThanOrEqual":
            return compareNumbers(value, filter.value, (a, b) => a <= b);
        case "dateEquals":
            return compareDates(value, filter.value, (a, b) => a === b);
        case "dateBefore":
            return compareDates(value, filter.value, (a, b) => a < b);
        case "dateAfter":
            return compareDates(value, filter.value, (a, b) => a > b);
        case "contains":
        default:
            return normalizedValue.includes(normalizedFilter);
    }

}

function getOperatorOptions(column: XlsxTableColumn) {

    const textOptions = [
        {
            value: "contains",
            label: "Tartalmazza"
        },
        {
            value: "equals",
            label: "Pontosan egyezik"
        },
        {
            value: "startsWith",
            label: "Ezzel kezdődik"
        }
    ];

    const numberOptions = [
        {
            value: "greaterThan",
            label: "Nagyobb mint"
        },
        {
            value: "greaterThanOrEqual",
            label: "Nagyobb vagy egyenlő"
        },
        {
            value: "lessThan",
            label: "Kisebb mint"
        },
        {
            value: "lessThanOrEqual",
            label: "Kisebb vagy egyenlő"
        }
    ];

    const dateOptions = [
        {
            value: "dateEquals",
            label: "Dátum egyezik"
        },
        {
            value: "dateBefore",
            label: "Dátum előtt"
        },
        {
            value: "dateAfter",
            label: "Dátum után"
        }
    ];

    return [
        ...textOptions,
        ...(column.type === "number" ? numberOptions : []),
        ...(column.type === "date" ? dateOptions : []),
        {
            value: "empty",
            label: "Üres"
        },
        {
            value: "notEmpty",
            label: "Nem üres"
        }
    ];

}

function isEmptyOperator(
    operator: FilterOperator
): boolean {

    return operator === "empty"
        || operator === "notEmpty";

}

function compareValues(
    a: string,
    b: string,
    type: XlsxTableColumn["type"]
): number {

    if (type === "number") {
        return compareNullable(
            parseNumber(a),
            parseNumber(b)
        );
    }

    if (type === "date") {
        return compareNullable(
            parseDate(a),
            parseDate(b)
        );
    }

    return a.localeCompare(
        b,
        "hu-HU",
        {
            numeric: true,
            sensitivity: "base"
        }
    );

}

function compareNumbers(
    value: string,
    filterValue: string,
    compare: (a: number, b: number) => boolean
): boolean {

    const a =
        parseNumber(value);

    const b =
        parseNumber(filterValue);

    return a !== null
        && b !== null
        && compare(a, b);

}

function compareDates(
    value: string,
    filterValue: string,
    compare: (a: number, b: number) => boolean
): boolean {

    const a =
        parseDate(value);

    const b =
        parseDate(filterValue);

    return a !== null
        && b !== null
        && compare(a, b);

}

function compareNullable(
    a: number | null,
    b: number | null
): number {

    if (a === null && b === null) {
        return 0;
    }

    if (a === null) {
        return -1;
    }

    if (b === null) {
        return 1;
    }

    return a - b;

}

function parseNumber(
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

function parseDate(
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

function getFileName(
    path: string
): string {

    return path.split(/[\\/]/).pop() ?? path;

}
