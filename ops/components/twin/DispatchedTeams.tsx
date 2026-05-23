"use client";
import { useStore } from "@/lib/store";

export function DispatchedTeams() {
  const teams = useStore((s) => s.teams);
  return (
    <group>
      {teams.map((t) => {
        const color = t.status === "responding" ? "#F9AB00" : t.status === "on_task" ? "#8AB4F8" : "#9AA0A6";
        return (
          <mesh key={t.team_id} position={[t.position[0], 2, t.position[1]]}>
            <sphereGeometry args={[1.2, 12, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}
