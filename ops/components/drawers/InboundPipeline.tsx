"use client";
import { Stack, Typography, Box, LinearProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { api } from "@/lib/api";

type Source = { source_id: string; name: string; arrival_rate_per_min: number; fill_pct: number; eta_gate_min: number };

const SOURCE_ICON: Record<string, string> = {
  metro_mg_road: "subway",
  metro_cubbon_park: "subway",
  parking_north: "local_parking",
};

export function InboundPipeline() {
  const [sources, setSources] = useState<Source[]>([]);
  useEffect(() => {
    const fetchOnce = () => api.opsState().then((s: any) => setSources(s.inbound?.sources ?? []));
    fetchOnce();
    const id = setInterval(fetchOnce, 5000);
    return () => clearInterval(id);
  }, []);

  const totalRate = sources.reduce((s, x) => s + x.arrival_rate_per_min, 0);
  const tone: "live" | "warning" | "idle" = totalRate > 400 ? "warning" : totalRate > 0 ? "live" : "idle";

  return (
    <Drawer title="Inbound pipeline" tone={tone} badge={`${Math.round(totalRate)}/min`}>
      <Stack spacing={1.5}>
        {sources.map((s) => {
          const fill = Math.min(100, s.fill_pct * 100);
          const high = fill > 70;
          return (
            <Box key={s.source_id}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <Box className="material-symbols-sharp" sx={{ fontSize: 18, color: "text.secondary" }}>
                  {SOURCE_ICON[s.source_id] ?? "directions"}
                </Box>
                <Typography sx={{ fontSize: 13, color: "text.primary", flex: 1, fontWeight: 500 }}>
                  {s.name}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  ETA <Box component="span" sx={{ color: "text.primary", fontWeight: 500 }}>{s.eta_gate_min.toFixed(0)}m</Box>
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LinearProgress
                  variant="determinate" value={fill}
                  sx={{
                    flex: 1, height: 6, borderRadius: 3,
                    bgcolor: "#E8EAED",
                    "& .MuiLinearProgress-bar": { bgcolor: high ? "#F29900" : "#1A73E8" },
                  }}
                />
                <Typography sx={{ fontSize: 11, color: "text.secondary", minWidth: 50 }}>
                  {s.arrival_rate_per_min.toFixed(0)}/min
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Drawer>
  );
}
