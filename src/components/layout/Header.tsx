import {
    AppBar,
    Box,
    Button,
    Toolbar,
    Typography
} from "@mui/material";

import { dialogService } from "../../services/DialogService";
import { indexService } from "../../services/IndexService";

export default function Header() {

    async function handleSelectFolder() {

        try {

            const folder = await dialogService.selectDocumentsFolder();

            if (!folder) {
                return;
            }

            await indexService.run(folder);

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