"use client";
import { Box, Card, CardContent, Typography, Stack, Chip, LinearProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";

export default function GatesPage() {
  const plan = useStore((s) => s.plan);
  const { data: gates, isLoading } = useQuery({
    queryKey: ["gates"], queryFn: api.gates, refetchInterval: 5000,
  });
  if (isLoading || !gates) return <LinearProgress />;
  const sorted = [...gates].sort((a, b) => a.wait_min - b.wait_min);
  return (
    <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
      <Typography variant="h4">Pick a gate</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
        Live wait times. Your assigned gate is {plan?.assigned_gate ?? "—"}.
      </Typography>
      <Stack spacing={1}>
        {sorted.map((g) => (
          <Card key={g.gate_id} variant="outlined"
            sx={{ borderColor: g.gate_id === plan?.assigned_gate ? "primary.main" : "divider", borderWidth: g.gate_id === plan?.assigned_gate ? 2 : 1 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle1">{g.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{g.status}</Typography>
                </Box>
                <Chip color={g.wait_min < 5 ? "success" : g.wait_min < 12 ? "warning" : "error"}
                  label={`${g.wait_min.toFixed(0)} min wait`} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
