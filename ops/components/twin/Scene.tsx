"use client";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Stack, Typography, Tooltip, IconButton } from "@mui/material";
import { Stadium } from "./Stadium";
import { CameraRig, type CameraMode } from "./CameraRig";
import { Zones } from "./Zones";
import { DispatchedTeams } from "./DispatchedTeams";
import { AlertMarkers } from "./AlertMarkers";
import { WeatherFront } from "./WeatherFront";
import { Labels } from "./Labels";

const CAMERA_LABELS: Record<CameraMode, string> = {
  bird: "Bird",
  iso: "Iso",
  walk: "Pitch",
};

export function Scene() {
  const [mode, setMode] = useState<CameraMode>("iso");
  const [showLabels, setShowLabels] = useState(true);

  return (
    <Box sx={{ position: "absolute", inset: 0 }}>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 38, near: 0.5, far: 600 }}>
        <color attach="background" args={["#E8F0FE"]} />
        <fog attach="fog" args={["#E8F0FE", 220, 380]} />

        <hemisphereLight args={["#FFFFFF", "#DADCE0", 0.8]} />
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[140, 200, 100]}
          intensity={1.25}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-180}
          shadow-camera-right={180}
          shadow-camera-top={180}
          shadow-camera-bottom={-180}
          shadow-camera-near={1}
          shadow-camera-far={500}
          color="#FFFFFF"
        />
        <directionalLight position={[-100, 80, -60]} intensity={0.35} color="#C2D4F3" />

        <Stadium />
        <Zones />
        <DispatchedTeams />
        <AlertMarkers />
        <WeatherFront />
        {showLabels && <Labels />}
        <CameraRig mode={mode} />

        <EffectComposer multisampling={4}>
          <Vignette eskil={false} offset={0.25} darkness={0.32} />
        </EffectComposer>
      </Canvas>

      {/* Camera mode toggle */}
      <Box sx={{
        position: "absolute", top: 12, right: 12,
        bgcolor: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 1px 2px rgba(60,64,67,0.2), 0 1px 3px rgba(60,64,67,0.1)",
        borderRadius: "999px",
        px: 0.5, py: 0.5,
        display: "flex", alignItems: "center", gap: 0.5,
      }}>
        <ToggleButtonGroup
          size="small" exclusive value={mode}
          onChange={(_, v) => v && setMode(v)}
          sx={{
            "& .MuiToggleButton-root": {
              border: 0, color: "#5F6368",
              borderRadius: "999px", px: 1.75, py: 0.4,
              fontFamily: '"Google Sans Text", sans-serif', fontWeight: 500, fontSize: 12, letterSpacing: 0.2,
              "&.Mui-selected": {
                bgcolor: "#E8F0FE",
                color: "#1A73E8",
                "&:hover": { bgcolor: "#D2E3FC" },
              },
            },
          }}
        >
          {(["bird", "iso", "walk"] as CameraMode[]).map((m) => (
            <ToggleButton key={m} value={m}>{CAMERA_LABELS[m]}</ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Box sx={{ width: 1, height: 20, bgcolor: "rgba(60,64,67,0.12)", mx: 0.25 }} />
        <Tooltip title={showLabels ? "Hide labels" : "Show labels"}>
          <IconButton
            size="small"
            onClick={() => setShowLabels((s) => !s)}
            sx={{
              color: showLabels ? "#1A73E8" : "#5F6368",
              bgcolor: showLabels ? "#E8F0FE" : "transparent",
              borderRadius: "999px",
              "&:hover": { bgcolor: showLabels ? "#D2E3FC" : "rgba(60,64,67,0.06)" },
            }}
          >
            <Box className="material-symbols-sharp" sx={{ fontSize: 18 }}>label</Box>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Venue chip bottom-left */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{
        position: "absolute", bottom: 12, left: 12,
        bgcolor: "rgba(255,255,255,0.96)",
        boxShadow: "0 1px 2px rgba(60,64,67,0.2), 0 1px 3px rgba(60,64,67,0.1)",
        borderRadius: 1.25,
        px: 1.25, py: 0.5,
      }}>
        <Box sx={{
          width: 6, height: 6, borderRadius: "50%",
          bgcolor: "#1E8E3E",
          boxShadow: "0 0 6px rgba(30,142,62,0.6)",
        }} />
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#202124" }}>
          M. Chinnaswamy Stadium · LIVE
        </Typography>
      </Stack>
    </Box>
  );
}
