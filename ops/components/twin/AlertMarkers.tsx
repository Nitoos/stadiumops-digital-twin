"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useStore } from "@/lib/store";

function centroid(poly: number[][]): [number, number] {
  const n = poly.length;
  const [sx, sy] = poly.reduce(([ax, ay], [px, py]) => [ax + px, ay + py], [0, 0]);
  return [sx / n, sy / n];
}

function PulsingPin({ x, z, color }: { x: number; z: number; color: string }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const s = 1 + Math.sin(t * 4) * 0.18;
    ref.current.scale.set(s, 1, s);
  });
  return (
    <group ref={ref} position={[x, 0, z]}>
      <mesh position={[0, 16, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 24, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, 28, 0]} castShadow>
        <sphereGeometry args={[1.4, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
        <ringGeometry args={[3.2, 4.0, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.65} />
      </mesh>
    </group>
  );
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
        const color = a.severity === "critical" ? "#D93025" : "#F29900";
        return <PulsingPin key={a.id} x={cx} z={cy} color={color} />;
      })}
    </group>
  );
}
