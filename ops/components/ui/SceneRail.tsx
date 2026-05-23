"use client";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { api } from "@/lib/api";

const SCENES = [
  { name: "entry_surge", label: "Entry surge",  icon: "groups", accent: "#F28B82" },
  { name: "storm",       label: "Storm",         icon: "bolt",   accent: "#FDD663" },
  { name: "drone_threat", label: "Drone threat", icon: "warning", accent: "#C58AF9" },
  { name: "exit_surge",  label: "Exit surge",    icon: "logout", accent: "#81C995" },
];

export function SceneRail() {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ px: 1 }}>
      <Typography sx={{
        fontSize: 9, letterSpacing: 1.6, fontWeight: 700,
        color: "text.disabled", textTransform: "uppercase",
        fontFamily: "Roboto Mono, monospace",
        mr: 0.5,
      }}>
        Demo Scenes
      </Typography>
      {SCENES.map((s) => (
        <ButtonBase
          key={s.name}
          onClick={() => api.runScene(s.name)}
          sx={{
            borderRadius: 1.5,
            px: 1.5, py: 0.85,
            border: "1px solid rgba(232,234,237,0.08)",
            bgcolor: "rgba(20,26,34,0.5)",
            display: "flex", alignItems: "center", gap: 0.9,
            transition: "all 180ms ease",
            "&:hover": {
              borderColor: s.accent,
              bgcolor: "rgba(20,26,34,0.85)",
              boxShadow: `0 0 16px ${s.accent}40`,
            },
          }}
        >
          <Box sx={{
            width: 8, height: 8, borderRadius: "50%",
            bgcolor: s.accent, boxShadow: `0 0 6px ${s.accent}`,
          }} />
          <Typography sx={{
            fontSize: 12, fontWeight: 600, letterSpacing: 0.2,
            color: "text.primary",
          }}>
            {s.label}
          </Typography>
        </ButtonBase>
      ))}
    </Stack>
  );
}
