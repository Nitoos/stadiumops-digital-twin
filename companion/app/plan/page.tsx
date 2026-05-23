"use client";
import { Box, Card, CardContent, Typography, Stack, Button, Chip } from "@mui/material";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function PlanPage() {
  const plan = useStore((s) => s.plan);
  if (!plan) return <Box sx={{ p: 3 }}><Typography>No plan. Go back and set persona.</Typography></Box>;

  const leaveBy = `${Math.max(0, plan.arrive_by_min)} min before match`;
  return (
    <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
      <Typography variant="h4">Your plan</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
        Personalized for {plan.persona.replace("_", " ")}. Section {plan.section.replace("_", " ").toUpperCase()}.
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Leave home</Typography>
          <Typography variant="h5">{leaveBy}</Typography>
          <Typography variant="body2" color="text.secondary">
            Arrival staggered by your section to avoid surges.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Your gate</Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5">{plan.assigned_gate.replace("_", " ").toUpperCase()}</Typography>
            <Chip size="small" label={plan.lane.replace("_", " ")} color="primary" />
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Get here via</Typography>
          <Typography variant="h6">{plan.transit.replace(/_/g, " ")}</Typography>
        </CardContent>
      </Card>

      <Stack spacing={1}>
        <Button variant="outlined" component={Link} href="/gates">Live gate picker</Button>
        <Button variant="outlined" component={Link} href="/queue">Smart queue</Button>
        <Button variant="outlined" component={Link} href="/seat">In-seat copilot</Button>
        <Button variant="outlined" color="warning" component={Link} href="/alert">Demo: crisis push</Button>
        <Button variant="outlined" component={Link} href="/exit">Exit & transit</Button>
        <Button variant="outlined" component={Link} href="/reunify">Reunification</Button>
      </Stack>
    </Box>
  );
}
