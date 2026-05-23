"use client";
import { Box, Stack, Typography, IconButton, Tooltip } from "@mui/material";
import { StatusDot } from "./StatusDot";

export function AppBar({ phase, simMin }: { phase: string; simMin: number }) {
  const tone = phase === "post" ? "warning" : (phase === "live" || phase === "break") ? "critical" : "live";
  const phaseLabel = phase === "pre" ? "Pre-match" : phase === "live" ? "Live" : phase === "break" ? "Innings break" : phase === "post" ? "Post-match" : "Booting";

  return (
    <Box sx={{
      bgcolor: "#FFFFFF",
      borderBottom: "1px solid",
      borderColor: "divider",
      px: 3, py: 1.25,
      display: "flex", alignItems: "center", gap: 2,
    }}>
      {/* Brand */}
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <Box sx={{
          width: 32, height: 32, borderRadius: 1.25,
          background: "linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC04 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Box className="material-symbols-sharp" sx={{ fontSize: 18, color: "#FFFFFF" }}>shield_lock</Box>
        </Box>
        <Box>
          <Typography sx={{
            fontFamily: '"Google Sans Display", sans-serif',
            fontSize: 16, fontWeight: 500, color: "text.primary",
            lineHeight: 1.1, letterSpacing: -0.1,
          }}>
            StadiumOps Command
          </Typography>
          <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.1 }}>
            M. Chinnaswamy · CSK vs RCB
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ height: 28, width: 1, bgcolor: "divider", mx: 1 }} />

      {/* Live status pill */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{
        px: 1.5, py: 0.5,
        bgcolor: tone === "critical" ? "#FCE8E6" : tone === "warning" ? "#FEF7E0" : "#E6F4EA",
        color: tone === "critical" ? "#B31412" : tone === "warning" ? "#B26A00" : "#137333",
        borderRadius: 999,
      }}>
        <StatusDot tone={tone as any} size={8} />
        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
          {phaseLabel} · T+{String(Math.floor(simMin / 60)).padStart(2, "0")}:{String(simMin % 60).padStart(2, "0")}
        </Typography>
      </Stack>

      <Box sx={{ flex: 1 }} />

      {/* Right side icons */}
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Tooltip title="Search">
          <IconButton size="small">
            <Box className="material-symbols-sharp" sx={{ fontSize: 20, color: "text.secondary" }}>search</Box>
          </IconButton>
        </Tooltip>
        <Tooltip title="Notifications">
          <IconButton size="small">
            <Box className="material-symbols-sharp" sx={{ fontSize: 20, color: "text.secondary" }}>notifications</Box>
          </IconButton>
        </Tooltip>
        <Tooltip title="Help">
          <IconButton size="small">
            <Box className="material-symbols-sharp" sx={{ fontSize: 20, color: "text.secondary" }}>help</Box>
          </IconButton>
        </Tooltip>
        <Box sx={{
          ml: 1,
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg, #4285F4, #C58AF9)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#FFFFFF", fontWeight: 500, fontSize: 12,
          fontFamily: '"Google Sans Display", sans-serif',
          cursor: "pointer",
        }}>NS</Box>
      </Stack>
    </Box>
  );
}
