"use client";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect } from "react";

export type CameraMode = "bird" | "iso" | "walk";

export function CameraRig({ mode }: { mode: CameraMode }) {
  const { camera } = useThree();

  useEffect(() => {
    if (mode === "bird") {
      camera.position.set(40, 160, 42);
      camera.lookAt(40, 0, 40);
    } else if (mode === "iso") {
      camera.position.set(150, 90, 150);
      camera.lookAt(40, 4, 40);
    } else {
      // Pitch-side cinematic
      camera.position.set(40, 8, 130);
      camera.lookAt(40, 4, 40);
    }
  }, [mode, camera]);

  return (
    <OrbitControls
      target={[40, 4, 40]}
      enableDamping
      dampingFactor={0.12}
      minDistance={40}
      maxDistance={260}
      maxPolarAngle={Math.PI / 2.05}
    />
  );
}
