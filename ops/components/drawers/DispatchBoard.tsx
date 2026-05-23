"use client";
import { Stack, Typography, Chip, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { api } from "@/lib/api";

type Team = { team_id: string; role: string; position: [number, number]; status: string };

const ROLE_ICON: Record<string, string> = {
  crowd_marshal: "groups",
  medical: "medical_services",
  security: "security",
  transit: "directions_bus",
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  idle: { bg: "#F1F3F4", color: "#5F6368", label: "Idle" },
  responding: { bg: "#FEF7E0", color: "#B26A00", label: "Responding" },
  on_task: { bg: "#E8F0FE", color: "#1557B0", label: "On task" },
};

export function DispatchBoard() {
  const [teams, setTeams] = useState<Team[]>([]);
  useEffect(() => {
    const fetchOnce = () => api.opsState().then((s: any) => setTeams(s.teams ?? []));
    fetchOnce();
    const id = setInterval(fetchOnce, 3000);
    return () => clearInterval(id);
  }, []);

  const responding = teams.filter((t) => t.status === "responding").length;
  const tone = responding > 0 ? "warning" : "idle";

  return (
    <Drawer title="Dispatch board" tone={tone} badge={`${teams.length} teams`}>
      {teams.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.disabled", fontSize: 12 }}>
          No teams registered.
        </Typography>
      ) : (
        <Stack spacing={0.75}>
          {teams.map((t) => {
            const style = STATUS_STYLE[t.status] ?? STATUS_STYLE.idle;
            return (
              <Box key={t.team_id} sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                p: 1, borderRadius: 1.5,
                bgcolor: "#F8F9FA",
                "&:hover": { bgcolor: "#F1F3F4" },
              }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{
                    width: 28, height: 28, borderRadius: "50%",
                    bgcolor: "#FFFFFF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Box className="material-symbols-sharp" sx={{ fontSize: 16, color: "text.secondary" }}>
                      {ROLE_ICON[t.role] ?? "person"}
                    </Box>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.primary", textTransform: "capitalize" }}>
                      {t.team_id}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "text.secondary", textTransform: "capitalize" }}>
                      {t.role.replace("_", " ")}
                    </Typography>
                  </Box>
                </Stack>
                <Chip size="small" label={style.label}
                  sx={{ bgcolor: style.bg, color: style.color, height: 22, fontSize: 11, fontWeight: 500 }} />
              </Box>
            );
          })}
        </Stack>
      )}
    </Drawer>
  );
}
