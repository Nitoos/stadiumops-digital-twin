"use client";
import { ToggleButton, ToggleButtonGroup, Box, Typography } from "@mui/material";
import { useStore } from "@/lib/store";

export function ForecastLens() {
  const h = useStore((s) => s.forecastHorizon);
  const set = useStore((s) => s.setForecastHorizon);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.4 }}>
        Forecast
      </Typography>
      <ToggleButtonGroup
        size="small" exclusive value={h} onChange={(_, v) => v !== null && set(v)}
        sx={{
          "& .MuiToggleButton-root": {
            border: "1px solid rgba(60,64,67,0.18)",
            color: "text.secondary",
            px: 1.25, py: 0.4, fontSize: 12, fontWeight: 500,
            "&.Mui-selected": {
              bgcolor: "#E8F0FE", color: "#1A73E8",
              borderColor: "#1A73E8",
              "&:hover": { bgcolor: "#D2E3FC" },
            },
          },
        }}
      >
        <ToggleButton value={0}>Now</ToggleButton>
        <ToggleButton value={5}>+5m</ToggleButton>
        <ToggleButton value={10}>+10m</ToggleButton>
        <ToggleButton value={15}>+15m</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
