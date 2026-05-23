"use client";
import { Box, Card, CardContent, Typography, Stack, Chip, Button } from "@mui/material";

const RESTROOMS = [
  { id: "restroom_n", name: "Restroom North", wait_now: 3, wait_break: 14 },
  { id: "restroom_s", name: "Restroom South", wait_now: 1, wait_break: 12 },
];
const FOOD = [
  { id: "food_court", name: "Food Court", wait_now: 5, wait_break: 22 },
];

export default function SeatPage() {
  return (
    <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
      <Typography variant="h4">In-seat copilot</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
        Best window to break — avoid the rush at the innings break.
      </Typography>
      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Typography variant="overline">Restrooms</Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {RESTROOMS.map((r) => (
                <Stack key={r.id} direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2">{r.name}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" color="success" label={`Now ${r.wait_now}m`} />
                    <Chip size="small" color="warning" label={`At break ${r.wait_break}m`} />
                  </Stack>
                </Stack>
              ))}
            </Stack>
            <Button size="small" variant="outlined" sx={{ mt: 1 }}>Reserve now slot</Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="overline">Food</Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {FOOD.map((f) => (
                <Stack key={f.id} direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2">{f.name}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" color="success" label={`Order-ahead`} />
                    <Chip size="small" color="warning" label={`Pickup ${f.wait_now}m`} />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
