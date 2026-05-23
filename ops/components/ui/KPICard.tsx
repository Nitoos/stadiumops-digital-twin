"use client";
import { Box, Card, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

const TONE_COLOR: Record<string, string> = {
  default: "#1A73E8",
  warning: "#F29900",
  critical: "#D93025",
  success: "#1E8E3E",
};

export function KPICard({ label, value, unit, tone = "default", hint, icon }: {
  label: string;
  value: string | number;
  unit?: string;
  tone?: "default" | "warning" | "critical" | "success";
  hint?: string;
  icon?: ReactNode;
}) {
  const accent = TONE_COLOR[tone];
  return (
    <Card sx={{ p: 2, position: "relative", overflow: "hidden", minWidth: 0 }}>
      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 1.5,
          bgcolor: `${accent}14`,
          color: accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {icon ?? <Box className="material-symbols-sharp" sx={{ fontSize: 22 }}>insights</Box>}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{
            fontSize: 11, fontWeight: 500, letterSpacing: 0.3,
            color: "text.secondary", textTransform: "uppercase",
            mb: 0.25,
          }}>
            {label}
          </Typography>
          <Stack direction="row" alignItems="baseline" spacing={0.5}>
            <Typography sx={{
              fontFamily: '"Google Sans Display", sans-serif',
              fontSize: 26, fontWeight: 500, color: "text.primary",
              letterSpacing: -0.4, lineHeight: 1.15,
            }}>
              {value}
            </Typography>
            {unit && (
              <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 500 }}>
                {unit}
              </Typography>
            )}
          </Stack>
          {hint && (
            <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.25 }}>
              {hint}
            </Typography>
          )}
        </Box>
      </Stack>
    </Card>
  );
}
