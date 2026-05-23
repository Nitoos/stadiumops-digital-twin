"use client";
import { useStore } from "@/lib/store";

const COLOR: Record<string, string> = {
  responding: "#F29900",
  on_task: "#1A73E8",
  idle: "#5F6368",
};

export function DispatchedTeams() {
  const teams = useStore((s) => s.teams);
  return (
    <group>
      {teams.map((t) => {
        const color = COLOR[t.status] ?? "#5F6368";
        const isMoving = t.status === "responding";
        return (
          <group key={t.team_id} position={[t.position[0], 0, t.position[1]]}>
            {/* Vertical light beam */}
            <mesh position={[0, 8, 0]}>
              <cylinderGeometry args={[0.16, 0.16, 16, 8]} />
              <meshBasicMaterial color={color} transparent opacity={isMoving ? 0.6 : 0.4} />
            </mesh>
            {/* Glowing dot */}
            <mesh position={[0, 0.7, 0]} castShadow>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} />
            </mesh>
            {/* Halo ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
              <ringGeometry args={[1.8, 2.4, 32]} />
              <meshBasicMaterial color={color} transparent opacity={0.45} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
