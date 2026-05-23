"use client";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Stadium } from "./Stadium";
import { CameraRig, type CameraMode } from "./CameraRig";
import { Zones } from "./Zones";
import { DispatchedTeams } from "./DispatchedTeams";
import { AlertMarkers } from "./AlertMarkers";
import { WeatherFront } from "./WeatherFront";

export function Scene() {
  const [mode, setMode] = useState<CameraMode>("iso");
  return (
    <Box sx={{ position: "absolute", inset: 0 }}>
      <Canvas shadows camera={{ fov: 45, near: 0.1, far: 1000 }}>
        <color attach="background" args={["#0B0F14"]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[50, 80, 30]} intensity={0.9} castShadow />
        <Stadium />
        <Zones />
        <DispatchedTeams />
        <AlertMarkers />
        <WeatherFront />
        <CameraRig mode={mode} />
      </Canvas>
      <Box sx={{ position: "absolute", top: 8, right: 8 }}>
        <ToggleButtonGroup
          size="small" exclusive value={mode}
          onChange={(_, v) => v && setMode(v)}
          sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}
        >
          <ToggleButton value="bird">Bird</ToggleButton>
          <ToggleButton value="iso">Iso</ToggleButton>
          <ToggleButton value="walk">Walk</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}
