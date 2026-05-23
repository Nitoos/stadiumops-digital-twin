"use client";
import { Stack, Typography, Box } from "@mui/material";
import { Drawer } from "@/components/ui/Drawer";
import { useStore } from "@/lib/store";

const STYLES: Record<string, { bg: string; border: string; color: string; label: string }> = {
  critical: { bg: "#FCE8E6", border: "#D93025", color: "#B31412", label: "Critical" },
  warning:  { bg: "#FEF7E0", border: "#F29900", color: "#B26A00", label: "Warning" },
  info:     { bg: "#E8F0FE", border: "#1A73E8", color: "#1557B0", label: "Info" },
};

export function AlertConsole() {
  const alerts = useStore((s) => s.alerts);
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const tone = criticalCount > 0 ? "critical" : alerts.length > 0 ? "warning" : "idle";

  return (
    <Drawer title="Alert console" tone={tone} badge={alerts.length === 0 ? "All clear" : `${alerts.length} active`}>
      {alerts.length === 0 ? (
        <Box sx={{ py: 3, textAlign: "center" }}>
          <Box className="material-symbols-sharp" sx={{ fontSize: 32, color: "text.disabled" }}>check_circle</Box>
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
            All zones nominal. Monitoring live.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {alerts.slice(0, 6).map((a) => {
            const s = STYLES[a.severity] ?? STYLES.info;
            return (
              <Box key={a.id} sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: s.bg,
                borderLeft: `3px solid ${s.border}`,
              }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography sx={{
                    fontSize: 11, fontWeight: 500, letterSpacing: 0.3,
                    color: s.color, textTransform: "uppercase",
                  }}>
                    {s.label}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 500 }}>
                    {a.zone_id ?? "—"}
                  </Typography>
                </Stack>
                <Typography sx={{ fontSize: 13, color: "text.primary", lineHeight: 1.45 }}>
                  {a.reason}
                </Typography>
                {a.density_per_m2 !== undefined && (
                  <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.5 }}>
                    LOS <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>{a.los}</Box> · {a.density_per_m2.toFixed(2)} ppl/m²
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
