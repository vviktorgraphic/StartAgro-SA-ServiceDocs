import {
    Box,
    Divider,
    Typography
} from "@mui/material";

import { useAppContext } from "../../context/AppContext";
import ServiceVisitTable from "./ServiceVisitTable";

export default function PreviewPanel() {

    const { selectedWorkOrder } = useAppContext();

    return (

        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%"
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
                            <br />
                            <br />
                            (a következő sprintben)

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

                    {selectedWorkOrder
                        ? `${selectedWorkOrder.imageFiles.length} db kép`
                        : "Nincs kapcsolódó fénykép."}

                </Typography>

            </Box>

        </Box>

    );

}