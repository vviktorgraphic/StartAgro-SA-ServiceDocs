import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#b40c0e",
    },

    secondary: {
      main: "#2E7D32",
    },

    background: {
      default: "#ECEFF1",
      paper: "#FFFFFF",
    },
  },

  shape: {
    borderRadius: 8,
  },

  typography: {
    fontFamily: "Roboto, Segoe UI, Arial, sans-serif",

    h5: {
      fontWeight: 600,
    },

    h6: {
      fontWeight: 600,
    },
  },
});
