"use client";
import { createTheme } from "@mui/material/styles";

/**
 * StadiumOps Command — Material Design 3, command-centre idiom.
 * Tonal layering: surface ladder from #0A0D12 → #1F2630 to read at a glance.
 * Accents: Google blue/green/amber/red, with a calmer text scale than default.
 */
export const opsTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: { main: "#8AB4F8", dark: "#1A73E8", light: "#AECBFA", contrastText: "#0B1220" },
    secondary: { main: "#81C995", dark: "#0F9D58", light: "#A8DAB5", contrastText: "#0B1220" },
    warning: { main: "#FDD663", dark: "#F9AB00", light: "#FEEFC3" },
    error: { main: "#F28B82", dark: "#D93025", light: "#FAD2CF" },
    success: { main: "#81C995" },
    info: { main: "#78D9EC" },
    background: { default: "#0A0D12", paper: "#141A22" },
    text: { primary: "#F1F3F4", secondary: "#9AA0A6", disabled: "#5F6368" },
    divider: "rgba(232,234,237,0.08)",
  },
  typography: {
    fontFamily: '"Google Sans Text","Roboto Flex","Inter",system-ui,sans-serif',
    h1: { fontFamily: '"Google Sans Display","Inter",sans-serif', fontWeight: 600, letterSpacing: -0.5 },
    h2: { fontFamily: '"Google Sans Display","Inter",sans-serif', fontWeight: 600, letterSpacing: -0.4 },
    h3: { fontFamily: '"Google Sans Display","Inter",sans-serif', fontWeight: 600, letterSpacing: -0.3 },
    h4: { fontFamily: '"Google Sans Display","Inter",sans-serif', fontWeight: 600, letterSpacing: -0.2 },
    h5: { fontFamily: '"Google Sans Display","Inter",sans-serif', fontWeight: 600, letterSpacing: -0.1 },
    h6: { fontFamily: '"Google Sans Display","Inter",sans-serif', fontWeight: 600 },
    subtitle1: { fontWeight: 600, letterSpacing: 0.1 },
    subtitle2: { fontWeight: 600, letterSpacing: 0.1 },
    body1: { letterSpacing: 0.1 },
    body2: { letterSpacing: 0.15, lineHeight: 1.5 },
    overline: { letterSpacing: 1.5, fontWeight: 600, fontSize: 10, color: "#9AA0A6" },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: 0.2 },
    caption: { letterSpacing: 0.3, fontSize: 11 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, letterSpacing: 0.3 } } },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Subtle dot-grid texture for "telemetry" feel
          backgroundImage:
            "radial-gradient(rgba(138,180,248,0.035) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          backgroundPosition: "0 0",
        },
      },
    },
  },
});
