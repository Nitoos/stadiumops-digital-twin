"use client";
import { useMemo } from "react";
import * as THREE from "three";

export function Stadium() {
  const pitchGeo = useMemo(() => new THREE.PlaneGeometry(60, 60), []);
  const pitchMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2E7D32", roughness: 0.8 }), []);
  const standMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1F232B", roughness: 0.7 }), []);

  return (
    <group position={[0, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, 0, 40]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0F1419" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, 0.01, 40]} geometry={pitchGeo} material={pitchMat} />
      <mesh position={[10, 4, 40]} material={standMat}>
        <boxGeometry args={[20, 8, 70]} />
      </mesh>
      <mesh position={[70, 4, 40]} material={standMat}>
        <boxGeometry args={[20, 8, 70]} />
      </mesh>
      <mesh position={[40, 4, 10]} material={standMat}>
        <boxGeometry args={[70, 8, 20]} />
      </mesh>
      <mesh position={[40, 4, 70]} material={standMat}>
        <boxGeometry args={[70, 8, 20]} />
      </mesh>
      <gridHelper args={[200, 40, "#1E2632", "#161B22"]} position={[40, 0.02, 40]} />
    </group>
  );
}
