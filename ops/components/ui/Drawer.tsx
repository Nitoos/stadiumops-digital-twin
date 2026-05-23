"use client";
import { Box, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";
import { StatusDot } from "./StatusDot";

export function Drawer({ title, children, tone, badge }: {
  title: string;
  children: ReactNode;
  density?: "compact" | "standard";
  tone?: "live" | "warning" | "critical" | "idle";
  badge?: string;
}) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {tone && <StatusDot tone={tone} size={7} />}
          <Typography sx={{
            fontSize: 11, letterSpacing: 0.5, fontWeight: 500,
            color: "text.secondary", textTransform: "uppercase",
          }}>
            {title}
          </Typography>
        </Stack>
        {badge && (
          <Typography sx={{
            fontSize: 10, letterSpacing: 0.4, fontWeight: 500,
            color: "text.disabled",
          }}>
            {badge}
          </Typography>
        )}
      </Stack>
      <Box>{children}</Box>
    </Box>
  );
}
