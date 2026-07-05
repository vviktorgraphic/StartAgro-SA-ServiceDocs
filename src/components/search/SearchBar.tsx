import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import {
    Box,
    IconButton,
    InputAdornment,
    TextField
} from "@mui/material";

import { useAppContext } from "../../context/AppContext";

export default function SearchBar() {

    const {
        searchQuery,
        setSearchQuery
    } = useAppContext();

    return (

        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                px: 2,
                bgcolor: "background.paper"
            }}
        >

            <TextField
                fullWidth
                size="small"
                placeholder="Keresés partnerre, munkalapszámra, géptípusra..."
                variant="outlined"
                value={searchQuery}
                onChange={event =>
                    setSearchQuery(event.target.value)
                }
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: searchQuery
                            ? (
                                <InputAdornment position="end">
                                    <IconButton
                                        edge="end"
                                        onClick={() => setSearchQuery("")}
                                        aria-label="Keresés törlése"
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                            : null
                    }
                }}
            />

        </Box>

    );

}
