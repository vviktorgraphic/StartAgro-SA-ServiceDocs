import {
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

    function renderIndexStatus() {

        if (isIndexing) {
            return "Indexelés folyamatban...";
        }

        if (indexError) {
            return indexError;
        }

        if (indexSummary) {
            return renderSummary(indexSummary);
        }

        return null;

    }

    const indexStatus =
        renderIndexStatus();

    return (

        <AppBar
            position="static"
            color="primary"
            elevation={1}
            sx={{
                height: 64,
                zIndex: theme => theme.zIndex.drawer + 2
            }}
        >

            <Toolbar
                sx={{
                    minHeight: "64px !important",
                    gap: 1,
                    position: "relative"
                }}
            >

                <Typography
                    variant="h6"
                    noWrap
                    sx={{
                        fontWeight: 600
                    }}
                >
                    Start Agro - Szerviz Munkalapok
                </Typography>

                {indexStatus && (

                    <Box
                        sx={{
                            maxWidth: 520,
                            minWidth: 0,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: "rgba(255, 255, 255, 0.14)",
                            border: 1,
                            borderColor: "rgba(255, 255, 255, 0.24)"
                        }}
                    >

                        <Typography
                            variant="body2"
                            noWrap
                            title={indexStatus}
                        >

                            {indexStatus}

                        </Typography>

                    </Box>

                )}

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

                {isIndexing && (

                    <LinearProgress
                        color="inherit"
                        sx={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}
                    />

                )}

            </Toolbar>

        </AppBar>

    );

}
