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
    <Drawer title="AI Agent · Gemini 2.0" tone={rec ? "live" : "idle"} badge={rec ? "READY" : "AWAITING CTX"}>
      <Stack spacing={1}>
        <TextField
          multiline rows={2} size="small"
          value={ctx}
          onChange={(e) => setCtx(e.target.value)}
          InputProps={{
            sx: {
              fontSize: 12, fontFamily: "Roboto Mono, monospace",
              bgcolor: "rgba(10,13,18,0.6)",
            },
          }}
        />
        <Button
          size="small" variant="contained" onClick={ask} disabled={loading}
          sx={{
            py: 0.75,
            background: "linear-gradient(135deg, #8AB4F8, #C58AF9)",
            color: "#0B1220",
            "&:hover": {
              background: "linear-gradient(135deg, #AECBFA, #D7B3FB)",
              boxShadow: "0 0 16px rgba(138,180,248,0.5)",
            },
          }}
        >
          {loading ? "Thinking…" : "Ask Agent"}
        </Button>
        {loading && <LinearProgress sx={{ borderRadius: 1 }} />}
        {rec && (
          <Box sx={{
            p: 1.25,
            borderRadius: 1.25,
            bgcolor: "rgba(138,180,248,0.06)",
            border: "1px solid rgba(138,180,248,0.25)",
            position: "relative",
          }}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
              <Box sx={{
                width: 18, height: 18, borderRadius: 0.75,
                background: "linear-gradient(135deg, #8AB4F8, #C58AF9)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Box className="material-symbols-sharp" sx={{ fontSize: 12, color: "#0B1220" }}>auto_awesome</Box>
              </Box>
              <Typography sx={{
                fontSize: 13, fontWeight: 600,
                fontFamily: '"Google Sans Display", sans-serif',
                color: "text.primary",
              }}>
                {rec.title}
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.5, mb: 0.75 }}>
              {rec.rationale}
            </Typography>
            <Stack spacing={0.25}>
              {rec.actions.map((a, i) => (
                <Typography key={i} sx={{ fontSize: 11.5, color: "text.primary" }}>
                  <Box component="span" sx={{ color: "primary.main", fontFamily: "Roboto Mono, monospace", mr: 0.5 }}>
                    →
                  </Box>
                  {a}
                </Typography>
              ))}
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1, pt: 0.75, borderTop: "1px solid rgba(138,180,248,0.15)" }}>
              <Typography sx={{
                fontSize: 9, letterSpacing: 1.2, fontWeight: 700,
                color: "text.disabled", fontFamily: "Roboto Mono, monospace",
              }}>
                CONFIDENCE
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box sx={{ width: 60, height: 4, bgcolor: "rgba(138,180,248,0.15)", borderRadius: 2, overflow: "hidden" }}>
                  <Box sx={{
                    height: "100%",
                    width: `${Math.round(rec.confidence * 100)}%`,
                    background: "linear-gradient(90deg, #8AB4F8, #C58AF9)",
                  }} />
                </Box>
                <Typography sx={{
                  fontSize: 11, fontWeight: 600,
                  fontFamily: "Roboto Mono, monospace", color: "text.primary",
                }}>
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
