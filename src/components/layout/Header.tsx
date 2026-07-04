import {
    Alert,
    AppBar,
    Box,
    Button,
    LinearProgress,
    Toolbar,
    Typography
} from "@mui/material";
import { useState } from "react";

import { useAppContext } from "../../context/AppContext";
import { dialogService } from "../../services/DialogService";
import {
    IndexingSummary,
    indexService
} from "../../services/IndexService";
import { loadWorkOrdersService } from "../../services/LoadWorkOrdersService";

export default function Header() {

    const {
        documentsFolder,
        setDocumentsFolder,
        setWorkOrders,
        setSelectedWorkOrder
    } = useAppContext();

    const [isIndexing, setIsIndexing] =
        useState(false);

    const [indexSummary, setIndexSummary] =
        useState<IndexingSummary | null>(null);

    const [indexError, setIndexError] =
        useState<string | null>(null);

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

        if (!documentsFolder || isIndexing) {
            return;
        }

        setIsIndexing(true);
        setIndexSummary(null);
        setIndexError(null);

        try {

            const result =
                await indexService.run(documentsFolder);

            await refreshWorkOrders();

            setIndexSummary(result.summary);

        } catch (err) {

            console.error(
                "Indexelés hiba:",
                err
            );

            setIndexError(
                "Az indexelés nem sikerült. Ellenőrizd a dokumentummappát, majd próbáld újra."
            );

        } finally {

            setIsIndexing(false);

        }

    }

    function renderSummary(summary: IndexingSummary) {

        return [
            `${summary.scannedPdfs} PDF`,
            `${summary.scannedImages} kép`,
            `${summary.parsed} feldolgozva`,
            `${summary.skipped} kihagyva`,
            `${summary.deleted} törölve`,
            `${summary.errors} hiba`
        ].join(" | ");

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
                    Start Agro - Szerviz Munkalapok
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Button
                    color="inherit"
                    onClick={handleSelectFolder}
                    disabled={isIndexing}
                >
                    Tallózás
                </Button>

                <Button
                    color="inherit"
                    onClick={handleIndexFolder}
                    disabled={!documentsFolder || isIndexing}
                >
                    {isIndexing
                        ? "Indexelés..."
                        : "Mappa indexelése"}
                </Button>

                <Button color="inherit">
                    ⚙
                </Button>

            </Toolbar>

            {(isIndexing || indexSummary || indexError) && (

                <Box
                    sx={{
                        px: 2,
                        pb: 1
                    }}
                >

                    {isIndexing && (

                        <Box>

                            <Typography variant="body2">

                                Indexelés folyamatban...

                            </Typography>

                            <LinearProgress color="inherit" />

                        </Box>

                    )}

                    {indexSummary && !isIndexing && (

                        <Alert
                            severity={
                                indexSummary.errors > 0
                                    ? "warning"
                                    : "success"
                            }
                            sx={{ py: 0 }}
                        >

                            {renderSummary(indexSummary)}

                        </Alert>

                    )}

                    {indexError && !isIndexing && (

                        <Alert
                            severity="error"
                            sx={{ py: 0 }}
                        >

                            {indexError}

                        </Alert>

                    )}

                </Box>

            )}

        </AppBar>

    );

}
