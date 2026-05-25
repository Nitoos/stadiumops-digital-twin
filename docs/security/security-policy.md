# StadiumOps — Security Policy

This document describes the security controls in the Phase-0 prototype and
the gap to a production-grade Phase-1 deployment. Threat model assumes
attackers can:

- Reach the public internet-exposed backend
- Read the source code (repo is public)
- Submit crafted payloads to every endpoint
- Connect to WebSockets from any origin
- Inject prompt content via the AI Agent free-text box

Out of scope for Phase 0: nation-state attackers, supply-chain compromise
of pinned dependencies, side-channel attacks against the host OS.

---

## 1. Authentication

| Surface | Phase 0 | Phase 1+ |
|---|---|---|
| Ops endpoints (`/api/ops/*`) | Shared-secret bearer token from `OPS_TOKEN`, constant-time compare | Google Identity Platform (OIDC), role-claimed JWT, httpOnly cookie |
| WebSocket `/ws` | Same bearer token via `?token=` (browser) or `Authorization` header | Short-lived JWT issued on session start |
| Fan endpoints (`/api/fan/*`) | Anonymous (rate-limited) | Identity Platform fan auth |
| `/health`, `/api/layout` | Anonymous | Anonymous (intentionally — for monitoring) |

Set `OPS_AUTH_ENFORCE=true` in production. The backend refuses to start
if enforcement is on but `OPS_TOKEN` is empty.

In enforcement mode, `/docs` and `/openapi.json` are disabled to avoid
leaking the API surface to anonymous callers.

## 2. Transport

- TLS termination at upstream proxy (Cloud Load Balancer / Cloud Run)
- `Strict-Transport-Security` header when `ENABLE_HSTS=true`
- All cookies (Phase 1+) ship `Secure; HttpOnly; SameSite=Strict`

## 3. CORS

- Allow-list driven from `CORS_ORIGINS` env. Defaults to localhost:3000 + 3001.
- **Never** set to `*` — bearer auth alone does not protect against CSRF on
  endpoints that mutate state.
- `allow_credentials=true` so the dashboard can carry the bearer header.

## 4. Input validation

Every request body goes through strict Pydantic models with:

- Length caps (titles ≤ 200, bodies ≤ 2000)
- Numeric range caps (surge magnitude ∈ [-50000, 50000])
- Enum allow-lists for zone IDs, section IDs, channels, severities, personas, scenes
- Regex pattern on operator strings (`^[a-zA-Z0-9._-]+$`) — blocks command-injection-style values

Path parameters (e.g. `fan_id`) are validated defensively even though the
router shape forbids most attacks.

## 5. AI prompt-injection defence

The AI Agent is the largest free-text surface. Defence is layered:

| Layer | Mechanism |
|---|---|
| 1. Sanitiser (`backend/security/prompt_guard.py`) | Strips control chars, RTLO, zero-width; redacts common injection markers; caps at 2 000 chars; NFKC-normalises unicode |
| 2. Wrap | Cleaned context wrapped in `<operator_context>...</operator_context>` block |
| 3. System prompt | Instructs the model to treat content inside that block as DATA only — never instructions, never role changes |
| 4. Output guard | Model is told to respond with a fixed JSON shape when it detects an injection attempt |
| 5. Operator-in-the-loop | The agent's output **never auto-executes**. Every protocol confirmation and every fan broadcast requires an explicit operator click. |

## 6. Rate limiting

- Token-bucket per (IP, path-policy), in-memory
- Default: 120 burst, 2 RPS sustained
- AI agent: 10 burst, 0.2 RPS (Gemini is expensive)
- Scene injection + broadcasts: 6 burst, 0.2 RPS (high-impact endpoints)
- 429 response with `Retry-After: 5`

Phase 1+: swap for Memorystore-backed limiter behind Cloud Armor with
per-token quotas.

## 7. WebSocket controls

- Auth on handshake (close with 1008 if invalid)
- Bounded queue (200) with drop-oldest on backpressure
- Per-message size cap (`WS_MAX_MESSAGE_BYTES`, default 32 KiB)
- Oversized events sent with `_truncated` marker instead of full payload
- Server pings every 15 s to detect dead peers

