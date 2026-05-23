export type Persona = "standard" | "family" | "pmr" | "hearing_impaired" | "away_fan" | "first_time";

export type FanPlan = {
  fan_id: string;
  persona: Persona;
  section: string;
  transit: string;
  assigned_gate: string;
  lane: string;
  arrive_by_min: number;
  language: string;
};

export type GateStatus = {
  gate_id: string;
  name: string;
  status: "open" | "closed" | "reserved";
  queue_length: number;
  wait_min: number;
};
