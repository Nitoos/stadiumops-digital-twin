"use client";
import { Stack, Typography, Button, Box, Chip, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { api } from "@/lib/api";
import { wsClient } from "@/lib/ws";
import { useStore } from "@/lib/store";
import { zoneName } from "@/lib/zoneName";

type Armed = {
  id: string; sop: string; name: string; severity: string;
  checklist: string[]; confirmed_by: string | null;
  trigger?: Record<string, any>;
  // Backend `protocol.armed` payload now includes the event ts via WS;
  // we also stash a local arrival ts so we can show "armed Xs ago".
  _arrivedTs?: number;
};

// Friendly title per SOP — concise, action-focused. Falls back to the SOP catalog name.
const SOP_HEADLINE: Record<string, string> = {
  CROWD_CRUSH_RISK: "Crush risk",
  STORM_INBOUND: "Storm inbound",
  HEAT_RISK: "Heat risk",
  UNAUTHORIZED_DRONE: "Unauthorized drone",
  MEDICAL_MASS_CASUALTY: "Mass casualty",
  PITCH_INVASION: "Pitch invasion",
};

const SOP_ICON: Record<string, string> = {
  CROWD_CRUSH_RISK: "groups",
  STORM_INBOUND: "thunderstorm",
  HEAT_RISK: "thermostat",
  UNAUTHORIZED_DRONE: "flight",
  MEDICAL_MASS_CASUALTY: "emergency",
  PITCH_INVASION: "sports_cricket",
};

function ageLabel(arrivedTs?: number): string {
  if (!arrivedTs) return "just now";
  const sec = Math.max(0, Math.round((Date.now() - arrivedTs) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  return `${min}m ${sec % 60}s ago`;
}

export function ProtocolArmed() {
  const [armed, setArmed] = useState<Armed[]>([]);
  const [doneSteps, setDoneSteps] = useState<Record<string, Set<number>>>({});
  const [, force] = useState(0);
  const layout = useStore((s) => s.layout);

  useEffect(() => {
    api.opsState().then((s: any) => {
      const list = (s.protocols_armed ?? []).map((p: any) => ({ ...p, _arrivedTs: Date.now() }));
      setArmed(list);
    });
    const off = wsClient.on((e) => {
      if (e.topic === "protocol.armed") {
        setArmed((a) => [...a, { ...e.payload, _arrivedTs: Date.now() }]);
      }
      if (e.topic === "protocol.confirmed") {
        setArmed((a) => a.map((p) =>
          p.id === e.payload.id ? { ...p, confirmed_by: e.payload.confirmed_by } : p));
      }
    });
    // re-render every 5s for "armed Xs ago"
    const tick = setInterval(() => force((n) => n + 1), 5000);
    return () => { off(); clearInterval(tick); };
  }, []);

  async function confirm(id: string) {
    await api.confirmProtocol(id, "ops.commander.demo");
  }

  function dismiss(id: string) {
    // Local-only dismiss (Phase 0): hide from the panel without confirming.
    setArmed((a) => a.filter((p) => p.id !== id));
  }

  function toggleStep(id: string, idx: number) {
    setDoneSteps((m) => {
      const s = new Set(m[id] ?? []);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return { ...m, [id]: s };
    });
  }

  const activeCount = armed.filter((p) => !p.confirmed_by).length;
  const hasCritical = armed.some((p) => p.severity === "critical" && !p.confirmed_by);

  // Sort: unconfirmed first, most-recent first
  const sorted = [...armed].sort((a, b) => {
    if (!!a.confirmed_by !== !!b.confirmed_by) return a.confirmed_by ? 1 : -1;
    return (b._arrivedTs ?? 0) - (a._arrivedTs ?? 0);
  });

  return (
    <Drawer
      title="Protocols armed"
      tone={hasCritical ? "critical" : activeCount > 0 ? "warning" : "idle"}
      badge={armed.length === 0 ? "Standby" : `${activeCount} pending · ${armed.length} total`}
    >
      {armed.length === 0 ? (
        <Box sx={{ py: 3, textAlign: "center" }}>
          <Box className="material-symbols-sharp" sx={{ fontSize: 32, color: "text.disabled" }}>policy</Box>
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
            No protocols armed. Awaiting trigger.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {sorted.map((p) => {
            const isCritical = p.severity === "critical";
            const confirmed = !!p.confirmed_by;
            const accent = confirmed ? "#1E8E3E" : isCritical ? "#D93025" : "#F29900";
            const bg = confirmed ? "#E6F4EA" : isCritical ? "#FCE8E6" : "#FEF7E0";

            const headline = SOP_HEADLINE[p.sop] ?? p.name;
            const icon = SOP_ICON[p.sop] ?? "warning";
            const zone = zoneName(p.trigger?.zone_id, layout);
            const los: string | undefined = p.trigger?.los;
            const density: number | undefined = p.trigger?.density_per_m2;
            const reason: string | undefined = p.trigger?.reason;

            return (
              <Box key={p.id} sx={{
                p: 1.75,
                borderRadius: 1.5,
                bgcolor: bg,
                border: "1px solid",
                borderColor: `${accent}40`,
              }}>
                {/* Headline: ICON + LOCATION + ACTION */}
                <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 0.75 }}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: 1.25, flexShrink: 0,
                    bgcolor: "#FFFFFF",
                    border: `1px solid ${accent}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Box className="material-symbols-sharp" sx={{ fontSize: 20, color: accent }}>{icon}</Box>
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{
                      fontSize: 10, letterSpacing: 0.4, fontWeight: 500,
                      color: accent, textTransform: "uppercase",
                    }}>
                      {headline} · {p.trigger?.zone_id ? "Location" : "Venue-wide"}
                    </Typography>
                    <Typography sx={{
                      fontFamily: '"Google Sans Display", sans-serif',
                      fontSize: 15, fontWeight: 500, color: "text.primary", lineHeight: 1.2,
                    }}>
                      {zone}
                    </Typography>
                  </Box>
                  <Chip size="small" label={p.sop}
                    sx={{
                      height: 20, fontSize: 9.5, fontWeight: 500, letterSpacing: 0.3,
                      bgcolor: "#FFFFFF",
                      color: accent,
                      border: `1px solid ${accent}40`,
                    }}
                  />
                </Stack>

                {/* Telemetry strip — LOS, density, reason, age */}
                <Stack direction="row" alignItems="center" spacing={1.5}
                  sx={{ mb: 0.75, flexWrap: "wrap", rowGap: 0.5 }}>
                  {los && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography sx={{ fontSize: 10.5, color: "text.secondary", fontWeight: 500 }}>LOS</Typography>
                      <Box sx={{
                        px: 0.85, py: 0.05, borderRadius: 0.75,
                        bgcolor: "#FFFFFF", border: `1px solid ${accent}40`,
                        fontSize: 11, fontWeight: 600, color: accent,
                        fontFamily: "Roboto Mono, monospace",
                      }}>
                        {los}
                      </Box>
                    </Stack>
                  )}
                  {density !== undefined && (
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      <Box component="span" sx={{ color: "text.primary", fontWeight: 500 }}>{density.toFixed(2)}</Box> ppl/m²
                    </Typography>
                  )}
                  {p.trigger?.storm_eta_min !== undefined && (
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      Storm ETA <Box component="span" sx={{ color: "text.primary", fontWeight: 500 }}>{p.trigger.storm_eta_min}m</Box>
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: 11, color: "text.disabled", ml: "auto" }}>
                    {confirmed ? "confirmed" : `armed ${ageLabel(p._arrivedTs)}`}
                  </Typography>
                </Stack>

                {reason && !confirmed && (
                  <Typography sx={{
                    fontSize: 12, color: "text.secondary", lineHeight: 1.45, mb: 0.75,
                    pl: 0.25,
                  }}>
                    {reason}
                  </Typography>
                )}

                {/* Checklist */}
                <List dense disablePadding>
                  {p.checklist.map((step, i) => {
                    const done = doneSteps[p.id]?.has(i) ?? false;
                    return (
                      <ListItem key={i} disablePadding onClick={() => toggleStep(p.id, i)}
                        sx={{ cursor: "pointer", py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          {done
                            ? <CheckBoxIcon fontSize="small" sx={{ fontSize: 18, color: "#1E8E3E" }} />
                            : <CheckBoxOutlineBlankIcon fontSize="small" sx={{ fontSize: 18, color: "text.disabled" }} />}
                        </ListItemIcon>
                        <ListItemText
                          primary={step}
                          primaryTypographyProps={{
                            sx: {
                              fontSize: 13, lineHeight: 1.45,
                              textDecoration: done ? "line-through" : "none",
                              color: done ? "text.disabled" : "text.primary",
                            },
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>

                {confirmed ? (
                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1 }}>
                    <Box className="material-symbols-sharp" sx={{ fontSize: 16, color: "#1E8E3E" }}>check_circle</Box>
                    <Typography sx={{ fontSize: 12, color: "#137333" }}>
                      Confirmed by {p.confirmed_by}
                    </Typography>
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
                    <Button
                      fullWidth size="small" variant="contained"
                      onClick={() => confirm(p.id)}
                      sx={{
                        bgcolor: accent,
                        color: "#FFFFFF",
                        "&:hover": { bgcolor: accent, filter: "brightness(0.92)" },
                      }}
                    >
                      Confirm & execute
                    </Button>
                    <Button
                      size="small" variant="text"
                      onClick={() => dismiss(p.id)}
                      sx={{ color: "text.secondary", minWidth: 80 }}
                    >
                      Dismiss
                    </Button>
                  </Stack>
                )}
              </Box>
            );
          })}
        </Stack>
      )}
    </Drawer>
  );
}
