import {
    AppBar,
    Box,
    Button,
    Toolbar,
    Typography
} from "@mui/material";

import { useAppContext } from "../../context/AppContext";
import { dialogService } from "../../services/DialogService";
import { indexService } from "../../services/IndexService";
import { loadWorkOrdersService } from "../../services/LoadWorkOrdersService";

export default function Header() {

    const {
        documentsFolder,
        setDocumentsFolder,
        setWorkOrders,
        setSelectedWorkOrder
    } = useAppContext();

    async function refreshWorkOrders() {

        const workOrders =
            await loadWorkOrdersService.loadAll();

        setWorkOrders(workOrders);

        setSelectedWorkOrder(
            workOrders[0] ?? null
        );

    }

    async function handleSelectFolder() {

        try {

            const folder =
                await dialogService.selectDocumentsFolder();

            if (!folder) {
                return;
            }

            setDocumentsFolder(folder);

            await refreshWorkOrders();

        } catch (err) {

            console.error(
                "Dialog hiba:",
                err
            );

        }

    }

    async function handleIndexFolder() {

        try {

            if (!documentsFolder) {
                return;
            }

            await indexService.run(documentsFolder);

            await refreshWorkOrders();

        } catch (err) {

            console.error(
                "Indexeles hiba:",
                err
            );

        }

    }

    return (

        <AppBar
            position="static"
            color="primary"
            elevation={1}
        >

            <Toolbar>

                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600
                    }}
                >
                    Start Agro – Szerviz Munkalapok
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Button
                    color="inherit"
                    onClick={handleSelectFolder}
                >
                    Tallózás
                </Button>

                <Button
                    color="inherit"
                    onClick={handleIndexFolder}
                >
                    🔄 Mappa indexelése
                </Button>

                <Button color="inherit">
                    ⚙
                </Button>

            </Toolbar>

        </AppBar>

    );

}
