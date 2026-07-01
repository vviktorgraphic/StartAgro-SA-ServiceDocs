import {
    Box,
    Typography
} from "@mui/material";

export default function StatusBar() {

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

                0 dokumentum

            </Typography>

            <Typography
                variant="body2"
                sx={{
                    ml: 3
                }}
            >

                Utolsó munkalap: -

            </Typography>

            <Typography
                variant="body2"
                sx={{
                    ml: 3
                }}
            >

                Utolsó index: -

            </Typography>

        </Box>

    );

}