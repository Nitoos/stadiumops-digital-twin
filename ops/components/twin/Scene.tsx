"use client";
import { Canvas } from "@react-three/fiber";
import { Environment, Sky } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Stack } from "@mui/material";
import { Stadium } from "./Stadium";
import { CameraRig, type CameraMode } from "./CameraRig";
import { Zones } from "./Zones";
import { DispatchedTeams } from "./DispatchedTeams";
import { AlertMarkers } from "./AlertMarkers";
import { WeatherFront } from "./WeatherFront";

const CAMERA_LABELS: Record<CameraMode, string> = {
  bird: "Bird",
  iso: "Iso",
  walk: "Pitch",
};

export function Scene() {
  const [mode, setMode] = useState<CameraMode>("iso");
  return (
    <Box sx={{ position: "absolute", inset: 0 }}>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 38, near: 0.5, far: 600 }}>
        {/* Night sky background */}
        <color attach="background" args={["#05080C"]} />
        <fog attach="fog" args={["#05080C", 180, 320]} />

        {/* Subtle key + ambient lighting (floodlights from Stadium add their own pointlights) */}
        <hemisphereLight args={["#B7CDEB", "#1A1F2A", 0.35]} />
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[120, 160, 80]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-150}
          shadow-camera-right={150}
          shadow-camera-top={150}
          shadow-camera-bottom={-150}
          shadow-camera-near={1}
          shadow-camera-far={400}
          color="#D8E3FF"
        />
        {/* Cool rim light from opposite side */}
        <directionalLight position={[-80, 60, -40]} intensity={0.35} color="#7EA7FF" />

        <Stadium />
        <Zones />
        <DispatchedTeams />
        <AlertMarkers />
        <WeatherFront />
        <CameraRig mode={mode} />

        <EffectComposer multisampling={4}>
          <Bloom intensity={0.65} luminanceThreshold={0.65} luminanceSmoothing={0.2} mipmapBlur />
          <Vignette eskil={false} offset={0.18} darkness={0.55} />
        </EffectComposer>
      </Canvas>

      {/* Camera mode toggle — glass pill */}
      <Box sx={{
        position: "absolute", top: 12, right: 12,
        bgcolor: "rgba(15,17,21,0.72)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(232,234,237,0.12)",
        borderRadius: "999px",
        px: 0.5, py: 0.5,
      }}>
        <ToggleButtonGroup
          size="small" exclusive value={mode}
          onChange={(_, v) => v && setMode(v)}
          sx={{
            "& .MuiToggleButton-root": {
              border: 0, color: "text.secondary",
              borderRadius: "999px", px: 1.5,
              fontFamily: '"Google Sans Text", sans-serif', fontWeight: 600, fontSize: 12, letterSpacing: 0.5,
              "&.Mui-selected": { bgcolor: "primary.main", color: "#0B1220", "&:hover": { bgcolor: "primary.main" } },
            },
          }}
        >
          {(["bird", "iso", "walk"] as CameraMode[]).map((m) => (
            <ToggleButton key={m} value={m}>{CAMERA_LABELS[m]}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Coords / scale ticker bottom-left */}
      <Stack direction="row" spacing={1} sx={{
        position: "absolute", bottom: 12, left: 12,
        bgcolor: "rgba(15,17,21,0.72)", backdropFilter: "blur(10px)",
        border: "1px solid rgba(232,234,237,0.10)", borderRadius: 1,
        px: 1.25, py: 0.5, color: "text.secondary",
        fontFamily: "Roboto Mono, monospace", fontSize: 11, letterSpacing: 0.5,
      }}>
        <span>VENUE / CHINNASWAMY</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>SCALE 1:1</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span style={{ color: "#81C995" }}>● LIVE</span>
      </Stack>
    </Box>
  );
}
