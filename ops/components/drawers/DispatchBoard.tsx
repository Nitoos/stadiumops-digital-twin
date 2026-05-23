"use client";
import { Stack, Typography, Chip, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { api } from "@/lib/api";

type Team = { team_id: string; role: string; position: [number, number]; status: string };

export function DispatchBoard() {
  const [teams, setTeams] = useState<Team[]>([]);
  useEffect(() => {
    const fetchOnce = () => api.opsState().then((s: any) => setTeams(s.teams ?? []));
    fetchOnce();
    const id = setInterval(fetchOnce, 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <Drawer title="Dispatch board">
      {teams.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No teams registered.</Typography>
      ) : (
        <Stack spacing={0.5}>
          {teams.map((t) => (
            <Box key={t.team_id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 0.5 }}>
              <Box>
                <Typography variant="body2" sx={{ fontFamily: "Roboto Mono" }}>{t.team_id}</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>{t.role}</Typography>
              </Box>
              <Chip size="small" label={t.status}
                color={t.status === "responding" ? "warning" : t.status === "on_task" ? "primary" : "default"} />
            </Box>
          ))}
        </Stack>
      )}
    </Drawer>
  );
}
