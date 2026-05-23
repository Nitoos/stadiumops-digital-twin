"use client";
import { Html } from "@react-three/drei";
import { useStore } from "@/lib/store";

/**
 * In-scene labels for new users:
 *   - Pitch          (center, large)
 *   - 4 Stands       (above each tier roof)
 *   - 8 Gates        (at each gate position)
 *   - 4 Concourses   (on apron ring)
 *   - Food court     (on apron)
 */

function centroid(poly: number[][]): [number, number] {
  const n = poly.length;
  const [sx, sy] = poly.reduce(([ax, ay], [px, py]) => [ax + px, ay + py], [0, 0]);
  return [sx / n, sy / n];
}

/** Single label chip — Material Design 3 pill, anchored at a 3D position */
function Chip({
  position, text, sub, size = "md", tone = "default",
}: {
  position: [number, number, number];
  text: string;
  sub?: string;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "pitch" | "stand" | "gate" | "concourse" | "amenity";
}) {
  const styles: Record<string, { bg: string; color: string; border: string; pad: string; fs: number; weight: number }> = {
    default:   { bg: "#FFFFFF",       color: "#202124", border: "rgba(60,64,67,0.18)", pad: "4px 10px",  fs: 11,   weight: 500 },
    pitch:     { bg: "#1E8E3E",       color: "#FFFFFF", border: "rgba(0,0,0,0)",       pad: "6px 14px",  fs: 12,   weight: 600 },
    stand:     { bg: "#1A73E8",       color: "#FFFFFF", border: "rgba(0,0,0,0)",       pad: "5px 12px",  fs: 11.5, weight: 600 },
    gate:      { bg: "#FFFFFF",       color: "#1A73E8", border: "#1A73E840",           pad: "3px 8px",   fs: 10,   weight: 600 },
    concourse: { bg: "rgba(255,255,255,0.92)", color: "#5F6368", border: "rgba(60,64,67,0.15)", pad: "3px 9px", fs: 10, weight: 500 },
    amenity:   { bg: "#FEF7E0",       color: "#B26A00", border: "rgba(242,153,0,0.4)", pad: "3px 9px",   fs: 10,   weight: 500 },
  };
  const s = styles[tone];
  const sizeScale = size === "sm" ? 0.85 : size === "lg" ? 1.2 : 1;
  const distFactor = size === "sm" ? 90 : size === "lg" ? 160 : 120;

  return (
    <Html
      position={position}
      center
      distanceFactor={distFactor}
      style={{ pointerEvents: "none", userSelect: "none" }}
    >
      <div
        style={{
          fontFamily: '"Google Sans Text", "Roboto", sans-serif',
          fontSize: s.fs * sizeScale,
          fontWeight: s.weight,
          letterSpacing: 0.3,
          color: s.color,
          background: s.bg,
          border: `1px solid ${s.border}`,
          padding: s.pad,
          borderRadius: 999,
          boxShadow: "0 1px 2px rgba(60,64,67,0.18), 0 1px 3px rgba(60,64,67,0.08)",
          whiteSpace: "nowrap",
          textAlign: "center",
          lineHeight: 1.15,
        }}
      >
        {text}
        {sub && (
          <div style={{
            fontSize: (s.fs - 2) * sizeScale, fontWeight: 400,
            opacity: 0.85, marginTop: 1, letterSpacing: 0.2,
          }}>
            {sub}
          </div>
        )}
      </div>
    </Html>
  );
}

const STAND_LABELS: Record<string, { name: string; pos: [number, number, number] }> = {
  // Above each tier roof (y=18, tier roof is at y=13.5)
  stand_a: { name: "Stand A",  pos: [-2, 18, 40] },  // West stand actually — layout assigns stand_a to gates at x=-10 (gates 1, 2)
  stand_b: { name: "Stand B",  pos: [40, 18, 82] },  // North
  stand_c: { name: "Stand C",  pos: [82, 18, 40] },  // East
  stand_d: { name: "Stand D",  pos: [40, 18, -2] },  // South
};

const CONCOURSE_LABEL: Record<string, string> = {
  concourse_n: "Concourse · North",
  concourse_s: "Concourse · South",
  concourse_e: "Concourse · East",
  concourse_w: "Concourse · West",
  food_court:  "Food Court",
  restroom_n:  "Restroom N",
  restroom_s:  "Restroom S",
};

export function Labels() {
  const layout = useStore((s) => s.layout);
  if (!layout) return null;

  return (
    <group>
      {/* Pitch */}
      <Chip position={[40, 8, 40]} text="PITCH" tone="pitch" size="lg" />

      {/* Stands — labels float above the roof */}
      {Object.entries(STAND_LABELS).map(([id, { name, pos }]) => (
        <Chip key={id} position={pos} text={name} tone="stand" size="md" />
      ))}

      {/* Gates — at the gate position from layout, just above ground */}
      {layout.gates.map((g) => (
        <Chip
          key={g.id}
          position={[g.position[0], 2.6, g.position[1]]}
          text={g.name}
          tone="gate"
          size="sm"
        />
      ))}

      {/* Concourses, food court, restrooms — small chips on the apron */}
      {layout.zones
        .filter((z) => z.type !== "stand")
        .map((z) => {
          const [cx, cy] = centroid(z.polygon);
          const tone = z.type === "concession" || z.type === "restroom" ? "amenity" : "concourse";
          return (
            <Chip
              key={z.id}
              position={[cx, 1.2, cy]}
              text={CONCOURSE_LABEL[z.id] ?? z.name}
              tone={tone}
              size="sm"
            />
          );
        })}

      {/* Floodlight tags — tiny corner labels */}
      {[[2, 2], [78, 2], [2, 78], [78, 78]].map(([x, z], i) => (
        <Chip
          key={`fl-${i}`}
          position={[x, 40, z]}
          text="Floodlight"
          tone="default"
          size="sm"
        />
      ))}
    </group>
  );
}
