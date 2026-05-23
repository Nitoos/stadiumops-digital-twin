"use client";
import { Box, Stack, Typography, Button } from "@mui/material";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { wsClient } from "@/lib/ws";
import { useStore } from "@/lib/store";
import { DensityLegend } from "@/components/ui/DensityLegend";
import { KPIChip } from "@/components/ui/KPIChip";
import { Scene } from "@/components/twin/Scene";
import { AlertConsole } from "@/components/drawers/AlertConsole";
import { ProtocolArmed } from "@/components/drawers/ProtocolArmed";
import { AgentPane } from "@/components/drawers/AgentPane";
import { CommsDrafter } from "@/components/drawers/CommsDrafter";
import { DispatchBoard } from "@/components/drawers/DispatchBoard";
import { InboundPipeline } from "@/components/drawers/InboundPipeline";
import { TimeScrubber } from "@/components/controls/TimeScrubber";
import { ForecastLens } from "@/components/controls/ForecastLens";
import { WhatIfButton } from "@/components/controls/WhatIfButton";

const SCENES: { name: string; label: string; color: "error" | "warning" | "secondary" | "primary" }[] = [
  { name: "entry_surge", label: "Entry surge", color: "error" },
  { name: "storm", label: "Storm", color: "warning" },
  { name: "drone_threat", label: "Drone threat", color: "primary" },
  { name: "exit_surge", label: "Exit surge", color: "secondary" },
];

export default function Page() {
  const setLayout = useStore((s) => s.setLayout);
  const onDensity = useStore((s) => s.onDensity);
  const addAlert = useStore((s) => s.addAlert);
  const setWeather = useStore((s) => s.setWeather);
  const addThreat = useStore((s) => s.addThreat);
  const density = useStore((s) => s.density);
  const setTeams = useStore((s) => s.setTeams);

  useQuery({ queryKey: ["layout"], queryFn: async () => {
    const l = await api.layout(); setLayout(l); return l;
  }});

  useEffect(() => {
    wsClient.connect();
    const off = wsClient.on((e) => {
      if (e.topic === "density.tick") onDensity(e.payload);
      if (e.topic === "anomaly.detected") addAlert({
        id: e.payload.id, severity: e.payload.severity,
        zone_id: e.payload.zone_id, reason: e.payload.reason,
        los: e.payload.los, density_per_m2: e.payload.density_per_m2,
      });
      if (e.topic === "weather.alert") setWeather(e.payload);
      if (e.topic === "threat.signal") addThreat({
        id: e.payload.id, summary: e.payload.summary, severity: e.payload.severity,
      });
    });
    const teamRefresh = setInterval(() => {
      api.opsState().then((s: any) => setTeams(s.teams ?? [])).catch(() => {});
    }, 4000);
    return () => { off(); clearInterval(teamRefresh); };
  }, [onDensity, addAlert, setWeather, addThreat, setTeams]);

  const phase = density?.phase ?? "—";
  const sim_min = density ? Math.round(density.sim_time_sec / 60) : 0;
  const peak = density?.zones?.length ? Math.max(...density.zones.map((z) => z.density_per_m2)) : 0;

  return (
    <Box sx={{ height: "100vh", display: "grid", gridTemplateRows: "auto auto 1fr auto", gap: 1, p: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h5">StadiumOps Command</Typography>
        <Box sx={{ flex: 1 }} />
        <ForecastLens />
        <WhatIfButton />
        <KPIChip label="Phase" value={phase} />
        <KPIChip label="Sim time (min)" value={sim_min} />
        <KPIChip label="Peak density (ppl/m²)" value={peak.toFixed(2)}
          tone={peak >= 2 ? "critical" : peak >= 1 ? "warning" : "success"} />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ px: 1, pb: 1 }}>
        <Typography variant="caption" sx={{ alignSelf: "center", color: "text.secondary", mr: 1 }}>
          Demo:
        </Typography>
        {SCENES.map((s) => (
          <Button key={s.name} size="small" variant="outlined" color={s.color}
            onClick={() => api.runScene(s.name)}>
            {s.label}
          </Button>
        ))}
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 1, minHeight: 0 }}>
        <Box sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", position: "relative", overflow: "hidden" }}>
          <Scene />
        </Box>
        <Stack spacing={1} sx={{ overflow: "auto", pr: 0.5 }}>
          <ProtocolArmed />
          <AlertConsole />
          <AgentPane />
          <CommsDrafter />
          <DispatchBoard />
          <InboundPipeline />
        </Stack>
      </Box>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ px: 2, py: 1 }}>
        <DensityLegend />
        <Box sx={{ flex: 1 }} />
        <TimeScrubber />
      </Stack>
    </Box>
  );
}
