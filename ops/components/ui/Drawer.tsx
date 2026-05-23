"use client";
import { Box, Paper, Typography, Stack } from "@mui/material";
import { ReactNode } from "react";
import { StatusDot } from "./StatusDot";

export function Drawer({ title, children, density = "standard", tone, badge }: {
  title: string;
  children: ReactNode;
  density?: "compact" | "standard";
  tone?: "live" | "warning" | "critical" | "idle";
  badge?: string;
}) {
  return (
    <Paper elevation={0} sx={{
      bgcolor: "rgba(20,26,34,0.7)",
      border: "1px solid rgba(232,234,237,0.07)",
      borderRadius: 2,
      p: density === "compact" ? 1.5 : 1.75,
      overflow: "auto",
      backdropFilter: "blur(8px)",
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        inset: 0,
        borderRadius: 2,
        background: "linear-gradient(180deg, rgba(138,180,248,0.04), transparent 30%)",
        pointerEvents: "none",
      },
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {tone && <StatusDot tone={tone} size={7} />}
          <Typography sx={{
            fontSize: 10, letterSpacing: 1.6, fontWeight: 700,
            color: "text.secondary", textTransform: "uppercase",
            fontFamily: "Roboto Mono, monospace",
          }}>
            {title}
          </Typography>
        </Stack>
        {badge && (
          <Typography sx={{
            fontSize: 9, letterSpacing: 0.8, fontWeight: 600,
            color: "text.disabled", fontFamily: "Roboto Mono, monospace",
          }}>
            {badge}
          </Typography>
        )}
      </Stack>
      <Box>{children}</Box>
    </Paper>
  );
}
