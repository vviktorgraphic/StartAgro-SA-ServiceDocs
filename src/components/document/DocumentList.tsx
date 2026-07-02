import {
    Box,
    Divider,
    List,
    ListItemButton,
    ListItemText,
    Typography
} from "@mui/material";

const documents = [
    {
        id: 1,
        workOrder: "HT-0008218",
        partner: "Marján Zoltán",
        date: "2026.07.01"
    },
    {
        id: 2,
        workOrder: "PJ-001542",
        partner: "Agro Kft.",
        date: "2026.06.28"
    },
    {
        id: 3,
        workOrder: "TP-000381",
        partner: "Kiss István",
        date: "2026.06.25"
    }
];

export default function DocumentList() {

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

                    Munkalapok

                </Typography>

            </Box>

            <Divider />

            <List
                sx={{
                    overflow: "auto",
                    flex: 1,
                    p: 0
                }}
            >

                {documents.map(document => (

                    <ListItemButton
                        key={document.id}
                        divider
                    >

                        <ListItemText

                            primary={document.workOrder}

                            secondary={

                                <>
                                    {document.partner}

                                    <br />

                                    {document.date}
                                </>

                            }

                        />

                    </ListItemButton>

                ))}

            </List>

        </Box>

    );

}