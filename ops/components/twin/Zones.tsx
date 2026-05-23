"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { useStore } from "@/lib/store";
import { LOS_COLOR } from "@/components/ui/DensityLegend";

function polyToShape(polygon: number[][]): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(polygon[0][0], polygon[0][1]);
  for (let i = 1; i < polygon.length; i++) shape.lineTo(polygon[i][0], polygon[i][1]);
  shape.closePath();
  return shape;
}

export function Zones() {
  const layout = useStore((s) => s.layout);
  const density = useStore((s) => s.density);
  const horizon = useStore((s) => s.forecastHorizon);

  const zoneStates = useMemo(() => {
    const m = new Map<string, { color: string; los: string; density: number }>();
    for (const z of density?.zones ?? []) {
      const los = horizon === 0 ? z.los : horizon === 5 ? z.los_forecast_5m : horizon === 10 ? z.los_forecast_10m : z.los_forecast_15m;
      m.set(z.zone_id, { color: LOS_COLOR[los] ?? "#9AA0A6", los, density: z.density_per_m2 });
    }
    return m;
  }, [density, horizon]);

  if (!layout) return null;

  return (
    <group>
      {layout.zones.map((z) => {
        const shape = polyToShape(z.polygon);
        const geom = new THREE.ShapeGeometry(shape);
        const state = zoneStates.get(z.id);
        const color = state?.color ?? "#BDC1C6";

        const isStand = z.type === "stand";
        const yBase = isStand ? 14.1 : 0.12;
        const opacity = horizon === 0 ? (isStand ? 0.7 : 0.55) : 0.42;
        const isCritical = state?.los === "F" || state?.los === "E";

        return (
          <group key={z.id}>
            <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]} position={[0, yBase, 0]}>
              <meshBasicMaterial color={color} transparent opacity={opacity} />
            </mesh>
            {isStand && isCritical && (
              <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]} position={[0, yBase + 0.4, 0]}>
                <meshBasicMaterial color={color} transparent opacity={0.55} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
