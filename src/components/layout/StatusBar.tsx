import {
    Box,
    Typography
} from "@mui/material";

import { useAppContext } from "../../context/AppContext";

export default function StatusBar() {

    const {
        filteredWorkOrders,
        lastSuccessfulIndexAt
    } = useAppContext();

    const lastWorkOrder =
        filteredWorkOrders.length > 0
            ? filteredWorkOrders[filteredWorkOrders.length - 1].workOrderNumber
            : "-";

    const lastIndex =
        lastSuccessfulIndexAt
            ? lastSuccessfulIndexAt.toLocaleString("hu-HU")
            : "-";

    return (

        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                px: 2,
                bgcolor: "grey.200",
                borderTop: 1,
                borderColor: "divider"
            }}
        >

            <Typography
                variant="body2"
            >

                {filteredWorkOrders.length} dokumentum

            </Typography>

            <Typography
                variant="body2"
                sx={{
                    ml: 3
                }}
            >

                Utolsó munkalap: {lastWorkOrder}

            </Typography>

            <Typography
                variant="body2"
                sx={{
                    ml: 3
                }}
            >

                Utolsó index: {lastIndex}

            </Typography>

        </Box>

    );

}
