import PreviewPanel from "../preview/PreviewPanel";
import WorkOrderList from "../workorder/WorkOrderList";
import Sidebar from "../sidebar/Sidebar";
import SearchBar from "../search/SearchBar";
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

            <Box
                sx={{
                    gridColumn: "1 / 4",
                    gridRow: "2"
                }}
            >
                <SearchBar />
            </Box>

            <Paper
                square
                sx={{
                    gridRow: "3",
                    borderRight: 1,
                    borderColor: "divider"
                }}
            >
                <Sidebar />
            </Paper>
            
            <Paper
                square
                sx={{
                    gridRow: "3",
                    borderRight: 1,
                    borderColor: "divider"
                }}
            >
                <WorkOrderList />
            </Paper>


            <Paper
                square
                sx={{
                    gridRow: "3"
                }}
            >
                <PreviewPanel />
            </Paper>

            <Box
                sx={{
                    gridColumn: "1 / 4",
                    gridRow: "4"
                }}
            >
                <StatusBar />
            </Box>

        </Box>

    );

}