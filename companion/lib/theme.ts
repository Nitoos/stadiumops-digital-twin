"use client";
import { createTheme } from "@mui/material/styles";

export const companionTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: "#1A73E8", contrastText: "#FFFFFF" },
    secondary: { main: "#0F9D58", contrastText: "#FFFFFF" },
    warning: { main: "#F9AB00" },
    error: { main: "#D93025" },
    success: { main: "#0F9D58" },
    background: { default: "#FFFBFE", paper: "#FFFFFF" },
    text: { primary: "#1B1F23", secondary: "#5F6368" },
  },
  typography: {
    fontFamily: '"Google Sans Text","Roboto Flex","Inter",system-ui,sans-serif',
    h4: { fontFamily: '"Google Sans Display","Inter",sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Google Sans Display","Inter",sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Google Sans Display","Inter",sans-serif', fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 20 },
});
