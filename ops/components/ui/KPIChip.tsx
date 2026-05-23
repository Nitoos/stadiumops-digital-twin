"use client";
import { Box, Stack, Typography } from "@mui/material";

const TONE_COLOR: Record<string, string> = {
  default: "#F1F3F4",
  warning: "#FDD663",
  critical: "#F28B82",
  success: "#81C995",
};

const TONE_STRIPE: Record<string, string> = {
  default: "rgba(138,180,248,0.5)",
  warning: "#FDD663",
  critical: "#F28B82",
  success: "#81C995",
};

export function KPIChip({ label, value, tone = "default", unit }: {
  label: string;
  value: string | number;
  unit?: string;
  tone?: "default" | "warning" | "critical" | "success";
}) {
  return (
    <Box sx={{
      position: "relative",
      px: 1.75, py: 0.9,
      borderRadius: 1.5,
      border: "1px solid rgba(232,234,237,0.08)",
      bgcolor: "rgba(20,26,34,0.85)",
      backdropFilter: "blur(8px)",
      minWidth: 124,
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        left: 0, top: 8, bottom: 8,
        width: 2,
        borderRadius: 2,
        bgcolor: TONE_STRIPE[tone],
        boxShadow: `0 0 8px ${TONE_STRIPE[tone]}`,
      },
    }}>
      <Typography sx={{
        fontSize: 9, letterSpacing: 1.4, fontWeight: 700,
        color: "text.secondary", textTransform: "uppercase",
        fontFamily: "Roboto Mono, monospace",
      }}>
        {label}
      </Typography>
      <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mt: 0.1 }}>
        <Typography sx={{
          fontFamily: '"Google Sans Display", sans-serif',
          fontSize: 22, lineHeight: 1.1, fontWeight: 600,
          color: TONE_COLOR[tone],
          letterSpacing: -0.5,
        }}>
          {value}
        </Typography>
        {unit && (
          <Typography sx={{
            fontSize: 10, color: "text.secondary",
            fontFamily: "Roboto Mono, monospace", letterSpacing: 0.5,
          }}>
            {unit}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
