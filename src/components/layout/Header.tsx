import {
    AppBar,
    Box,
    Button,
    Toolbar,
    Typography
} from "@mui/material";

import { dialogService } from "../../services/DialogService";
import { indexService } from "../../services/IndexService";
import { useAppContext } from "../../context/AppContext";

export default function Header() {

    const {
        setDocumentsFolder,
        setWorkOrders
    } = useAppContext();

    async function handleSelectFolder() {

        try {

            const folder =
                await dialogService.selectDocumentsFolder();

            if (!folder) {
                return;
            }

            const workOrders =
                await indexService.run(folder);

            setDocumentsFolder(folder);

            setWorkOrders(workOrders);

        } catch (err) {

            console.error("Dialog hiba:", err);

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