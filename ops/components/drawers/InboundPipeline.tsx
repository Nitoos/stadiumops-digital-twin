"use client";
import { Stack, Typography, Box, LinearProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { api } from "@/lib/api";

type Source = { source_id: string; name: string; arrival_rate_per_min: number; fill_pct: number; eta_gate_min: number };

export function InboundPipeline() {
  const [sources, setSources] = useState<Source[]>([]);
  useEffect(() => {
    const fetchOnce = () => api.opsState().then((s: any) => setSources(s.inbound?.sources ?? []));
    fetchOnce();
    const id = setInterval(fetchOnce, 5000);
    return () => clearInterval(id);
  }, []);
  return (
    <Drawer title="Inbound pipeline (L2)" density="compact">
      <Stack spacing={1}>
        {sources.map((s) => (
          <Box key={s.source_id}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">{s.name}</Typography>
              <Typography variant="caption" sx={{ fontFamily: "Roboto Mono", color: "text.secondary" }}>
                {s.arrival_rate_per_min.toFixed(0)}/min · ETA {s.eta_gate_min.toFixed(0)}m
              </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={Math.min(100, s.fill_pct * 100)} />
          </Box>
        ))}
      </Stack>
    </Drawer>
  );
}
