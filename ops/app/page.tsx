"use client";
import { Box, Stack } from "@mui/material";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { wsClient } from "@/lib/ws";
import { useStore } from "@/lib/store";
import { DensityLegend } from "@/components/ui/DensityLegend";
import { KPIChip } from "@/components/ui/KPIChip";
import { VenueHeader } from "@/components/ui/VenueHeader";
import { OperatorBadge } from "@/components/ui/OperatorBadge";
import { SceneRail } from "@/components/ui/SceneRail";
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

  const phase = density?.phase ?? "boot";
  const simMin = density ? Math.round(density.sim_time_sec / 60) : 0;
  const peak = density?.zones?.length ? Math.max(...density.zones.map((z) => z.density_per_m2)) : 0;
  const totalOcc = density?.zones?.reduce((s, z) => s + z.occupancy, 0) ?? 0;
  const peakTone = peak >= 2 ? "critical" : peak >= 1 ? "warning" : "success";

  return (
    <Box sx={{
      height: "100vh",
      display: "grid",
      gridTemplateRows: "auto auto 1fr auto",
      gap: 1.25,
      p: 1.25,
      // Layered radial backdrop for command-center depth
      background: `
        radial-gradient(ellipse at 18% 0%, rgba(26,115,232,0.10), transparent 55%),
        radial-gradient(ellipse at 82% 100%, rgba(217,48,37,0.08), transparent 55%),
        #0A0D12
      `,
    }}>
      {/* Top bar: venue header · forecast lens · what-if · KPIs · operator */}
      <Stack direction="row" alignItems="center" sx={{
        px: 1.25, py: 1.25,
        bgcolor: "rgba(20,26,34,0.55)",
        border: "1px solid rgba(232,234,237,0.07)",
        borderRadius: 2,
        backdropFilter: "blur(8px)",
        gap: 2, flexWrap: "wrap",
      }}>
        <VenueHeader phase={phase} simMin={simMin} />
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ForecastLens />
          <WhatIfButton />
        </Stack>
        <Box sx={{ width: 1, height: 28, bgcolor: "divider" }} />
        <Stack direction="row" spacing={1}>
          <KPIChip label="Sim Time" value={`${simMin}m`} />
          <KPIChip label="Occupancy" value={totalOcc.toLocaleString()} />
          <KPIChip label="Peak Density" value={peak.toFixed(2)} unit="ppl/m²" tone={peakTone} />
        </Stack>
        <OperatorBadge />
      </Stack>

      {/* Scene rail */}
      <Box sx={{
        bgcolor: "rgba(20,26,34,0.4)",
        border: "1px solid rgba(232,234,237,0.05)",
        borderRadius: 2,
        py: 1, px: 0.5,
      }}>
        <SceneRail />
      </Box>

      {/* Main: twin canvas + drawer rail */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 1.25, minHeight: 0 }}>
        <Box sx={{
          borderRadius: 2,
          border: "1px solid rgba(232,234,237,0.07)",
          bgcolor: "#05080C",
          position: "relative",
          overflow: "hidden",
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.6)",
        }}>
          <Scene />
        </Box>
        <Stack spacing={1.25} sx={{ overflow: "auto", pr: 0.5, minHeight: 0 }}>
          <ProtocolArmed />
          <AlertConsole />
          <AgentPane />
          <CommsDrafter />
          <DispatchBoard />
          <InboundPipeline />
        </Stack>
      </Box>

      {/* Bottom: density legend + replay scrubber */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{
        px: 1.5, py: 1,
        bgcolor: "rgba(20,26,34,0.45)",
        border: "1px solid rgba(232,234,237,0.05)",
        borderRadius: 2,
      }}>
        <DensityLegend />
        <Box sx={{ flex: 1 }} />
        <TimeScrubber />
      </Stack>
    </Box>
  );
}
