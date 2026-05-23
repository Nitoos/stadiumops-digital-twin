"use client";
import { Box, Stack, Typography } from "@mui/material";
import { StatusDot } from "./StatusDot";

export function VenueHeader({ phase, simMin }: { phase: string; simMin: number }) {
  const tone = phase === "post" ? "warning" : phase === "live" || phase === "break" ? "critical" : "live";
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{
          width: 32, height: 32, borderRadius: 1.25,
          background: "linear-gradient(135deg, #1A73E8 0%, #0F9D58 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 22px rgba(138,180,248,0.45)",
        }}>
          <Box className="material-symbols-sharp" sx={{ fontSize: 20, color: "#0B1220" }}>shield_lock</Box>
        </Box>
        <Box>
          <Typography sx={{
            fontFamily: '"Google Sans Display", sans-serif',
            fontSize: 17, fontWeight: 600, letterSpacing: -0.2, lineHeight: 1.1,
            color: "text.primary",
          }}>
            StadiumOps Command
          </Typography>
          <Typography sx={{
            fontSize: 10, letterSpacing: 1.4, fontWeight: 600,
            color: "text.secondary", fontFamily: "Roboto Mono, monospace",
            textTransform: "uppercase",
          }}>
            Chinnaswamy · CSK ⌁ RCB
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ width: 1, height: 28, bgcolor: "divider" }} />

      <Stack direction="row" alignItems="center" spacing={1}>
        <StatusDot tone={tone as any} size={8} />
        <Typography sx={{
          fontFamily: "Roboto Mono, monospace",
          fontSize: 11, letterSpacing: 1.3, fontWeight: 600,
          color: "text.primary", textTransform: "uppercase",
        }}>
          {phase} · T+{String(Math.floor(simMin / 60)).padStart(2, "0")}:{String(simMin % 60).padStart(2, "0")}
        </Typography>
      </Stack>
    </Stack>
  );
}
