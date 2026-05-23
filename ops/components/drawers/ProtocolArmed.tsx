"use client";
import { Stack, Typography, Button, Box, Chip, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { api } from "@/lib/api";
import { wsClient } from "@/lib/ws";

type Armed = {
  id: string; sop: string; name: string; severity: string;
  checklist: string[]; confirmed_by: string | null;
};

export function ProtocolArmed() {
  const [armed, setArmed] = useState<Armed[]>([]);
  const [doneSteps, setDoneSteps] = useState<Record<string, Set<number>>>({});

  useEffect(() => {
    api.opsState().then((s: any) => setArmed(s.protocols_armed ?? []));
    const off = wsClient.on((e) => {
      if (e.topic === "protocol.armed") {
        setArmed((a) => [...a, e.payload]);
      }
      if (e.topic === "protocol.confirmed") {
        setArmed((a) => a.map((p) => p.id === e.payload.id ? { ...p, confirmed_by: e.payload.confirmed_by } : p));
      }
    });
    return () => { off(); };
  }, []);

  async function confirm(id: string) {
    await api.confirmProtocol(id, "ops.commander.demo");
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

  return (
    <Drawer
      title="Protocols Armed"
      tone={hasCritical ? "critical" : activeCount > 0 ? "warning" : "idle"}
      badge={armed.length === 0 ? "STANDBY" : `${activeCount} PENDING`}
    >
      {armed.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.disabled", fontSize: 12, py: 1 }}>
          No protocols armed. Awaiting trigger.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {armed.map((p) => {
            const isCritical = p.severity === "critical";
            const confirmed = !!p.confirmed_by;
            return (
              <Box key={p.id} sx={{
                p: 1.5,
                borderRadius: 1.5,
                position: "relative",
                bgcolor: confirmed ? "rgba(129,201,149,0.04)" : isCritical ? "rgba(242,139,130,0.06)" : "rgba(253,214,99,0.04)",
                border: "1px solid",
                borderColor: confirmed ? "rgba(129,201,149,0.3)" : isCritical ? "rgba(242,139,130,0.4)" : "rgba(253,214,99,0.3)",
                boxShadow: confirmed ? "none" : isCritical ? "0 0 22px rgba(242,139,130,0.15)" : "0 0 14px rgba(253,214,99,0.1)",
                "&::before": !confirmed && isCritical ? {
                  content: '""', position: "absolute", inset: -1, borderRadius: 1.5,
                  background: "linear-gradient(90deg, transparent, rgba(242,139,130,0.18), transparent)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2.5s linear infinite",
                  pointerEvents: "none",
                  "@keyframes shimmer": {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                  },
                } : undefined,
              }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography sx={{
                    fontFamily: '"Google Sans Display", sans-serif',
                    fontSize: 13.5, fontWeight: 600,
                    color: confirmed ? "text.secondary" : "text.primary",
                  }}>
                    {p.name}
                  </Typography>
                  <Chip size="small" label={p.sop}
                    sx={{
                      height: 18, fontSize: 9, fontFamily: "Roboto Mono, monospace",
                      letterSpacing: 0.6,
                      bgcolor: isCritical ? "rgba(242,139,130,0.18)" : "rgba(253,214,99,0.18)",
                      color: isCritical ? "#F28B82" : "#FDD663",
                      border: `1px solid ${isCritical ? "rgba(242,139,130,0.4)" : "rgba(253,214,99,0.4)"}`,
                    }}
                  />
                </Stack>
                <List dense disablePadding sx={{ mt: 0.5 }}>
                  {p.checklist.map((step, i) => {
                    const done = doneSteps[p.id]?.has(i) ?? false;
                    return (
                      <ListItem key={i} disablePadding onClick={() => toggleStep(p.id, i)}
                        sx={{ cursor: "pointer", py: 0.15 }}>
                        <ListItemIcon sx={{ minWidth: 26 }}>
                          {done
                            ? <CheckBoxIcon fontSize="small" sx={{ fontSize: 16, color: "#81C995" }} />
                            : <CheckBoxOutlineBlankIcon fontSize="small" sx={{ fontSize: 16, color: "text.disabled" }} />}
                        </ListItemIcon>
                        <ListItemText
                          primary={step}
                          primaryTypographyProps={{
                            sx: {
                              fontSize: 12, lineHeight: 1.4,
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
                  <Chip size="small" label={`Confirmed · ${p.confirmed_by}`}
                    sx={{
                      mt: 0.75, height: 20, fontSize: 10,
                      bgcolor: "rgba(129,201,149,0.18)",
                      color: "#81C995",
                      border: "1px solid rgba(129,201,149,0.4)",
                    }} />
                ) : (
                  <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={() => confirm(p.id)}
                    sx={{
                      mt: 1, py: 0.65, fontSize: 12,
                      bgcolor: isCritical ? "#D93025" : "#F9AB00",
                      color: "#0B1220",
                      "&:hover": {
                        bgcolor: isCritical ? "#F28B82" : "#FDD663",
                        boxShadow: `0 0 16px ${isCritical ? "rgba(217,48,37,0.5)" : "rgba(249,171,0,0.5)"}`,
                      },
                    }}
                  >
                    Confirm & Execute
                  </Button>
                )}
              </Box>
            );
          })}
        </Stack>
      )}
    </Drawer>
  );
}
