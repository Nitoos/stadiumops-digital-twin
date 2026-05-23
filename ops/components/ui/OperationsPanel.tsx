"use client";
import { Box, Card, Tab, Tabs, Badge } from "@mui/material";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { ProtocolArmed } from "@/components/drawers/ProtocolArmed";
import { AlertConsole } from "@/components/drawers/AlertConsole";
import { AgentPane } from "@/components/drawers/AgentPane";
import { CommsDrafter } from "@/components/drawers/CommsDrafter";
import { DispatchBoard } from "@/components/drawers/DispatchBoard";
import { InboundPipeline } from "@/components/drawers/InboundPipeline";

type TabKey = "protocols" | "alerts" | "agent" | "comms" | "teams" | "inbound";

// Natural reading order: observation → response → support
//   Alerts     — what is happening
//   Protocols  — what to do about it
//   AI Agent   — get a recommendation
//   Comms      — broadcast to fans
//   Teams      — dispatch field staff
//   Inbound    — pre-match flow
const TAB_META: { key: TabKey; label: string; icon: string }[] = [
  { key: "alerts",    label: "Alerts",    icon: "notifications_active" },
  { key: "protocols", label: "Protocols", icon: "policy" },
  { key: "agent",     label: "AI Agent",  icon: "auto_awesome" },
  { key: "comms",     label: "Comms",     icon: "campaign" },
  { key: "teams",     label: "Teams",     icon: "groups" },
  { key: "inbound",   label: "Inbound",   icon: "directions_subway" },
];

export function OperationsPanel() {
  const alerts = useStore((s) => s.alerts);
  const [tab, setTab] = useState<TabKey>("alerts");
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  // Auto-switch to Alerts when a critical alert arrives
  useEffect(() => {
    if (criticalCount > 0 && tab !== "alerts") {
      // Don't yank focus mid-edit; only switch when no manual tab change for a moment.
      // Phase 0: simply jump.
      setTab("alerts");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criticalCount]);

  return (
    <Card sx={{ display: "flex", flexDirection: "column", minHeight: 0, height: "100%" }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          borderBottom: 1, borderColor: "divider",
          minHeight: 48,
          px: 1,
          "& .MuiTab-root": { minHeight: 48, fontSize: 13, color: "text.secondary" },
          "& .Mui-selected": { color: "primary.main" },
        }}
      >
        {TAB_META.map((m) => {
          const showBadge = m.key === "alerts" && alerts.length > 0;
          return (
            <Tab
              key={m.key}
              value={m.key}
              iconPosition="start"
              icon={
                <Box sx={{ display: "flex", alignItems: "center", position: "relative" }}>
                  <Box className="material-symbols-sharp" sx={{ fontSize: 18 }}>{m.icon}</Box>
                  {showBadge && (
                    <Badge
                      badgeContent={alerts.length}
                      color={criticalCount > 0 ? "error" : "warning"}
                      sx={{
                        "& .MuiBadge-badge": { fontSize: 9, height: 14, minWidth: 14, padding: "0 4px", right: -6, top: -3 },
                      }}
                    />
                  )}
                </Box>
              }
              label={m.label}
              sx={{ textTransform: "none", fontWeight: 500, letterSpacing: 0.1, gap: 0.75 }}
            />
          );
        })}
      </Tabs>
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {tab === "protocols" && <ProtocolArmed />}
        {tab === "alerts" && <AlertConsole />}
        {tab === "agent" && <AgentPane />}
        {tab === "comms" && <CommsDrafter />}
        {tab === "teams" && <DispatchBoard />}
        {tab === "inbound" && <InboundPipeline />}
      </Box>
    </Card>
  );
}
