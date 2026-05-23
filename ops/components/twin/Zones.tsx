"use client";
import { useMemo, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useStore } from "@/lib/store";
import { LOS_COLOR } from "@/components/ui/DensityLegend";

/**
 * Build a Three.Shape from a layout polygon (XY in layout coords).
 *
 * We later rotate the mesh `-π/2` around X so it lies flat on the ground.
 * That rotation maps shape-Y → world -Z, so layout Y = 75 would land at
 * world Z = -75 (mirrored across the bowl). To get layout Y → world +Z,
 * we negate Y when building the shape AND reverse the vertex order so the
 * triangulated face normal still points up.
 */
function polyToShape(polygon: number[][]): THREE.Shape {
  const shape = new THREE.Shape();
  const pts = [...polygon].reverse(); // preserve face winding after Y negation
  shape.moveTo(pts[0][0], -pts[0][1]);
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], -pts[i][1]);
  shape.closePath();
  return shape;
}

function centroid(poly: number[][]): [number, number] {
  const n = poly.length;
  const [sx, sy] = poly.reduce(([ax, ay], [px, py]) => [ax + px, ay + py], [0, 0]);
  return [sx / n, sy / n];
}

const TYPE_LABEL: Record<string, string> = {
  stand: "Seating stand",
  concourse: "Concourse",
  concession: "Concessions / food court",
  restroom: "Restroom",
};

const LOS_LABEL: Record<string, string> = {
  A: "Free flow",
  B: "Minor crowding",
  C: "Reduced speed",
  D: "Restricted",
  E: "Severe",
  F: "Critical · crush risk",
};

