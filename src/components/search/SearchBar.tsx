import SearchIcon from "@mui/icons-material/Search";
import {
    Box,
    IconButton,
    InputAdornment,
    TextField
} from "@mui/material";

export default function SearchBar() {

    return (

        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                px: 2
            }}
        >

            <TextField
                fullWidth
                size="small"
                placeholder="Keresés partnerre, munkalapszámra, géptípusra..."
                variant="outlined"
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton edge="end">
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }
                }}
            />

        </Box>

    );

}