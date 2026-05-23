"use client";
import { Box, Stack, Typography } from "@mui/material";

const LEVELS: { los: string; color: string; label: string }[] = [
  { los: "A", color: "#1E8E3E", label: "Free flow" },
  { los: "B", color: "#34A853", label: "Minor" },
  { los: "C", color: "#FBBC04", label: "Reduced" },
  { los: "D", color: "#F29900", label: "Restricted" },
  { los: "E", color: "#EA4335", label: "Severe" },
  { los: "F", color: "#D93025", label: "Critical" },
];

export function DensityLegend() {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Typography sx={{
        fontSize: 11, letterSpacing: 0.5, fontWeight: 500,
        color: "text.secondary", textTransform: "uppercase",
      }}>
        Fruin LOS
      </Typography>
      {LEVELS.map((l) => (
        <Stack key={l.los} direction="row" alignItems="center" spacing={0.5}>
          <Box sx={{
            width: 8, height: 8, borderRadius: "50%",
            bgcolor: l.color,
          }} />
          <Typography sx={{ fontSize: 12, color: "text.primary" }}>
            <Box component="span" sx={{ fontWeight: 600 }}>{l.los}</Box>{" "}
            <Box component="span" sx={{ color: "text.secondary" }}>{l.label}</Box>
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export const LOS_COLOR: Record<string, string> = Object.fromEntries(LEVELS.map((l) => [l.los, l.color]));
