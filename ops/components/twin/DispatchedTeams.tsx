"use client";
import { useStore } from "@/lib/store";

const COLOR: Record<string, string> = {
  responding: "#F9AB00",
  on_task: "#8AB4F8",
  idle: "#9AA0A6",
};

export function DispatchedTeams() {
  const teams = useStore((s) => s.teams);
  return (
    <group>
      {teams.map((t) => {
        const color = COLOR[t.status] ?? "#9AA0A6";
        const isMoving = t.status === "responding";
        return (
          <group key={t.team_id} position={[t.position[0], 0, t.position[1]]}>
            {/* Vertical light beam */}
            <mesh position={[0, 8, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 16, 8]} />
              <meshBasicMaterial color={color} transparent opacity={isMoving ? 0.55 : 0.3} />
            </mesh>
            {/* Glowing dot at base */}
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[1.1, 16, 16]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
            </mesh>
            {/* Halo */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
              <ringGeometry args={[1.6, 2.2, 24]} />
              <meshBasicMaterial color={color} transparent opacity={0.35} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
