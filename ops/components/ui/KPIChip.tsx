"use client";
import { Box, Typography } from "@mui/material";

export function KPIChip({ label, value, tone = "default" }: {
  label: string; value: string | number;
  tone?: "default" | "warning" | "critical" | "success";
}) {
  const colors: Record<string, string> = {
    default: "text.primary",
    warning: "warning.main",
    critical: "error.main",
    success: "success.main",
  };
  return (
    <Box sx={{
      px: 1.5, py: 1, borderRadius: 2, border: "1px solid", borderColor: "divider",
      bgcolor: "background.paper", minWidth: 100,
    }}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>{label}</Typography>
      <Typography variant="h6" sx={{ color: colors[tone], fontFamily: "Roboto Mono" }}>
        {value}
      </Typography>
    </Box>
  );
}
