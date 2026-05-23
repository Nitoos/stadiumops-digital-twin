"use client";
import { useMemo } from "react";
import * as THREE from "three";

// Daytime stadium — clean Google-grey concrete, vibrant pitch.
const CONCRETE = "#DADCE0";          // Google grey 300
const CONCRETE_LIGHT = "#E8EAED";    // Google grey 200
const ROOF = "#C5C8CC";
const PITCH_GREEN = "#188038";
const PITCH_GREEN_STRIPE = "#1E8E3E";
const BOUNDARY = "#FFFFFF";
const CREASE = "#FFFFFF";
const STEEL = "#9AA0A6";
const APRON = "#F1F3F4";
const APRON_OUTER = "#E8EAED";
const APRON_FAR = "#DADCE0";

function Tier({ position, length, depth, rotationY = 0 }: {
  position: [number, number, number];
  length: number;
  depth: number;
  rotationY?: number;
}) {
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
          <meshStandardMaterial color={t.color} roughness={0.95} metalness={0.02} />
        </mesh>
      ))}
      <mesh position={[0, 13.5, -depth * 0.28]} castShadow>
        <boxGeometry args={[length * 1.05, 0.8, depth * 0.7]} />
        <meshStandardMaterial color={ROOF} roughness={0.7} metalness={0.1} />
      </mesh>
    </group>
  );
}

function FloodlightPylon({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 18, 0]}>
        <cylinderGeometry args={[0.55, 0.85, 36, 12]} />
        <meshStandardMaterial color={STEEL} roughness={0.7} metalness={0.5} />
      </mesh>
      <mesh position={[0, 36, 0]} castShadow>
        <boxGeometry args={[4, 1.2, 3]} />
        <meshStandardMaterial color="#3C4043" roughness={0.5} metalness={0.6} />
      </mesh>
      {[-1.2, 0, 1.2].map((dx) =>
        [-0.8, 0.8].map((dz) => (
          <mesh key={`${dx}-${dz}`} position={[dx, 36.7, dz]}>
            <sphereGeometry args={[0.35, 8, 8]} />
            <meshStandardMaterial color="#F8F9FA" roughness={0.25} />
          </mesh>
        ))
      )}
    </group>
  );
}

function Scoreboard({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[16, 8, 1]} />
        <meshStandardMaterial color="#3C4043" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 4, 0.51]}>
        <planeGeometry args={[14.5, 6.5]} />
        <meshStandardMaterial color="#202124" roughness={0.3} emissive="#202124" emissiveIntensity={0.05} />
      </mesh>
      {/* Yellow accent strip */}
      <mesh position={[0, 7, 0.52]}>
        <planeGeometry args={[14, 0.5]} />
        <meshBasicMaterial color="#FBBC04" />
      </mesh>
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[2, 4, 1]} />
        <meshStandardMaterial color={STEEL} roughness={0.5} metalness={0.6} />
      </mesh>
    </group>
  );
}

function Pitch() {
  const centre = useMemo(() => new THREE.PlaneGeometry(58, 58), []);
  const wicketStrip = useMemo(() => new THREE.PlaneGeometry(3, 22), []);

  return (
    <group position={[40, 0, 40]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} geometry={centre} receiveShadow>
        <meshStandardMaterial color={PITCH_GREEN} roughness={0.9} />
      </mesh>
      {[-20, -10, 0, 10, 20].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, z]}>
          <planeGeometry args={[58, 4]} />
          <meshStandardMaterial color={PITCH_GREEN_STRIPE} roughness={0.9} />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} geometry={wicketStrip}>
        <meshStandardMaterial color="#D4B884" roughness={0.95} />
      </mesh>

      {[-10, 10].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, z]}>
          <planeGeometry args={[6, 0.2]} />
          <meshBasicMaterial color={CREASE} />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[27, 27.4, 96]} />
        <meshBasicMaterial color={BOUNDARY} />
      </mesh>

      {[-10.4, 10.4].map((z) =>
        [-0.4, 0, 0.4].map((x) => (
          <mesh key={`${z}-${x}`} position={[x, 0.5, z]}>
            <cylinderGeometry args={[0.05, 0.05, 0.9, 6]} />
            <meshStandardMaterial color="#F8F9FA" />
          </mesh>
        ))
      )}
    </group>
  );
}

function Apron() {
  return (
    <group position={[40, 0, 40]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color={APRON_FAR} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <ringGeometry args={[58, 130, 96]} />
        <meshStandardMaterial color={APRON_OUTER} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <ringGeometry args={[42, 58, 96]} />
        <meshStandardMaterial color={APRON} roughness={1} />
      </mesh>
    </group>
  );
}

export function Stadium() {
  return (
    <group>
      <Apron />
      <Pitch />

      <Tier position={[8, 0, 40]} length={70} depth={14} rotationY={Math.PI / 2} />
      <Tier position={[72, 0, 40]} length={70} depth={14} rotationY={-Math.PI / 2} />
      <Tier position={[40, 0, 72]} length={70} depth={14} rotationY={Math.PI} />
      <Tier position={[40, 0, 8]} length={70} depth={14} rotationY={0} />

      <FloodlightPylon position={[2, 0, 2]} />
      <FloodlightPylon position={[78, 0, 2]} />
      <FloodlightPylon position={[2, 0, 78]} />
      <FloodlightPylon position={[78, 0, 78]} />

      <Scoreboard position={[40, 14, 84]} rotationY={Math.PI} />
    </group>
  );
}
