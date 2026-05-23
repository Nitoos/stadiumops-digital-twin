"use client";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Stack, Box } from "@mui/material";
import { useState } from "react";
import { api } from "@/lib/api";

export function WhatIfButton() {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);

  async function runScenario() {
    setRunning(true);
    try {
      await api.agentAsk(
        "What-if scenario: close Gate 4 and open Gate 6, reroute Section B " +
        "via West Concourse. Project density curve impact at +10 min."
      );
    } finally { setRunning(false); }
  }

  return (
    <>
      <Button
        size="small" variant="outlined"
        onClick={() => setOpen(true)}
        startIcon={<Box className="material-symbols-sharp" sx={{ fontSize: 18 }}>fork_right</Box>}
      >
        What-if branch
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontFamily: '"Google Sans Display", sans-serif', fontWeight: 500 }}>
          What-if scenario
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography variant="body2">
              Branch the live state and project an alternative. Phase 0 uses the AI agent
              to forecast the impact; Phase 1 runs a sandbox sim on Pub/Sub.
            </Typography>
            <Box sx={{ p: 2, bgcolor: "#F8F9FA", borderRadius: 2 }}>
              <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mb: 0.5 }}>
                Default scenario
              </Typography>
              <Typography variant="body2">
                Close Gate 4 → open Gate 6 → reroute Section B via West Concourse.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={runScenario} disabled={running} variant="contained">
            {running ? "Running…" : "Run scenario"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
