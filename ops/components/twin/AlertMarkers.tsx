"use client";
import { useStore } from "@/lib/store";

function centroid(poly: number[][]): [number, number] {
  const n = poly.length;
  const [sx, sy] = poly.reduce(([ax, ay], [px, py]) => [ax + px, ay + py], [0, 0]);
  return [sx / n, sy / n];
}

export function AlertMarkers() {
  const alerts = useStore((s) => s.alerts);
  const layout = useStore((s) => s.layout);
  if (!layout) return null;
  return (
    <group>
      {alerts.slice(0, 6).map((a) => {
        const z = layout.zones.find((zz) => zz.id === a.zone_id);
        if (!z) return null;
        const [cx, cy] = centroid(z.polygon);
        return (
          <mesh key={a.id} position={[cx, 10, cy]}>
            <coneGeometry args={[1.8, 4, 4]} />
            <meshStandardMaterial color={a.severity === "critical" ? "#F28B82" : "#FDD663"} />
          </mesh>
        );
      })}
    </group>
  );
}
