import type { Layout } from "./types";

const BASE = process.env.NEXT_PUBLIC_API ?? "http://127.0.0.1:8000";

// The ops bearer token is loaded from one of (in order):
//   1. localStorage (set by a login flow — Phase 1+)
//   2. NEXT_PUBLIC_OPS_TOKEN env var (demo only — leaks in client bundle)
// Phase 1+: swap for httpOnly cookie + same-site=strict after OIDC login.
function getOpsToken(): string | null {
  if (typeof window !== "undefined") {
    const t = window.localStorage.getItem("stadiumops.token");
    if (t) return t;
  }
  return process.env.NEXT_PUBLIC_OPS_TOKEN ?? null;
}

export function setOpsToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem("stadiumops.token", token);
  else window.localStorage.removeItem("stadiumops.token");
}

export class AuthError extends Error {
  constructor() {
    super("Ops authentication required or invalid token.");
    this.name = "AuthError";
  }
}

async function j<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(init?.headers as Record<string, string> ?? {}),
  };
  const token = getOpsToken();
  if (token && path.startsWith("/api/ops")) {
    headers["authorization"] = `Bearer ${token}`;
  }
  const r = await fetch(`${BASE}${path}`, { ...init, headers, credentials: "omit" });
  if (r.status === 401) throw new AuthError();
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

export { getOpsToken };
