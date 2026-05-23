"use client";
import { ToggleButton, ToggleButtonGroup, Box, Typography } from "@mui/material";
import { useStore } from "@/lib/store";

export function ForecastLens() {
  const h = useStore((s) => s.forecastHorizon);
  const set = useStore((s) => s.setForecastHorizon);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>Forecast lens</Typography>
      <ToggleButtonGroup size="small" exclusive value={h} onChange={(_, v) => v !== null && set(v)}>
        <ToggleButton value={0}>Now</ToggleButton>
        <ToggleButton value={5}>+5m</ToggleButton>
        <ToggleButton value={10}>+10m</ToggleButton>
        <ToggleButton value={15}>+15m</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
