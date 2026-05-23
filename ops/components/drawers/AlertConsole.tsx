"use client";
import { Stack, Typography, Chip, Box } from "@mui/material";
import { Drawer } from "@/components/ui/Drawer";
import { useStore } from "@/lib/store";

const COLORS: Record<string, "error" | "warning" | "info"> = {
  critical: "error", warning: "warning", info: "info",
};

export function AlertConsole() {
  const alerts = useStore((s) => s.alerts);
  return (
    <Drawer title="Alert console">
      {alerts.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No active alerts.</Typography>
      ) : (
        <Stack spacing={1}>
          {alerts.slice(0, 6).map((a) => (
            <Box key={a.id} sx={{ p: 1, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Chip size="small" color={COLORS[a.severity] ?? "default"} label={a.severity.toUpperCase()} />
                <Typography variant="caption" sx={{ fontFamily: "Roboto Mono", color: "text.secondary" }}>
                  {a.zone_id ?? "—"}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{a.reason}</Typography>
              {a.density_per_m2 !== undefined && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  LOS {a.los} · {a.density_per_m2.toFixed(2)} ppl/m²
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Drawer>
  );
}