export function Zones() {
  const layout = useStore((s) => s.layout);
  const density = useStore((s) => s.density);
  const horizon = useStore((s) => s.forecastHorizon);
  const [hovered, setHovered] = useState<string | null>(null);

  const zoneStates = useMemo(() => {
    const m = new Map<string, { color: string; los: string; density: number; occupancy: number }>();
    for (const z of density?.zones ?? []) {
      const los = horizon === 0 ? z.los : horizon === 5 ? z.los_forecast_5m : horizon === 10 ? z.los_forecast_10m : z.los_forecast_15m;
      m.set(z.zone_id, {
        color: LOS_COLOR[los] ?? "#9AA0A6",
        los,
        density: z.density_per_m2,
        occupancy: z.occupancy,
      });
    }
    return m;
  }, [density, horizon]);

  // stand_id → list of feeding gates (from layout) + concourse adjacency
  const gatesForZone = useMemo(() => {
    const m: Record<string, string[]> = {};
    if (!layout) return m;
    for (const g of layout.gates) {
      m[g.stand] = [...(m[g.stand] ?? []), g.name];
    }
    // Concourses inherit gates from the stand they neighbour
    const standForConcourse: Record<string, string> = {
      concourse_w: "stand_a",
      concourse_n: "stand_b",
      concourse_e: "stand_c",
      concourse_s: "stand_d",
    };
    for (const [conc, stand] of Object.entries(standForConcourse)) {
      m[conc] = m[stand] ?? [];
    }
    return m;
  }, [layout]);

  if (!layout) return null;

  const onOver = (zoneId: string) => (e: any) => {
    e.stopPropagation();
    setHovered(zoneId);
    if (typeof document !== "undefined") document.body.style.cursor = "pointer";
  };
  const onOut = (e: any) => {
    e.stopPropagation();
    setHovered(null);
    if (typeof document !== "undefined") document.body.style.cursor = "default";
  };

  const hoveredZone = hovered ? layout.zones.find((z) => z.id === hovered) : null;
  const hoveredState = hovered ? zoneStates.get(hovered) : undefined;
  const hoveredGates = hovered ? gatesForZone[hovered] : undefined;
  const hoveredCentroid = hoveredZone ? centroid(hoveredZone.polygon) : null;
  const hoveredYBase = hoveredZone?.type === "stand" ? 14.1 : 0.12;

  return (
    <group>
      {layout.zones.map((z) => {
        const shape = polyToShape(z.polygon);
        const geom = new THREE.ShapeGeometry(shape);
        const state = zoneStates.get(z.id);
        const color = state?.color ?? "#BDC1C6";

        const isStand = z.type === "stand";
        const yBase = isStand ? 14.1 : 0.12;
        const baseOpacity = horizon === 0 ? (isStand ? 0.7 : 0.55) : 0.42;
        const isHovered = hovered === z.id;
        const opacity = isHovered ? Math.min(1, baseOpacity + 0.2) : baseOpacity;
        const isCritical = state?.los === "F" || state?.los === "E";

        return (
          <group key={z.id}>
            <mesh
              geometry={geom}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, yBase, 0]}
              onPointerOver={onOver(z.id)}
              onPointerOut={onOut}
            >
              <meshBasicMaterial color={color} transparent opacity={opacity} />
            </mesh>
            {isStand && isCritical && (
              <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]} position={[0, yBase + 0.4, 0]}>
                <meshBasicMaterial color={color} transparent opacity={0.55} />
              </mesh>
            )}
            {/* Hover outline */}
            {isHovered && (
              <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]} position={[0, yBase + 0.05, 0]}>
                <meshBasicMaterial color="#202124" transparent opacity={0.18} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Hover tooltip */}
      {hovered && hoveredZone && hoveredCentroid && (
        <Html
          position={[hoveredCentroid[0], hoveredYBase + 5, hoveredCentroid[1]]}
          center
          distanceFactor={120}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            style={{
              fontFamily: '"Google Sans Text", "Roboto", sans-serif',
              minWidth: 200,
              maxWidth: 260,
              background: "#FFFFFF",
              border: "1px solid rgba(60,64,67,0.18)",
              borderRadius: 12,
              boxShadow: "0 2px 6px rgba(60,64,67,0.18), 0 4px 12px rgba(60,64,67,0.10)",
              padding: "10px 12px",
              color: "#202124",
              lineHeight: 1.35,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: hoveredState?.color ?? "#9AA0A6",
                boxShadow: `0 0 0 3px ${(hoveredState?.color ?? "#9AA0A6")}26`,
                flexShrink: 0,
              }} />
              <div style={{
                fontFamily: '"Google Sans Display", "Roboto", sans-serif',
                fontSize: 14, fontWeight: 500, color: "#202124",
              }}>
                {hoveredZone.name}
              </div>
            </div>
            <div style={{
              fontSize: 11, color: "#5F6368", marginBottom: 6,
              letterSpacing: 0.2,
            }}>
              {TYPE_LABEL[hoveredZone.type] ?? hoveredZone.type}
              {" · "}
              <span style={{ fontFamily: "Roboto Mono, monospace" }}>{hoveredZone.id}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 10px", fontSize: 12 }}>
              <div style={{ color: "#5F6368" }}>Occupancy</div>
              <div>
                <strong style={{ fontWeight: 500 }}>{hoveredState?.occupancy?.toLocaleString() ?? "—"}</strong>
                <span style={{ color: "#5F6368" }}> / {hoveredZone.capacity.toLocaleString()}</span>
              </div>

              <div style={{ color: "#5F6368" }}>Density</div>
              <div>
                <strong style={{ fontWeight: 500 }}>{hoveredState ? hoveredState.density.toFixed(2) : "—"}</strong>
                <span style={{ color: "#5F6368" }}> ppl/m²</span>
              </div>

              <div style={{ color: "#5F6368" }}>Area</div>
              <div>
                <strong style={{ fontWeight: 500 }}>{hoveredZone.area_m2.toLocaleString()}</strong>
                <span style={{ color: "#5F6368" }}> m²</span>
              </div>

              <div style={{ color: "#5F6368" }}>LOS</div>
              <div>
                <span style={{
                  display: "inline-block",
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: `${hoveredState?.color ?? "#9AA0A6"}22`,
                  color: hoveredState?.color ?? "#5F6368",
                  fontWeight: 600,
                  fontSize: 11,
                  fontFamily: "Roboto Mono, monospace",
                  marginRight: 4,
                }}>
                  {hoveredState?.los ?? "—"}
                </span>
                <span style={{ color: "#5F6368", fontSize: 11 }}>
                  {hoveredState?.los ? (LOS_LABEL[hoveredState.los] ?? "") : ""}
                </span>
              </div>

              {hoveredGates && hoveredGates.length > 0 && (
                <>
                  <div style={{ color: "#5F6368" }}>Feeding gates</div>
                  <div style={{ fontSize: 11 }}>
                    {hoveredGates.join(", ")}
                  </div>
                </>
              )}
            </div>

            {horizon !== 0 && (
              <div style={{
                marginTop: 6, paddingTop: 6,
                borderTop: "1px solid rgba(60,64,67,0.10)",
                fontSize: 11, color: "#5F6368",
              }}>
                Showing <strong style={{ color: "#1A73E8" }}>+{horizon} min</strong> forecast
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
