import { create } from "zustand";
import type { ZoneState, Alert, Protocol, WeatherState, Team, Layout } from "./types";

type DensityTick = {
  sim_time_sec: number;
  phase: string;
  zones: ZoneState[];
};

type State = {
  layout: Layout | null;
  density: DensityTick | null;
  alerts: Alert[];
  protocols: Protocol[];
  weather: WeatherState | null;
  teams: Team[];
  threats: { id: string; summary: string; severity: string }[];
  scrubTs: number | null;
  forecastHorizon: 0 | 5 | 10 | 15;
  setLayout: (l: Layout) => void;
  onDensity: (d: DensityTick) => void;
  addAlert: (a: Alert) => void;
  setProtocols: (p: Protocol[]) => void;
  setWeather: (w: WeatherState) => void;
  setTeams: (t: Team[]) => void;
  addThreat: (s: { id: string; summary: string; severity: string }) => void;
  setScrubTs: (ts: number | null) => void;
  setForecastHorizon: (h: 0 | 5 | 10 | 15) => void;
};

export const useStore = create<State>((set) => ({
  layout: null,
  density: null,
  alerts: [],
  protocols: [],
  weather: null,
  teams: [],
  threats: [],
  scrubTs: null,
  forecastHorizon: 0,
  setLayout: (l) => set({ layout: l }),
  onDensity: (d) => set({ density: d }),
  addAlert: (a) => set((s) => ({ alerts: [a, ...s.alerts].slice(0, 50) })),
  setProtocols: (p) => set({ protocols: p }),
  setWeather: (w) => set({ weather: w }),
  setTeams: (t) => set({ teams: t }),
  addThreat: (sig) => set((s) => ({ threats: [sig, ...s.threats].slice(0, 20) })),
  setScrubTs: (ts) => set({ scrubTs: ts }),
  setForecastHorizon: (h) => set({ forecastHorizon: h }),
}));
