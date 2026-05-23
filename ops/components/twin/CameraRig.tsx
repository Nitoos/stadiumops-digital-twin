"use client";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect } from "react";

export type CameraMode = "bird" | "iso" | "walk";

export function CameraRig({ mode }: { mode: CameraMode }) {
  const { camera } = useThree();

  useEffect(() => {
    if (mode === "bird") {
      camera.position.set(40, 110, 40);
      camera.lookAt(40, 0, 40);
    } else if (mode === "iso") {
      camera.position.set(110, 70, 110);
      camera.lookAt(40, 0, 40);
    } else {
      camera.position.set(40, 6, 110);
      camera.lookAt(40, 4, 40);
    }
  }, [mode, camera]);

  return <OrbitControls target={[40, 0, 40]} enableDamping dampingFactor={0.1} />;
}
