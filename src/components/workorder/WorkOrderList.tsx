import {
    Box,
    Divider,
    List,
    ListItemButton,
    ListItemText,
    Typography
} from "@mui/material";

import { useAppContext } from "../../context/AppContext";

export default function WorkOrderList() {

    const {
        workOrders,
        selectedWorkOrder,
        setSelectedWorkOrder
    } = useAppContext();

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

                    Munkalapok ({workOrders.length})

                </Typography>

            </Box>

            <Divider />

            <List
                sx={{
                    overflow: "auto",
                    flex: 1,
                    minHeight: 0,
                    p: 0
                }}
            >

                {workOrders.map(workOrder => (

                    <ListItemButton

                        key={workOrder.workOrderNumber}

                        divider

                        selected={
                            selectedWorkOrder?.workOrderNumber ===
                            workOrder.workOrderNumber
                        }

                        onClick={() =>
                            setSelectedWorkOrder(workOrder)
                        }

                    >

                        <ListItemText

                            primary={workOrder.workOrderNumber}

                            secondary={`📷 ${workOrder.imageFiles.length} kép`}

                        />

                    </ListItemButton>

                ))}

            </List>

        </Box>

    );

}
