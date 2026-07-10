import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import AppShell from "./components/layout/AppShell";
import MainNavigation, { MainView } from "./components/layout/MainNavigation";
import WorkOrderTableView from "./components/table/WorkOrderTableView";
import { useAppContext } from "./context/AppContext";
import { loadWorkOrdersService } from "./services/LoadWorkOrdersService";
import { startupService } from "./services/StartupService";

export default function App() {

    const [activeView, setActiveView] =
        useState<MainView>("quickSearch");

    const {

        setWorkOrders,

        setSelectedWorkOrder

    } = useAppContext();

    useEffect(() => {

        async function initialize() {

            try {

                await startupService.initialize();

                const workOrders =
                    await loadWorkOrdersService.loadAll();

                setWorkOrders(
                    workOrders
                );

                if (workOrders.length > 0) {

                    setSelectedWorkOrder(
                        workOrders[0]
                    );

                }

            } catch (error) {

                console.error(error);

            }

        }

        initialize();

    }, [

        setWorkOrders,

        setSelectedWorkOrder

    ]);

    return (

        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "220px minmax(0, 1fr)",
                width: "100%",
                maxWidth: "100%",
                height: "100vh",
                minWidth: 0,
                minHeight: 0,
                boxSizing: "border-box",
                overflow: "hidden",
                bgcolor: "background.default"
            }}
        >

            <MainNavigation
                activeView={activeView}
                onViewChange={setActiveView}
            />

            <Box
                sx={{
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    minHeight: 0,
                    boxSizing: "border-box",
                    overflow: "hidden"
                }}
            >
                {activeView === "quickSearch"
                    ? <AppShell />
                    : <WorkOrderTableView />}
            </Box>

        </Box>

    );

}
