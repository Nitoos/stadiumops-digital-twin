"use client";
import { createTheme } from "@mui/material/styles";

// Material Design 3 — Command Center dark scheme
export const opsTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: { main: "#8AB4F8", dark: "#1A73E8", contrastText: "#0B1220" },
    secondary: { main: "#81C995", dark: "#0F9D58", contrastText: "#0B1220" },
    warning: { main: "#FDD663", dark: "#F9AB00" },
    error: { main: "#F28B82", dark: "#D93025" },
    success: { main: "#81C995" },
    background: { default: "#0F1115", paper: "#181B21" },
    text: { primary: "#E8EAED", secondary: "#9AA0A6" },
    divider: "rgba(232,234,237,0.12)",
  },
  typography: {
    fontFamily: '"Google Sans Text","Roboto Flex","Inter",system-ui,sans-serif',
    h1: { fontFamily: '"Google Sans Display","Inter",system-ui,sans-serif', fontWeight: 600 },
    h2: { fontFamily: '"Google Sans Display","Inter",system-ui,sans-serif', fontWeight: 600 },
    h3: { fontFamily: '"Google Sans Display","Inter",system-ui,sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Google Sans Display","Inter",system-ui,sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Google Sans Display","Inter",system-ui,sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Google Sans Display","Inter",system-ui,sans-serif', fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});
