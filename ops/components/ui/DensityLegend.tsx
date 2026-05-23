"use client";
import { Box, Typography } from "@mui/material";

const LEVELS: { los: string; color: string; label: string }[] = [
  { los: "A", color: "#1B5E20", label: "A — free flow" },
  { los: "B", color: "#388E3C", label: "B — minor" },
  { los: "C", color: "#FBC02D", label: "C — reduced" },
  { los: "D", color: "#F57C00", label: "D — restricted" },
  { los: "E", color: "#E64A19", label: "E — severe" },
  { los: "F", color: "#B71C1C", label: "F — critical" },
];

export function DensityLegend() {
  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
      {LEVELS.map((l) => (
        <Box key={l.los} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: l.color }} />
          <Typography variant="caption">{l.label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export const LOS_COLOR: Record<string, string> = Object.fromEntries(LEVELS.map((l) => [l.los, l.color]));
