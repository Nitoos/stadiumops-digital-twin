"use client";
import { useStore } from "@/lib/store";

export function WeatherFront() {
  const w = useStore((s) => s.weather);
  if (!w || (w.storm_eta_min ?? 999) > 30) return null;
  const eta = w.storm_eta_min ?? 30;
  const dist = eta * 1.6;
  return (
    <group position={[40 + dist, 0, 40 - dist]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
        <circleGeometry args={[40, 48]} />
        <meshBasicMaterial color="#5F6368" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 30, 0]}>
        <circleGeometry args={[30, 48]} />
        <meshBasicMaterial color="#9AA0A6" transparent opacity={0.45} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 30.1, 0]}>
        <circleGeometry args={[18, 48]} />
        <meshBasicMaterial color="#BDC1C6" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}
