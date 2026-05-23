"use client";
import { Box, Stack, Typography } from "@mui/material";

const LEVELS: { los: string; color: string; label: string }[] = [
  { los: "A", color: "#0F9D58", label: "Free" },
  { los: "B", color: "#34A853", label: "Minor" },
  { los: "C", color: "#FDD663", label: "Reduced" },
  { los: "D", color: "#F9AB00", label: "Restricted" },
  { los: "E", color: "#F28B82", label: "Severe" },
  { los: "F", color: "#D93025", label: "Critical" },
];

export function DensityLegend() {
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{
      px: 1.5, py: 0.5,
      bgcolor: "rgba(20,26,34,0.6)",
      border: "1px solid rgba(232,234,237,0.06)",
      borderRadius: "999px",
    }}>
      <Typography sx={{
        fontSize: 9, letterSpacing: 1.4, fontWeight: 700,
        color: "text.disabled", textTransform: "uppercase",
        fontFamily: "Roboto Mono, monospace",
      }}>
        Fruin LOS
      </Typography>
      {LEVELS.map((l) => (
        <Stack key={l.los} direction="row" alignItems="center" spacing={0.5}>
          <Box sx={{
            width: 18, height: 6, borderRadius: 1,
            bgcolor: l.color,
            boxShadow: `0 0 4px ${l.color}`,
          }} />
          <Typography sx={{
            fontSize: 10.5, letterSpacing: 0.3, fontFamily: "Roboto Mono, monospace",
            color: "text.secondary",
          }}>
            <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>{l.los}</Box>{" "}
            {l.label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export const LOS_COLOR: Record<string, string> = Object.fromEntries(LEVELS.map((l) => [l.los, l.color]));
