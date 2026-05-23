"use client";
import { Box, Slider, Button, Typography, Stack } from "@mui/material";
import { useState } from "react";
import { useStore } from "@/lib/store";

export function TimeScrubber() {
  const scrubTs = useStore((s) => s.scrubTs);
  const setScrub = useStore((s) => s.setScrubTs);
  const [offset, setOffset] = useState(0);
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 360 }}>
      <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.4 }}>
        Replay
      </Typography>
      <Slider
        size="small" min={0} max={3600} step={10}
        value={offset}
        onChange={(_, v) => {
          const o = Array.isArray(v) ? v[0] : v;
          setOffset(o);
          setScrub(o === 0 ? null : Date.now() / 1000 - o);
        }}
        sx={{ flex: 1, color: "primary.main" }}
      />
      <Typography sx={{
        fontSize: 12, fontWeight: 500, color: "text.primary", minWidth: 48, textAlign: "right",
      }}>
        {scrubTs === null ? "LIVE" : `-${Math.round(offset / 60)}m`}
      </Typography>
      <Button size="small" onClick={() => { setOffset(0); setScrub(null); }}>Live</Button>
    </Stack>
  );
}
