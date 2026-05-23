"use client";
import { Stack, Typography, Button, TextField, Box, Chip, LinearProgress } from "@mui/material";
import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { api } from "@/lib/api";
import type { AgentRec } from "@/lib/types";

export function AgentPane() {
  const [ctx, setCtx] = useState("Concourse North at LOS F. Density 2.5 ppl/m². Forecast +10m = F.");
  const [rec, setRec] = useState<AgentRec | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try { setRec((await api.agentAsk(ctx)) as AgentRec); } finally { setLoading(false); }
  }

  return (
    <Drawer title="AI Agent">
      <Stack spacing={1}>
        <TextField multiline rows={2} size="small" value={ctx} onChange={(e) => setCtx(e.target.value)} />
        <Button size="small" variant="contained" onClick={ask} disabled={loading}>
          {loading ? "Thinking…" : "Ask agent"}
        </Button>
        {loading && <LinearProgress />}
        {rec && (
          <Box sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Typography variant="subtitle2">{rec.title}</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", my: 0.5 }}>{rec.rationale}</Typography>
            <Stack spacing={0.25} sx={{ mt: 1 }}>
              {rec.actions.map((a, i) => (
                <Typography key={i} variant="body2">• {a}</Typography>
              ))}
            </Stack>
            <Chip size="small" sx={{ mt: 1 }} label={`Confidence ${Math.round(rec.confidence * 100)}%`} />
          </Box>
        )}
      </Stack>
    </Drawer>
  );
}
