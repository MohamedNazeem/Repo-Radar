import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0b3d5c",
    },
    secondary: {
      main: "#c45c26",
    },
    background: {
      default: "#f3f6f9",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 650,
    },
  },
  shape: {
    borderRadius: 10,
  },
});
