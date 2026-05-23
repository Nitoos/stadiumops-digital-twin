import type { Layout } from "./types";

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
  health: () => j("/health"),
  layout: () => j<Layout>("/api/layout"),
  opsState: () => j("/api/ops/state"),
  injectSurge: (zone_id: string, magnitude = 3000) =>
    j("/api/ops/inject/surge", { method: "POST", body: JSON.stringify({ zone_id, magnitude }) }),
  injectStorm: (eta_min = 12, lightning_km = 8) =>
    j("/api/ops/inject/storm", { method: "POST", body: JSON.stringify({ eta_min, lightning_km }) }),
  injectThreat: (summary: string, severity = "critical") =>
    j("/api/ops/inject/threat", { method: "POST", body: JSON.stringify({ summary, severity }) }),
  confirmProtocol: (protocol_id: string, operator: string) =>
    j("/api/ops/protocol/confirm", { method: "POST", body: JSON.stringify({ protocol_id, operator }) }),
  broadcast: (req: {
    title: string; body: string; sections: string[]; channels?: string[];
    stagger_sec?: number; route_hint?: string; operator: string;
  }) =>
    j("/api/ops/comms/broadcast", { method: "POST", body: JSON.stringify(req) }),
  agentAsk: (context: string) =>
    j("/api/ops/agent/ask", { method: "POST", body: JSON.stringify({ context }) }),
  aar: () => j("/api/ops/aar"),
  runScene: (name: string) =>
    j("/api/ops/demo/scene", { method: "POST", body: JSON.stringify({ name }) }),
};
