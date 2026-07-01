import {
    AppBar,
    Box,
    Button,
    Toolbar,
    Typography
} from "@mui/material";

export default function Header() {

    return (

        <AppBar
            position="static"
            color="primary"
            elevation={1}
        >

            <Toolbar>

                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600
                    }}
                >
                    SA-ServiceDocs
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Button color="inherit">

                    📂 Mappa

                </Button>

                <Button color="inherit">

                    🔄 Indexelés

                </Button>

                <Button color="inherit">

                    ⚙

                </Button>

            </Toolbar>

        </AppBar>

    );

}