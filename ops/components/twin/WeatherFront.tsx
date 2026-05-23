"use client";
import { useStore } from "@/lib/store";

export function WeatherFront() {
  const w = useStore((s) => s.weather);
  if (!w || (w.storm_eta_min ?? 999) > 30) return null;
  const eta = w.storm_eta_min ?? 30;
  const dist = eta * 1.6; // closer with shorter ETA
  return (
    <group position={[40 + dist, 0, 40 - dist]}>
      {/* Cloud-disc shadow on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
        <circleGeometry args={[40, 48]} />
        <meshBasicMaterial color="#1B2030" transparent opacity={0.55} />
      </mesh>
      {/* Storm cloud (floating disc) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 30, 0]}>
        <circleGeometry args={[30, 48]} />
        <meshBasicMaterial color="#5B6CFF" transparent opacity={0.22} />
      </mesh>
      {/* Inner brighter core */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 30.1, 0]}>
        <circleGeometry args={[18, 48]} />
        <meshBasicMaterial color="#8AB4F8" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}
