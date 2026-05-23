import type { Layout } from "./types";

/**
 * Resolve a zone_id (e.g. "concourse_n") to a human-readable name
 * (e.g. "Concourse North") using the loaded stadium layout.
 * Falls back to a prettified version of the id when layout is missing.
 */
export function zoneName(zoneId: string | undefined | null, layout: Layout | null): string {
  if (!zoneId) return "Unknown zone";
  const z = layout?.zones.find((zz) => zz.id === zoneId);
  if (z?.name) return z.name;
  // Fallback: "concourse_n" → "Concourse N"
  return zoneId
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
