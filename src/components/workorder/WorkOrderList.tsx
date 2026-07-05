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
        filteredWorkOrders,
        selectedWorkOrder,
        setSelectedWorkOrder
    } = useAppContext();

    const hasActiveFilter =
        filteredWorkOrders.length !== workOrders.length;

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

                    Munkalapok ({filteredWorkOrders.length})

                </Typography>

                {hasActiveFilter && (

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >

                        Összesen: {workOrders.length}

                    </Typography>

                )}

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

                {filteredWorkOrders.length === 0 ? (

                    <Box
                        sx={{
                            p: 2
                        }}
                    >

                        <Typography color="text.secondary">

                            Nincs találat.

                        </Typography>

                    </Box>

                ) : filteredWorkOrders.map(workOrder => (

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
