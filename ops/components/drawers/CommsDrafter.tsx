"use client";
import { Stack, Typography, TextField, Button, Chip, Box } from "@mui/material";
import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { api } from "@/lib/api";

const STAND_OPTIONS = ["stand_a", "stand_b", "stand_c", "stand_d"];
const CHANNELS = ["push", "sms", "signage", "pa", "jumbotron"];

export function CommsDrafter() {
  const [title, setTitle] = useState("Move calmly via West Concourse");
  const [body, setBody] = useState("Take the West Concourse, 3-minute walk, calm pace. Route is safe.");
  const [sections, setSections] = useState<string[]>(["stand_b", "stand_c"]);
  const [channels, setChannels] = useState<string[]>(["push", "sms"]);
  const [stagger, setStagger] = useState(90);
  const [sentId, setSentId] = useState<string | null>(null);

  function toggle(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  async function send() {
    const r: any = await api.broadcast({
      title, body, sections, channels, stagger_sec: stagger, operator: "ops.commander.demo",
    });
    setSentId(r.broadcast_id);
  }

  return (
    <Drawer title="Comms drafter" tone="idle">
      <Stack spacing={1.25}>
        <TextField
          size="small" label="Title" fullWidth
          value={title} onChange={(e) => setTitle(e.target.value)}
          InputProps={{ sx: { fontSize: 13 } }}
        />
        <TextField
          size="small" label="Body" multiline rows={2} fullWidth
          value={body} onChange={(e) => setBody(e.target.value)}
          InputProps={{ sx: { fontSize: 13 } }}
        />
        <Box>
          <Typography sx={{
            fontSize: 11, color: "text.secondary", mb: 0.5,
            letterSpacing: 0.3, textTransform: "uppercase", fontWeight: 500,
          }}>
            Sections · sub-group stagger
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
            {STAND_OPTIONS.map((s) => (
              <Chip key={s} size="small" label={s.replace("_", " ").toUpperCase()} clickable
                color={sections.includes(s) ? "primary" : "default"}
                variant={sections.includes(s) ? "filled" : "outlined"}
                onClick={() => toggle(sections, setSections, s)} />
            ))}
          </Stack>
        </Box>
        <Box>
          <Typography sx={{
            fontSize: 11, color: "text.secondary", mb: 0.5,
            letterSpacing: 0.3, textTransform: "uppercase", fontWeight: 500,
          }}>
            Channels
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
            {CHANNELS.map((c) => (
              <Chip key={c} size="small" label={c} clickable
                color={channels.includes(c) ? "secondary" : "default"}
                variant={channels.includes(c) ? "filled" : "outlined"}
                onClick={() => toggle(channels, setChannels, c)} />
            ))}
          </Stack>
        </Box>
        <TextField
          size="small" type="number" label="Sub-group stagger (sec)"
          value={stagger} onChange={(e) => setStagger(Number(e.target.value))}
          InputProps={{ sx: { fontSize: 13 } }}
        />
        <Button size="small" variant="contained" color="secondary" onClick={send}
          startIcon={<Box className="material-symbols-sharp" sx={{ fontSize: 18 }}>send</Box>}
        >
          Approve & broadcast
        </Button>
        {sentId && (
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{
            p: 1, bgcolor: "#E6F4EA", borderRadius: 1,
          }}>
            <Box className="material-symbols-sharp" sx={{ fontSize: 16, color: "#1E8E3E" }}>check_circle</Box>
            <Typography sx={{ fontSize: 12, color: "#137333" }}>
              Broadcast {sentId.slice(0, 8)} sent
            </Typography>
          </Stack>
        )}
      </Stack>
    </Drawer>
  );
}
