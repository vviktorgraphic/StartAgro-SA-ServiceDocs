import {
    Box,
    Divider,
    Typography
} from "@mui/material";

export default function PreviewPanel() {

    return (

        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%"
            }}
        >

            <Box sx={{ p: 2 }}>

                <Typography variant="h6">

                    Előnézet

                </Typography>

            </Box>

            <Divider />

            <Box
                sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1
                }}
            >

                <Typography>

                    <strong>Munkalap:</strong> -

                </Typography>

                <Typography>

                    <strong>Partner:</strong> -

                </Typography>

                <Typography>

                    <strong>Szervizcsapat:</strong> -

                </Typography>

            </Box>

            <Divider />

            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >

                <Typography color="text.secondary">

                    Nincs kiválasztott munkalap.

                </Typography>

            </Box>

            <Divider />

            <Box
                sx={{
                    p: 2
                }}
            >

                <Typography variant="subtitle2">

                    Fotódokumentáció

                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >

                    Nincs kapcsolódó fénykép.

                </Typography>

            </Box>

        </Box>

    );

}