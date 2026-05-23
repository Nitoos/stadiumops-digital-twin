"use client";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { api } from "@/lib/api";

const SCENES = [
  { name: "entry_surge",  label: "Entry surge",  icon: "groups",  color: "#D93025", bg: "#FCE8E6" },
  { name: "storm",        label: "Storm",        icon: "bolt",    color: "#F29900", bg: "#FEF7E0" },
  { name: "drone_threat", label: "Drone threat", icon: "warning", color: "#7627BB", bg: "#F3E8FD" },
  { name: "exit_surge",   label: "Exit surge",   icon: "logout",  color: "#1E8E3E", bg: "#E6F4EA" },
];

export function SceneRail() {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
      <Typography sx={{
        fontSize: 11, letterSpacing: 0.5, fontWeight: 500,
        color: "text.secondary", textTransform: "uppercase",
        mr: 1,
      }}>
        Demo scenes
      </Typography>
      {SCENES.map((s) => (
        <ButtonBase
          key={s.name}
          onClick={() => api.runScene(s.name)}
          sx={{
            borderRadius: 999,
            px: 1.5, py: 0.6,
            bgcolor: "#FFFFFF",
            border: "1px solid",
            borderColor: "divider",
            display: "flex", alignItems: "center", gap: 0.75,
            transition: "all 160ms ease",
            "&:hover": {
              bgcolor: s.bg,
              borderColor: s.color,
            },
          }}
        >
          <Box className="material-symbols-sharp" sx={{ fontSize: 16, color: s.color }}>{s.icon}</Box>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: "text.primary" }}>
            {s.label}
          </Typography>
        </ButtonBase>
      ))}
    </Stack>
  );
}
