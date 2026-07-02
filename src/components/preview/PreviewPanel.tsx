import {
    Box,
    Divider,
    Typography
} from "@mui/material";

import { useAppContext } from "../../context/AppContext";

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
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 2
                }}
            >

                {selectedWorkOrder ? (

                    <Typography
                        color="text.secondary"
                        align="center"
                    >

                        PDF előnézet
                        <br />
                        <Divider />

<Box
    sx={{
        p: 2,
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
        {selectedWorkOrder?.partnerName ?? "-"}

    </Typography>

    <Typography>

        <strong>Adószám:</strong>{" "}
        {selectedWorkOrder?.taxNumber ?? "-"}

    </Typography>

    <Typography>

        <strong>Gép:</strong>{" "}
        {selectedWorkOrder?.machineType ?? "-"}

    </Typography>

    <Typography>

        <strong>Alvázszám:</strong>{" "}
        {selectedWorkOrder?.serialNumber ?? "-"}

    </Typography>

</Box>
                        <br />
                        (a következő sprintben)

                    </Typography>

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