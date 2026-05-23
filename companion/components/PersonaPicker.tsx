"use client";
import { Box, Card, CardActionArea, CardContent, Stack, Typography, Button, MenuItem, TextField } from "@mui/material";
import { useState } from "react";
import { PERSONAS } from "@/lib/persona";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { Persona } from "@/lib/types";

const SECTIONS = ["stand_a", "stand_b", "stand_c", "stand_d"];
const TRANSITS = ["metro_mg_road", "metro_cubbon_park", "parking_north"];

export function PersonaPicker({ onDone }: { onDone: () => void }) {
  const [persona, setPersona] = useState<Persona>("standard");
  const [section, setSection] = useState("stand_b");
  const [transit, setTransit] = useState("metro_mg_road");
  const setFanId = useStore((s) => s.setFanId);
  const setPlan = useStore((s) => s.setPlan);

  async function start() {
    const fan_id = "fan_" + Math.random().toString(36).slice(2, 8);
    setFanId(fan_id);
    const plan = await api.checkin(fan_id, persona, section, transit);
    setPlan(plan);
    onDone();
  }

  return (
    <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
      <Typography variant="h4">MatchDay Companion</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
        Tell us a bit about you. We&apos;ll personalize your matchday.
      </Typography>

      <Typography variant="overline">Who are you?</Typography>
      <Stack spacing={1} sx={{ mb: 3 }}>
        {PERSONAS.map((p) => (
          <Card key={p.id} variant="outlined"
            sx={{ borderColor: persona === p.id ? "primary.main" : "divider", borderWidth: persona === p.id ? 2 : 1 }}>
            <CardActionArea onClick={() => setPersona(p.id)}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box className="material-symbols-rounded" sx={{ fontSize: 32, color: "primary.main" }}>{p.icon}</Box>
                  <Box>
                    <Typography variant="subtitle1">{p.label}</Typography>
                    <Typography variant="body2" color="text.secondary">{p.description}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>

      <Stack spacing={2}>
        <TextField select label="Your section" value={section} onChange={(e) => setSection(e.target.value)} fullWidth>
          {SECTIONS.map((s) => <MenuItem key={s} value={s}>{s.replace("_", " ").toUpperCase()}</MenuItem>)}
        </TextField>
        <TextField select label="Getting to the ground via" value={transit} onChange={(e) => setTransit(e.target.value)} fullWidth>
          {TRANSITS.map((t) => <MenuItem key={t} value={t}>{t.replace(/_/g, " ")}</MenuItem>)}
        </TextField>
        <Button variant="contained" size="large" onClick={start}>Get my plan</Button>
      </Stack>
    </Box>
  );
}
