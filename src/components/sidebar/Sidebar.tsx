import {
    Box,
    Button,
    Divider,
    MenuItem,
    Stack,
    TextField,
    Typography
} from "@mui/material";

import {
    useAppContext,
    WorkOrderFilters
} from "../../context/AppContext";

const serviceTeams = [
    ["AD", "Admin"],
    ["SA", "Start Agro Kft"],
    ["HT", "Help-Trak Kft"],
    ["HA", "Haty Szerviz Kft"],
    ["LA", "Lengyel Attila"],
    ["TP", "Turcsányi Péter"],
    ["MJ", "Mester János"],
    ["PJ", "Pászti János"],
    ["SP", "Surányi Péter"],
    ["PB", "Pigler Béla"],
    ["KT", "Kis Tibor"],
    ["UP", "Urbán Péter"],
    ["GT", "Gellén Zoltán"]
] as const;

export default function Sidebar() {

    const {
        filters,
        setFilters,
        clearFilters
    } = useAppContext();

    function updateFilter(
        key: keyof WorkOrderFilters,
        value: string
    ) {

        setFilters({
            ...filters,
            [key]: value
        });

    }

    return (

        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: 0,
                p: 2,
                gap: 2,
                overflowY: "auto"
            }}
        >

            <Typography variant="h6">
                Szűrők
            </Typography>

            <Divider />

            <TextField
                select
                size="small"
                label="Szervizcsapat"
                fullWidth
                value={filters.serviceTeam}
                onChange={event =>
                    updateFilter(
                        "serviceTeam",
                        event.target.value
                    )
                }
            >
                <MenuItem value="">
                    Minden csapat
                </MenuItem>
                {serviceTeams.map(([prefix, name]) => (

                    <MenuItem
                        key={prefix}
                        value={prefix}
                    >
                        {name}
                    </MenuItem>

                ))}
            </TextField>

            <TextField
                size="small"
                label="Munkalap"
                placeholder="Pl.: HT-0008218"
                fullWidth
                value={filters.workOrderNumber}
                onChange={event =>
                    updateFilter(
                        "workOrderNumber",
                        event.target.value
                    )
                }
            />

            <TextField
                size="small"
                label="Partner"
                fullWidth
                value={filters.partnerName}
                onChange={event =>
                    updateFilter(
                        "partnerName",
                        event.target.value
                    )
                }
            />

            <TextField
                size="small"
                label="Technikus"
                fullWidth
                value={filters.technician}
                onChange={event =>
                    updateFilter(
                        "technician",
                        event.target.value
                    )
                }
            />

            <TextField
                size="small"
                label="Géptípus"
                fullWidth
                value={filters.machineType}
                onChange={event =>
                    updateFilter(
                        "machineType",
                        event.target.value
                    )
                }
            />

            <TextField
                size="small"
                label="Alvázszám"
                fullWidth
                value={filters.serialNumber}
                onChange={event =>
                    updateFilter(
                        "serialNumber",
                        event.target.value
                    )
                }
            />

            <Stack spacing={2}>

                <TextField
                    size="small"
                    label="Dátumtól"
                    type="date"
                    fullWidth
                    value={filters.dateFrom}
                    onChange={event =>
                        updateFilter(
                            "dateFrom",
                            event.target.value
                        )
                    }
                    slotProps={{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                />

                <TextField
                    size="small"
                    label="Dátumig"
                    type="date"
                    fullWidth
                    value={filters.dateTo}
                    onChange={event =>
                        updateFilter(
                            "dateTo",
                            event.target.value
                        )
                    }
                    slotProps={{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                />

            </Stack>

            <Button
                variant="outlined"
                fullWidth
                onClick={clearFilters}
            >
                Szűrők törlése
            </Button>

        </Box>

    );

}
