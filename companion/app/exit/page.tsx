"use client";
import { Box, Card, CardContent, Typography, Stack, Button, Chip, LinearProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";

const STAGGER_BY_SECTION: Record<string, number> = {
  stand_a: 0, stand_b: 6, stand_c: 12, stand_d: 18,
};

export default function ExitPage() {
  const plan = useStore((s) => s.plan);
  const section = plan?.section ?? "stand_b";
  const staggerMin = STAGGER_BY_SECTION[section] ?? 0;
  const [accepted, setAccepted] = useState(false);
  const [remaining, setRemaining] = useState(staggerMin * 60);

  useEffect(() => {
    if (!accepted) return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [accepted]);

  return (
    <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
      <Typography variant="h4">Exit & transit</Typography>
      {!accepted ? (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="overline">Stay {staggerMin} extra minutes</Typography>
            <Typography variant="h6" sx={{ my: 1 }}>Get a free drink + reserved metro slot</Typography>
            <Typography variant="body2" color="text.secondary">
              Your section is in wave {staggerMin === 0 ? "A (first)" : `at +${staggerMin}m`}.
              Leaving with your wave avoids platform crush.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button variant="contained" fullWidth onClick={() => setAccepted(true)}>Accept</Button>
              <Button variant="outlined" fullWidth>Leave now</Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="overline">Your reserved metro slot</Typography>
            <Typography variant="h3" sx={{ fontFamily: "Google Sans Display", my: 1 }}>
              {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
            </Typography>
            <LinearProgress variant="determinate" value={100 - (remaining / (staggerMin * 60 || 1)) * 100} />
            <Stack spacing={0.5} sx={{ mt: 2 }}>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Line</Typography><Chip size="small" label="Purple" /></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Platform</Typography><Chip size="small" label="2" /></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Carriage</Typography><Chip size="small" label="C" /></Stack>
            </Stack>
            {remaining === 0 && (
              <Typography variant="body1" sx={{ mt: 2, color: "success.main" }}>
                Time to move. Take the {plan?.assigned_gate?.toUpperCase()} exit.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
