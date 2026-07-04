import {
    Box,
    Button,
    Dialog,
    Divider,
    Typography
} from "@mui/material";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

import { useAppContext } from "../../context/AppContext";
import ServiceVisitTable from "./ServiceVisitTable";

export default function PreviewPanel() {

    const { selectedWorkOrder } = useAppContext();
    const [openImageIndex, setOpenImageIndex] = useState<number | null>(null);

    const imageFiles = selectedWorkOrder?.imageFiles ?? [];
    const openImage =
        openImageIndex === null ? null : imageFiles[openImageIndex];

    function getFileName(path: string) {
        return path.split(/[\\/]/).pop() ?? path;
    }

    function showPreviousImage() {
        setOpenImageIndex(current => {
            if (current === null || imageFiles.length === 0) {
                return current;
            }

            return current === 0 ? imageFiles.length - 1 : current - 1;
        });
    }

    function showNextImage() {
        setOpenImageIndex(current => {
            if (current === null || imageFiles.length === 0) {
                return current;
            }

            return current === imageFiles.length - 1 ? 0 : current + 1;
        });
    }

    useEffect(() => {
        if (openImageIndex !== null && openImageIndex >= imageFiles.length) {
            setOpenImageIndex(null);
        }
    }, [imageFiles.length, openImageIndex]);

    useEffect(() => {
        if (openImageIndex === null) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpenImageIndex(null);
            }

            if (event.key === "ArrowLeft") {
                showPreviousImage();
            }

            if (event.key === "ArrowRight") {
                showNextImage();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [openImageIndex, imageFiles.length]);

    return (

        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: 0
            }}
        >

            <Box sx={{ p: 2 }}>

                <Typography variant="h6">

                    Előnézet

                </Typography>

            </Box>

            <Divider />

            <Box
                sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1
                }}
            >

                <Typography>

                    <strong>Munkalap:</strong>{" "}
                    {selectedWorkOrder?.workOrderNumber ?? "-"}

                </Typography>

                <Typography>

                    <strong>Szervizcsapat:</strong>{" "}
                    {selectedWorkOrder?.prefix ?? "-"}

                </Typography>

                <Typography>

                    <strong>PDF:</strong>{" "}
                    {selectedWorkOrder
                        ? selectedWorkOrder.pdfFile.split(/[\\/]/).pop()
                        : "-"}

                </Typography>

            </Box>

            <Divider />

            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: "auto",
                    p: 2
                }}
            >

                {selectedWorkOrder ? (

                    <>

                        <Typography
                            color="text.secondary"
                            align="center"
                        >

                            PDF előnézet

                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1
                            }}
                        >

                            <Typography variant="subtitle2">

                                PDF adatok

                            </Typography>

                            <Typography>

                                <strong>Partner:</strong>{" "}
                                {selectedWorkOrder.partnerName ?? "-"}

                            </Typography>

                            <Typography>

                                <strong>Adószám:</strong>{" "}
                                {selectedWorkOrder.taxNumber ?? "-"}

                            </Typography>

                            <Typography>

                                <strong>Kapcsolattartó:</strong>{" "}
                                {selectedWorkOrder.contactName ?? "-"}

                            </Typography>

                            <Typography>

                                <strong>Telefon:</strong>{" "}
                                {selectedWorkOrder.phone ?? "-"}

                            </Typography>

                            <Typography>

                                <strong>E-mail:</strong>{" "}
                                {selectedWorkOrder.email ?? "-"}

                            </Typography>

                            <Typography>

                                <strong>Gép:</strong>{" "}
                                {selectedWorkOrder.machineType ?? "-"}

                            </Typography>

                            <Typography>

                                <strong>Alvázszám:</strong>{" "}
                                {selectedWorkOrder.serialNumber ?? "-"}

                            </Typography>

                            <Typography>

                                <strong>Munka típusa:</strong>{" "}
                                {selectedWorkOrder.workType ?? "-"}

                            </Typography>

                            <Typography sx={{ whiteSpace: "pre-wrap" }}>

                                <strong>Bejelentett hiba:</strong>
                                {"\n"}
                                {selectedWorkOrder.reportedIssue ?? "-"}

                            </Typography>

                            <Typography sx={{ whiteSpace: "pre-wrap" }}>

                                <strong>Elvégzett munka:</strong>
                                {"\n"}
                                {selectedWorkOrder.completedWork ?? "-"}

                            </Typography>

                            <Typography
                                variant="subtitle2"
                                sx={{ mt: 2 }}
                            >

                                Kiszállások

                            </Typography>

                            <ServiceVisitTable
                                serviceVisits={
                                    selectedWorkOrder.serviceVisits
                                }
                            />

                        </Box>

                    </>

                ) : (

                    <Typography color="text.secondary">

                        Nincs kiválasztott munkalap.

                    </Typography>

                )}

            </Box>

            <Divider />

            <Box
                sx={{
                    p: 2
                }}
            >

                <Typography variant="subtitle2">

                    Fotódokumentáció

                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >

                    {selectedWorkOrder && imageFiles.length > 0
                        ? `${imageFiles.length} db kép`
                        : "Nincs kapcsolódó fénykép."}

                </Typography>

                {selectedWorkOrder && imageFiles.length > 0 ? (

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, 96px)",
                            gap: 1,
                            mt: 1
                        }}
                    >

                        {imageFiles.map((imageFile, index) => {
                            const fileName = getFileName(imageFile);

                            return (
                                <Box
                                    key={imageFile}
                                    sx={{
                                        width: 96
                                    }}
                                >

                                    <Box
                                        component="button"
                                        type="button"
                                        onClick={() =>
                                            setOpenImageIndex(index)
                                        }
                                        title={fileName}
                                        sx={{
                                            width: 96,
                                            height: 96,
                                            p: 0,
                                            display: "block",
                                            overflow: "hidden",
                                            cursor: "pointer",
                                            borderRadius: 1,
                                            border: 1,
                                            borderColor: "divider",
                                            bgcolor: "background.default"
                                        }}
                                    >

                                        <Box
                                            component="img"
                                            src={convertFileSrc(imageFile)}
                                            alt={fileName}
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                display: "block",
                                                objectFit: "cover"
                                            }}
                                        />

                                    </Box>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        title={fileName}
                                        noWrap
                                        sx={{
                                            display: "block",
                                            width: 96,
                                            mt: 0.5
                                        }}
                                    >

                                        {fileName}

                                    </Typography>

                                </Box>
                            );
                        })}

                    </Box>

                ) : selectedWorkOrder ? (

                    <Box
                        sx={{
                            mt: 1,
                            p: 2,
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                            bgcolor: "background.default"
                        }}
                    >

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >

                            Ehhez a munkalaphoz nincs fotódokumentáció.

                        </Typography>

                    </Box>

                ) : null}

            </Box>

            <Dialog
                open={openImage !== null}
                onClose={() => setOpenImageIndex(null)}
                maxWidth="lg"
                fullWidth
            >

                {openImage && openImageIndex !== null && (

                    <Box
                        sx={{
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            gap: 2
                        }}
                    >

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 2
                            }}
                        >

                            <Typography
                                variant="subtitle2"
                                noWrap
                                title={getFileName(openImage)}
                            >

                                {getFileName(openImage)}

                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    flexShrink: 0
                                }}
                            >

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >

                                    {openImageIndex + 1} / {imageFiles.length}

                                </Typography>

                                <Button
                                    size="small"
                                    onClick={() => setOpenImageIndex(null)}
                                >

                                    Bezárás

                                </Button>

                            </Box>

                        </Box>

                        <Box
                            component="img"
                            src={convertFileSrc(openImage)}
                            alt={getFileName(openImage)}
                            sx={{
                                width: "100%",
                                maxHeight: "70vh",
                                objectFit: "contain",
                                bgcolor: "background.default",
                                borderRadius: 1
                            }}
                        />

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 1
                            }}
                        >

                            <Button
                                variant="outlined"
                                onClick={showPreviousImage}
                                disabled={imageFiles.length < 2}
                            >

                                Előző

                            </Button>

                            <Button
                                variant="outlined"
                                onClick={showNextImage}
                                disabled={imageFiles.length < 2}
                            >

                                Következő

                            </Button>

                        </Box>

                    </Box>

                )}

            </Dialog>

        </Box>

    );

}
