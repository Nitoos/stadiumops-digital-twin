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
    const m = new Map<string, string>();
    for (const z of density?.zones ?? []) {
      const los = horizon === 0 ? z.los : horizon === 5 ? z.los_forecast_5m : horizon === 10 ? z.los_forecast_10m : z.los_forecast_15m;
      m.set(z.zone_id, LOS_COLOR[los] ?? "#444");
    }
    return m;
  }, [density, horizon]);

  if (!layout) return null;

  return (
    <group>
      {layout.zones.map((z) => {
        const shape = polyToShape(z.polygon);
        const geom = new THREE.ShapeGeometry(shape);
        const color = zoneStates.get(z.id) ?? "#333";
        return (
          <mesh key={z.id} geometry={geom} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <meshStandardMaterial color={color} transparent opacity={horizon === 0 ? 0.7 : 0.45} />
          </mesh>
        );
      })}
    </group>
  );
}
