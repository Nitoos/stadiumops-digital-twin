"use client";
import { Box, Card, Stack } from "@mui/material";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { wsClient } from "@/lib/ws";
import { useStore } from "@/lib/store";
import { DensityLegend } from "@/components/ui/DensityLegend";
import { KPICard } from "@/components/ui/KPICard";
import { AppBar } from "@/components/ui/AppBar";
import { SceneRail } from "@/components/ui/SceneRail";
import { Scene } from "@/components/twin/Scene";
import { OperationsPanel } from "@/components/ui/OperationsPanel";
import { TimeScrubber } from "@/components/controls/TimeScrubber";
import { ForecastLens } from "@/components/controls/ForecastLens";
import { WhatIfButton } from "@/components/controls/WhatIfButton";

function PhaseIcon() { return <Box className="material-symbols-sharp" sx={{ fontSize: 22 }}>schedule</Box>; }
function TimerIcon() { return <Box className="material-symbols-sharp" sx={{ fontSize: 22 }}>timer</Box>; }
function OccupancyIcon() { return <Box className="material-symbols-sharp" sx={{ fontSize: 22 }}>groups</Box>; }
function DensityIcon() { return <Box className="material-symbols-sharp" sx={{ fontSize: 22 }}>density_medium</Box>; }

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
  const phaseLabel = phase === "pre" ? "Pre-match" : phase === "live" ? "Live" : phase === "break" ? "Break" : phase === "post" ? "Post-match" : "Boot";

  return (
    <Box sx={{
      height: "100vh",
      display: "grid",
      gridTemplateRows: "auto 1fr",
      bgcolor: "background.default",
    }}>
      <AppBar phase={phase} simMin={simMin} />

      <Box sx={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 420px",
        gap: 2,
        p: 2,
        minHeight: 0,
        overflow: "hidden",
      }}>
        {/* Left column: KPI strip + Twin */}
        <Stack spacing={2} sx={{ minHeight: 0 }}>
          {/* KPI strip — 4 hero stat cards */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 2,
          }}>
            <KPICard
              icon={<PhaseIcon />}
              label="Match phase"
              value={phaseLabel}
              hint={phase === "pre" ? "Inbound flow active" : "Live state"}
            />
            <KPICard
              icon={<TimerIcon />}
              label="Sim time"
              value={`${simMin}m`}
              hint="Since match T-90"
            />
            <KPICard
              icon={<OccupancyIcon />}
              label="Occupancy"
              value={totalOcc.toLocaleString()}
              unit="fans"
              hint="Across all zones"
            />
            <KPICard
              icon={<DensityIcon />}
              label="Peak density"
              value={peak.toFixed(2)}
              unit="ppl/m²"
              tone={peakTone}
              hint={peak >= 2 ? "Crush risk" : peak >= 1 ? "Restricted flow" : "Free flow"}
            />
          </Box>

          {/* Twin canvas */}
          <Card sx={{
            flex: 1, position: "relative", overflow: "hidden",
            bgcolor: "#E8F0FE",
            border: 0,
            minHeight: 0,
          }}>
            <Scene />
          </Card>

          {/* Footer band — legend + controls + scrubber */}
          <Card sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <DensityLegend />
            <Box sx={{ flex: 1 }} />
            <ForecastLens />
            <WhatIfButton />
            <TimeScrubber />
          </Card>

          {/* Demo scene rail — last so it's discoverable but not intrusive */}
          <Card sx={{ p: 1.5 }}>
            <SceneRail />
          </Card>
        </Stack>

        {/* Right column: Tabbed operations panel */}
        <Box sx={{ minHeight: 0, display: "flex" }}>
          <OperationsPanel />
        </Box>
      </Box>
    </Box>
  );
}
