"use client";
import { Box, Stack, Typography } from "@mui/material";

export function OperatorBadge() {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{
      px: 1.25, py: 0.6,
      bgcolor: "rgba(20,26,34,0.6)",
      border: "1px solid rgba(232,234,237,0.07)",
      borderRadius: 1.25,
    }}>
      <Box sx={{
        width: 26, height: 26, borderRadius: "50%",
        background: "linear-gradient(135deg, #8AB4F8 0%, #C58AF9 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: '"Google Sans Display", sans-serif',
        fontWeight: 700, fontSize: 12, color: "#0B1220",
      }}>
        NS
      </Box>
      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.primary", lineHeight: 1.1 }}>
          ops.commander
        </Typography>
        <Typography sx={{
          fontSize: 9, letterSpacing: 0.8, color: "text.disabled",
          fontFamily: "Roboto Mono, monospace",
        }}>
          ROLE · L7 CMDR
        </Typography>
      </Box>
    </Stack>
  );
}
