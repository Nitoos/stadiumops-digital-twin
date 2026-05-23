"use client";
import { Box } from "@mui/material";

const COLORS: Record<string, string> = {
  live: "#81C995",
  warning: "#FDD663",
  critical: "#F28B82",
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
        boxShadow: `0 0 ${size}px ${color}`,
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          inset: -2,
          borderRadius: "50%",
          border: `1px solid ${color}`,
          opacity: 0.55,
          animation: "pulse 2s ease-out infinite",
        },
        "@keyframes pulse": {
          "0%": { transform: "scale(0.9)", opacity: 0.7 },
          "100%": { transform: "scale(1.8)", opacity: 0 },
        },
      }}
    />
  );
}
