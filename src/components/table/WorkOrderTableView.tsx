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
    GridSortModel
} from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";

import { XlsxTableColumn, XlsxTableData, XlsxTableRow } from "../../models/XlsxTable";
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

const defaultTableUrl =
    new URL(
        "../../../datatable/test_tablazat.xlsx",
        import.meta.url
    ).href;

const defaultFilter: ColumnFilter = {
    operator: "contains",
    value: "",
    selectedValues: []
};

export default function WorkOrderTableView() {

    const [tableData, setTableData] =
        useState<XlsxTableData | null>(null);

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

    useEffect(() => {

        loadDefaultFile();

    }, []);

    async function loadDefaultFile() {

        setIsLoading(true);
        setError(null);

        try {

            const requestedResponse =
                await fetch("/datatable/test_tablazat.xlsx");

            const response =
                requestedResponse.ok
                    ? requestedResponse
                    : await fetch(defaultTableUrl);

            if (!response.ok) {
                setTableData(null);
                return;
            }

            const data =
                await response.arrayBuffer();

            setParsedTable(
                xlsxTableService.parse(
                    data,
                    "datatable/test_tablazat.xlsx"
                )
            );

        } catch (err) {

            console.error(err);
            setError("Az alapértelmezett XLSX fájl betöltése nem sikerült.");
            setTableData(null);

        } finally {

            setIsLoading(false);

        }

    }

    async function handleBrowse() {

        const path =
            await dialogService.selectXlsxFile();

        if (!path) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {

            const bytes =
                await tauriService.readXlsxBytes(path);

            setParsedTable(
                xlsxTableService.parse(
                    bytes.buffer.slice(
                        bytes.byteOffset,
                        bytes.byteOffset + bytes.byteLength
                    ),
                    getFileName(path)
                )
            );

        } catch (err) {

            console.error(err);
            setError("A kiválasztott XLSX fájl nem olvasható vagy érvénytelen.");
            setTableData(null);

        } finally {

            setIsLoading(false);

        }

    }

    function setParsedTable(data: XlsxTableData) {

        setTableData(data);
        setGlobalSearch("");
        setFilters({});
        setSortModel([]);
        setColumnVisibilityModel({});

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

    const gridRows =
        useMemo(
            () => filteredRows,
            [filteredRows]
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
                height: "100%",
                minHeight: 0,
                display: "grid",
                gridTemplateRows: "64px 1fr",
                bgcolor: "background.default"
            }}
        >

            <Toolbar
                sx={{
                    gap: 1.5,
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
                        minWidth: 220
                    }}
                >
                    Munkalapok táblázat
                </Typography>

                <TextField
                    size="small"
                    label="Globális keresés"
                    value={globalSearch}
                    onChange={event => setGlobalSearch(event.target.value)}
                    sx={{
                        width: 320
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

                <Box sx={{ flexGrow: 1 }} />

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
                    minHeight: 0,
                    p: 2
                }}
            >

                <Paper
                    square
                    sx={{
                        height: "100%",
                        minHeight: 0,
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
                        Nincs betöltött XLSX fájl.
                    </Alert>
                </Box>
            );
        }

        if (tableData.columns.length === 0) {
            return (
                <Box sx={{ p: 2 }}>
                    <Alert severity="warning">
                        Az első munkalap üres.
                    </Alert>
                </Box>
            );
        }

        return (

            <DataGrid
                rows={gridRows}
                columns={gridColumns}
                getRowId={row => row.id}
                density="compact"
                disableRowSelectionOnClick
                sortModel={sortModel}
                onSortModelChange={setSortModel}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={setColumnVisibilityModel}
                showToolbar
                sx={{
                    height: "100%",
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
