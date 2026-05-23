"use client";
import { Box, Slider, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useStore } from "@/lib/store";

export function TimeScrubber() {
  const scrubTs = useStore((s) => s.scrubTs);
  const setScrub = useStore((s) => s.setScrubTs);
  const [offset, setOffset] = useState(0);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 360 }}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>Replay</Typography>
      <Slider
        size="small" min={0} max={3600} step={10}
        value={offset}
        onChange={(_, v) => {
          const o = Array.isArray(v) ? v[0] : v;
          setOffset(o);
          setScrub(o === 0 ? null : Date.now() / 1000 - o);
        }}
        sx={{ flex: 1 }}
      />
      <Typography variant="caption" sx={{ fontFamily: "Roboto Mono" }}>
        {scrubTs === null ? "LIVE" : `-${Math.round(offset / 60)}m`}
      </Typography>
      <Button size="small" onClick={() => { setOffset(0); setScrub(null); }}>Live</Button>
    </Box>
  );
}
