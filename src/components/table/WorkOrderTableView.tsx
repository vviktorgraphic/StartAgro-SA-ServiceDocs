import ClearAllIcon from "@mui/icons-material/ClearAll";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
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

        setWorkbookData(data);
        setActiveWorksheetIndex(0);
        resetTableState();

    }

    function handleWorksheetChange(index: number) {

        setActiveWorksheetIndex(index);
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

    const filteredRows =
        useMemo(
            () => filterRows(
                tableData?.rows ?? [],
                globalSearch,
                filters
            ),
            [
                tableData,
                globalSearch,
                filters
            ]
        );

    const gridColumns =
        useMemo(
            () => buildGridColumns(
                tableData?.columns ?? [],
                filters,
                openColumnFilter
            ),
            [
                tableData,
                filters
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
                tableData?.rows ?? [],
                globalSearch,
                filters,
                activeFilterField
            ),
            [
                tableData,
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

    const hasFilters =
        globalSearch.length > 0
        || Object.keys(filters).length > 0;

    return (

        <Box
            sx={{
                width: "100%",
                maxWidth: "100%",
                height: "100%",
                minWidth: 0,
                minHeight: 0,
                display: "grid",
                gridTemplateRows: "auto minmax(0, 1fr)",
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
    ) => void
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
