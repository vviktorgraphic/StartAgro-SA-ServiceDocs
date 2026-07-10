import SearchIcon from "@mui/icons-material/Search";
import TableChartIcon from "@mui/icons-material/TableChart";
import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography
} from "@mui/material";
import { ReactNode } from "react";

export type MainView =
    "quickSearch"
    | "workOrderTable";

interface MainNavigationProps {

    activeView: MainView;

    onViewChange: (view: MainView) => void;

}

const navigationItems: Array<{
    view: MainView;
    label: string;
    icon: ReactNode;
}> = [
    {
        view: "quickSearch",
        label: "Munkalap gyorskereső",
        icon: <SearchIcon />
    },
    {
        view: "workOrderTable",
        label: "Munkalapok táblázat",
        icon: <TableChartIcon />
    }
];

export default function MainNavigation({
    activeView,
    onViewChange
}: MainNavigationProps) {

    return (

        <Box
            component="nav"
            sx={{
                height: "100%",
                borderRight: 1,
                borderColor: "divider",
                bgcolor: "background.paper"
            }}
        >

            <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{
                    px: 2,
                    py: 1.5,
                    fontWeight: 700
                }}
            >
                Modulok
            </Typography>

            <List disablePadding>
                {navigationItems.map(item => (
                    <ListItemButton
                        key={item.view}
                        selected={activeView === item.view}
                        onClick={() => onViewChange(item.view)}
                    >
                        <ListItemIcon>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.label}
                            slotProps={{
                                primary: {
                                    noWrap: true
                                }
                            }}
                        />
                    </ListItemButton>
                ))}
            </List>

        </Box>

    );

}
