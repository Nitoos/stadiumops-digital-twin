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

  return (
    <Drawer title="Protocols armed">
      {armed.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No protocols armed.</Typography>
      ) : (
        <Stack spacing={1}>
          {armed.map((p) => (
            <Box key={p.id} sx={{ p: 1.5, border: "1px solid", borderColor: p.severity === "critical" ? "error.main" : "divider", borderRadius: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2">{p.name}</Typography>
                <Chip size="small" color={p.severity === "critical" ? "error" : "warning"} label={p.sop} />
              </Stack>
              <List dense>
                {p.checklist.map((step, i) => {
                  const done = doneSteps[p.id]?.has(i) ?? false;
                  return (
                    <ListItem key={i} disablePadding onClick={() => toggleStep(p.id, i)} sx={{ cursor: "pointer", py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {done ? <CheckBoxIcon fontSize="small" color="success" /> : <CheckBoxOutlineBlankIcon fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText primary={step} primaryTypographyProps={{ variant: "body2", sx: { textDecoration: done ? "line-through" : "none", color: done ? "text.secondary" : "text.primary" } }} />
                    </ListItem>
                  );
                })}
              </List>
              {p.confirmed_by ? (
                <Chip size="small" color="success" label={`Confirmed by ${p.confirmed_by}`} />
              ) : (
                <Button size="small" variant="contained" color="error" onClick={() => confirm(p.id)}>
                  Confirm + execute
                </Button>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Drawer>
  );
}
