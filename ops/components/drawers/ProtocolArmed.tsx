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
      if (e.topic === "protocol.armed") setArmed((a) => [...a, e.payload]);
      if (e.topic === "protocol.confirmed") setArmed((a) =>
        a.map((p) => p.id === e.payload.id ? { ...p, confirmed_by: e.payload.confirmed_by } : p));
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
      title="Protocols armed"
      tone={hasCritical ? "critical" : activeCount > 0 ? "warning" : "idle"}
      badge={armed.length === 0 ? "Standby" : `${activeCount} pending`}
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
          {armed.map((p) => {
            const isCritical = p.severity === "critical";
            const confirmed = !!p.confirmed_by;
            const accent = confirmed ? "#1E8E3E" : isCritical ? "#D93025" : "#F29900";
            const bg = confirmed ? "#E6F4EA" : isCritical ? "#FCE8E6" : "#FEF7E0";
            return (
              <Box key={p.id} sx={{
                p: 1.75,
                borderRadius: 1.5,
                bgcolor: bg,
                border: "1px solid",
                borderColor: `${accent}40`,
              }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography sx={{
                    fontFamily: '"Google Sans Display", sans-serif',
                    fontSize: 14, fontWeight: 500, color: "text.primary",
                  }}>
                    {p.name}
                  </Typography>
                  <Chip size="small" label={p.sop}
                    sx={{
                      height: 22, fontSize: 10, fontWeight: 500, letterSpacing: 0.3,
                      bgcolor: "#FFFFFF",
                      color: accent,
                      border: `1px solid ${accent}40`,
                    }}
                  />
                </Stack>
                <List dense disablePadding sx={{ mt: 0.5 }}>
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
                  <Button
                    fullWidth size="small" variant="contained"
                    onClick={() => confirm(p.id)}
                    sx={{
                      mt: 1.25,
                      bgcolor: accent,
                      color: "#FFFFFF",
                      "&:hover": { bgcolor: accent, filter: "brightness(0.92)" },
                    }}
                  >
                    Confirm & execute
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
