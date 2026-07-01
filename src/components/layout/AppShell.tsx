import { Box, Paper } from "@mui/material";

import Header from "./Header";
import StatusBar from "./StatusBar";

export default function AppShell() {

    return (

        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "280px 420px 1fr",
                gridTemplateRows: "64px 56px 1fr 36px",
                height: "100vh",
                bgcolor: "background.default"
            }}
        >

            <Box
                sx={{
                    gridColumn: "1 / 4"
                }}
            >
                <Header />
            </Box>

            <Paper
                square
                elevation={1}
                sx={{
                    gridColumn: "1 / 4"
                }}
            />

            <Paper
                square
                sx={{
                    borderRight: 1,
                    borderColor: "divider"
                }}
            />

            <Paper
                square
                sx={{
                    borderRight: 1,
                    borderColor: "divider"
                }}
            />

            <Paper square />

            <Box
                sx={{
                    gridColumn: "1 / 4"
                }}
            >
                <StatusBar />
            </Box>

        </Box>

    );

}