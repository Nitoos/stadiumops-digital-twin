export type LOS = "A" | "B" | "C" | "D" | "E" | "F";
export type Severity = "info" | "warning" | "critical";

export type Zone = {
  id: string;
  name: string;
  type: "stand" | "concourse" | "concession" | "restroom";
  capacity: number;
  area_m2: number;
  polygon: number[][];
};

export type Gate = {
  id: string;
  name: string;
  stand: string;
  position: [number, number];
  capacity_per_min: number;
  status: "open" | "closed" | "reserved";
};

export type ZoneState = {
  zone_id: string;
  density_per_m2: number;
  los: LOS;
  occupancy: number;
  capacity: number;
  los_forecast_5m: LOS;
  los_forecast_10m: LOS;
  los_forecast_15m: LOS;
};

export type Alert = {
  id: string;
  severity: Severity;
  zone_id?: string;
  reason: string;
  los?: LOS;
  density_per_m2?: number;
};

export type Protocol = {
  id: string;
  sop: string;
  name: string;
  severity: Severity;
  checklist: string[];
  confirmed_by: string | null;
  trigger?: Record<string, unknown>;
};

export type AgentRec = {
  id: string;
  title: string;
  rationale: string;
  actions: string[];
  confidence: number;
  affected_zones: string[];
};

export type WeatherState = {
  summary: string;
  storm_eta_min: number | null;
  lightning_within_km: number | null;
  heat_index_c: number | null;
  wind_gust_kmh: number | null;
};

export type Team = {
  team_id: string;
  role: string;
  position: [number, number];
  status: "idle" | "responding" | "on_task";
  current_task_id: string | null;
};

export type Layout = {
  venue: { id: string; name: string; capacity: number };
  zones: Zone[];
  gates: Gate[];
  aeds: { id: string; position: [number, number] }[];
  transit: { id: string; name: string; distance_m: number; modes: string[] }[];
};
