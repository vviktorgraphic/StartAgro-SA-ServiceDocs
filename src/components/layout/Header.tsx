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
        setDocumentsFolder,
        setWorkOrders,
        setSelectedWorkOrder
    } = useAppContext();

    async function handleSelectFolder() {

        try {

            const folder =
                await dialogService.selectDocumentsFolder();

            if (!folder) {
                return;
            }

            await indexService.run(folder);

            const workOrders =
                await loadWorkOrdersService.loadAll();

            setDocumentsFolder(folder);

            setWorkOrders(workOrders);

            if (workOrders.length > 0) {

                setSelectedWorkOrder(
                    workOrders[0]
                );

            }

        } catch (err) {

            console.error(
                "Dialog hiba:",
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
                    📂 Dokumentummappa
                </Button>

                <Button color="inherit">
                    🔄 Mappa indexelése
                </Button>

                <Button color="inherit">
                    ⚙
                </Button>

            </Toolbar>

        </AppBar>

    );

}