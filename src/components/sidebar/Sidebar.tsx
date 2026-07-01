import {
    Box,
    Divider,
    Typography
} from "@mui/material";

export default function Sidebar() {

    return (

        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                p: 2
            }}
        >

            <Typography
                variant="h6"
                gutterBottom
            >

                Szűrők

            </Typography>

            <Divider />

        </Box>

    );

}