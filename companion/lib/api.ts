import type { FanPlan, GateStatus, Persona } from "./types";

const BASE = process.env.NEXT_PUBLIC_API ?? "http://127.0.0.1:8000";

async function j<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`${path} failed: ${r.status}`);
  return r.json() as Promise<T>;
}

export const api = {
  checkin: (fan_id: string, persona: Persona, section: string, transit: string) =>
    j<FanPlan>("/api/fan/checkin", {
      method: "POST",
      body: JSON.stringify({ fan_id, persona, section, transit }),
    }),
  plan: (fan_id: string) => j<FanPlan>(`/api/fan/plan/${fan_id}`),
  gates: () => j<GateStatus[]>("/api/fan/gates"),
};
