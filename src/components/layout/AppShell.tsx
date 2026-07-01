import { Box, Paper } from "@mui/material";

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
            {/* Header */}
            <Paper
                square
                elevation={2}
                sx={{
                    gridColumn: "1 / 4"
                }}
            />

            {/* Search */}
            <Paper
                square
                elevation={1}
                sx={{
                    gridColumn: "1 / 4"
                }}
            />

            {/* Sidebar */}
            <Paper
                square
                sx={{
                    borderRight: 1,
                    borderColor: "divider"
                }}
            />

            {/* Document list */}
            <Paper
                square
                sx={{
                    borderRight: 1,
                    borderColor: "divider"
                }}
            />

            {/* Preview */}
            <Paper square />

            {/* Statusbar */}
            <Paper
                square
                elevation={2}
                sx={{
                    gridColumn: "1 / 4"
                }}
            />
        </Box>
    );
}