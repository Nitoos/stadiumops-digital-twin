"use client";
import { createTheme } from "@mui/material/styles";

/**
 * StadiumOps Command — Google light theme (Cloud Console / Workspace idiom).
 *
 * Surface ladder:
 *   page:    #F8F9FA (Google grey 50)
 *   card:    #FFFFFF
 *   raised:  white + elevation 1/2
 *
 * Elevation uses Google's three-shadow recipe (no flat borders for primary surfaces).
 * Type uses Google Sans Display for headlines + Google Sans Text / Roboto Flex body.
 */
export const opsTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: "#1A73E8", dark: "#1557B0", light: "#4285F4", contrastText: "#FFFFFF" },
    secondary: { main: "#1E8E3E", dark: "#137333", light: "#34A853", contrastText: "#FFFFFF" },
    warning: { main: "#F29900", dark: "#E37400", light: "#FBBC04" },
    error: { main: "#D93025", dark: "#B31412", light: "#EA4335" },
    success: { main: "#1E8E3E" },
    info: { main: "#1A73E8" },
    background: { default: "#F8F9FA", paper: "#FFFFFF" },
    text: { primary: "#202124", secondary: "#5F6368", disabled: "#80868B" },
    divider: "rgba(60,64,67,0.12)",
  },
  typography: {
    fontFamily: '"Google Sans Text","Roboto Flex","Roboto","Inter",system-ui,sans-serif',
    h1: { fontFamily: '"Google Sans Display","Roboto",sans-serif', fontWeight: 500, letterSpacing: -0.5 },
    h2: { fontFamily: '"Google Sans Display","Roboto",sans-serif', fontWeight: 500, letterSpacing: -0.4 },
    h3: { fontFamily: '"Google Sans Display","Roboto",sans-serif', fontWeight: 500, letterSpacing: -0.3 },
    h4: { fontFamily: '"Google Sans Display","Roboto",sans-serif', fontWeight: 500, letterSpacing: -0.2 },
    h5: { fontFamily: '"Google Sans Display","Roboto",sans-serif', fontWeight: 500, letterSpacing: -0.1 },
    h6: { fontFamily: '"Google Sans Display","Roboto",sans-serif', fontWeight: 500 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    body1: { letterSpacing: 0.15, color: "#202124" },
    body2: { letterSpacing: 0.2, lineHeight: 1.5, color: "#5F6368" },
    overline: { letterSpacing: 1.4, fontWeight: 500, fontSize: 11, color: "#5F6368" },
    button: { textTransform: "none", fontWeight: 500, letterSpacing: 0.2 },
    caption: { letterSpacing: 0.3, fontSize: 12, color: "#5F6368" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 16, paddingBlock: 6, minHeight: 36 },
        outlined: { borderColor: "rgba(60,64,67,0.18)", "&:hover": { borderColor: "rgba(60,64,67,0.32)", backgroundColor: "rgba(60,64,67,0.04)" } },
        text: { "&:hover": { backgroundColor: "rgba(60,64,67,0.04)" } },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 500, letterSpacing: 0.2 } } },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 2px 0 rgba(60,64,67,0.10), 0 1px 3px 1px rgba(60,64,67,0.06)",
          borderRadius: 12,
        },
      },
    },
    MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 500, minHeight: 44, letterSpacing: 0.15 } } },
    MuiTabs: { styleOverrides: { indicator: { height: 3, borderRadius: "3px 3px 0 0" } } },
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: "#F8F9FA" },
      },
    },
  },
});
