"use client";
import { Stack, Typography, Box } from "@mui/material";
import { Drawer } from "@/components/ui/Drawer";
import { StatusDot } from "@/components/ui/StatusDot";
import { useStore } from "@/lib/store";

const TONE: Record<string, "critical" | "warning" | "idle"> = {
  critical: "critical",
  warning: "warning",
  info: "idle",
};

const COLORS: Record<string, string> = {
  critical: "#F28B82",
  warning: "#FDD663",
  info: "#9AA0A6",
};

export function AlertConsole() {
  const alerts = useStore((s) => s.alerts);
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const tone = criticalCount > 0 ? "critical" : alerts.length > 0 ? "warning" : "idle";

  return (
    <Drawer title="Alert Console" tone={tone} badge={alerts.length === 0 ? "ALL CLEAR" : `${alerts.length} ACTIVE`}>
      {alerts.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.disabled", fontSize: 12, py: 1 }}>
          No active alerts. Monitoring all zones.
        </Typography>
      ) : (
        <Stack spacing={0.75}>
          {alerts.slice(0, 6).map((a) => {
            const color = COLORS[a.severity];
            return (
              <Box key={a.id} sx={{
                p: 1,
                borderRadius: 1.25,
                bgcolor: "rgba(20,26,34,0.6)",
                borderLeft: `3px solid ${color}`,
                "&:hover": { bgcolor: "rgba(20,26,34,0.85)" },
              }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.25 }}>
                  <Stack direction="row" alignItems="center" spacing={0.6}>
                    <StatusDot tone={TONE[a.severity]} size={6} />
                    <Typography sx={{
                      fontSize: 10, letterSpacing: 1.1, fontWeight: 700,
                      color, textTransform: "uppercase",
                      fontFamily: "Roboto Mono, monospace",
                    }}>
                      {a.severity}
                    </Typography>
                  </Stack>
                  <Typography sx={{
                    fontSize: 10, letterSpacing: 0.5,
                    color: "text.disabled", fontFamily: "Roboto Mono, monospace",
                  }}>
                    {a.zone_id ?? "—"}
                  </Typography>
                </Stack>
                <Typography sx={{ fontSize: 12, color: "text.primary", lineHeight: 1.4 }}>
                  {a.reason}
                </Typography>
                {a.density_per_m2 !== undefined && (
                  <Typography sx={{
                    fontSize: 10, color: "text.secondary",
                    fontFamily: "Roboto Mono, monospace", letterSpacing: 0.3, mt: 0.25,
                  }}>
                    LOS <b style={{ color: "#F1F3F4" }}>{a.los}</b> · {a.density_per_m2.toFixed(2)} ppl/m²
                  </Typography>
                )}
              </Box>
            );
          })}
        </Stack>
      )}
    </Drawer>
  );
}