## 8. Response headers

Sent by `SecurityHeadersMiddleware` on every response:

| Header | Value | Purpose |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Block MIME sniffing |
| `X-Frame-Options` | `DENY` | Block clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Don't leak full URLs |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=(), payment=()` | Deny powerful APIs |
| `Content-Security-Policy` | `default-src 'none'; frame-ancestors 'none'; base-uri 'none'` | JSON-only API, no inline scripts, no framing |
| `Cross-Origin-Resource-Policy` | `same-origin` | Prevent embedding |
| `Cross-Origin-Opener-Policy` | `same-origin` | Spectre mitigation |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` (when HSTS on) | Force HTTPS |

The Next.js dashboards have their own CSP — see `ops/next.config.ts` and
`companion/next.config.ts` (Phase 1+ scope).

## 9. Error handling

- Validation errors return 422 with redacted Pydantic detail
- Generic exceptions return 500 with `{"error":"server_error"}` only
  (set `REDACT_ERRORS=false` to surface details — dev only)
- Full traceback is logged server-side with the request method + path
- HTTP exceptions surface their declared detail (operator-controlled,
  safe for these endpoints)

## 10. Audit + logging

- Every protocol arm, protocol confirm, fan broadcast, and anomaly is
  written to the AuditService log via the event bus
- AAR endpoint (`/api/ops/aar`) renders a structured summary

Phase 1+:
- Cloud Audit Logs (immutable) for every write
- BigQuery export for AAR + analytics
- PII redaction filter on application logs

## 11. Secrets

- `.env` is gitignored (verified by security-scan.sh)
- `.env.example` ships placeholder values only
- `GOOGLE_API_KEY` may be empty (forces simulated mode — no network)
- Phase 1+: Google Secret Manager + Workload Identity (no static creds)

## 12. Resource limits

- Bus history capped at `BUS_HISTORY_MAX` (default 5 000 events)
- StateStore prune-window driven by clock
- WS connection bounded queue (200 messages)

## 13. Dependency hygiene

- All Python deps pinned to exact versions (`==`)
- All Node deps pinned (lockfile committed)
- Run `./scripts/security-scan.sh` for `pip-audit` + `npm audit` + secret scan + tests

Recommend wiring this into CI on every PR.

## 14. What changed in this pass (commit log)

- `backend/security/` — new module (auth, headers, rate-limit, prompt-guard)
- All `/api/ops/*` endpoints now gate behind `require_ops_token`
- Strict Pydantic validation on every request body (enums, lengths, ranges)
- Security response headers middleware
- Per-IP, per-path token-bucket rate limit
- Generic 500 handler (no traceback leakage)
- Prompt-injection sanitiser on AI Agent inputs
- WebSocket auth handshake + payload size cap
- Bus history cap (memory bound)
- `.env.example` documents new vars
- Frontend `ops/lib/api.ts` + `ws.ts` carry the bearer token
- `backend/tests/test_security.py` — 16 security test cases
- `scripts/security-scan.sh` — one-shot scan

## 15. Reporting a vulnerability

Email `security@<your-domain>` with reproduction steps. Phase 1+: publish
a `SECURITY.md` with PGP key + scope + reward policy.

---

## Quick verification

```bash
# Enforce auth + generate a token
export OPS_TOKEN=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
export OPS_AUTH_ENFORCE=true
uvicorn backend.main:app --port 8000 &
sleep 2

# Should 401
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/api/ops/state

# Should 200
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer $OPS_TOKEN" \
  http://127.0.0.1:8000/api/ops/state

# Should 422 (bad zone)
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer $OPS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"zone_id":"$(cat /etc/passwd)","magnitude":1}' \
  http://127.0.0.1:8000/api/ops/inject/surge

# Should 429 after a burst
for i in {1..30}; do
  curl -s -o /dev/null -w "%{http_code} " \
    -H "Authorization: Bearer $OPS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"context":"x"}' \
    http://127.0.0.1:8000/api/ops/agent/ask
done

# /docs hidden in enforce mode
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/docs

pkill -f "uvicorn backend.main"
```
