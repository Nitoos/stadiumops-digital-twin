"use client";
import { Box, Card, CardContent, Typography, Stack, Button, Chip, TextField } from "@mui/material";
import { useState } from "react";
import { useStore } from "@/lib/store";

const MEMBERS = [
  { name: "Aarav", age: 7, status: "with you" },
  { name: "Diya", age: 11, status: "with you" },
];

export default function ReunifyPage() {
  const plan = useStore((s) => s.plan);
  const [missingName, setMissingName] = useState("");
  const [reported, setReported] = useState(false);

  if (plan?.persona !== "family") {
    return (
      <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
        <Typography variant="h4">Reunification</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Family mode unlocks reunification, group tracking, and child-safety routing.
          Re-onboard as a family persona to demo this.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
      <Typography variant="h4">Family</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
        Your group of {MEMBERS.length}.
      </Typography>
      <Stack spacing={1}>
        {MEMBERS.map((m) => (
          <Card key={m.name} variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle1">{m.name}</Typography>
                  <Typography variant="caption" color="text.secondary">Age {m.age}</Typography>
                </Box>
                <Chip size="small" color="success" label={m.status} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Typography variant="overline">Report missing</Typography>
        {!reported ? (
          <Stack spacing={1} sx={{ mt: 1 }}>
            <TextField size="small" label="Who?" value={missingName} onChange={(e) => setMissingName(e.target.value)} />
            <Button variant="contained" color="warning" disabled={!missingName} onClick={() => setReported(true)}>
              Report missing
            </Button>
          </Stack>
        ) : (
          <Card sx={{ mt: 1, bgcolor: "#FFF8E1" }}>
            <CardContent>
              <Typography variant="body1">
                {missingName} reported missing. All staff radios + the command center have been notified.
                Stay where you are — meet at <strong>Lost &amp; Found Point 3 (Concourse East)</strong>.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
