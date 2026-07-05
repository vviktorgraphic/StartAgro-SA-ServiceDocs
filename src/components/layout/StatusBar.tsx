import {
    Box,
    Typography
} from "@mui/material";

import { useAppContext } from "../../context/AppContext";

export default function StatusBar() {

    const {
        filteredWorkOrders
    } = useAppContext();

    const lastWorkOrder =
        filteredWorkOrders.length > 0
            ? filteredWorkOrders[filteredWorkOrders.length - 1].workOrderNumber
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

        </Box>

    );

}
