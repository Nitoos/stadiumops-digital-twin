"use client";
import { Box } from "@mui/material";

const COLORS: Record<string, string> = {
  live: "#1E8E3E",
  warning: "#F29900",
  critical: "#D93025",
  idle: "#9AA0A6",
};

export function StatusDot({ tone = "live", size = 8 }: { tone?: "live" | "warning" | "critical" | "idle"; size?: number }) {
  const color = COLORS[tone];
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        bgcolor: color,
        boxShadow: `0 0 0 3px ${color}26`,
        position: "relative",
        flexShrink: 0,
      }}
    />
  );
}
