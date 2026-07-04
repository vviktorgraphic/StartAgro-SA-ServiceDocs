import {
    Box,
    Button,
    Divider,
    MenuItem,
    Stack,
    TextField,
    Typography
} from "@mui/material";

export default function Sidebar() {

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

            <Typography
                variant="h6"
            >
                Szűrők
            </Typography>

            <Divider />

            <TextField
                select
                size="small"
                label="Szervizcsapat"
                fullWidth
                defaultValue=""
            >
                <MenuItem value="">
                    Minden csapat
                </MenuItem>

                <MenuItem value="HT">
                    Help-Trak Kft.
                </MenuItem>

                <MenuItem value="TP">
                    Turcsányi Péter
                </MenuItem>
            </TextField>

            <TextField
                size="small"
                label="Munkalap"
                placeholder="Pl.: HT-0008218"
                fullWidth
            />

            <TextField
                size="small"
                label="Partner"
                fullWidth
            />

            <TextField
                size="small"
                label="Technikus"
                fullWidth
            />

            <TextField
                size="small"
                label="Géptípus"
                fullWidth
            />

            <TextField
                size="small"
                label="Gyári szám"
                fullWidth
            />

            <Stack spacing={2}>

                <TextField
                    size="small"
                    label="Dátumtól"
                    placeholder="ÉÉÉÉ.HH.NN"
                    fullWidth
                />

                <TextField
                    size="small"
                    label="Dátumig"
                    placeholder="ÉÉÉÉ.HH.NN"
                    fullWidth
                />

            </Stack>

            <Button
                variant="outlined"
                fullWidth
            >
                Szűrők törlése
            </Button>

        </Box>

    );

}
