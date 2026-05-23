"use client";
import { Box, Paper, Typography } from "@mui/material";
import { ReactNode } from "react";

export function Drawer({ title, children, density = "standard" }: {
  title: string;
  children: ReactNode;
  density?: "compact" | "standard";
}) {
  return (
    <Paper elevation={0} sx={{
      bgcolor: "background.paper", border: "1px solid", borderColor: "divider",
      borderRadius: 2, p: density === "compact" ? 1.5 : 2, overflow: "auto",
    }}>
      <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: 1 }}>
        {title}
      </Typography>
      <Box sx={{ mt: 1 }}>{children}</Box>
    </Paper>
  );
}
