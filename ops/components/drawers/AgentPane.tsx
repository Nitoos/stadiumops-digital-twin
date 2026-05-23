"use client";
import { Stack, Typography, Button, TextField, Box, LinearProgress } from "@mui/material";
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
    <Drawer title="AI Agent · Gemini 2.0" tone={rec ? "live" : "idle"} badge={rec ? "Ready" : "Awaiting context"}>
      <Stack spacing={1.25}>
        <TextField
          multiline rows={3} size="small" fullWidth
          value={ctx}
          onChange={(e) => setCtx(e.target.value)}
          placeholder="Describe current ops context…"
          InputProps={{ sx: { fontSize: 13, bgcolor: "#F8F9FA" } }}
        />
        <Button
          size="small" variant="contained" onClick={ask} disabled={loading}
          startIcon={<Box className="material-symbols-sharp" sx={{ fontSize: 18 }}>auto_awesome</Box>}
        >
          {loading ? "Thinking…" : "Ask agent"}
        </Button>
        {loading && <LinearProgress sx={{ borderRadius: 1 }} />}
        {rec && (
          <Box sx={{
            p: 1.75,
            borderRadius: 1.5,
            bgcolor: "#E8F0FE",
            border: "1px solid #4285F440",
          }}>
            <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 0.75 }}>
              <Box sx={{
                width: 22, height: 22, borderRadius: 0.75, flexShrink: 0,
                background: "linear-gradient(135deg, #4285F4, #C58AF9)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Box className="material-symbols-sharp" sx={{ fontSize: 14, color: "#FFFFFF" }}>auto_awesome</Box>
              </Box>
              <Typography sx={{
                fontSize: 14, fontWeight: 500,
                fontFamily: '"Google Sans Display", sans-serif',
                color: "text.primary", lineHeight: 1.3,
              }}>
                {rec.title}
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5, mb: 1 }}>
              {rec.rationale}
            </Typography>
            <Stack spacing={0.5}>
              {rec.actions.map((a, i) => (
                <Stack key={i} direction="row" alignItems="flex-start" spacing={0.75}>
                  <Box sx={{ color: "primary.main", fontSize: 13, fontWeight: 600 }}>→</Box>
                  <Typography sx={{ fontSize: 12.5, color: "text.primary", lineHeight: 1.45 }}>{a}</Typography>
                </Stack>
              ))}
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{
              mt: 1.25, pt: 1, borderTop: "1px solid #4285F420",
            }}>
              <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 500 }}>
                Confidence
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 80, height: 6, bgcolor: "#FFFFFF", borderRadius: 3, overflow: "hidden" }}>
                  <Box sx={{
                    height: "100%",
                    width: `${Math.round(rec.confidence * 100)}%`,
                    bgcolor: "primary.main",
                  }} />
                </Box>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: "text.primary" }}>
                  {Math.round(rec.confidence * 100)}%
                </Typography>
              </Stack>
            </Stack>
          </Box>
        )}
      </Stack>
    </Drawer>
  );
}
