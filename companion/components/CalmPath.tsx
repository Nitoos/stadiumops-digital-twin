"use client";
import { Box, Card, CardContent, Typography, Button, LinearProgress } from "@mui/material";
import { useEffect, useState } from "react";

export function CalmPath({ section, waveSec, route, body }: {
  section: string; waveSec: number; route: string; body: string;
}) {
  const [secsToWave, setSecsToWave] = useState(waveSec);
  useEffect(() => {
    if (secsToWave <= 0) return;
    const id = setInterval(() => setSecsToWave((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [secsToWave]);

  useEffect(() => {
    if (secsToWave === 0 && typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([150, 100, 150]);
    }
  }, [secsToWave]);

  useEffect(() => {
    if (secsToWave === 0 && typeof window !== "undefined" && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(body);
      u.rate = 0.95;
      u.pitch = 0.9;
      window.speechSynthesis.speak(u);
    }
  }, [secsToWave, body]);

  if (secsToWave > 0) {
    return (
      <Card sx={{ borderColor: "warning.main", borderWidth: 2, bgcolor: "#FFF8E1" }} variant="outlined">
        <CardContent>
          <Typography variant="overline" color="warning.main">Holding — your wave in {secsToWave}s</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            For everyone&apos;s safety, sections are guided one at a time. Please remain in your seat.
          </Typography>
          <LinearProgress sx={{ mt: 1 }} variant="determinate" value={100 - (secsToWave / waveSec) * 100} />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card sx={{ borderColor: "primary.main", borderWidth: 2, bgcolor: "#E8F0FE" }} variant="outlined">
      <CardContent>
        <Typography variant="overline" color="primary.main">Calm-path — Section {section}</Typography>
        <Typography variant="h6" sx={{ my: 1 }}>{body}</Typography>
        <Box sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">Route</Typography>
          <Typography variant="body1" sx={{ fontFamily: "Google Sans Display" }}>{route}</Typography>
        </Box>
        <Button sx={{ mt: 2 }} variant="contained" fullWidth>I&apos;m moving</Button>
      </CardContent>
    </Card>
  );
}
