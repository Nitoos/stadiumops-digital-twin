"use client";
import { useStore } from "@/lib/store";

export function WeatherFront() {
  const w = useStore((s) => s.weather);
  if (!w || (w.storm_eta_min ?? 999) > 30) return null;
  const dist = (w.storm_eta_min ?? 30) * 0.8;
  return (
    <mesh position={[40 + dist, 12, 40 - dist]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[35, 32]} />
      <meshBasicMaterial color="#5B6CFF" transparent opacity={0.18} />
    </mesh>
  );
}
