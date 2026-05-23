"use client";
import { Box, Card, CardContent, Typography, LinearProgress, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export default function QueuePage() {
  const plan = useStore((s) => s.plan);
  const [pos, setPos] = useState(34);
  const [eta, setEta] = useState(7);
  useEffect(() => {
    const id = setInterval(() => {
      setPos((p) => Math.max(0, p - 2));
      setEta((e) => Math.max(0, +(e - 0.5).toFixed(1)));
    }, 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
      <Typography variant="h4">Smart queue</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
        {plan?.assigned_gate?.replace("_", " ").toUpperCase()} · {plan?.lane.replace("_", " ")}
      </Typography>
      <Card>
        <CardContent>
          <Stack alignItems="center" spacing={1}>
            <Typography variant="overline" color="text.secondary">Position in queue</Typography>
            <Typography variant="h2" sx={{ fontFamily: "Google Sans Display" }}>{pos}</Typography>
            <LinearProgress sx={{ width: "100%", height: 8, borderRadius: 4 }}
              variant="determinate" value={100 - pos * 2.5} />
            <Typography variant="body2" sx={{ mt: 1 }}>ETA to enter: {eta} min</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
