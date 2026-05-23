"use client";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useState } from "react";
import { CalmPath } from "@/components/CalmPath";
import { useStore } from "@/lib/store";

const WAVE: Record<string, number> = {
  stand_a: 0, stand_b: 90, stand_c: 180, stand_d: 270,
};

export default function AlertPage() {
  const plan = useStore((s) => s.plan);
  const [scenario, setScenario] = useState<"crush" | "storm" | null>(null);

  const section = plan?.section ?? "stand_b";
  const wave = WAVE[section] ?? 0;

  if (!scenario) {
    return (
      <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
        <Typography variant="h4">Crisis demo</Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
          Pick a scenario. The wave assigned to your section is {wave}s.
          (Sections are staggered to avoid simultaneous mass movement.)
        </Typography>
        <Stack spacing={1}>
          <Button variant="outlined" color="error" onClick={() => setScenario("crush")}>
            Crowd surge at Concourse North
          </Button>
          <Button variant="outlined" color="warning" onClick={() => setScenario("storm")}>
            Storm cell inbound (12 min)
          </Button>
        </Stack>
      </Box>
    );
  }

  const body = scenario === "crush"
    ? "Move calmly with the people around you. Route is safe. You will be outside in 4 minutes."
    : "Move calmly to the covered concourse. Storm expected in 12 minutes. The route is safe.";
  const route = scenario === "crush"
    ? "Take the West Concourse, 3-minute walk."
    : "Take the South Concourse exit — covered, 2-minute walk.";

  return (
    <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Alert</Typography>
      <CalmPath section={section} waveSec={wave} route={route} body={body} />
      <Button sx={{ mt: 2 }} fullWidth onClick={() => setScenario(null)}>Reset demo</Button>
    </Box>
  );
}
