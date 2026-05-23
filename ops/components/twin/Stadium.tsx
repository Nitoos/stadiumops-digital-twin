"use client";
import { useMemo } from "react";
import * as THREE from "three";

/**
 * Procedural stadium with:
 *  - Tiered bowl (3 rising rows on each side)
 *  - Roof canopy with subtle inner glow
 *  - Pitch with crease lines + boundary rope
 *  - 4 floodlight pylons with emissive lamps
 *  - LED scoreboard
 *  - Ground plane with dark concourse + outer apron
 *
 * Coordinates: layout JSON uses XY 0..80; we centre at (40, 0, 40).
 */

const CONCRETE = "#1A1F26";
const CONCRETE_LIGHT = "#242A33";
const ROOF = "#0F141B";
const PITCH_GREEN = "#2A6E36";
const PITCH_GREEN_STRIPE = "#358444";
const BOUNDARY = "#E8EAED";
const CREASE = "#F5F5F5";
const STEEL = "#3A4250";

function Tier({ position, length, depth, height, rotationY = 0 }: {
  position: [number, number, number];
  length: number;
  depth: number;
  height: number;
  rotationY?: number;
}) {
  // Three tiers (each higher and slightly offset back)
  const tiers = [
    { y: 0, w: depth, h: 3, color: CONCRETE },
    { y: 3, w: depth * 0.78, h: 4, color: CONCRETE_LIGHT, back: -depth * 0.11 },
    { y: 7, w: depth * 0.56, h: 5, color: CONCRETE, back: -depth * 0.22 },
  ];
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {tiers.map((t, i) => (
        <mesh key={i} position={[0, t.y + t.h / 2, t.back ?? 0]} castShadow receiveShadow>
          <boxGeometry args={[length, t.h, t.w]} />
          <meshStandardMaterial color={t.color} roughness={0.85} metalness={0.05} />
        </mesh>
      ))}
      {/* Roof canopy */}
      <mesh position={[0, 13.5, -depth * 0.28]} castShadow>
        <boxGeometry args={[length * 1.05, 0.8, depth * 0.7]} />
        <meshStandardMaterial color={ROOF} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Subtle inner glow strip under roof */}
      <mesh position={[0, 12.8, -depth * 0.1]}>
        <boxGeometry args={[length * 0.95, 0.15, depth * 0.5]} />
        <meshBasicMaterial color="#8AB4F8" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function FloodlightPylon({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 18, 0]}>
        <cylinderGeometry args={[0.6, 0.9, 36, 12]} />
        <meshStandardMaterial color={STEEL} roughness={0.7} metalness={0.5} />
      </mesh>
      {/* Lamp array */}
      <mesh position={[0, 36, 0]} castShadow>
        <boxGeometry args={[4, 1.2, 3]} />
        <meshStandardMaterial color="#101418" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Emissive lights */}
      {[-1.2, 0, 1.2].map((dx) =>
        [-0.8, 0.8].map((dz) => (
          <mesh key={`${dx}-${dz}`} position={[dx, 36.7, dz]}>
            <sphereGeometry args={[0.35, 8, 8]} />
            <meshBasicMaterial color="#FFF5C8" />
          </mesh>
        ))
      )}
      {/* Point light cast from each pylon */}
      <pointLight position={[0, 36, 0]} intensity={45} distance={120} color="#FFE9A0" />
    </group>
  );
}

function Scoreboard({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[16, 8, 1]} />
        <meshStandardMaterial color="#0A0E14" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* LED panel */}
      <mesh position={[0, 4, 0.51]}>
        <planeGeometry args={[14.5, 6.5]} />
        <meshBasicMaterial color="#F9AB00" />
      </mesh>
      <mesh position={[0, 4, 0.52]}>
        <planeGeometry args={[14, 6]} />
        <meshBasicMaterial color="#0A0E14" />
      </mesh>
      {/* Pole */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[2, 4, 1]} />
        <meshStandardMaterial color={STEEL} roughness={0.5} metalness={0.6} />
      </mesh>
    </group>
  );
}

function Pitch() {
  // Centre square is rotated 45° relative to bowl — but we keep it square for clarity
  const centre = useMemo(() => new THREE.PlaneGeometry(58, 58), []);
  const wicketStrip = useMemo(() => new THREE.PlaneGeometry(3, 22), []);

  return (
    <group position={[40, 0, 40]}>
      {/* Mowing stripes */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} geometry={centre}>
        <meshStandardMaterial color={PITCH_GREEN} roughness={0.85} />
      </mesh>
      {[-20, -10, 0, 10, 20].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, z]}>
          <planeGeometry args={[58, 4]} />
          <meshStandardMaterial color={PITCH_GREEN_STRIPE} roughness={0.85} />
        </mesh>
      ))}

      {/* Wicket strip (lighter, central pitch) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} geometry={wicketStrip}>
        <meshStandardMaterial color="#C9B383" roughness={0.95} />
      </mesh>

      {/* Crease lines */}
      {[-10, 10].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, z]}>
          <planeGeometry args={[6, 0.2]} />
          <meshBasicMaterial color={CREASE} />
        </mesh>
      ))}

      {/* Boundary rope (ring) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[27, 27.4, 96]} />
        <meshBasicMaterial color={BOUNDARY} />
      </mesh>

      {/* Stumps — three tiny verticals per end */}
      {[-10.4, 10.4].map((z) =>
        [-0.4, 0, 0.4].map((x) => (
          <mesh key={`${z}-${x}`} position={[x, 0.5, z]}>
            <cylinderGeometry args={[0.05, 0.05, 0.9, 6]} />
            <meshStandardMaterial color="#F2EFE5" />
          </mesh>
        ))
      )}
    </group>
  );
}

function Apron() {
  // Outer concourse + dark ground beyond
  return (
    <group position={[40, 0, 40]}>
      {/* Outermost ground (dark slab beyond stadium) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#070A0F" roughness={1} />
      </mesh>
      {/* Lighter outer ring (paved concourse) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <ringGeometry args={[58, 110, 96]} />
        <meshStandardMaterial color="#10141A" roughness={1} />
      </mesh>
      {/* Inner apron (just outside bowl) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[42, 58, 96]} />
        <meshStandardMaterial color="#161B23" roughness={1} />
      </mesh>
    </group>
  );
}

export function Stadium() {
  return (
    <group>
      <Apron />
      <Pitch />

      {/* Bowl: 4 sides, oriented so backs face out */}
      {/* West stand (along z-axis, on the -x side) */}
      <Tier position={[8, 0, 40]} length={70} depth={14} height={12} rotationY={Math.PI / 2} />
      {/* East stand */}
      <Tier position={[72, 0, 40]} length={70} depth={14} height={12} rotationY={-Math.PI / 2} />
      {/* North stand (along x-axis, on +z side) */}
      <Tier position={[40, 0, 72]} length={70} depth={14} height={12} rotationY={Math.PI} />
      {/* South stand */}
      <Tier position={[40, 0, 8]} length={70} depth={14} height={12} rotationY={0} />

      {/* Floodlights at the four corners */}
      <FloodlightPylon position={[2, 0, 2]} />
      <FloodlightPylon position={[78, 0, 2]} />
      <FloodlightPylon position={[2, 0, 78]} />
      <FloodlightPylon position={[78, 0, 78]} />

      {/* Scoreboard above north stand */}
      <Scoreboard position={[40, 14, 84]} rotationY={Math.PI} />
    </group>
  );
}
