# StadiumOps Digital Twin + MatchDay Companion

Real-time command platform for cricket stadium operations paired with a
fan-facing companion PWA. Phase-0 prototype that maps to the production
architecture defined in
`docs/superpowers/specs/2026-05-23-stadiumops-digital-twin-design.md`.

## Quick start

### 1. Backend (FastAPI + Gemini agent + crowd simulator)

```bash
python3.11 -m venv .venv   # python3.13 also works
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env       # optionally set GOOGLE_API_KEY for real Gemini
uvicorn backend.main:app --port 8000
```

Endpoints:
- `GET  /health` — process + sim phase
- `GET  /api/layout` — stadium geometry
- `GET  /api/ops/state` — phase / density / inbound / weather / protocols / teams / medical / ticketing
- `POST /api/ops/inject/{surge,storm,threat}` — operator-injected events
- `POST /api/ops/protocol/confirm` — confirm an armed SOP
- `POST /api/ops/comms/broadcast` — staggered fan-out across channels
- `POST /api/ops/agent/ask` — Gemini-grounded recommendation
- `POST /api/ops/demo/scene` — one of `entry_surge | storm | drone_threat | exit_surge`
- `GET  /api/ops/aar` — auto-generated After-Action Report
- `POST /api/fan/checkin`, `GET /api/fan/plan/{id}`, `GET /api/fan/gates`
- `WS   /ws` — live event stream (density.tick, anomaly.detected, protocol.*, weather.alert, threat.signal)

### 2. Ops dashboard (StadiumOps Command — digital twin)

```bash
cd ops
npm install --legacy-peer-deps
npm run dev    # http://localhost:3000
```

Material Design 3 dark theme with Google Sans Display + Roboto Flex.
React Three Fiber 3D twin with density-painted zones, forecast lens,
time scrubber, what-if button, and six operator drawers.

### 3. Companion PWA (MatchDay Companion)

```bash
cd companion
npm install --legacy-peer-deps
npm run dev    # http://localhost:3001
```

Material You light theme. Persona-driven onboarding → personalized plan →
F1/F2/F3/F5/F6/F8/F9/F10 flows including the staggered calm-path crisis push.

## One-shot launcher

```bash
./run.sh
```

Brings up backend + ops + companion. Ctrl-C stops all.

## Demo script (~5 minutes, side-by-side)

Open both screens. Companion onboard as **Family** persona, Section **C**.

1. **Pre-match** — Companion shows personalized plan (F1). Ops twin's Inbound
   Pipeline drawer shows live arrival ETAs from metro + parking.
2. **Entry surge** — Click *Scene: Entry surge* on ops. Concourse North
   flashes red, Alert console fires, `CROWD_CRUSH_RISK` protocol arms.
   Click *AI Agent → Ask* (or use the prefilled context) — get reroute
   recommendation with rationale + confidence. Open *Comms drafter* →
   Sections B, C → *Approve broadcast*. Switch to Companion `/alert` →
   *Crowd surge*: observe holding state counting down (Section C is wave 3,
   180s), then calm-path appears with TTS audio + distinct vibration.
3. **Storm** — *Scene: Storm* on ops. Weather front renders on the twin,
   `STORM_INBOUND` armed. Companion `/alert` → *Storm* scenario shows
   covered-concourse routing.
4. **Drone threat** — *Scene: Drone threat*. Threat signal appears;
   `UNAUTHORIZED_DRONE` armed. Police agency would confirm in Phase 1.
5. **Exit** — *Scene: Exit surge*. Companion `/exit` shows staggered slot
   countdown + transit-synced metro details.

## Architecture (Phase 0 → Phase 1+)

| Phase 0 (this build) | Phase 1+ swap |
|---|---|
| Single FastAPI process | GKE Autopilot microservices |
| In-process `EventBus` | Cloud Pub/Sub topics |
| In-memory state store | Firestore + Memorystore |
| Procedural stadium model | Real venue glTF + Google Photorealistic 3D Tiles |
| Simulated G5 edge CV events | Coral / Jetson at CCTV |
| Mock JWT | Identity Platform SSO |

See the design spec for the full target architecture, coverage matrix, and
SLOs.

## Tests

```bash
.venv/bin/pytest           # backend unit tests (46 tests)
cd ops && npm run typecheck
cd companion && npm run typecheck
```

## Tech stack

- **Backend:** Python 3.13, FastAPI, Pydantic, google-genai, pytest
- **Ops dashboard:** Next.js 15, TypeScript, MUI (Material Design 3),
  React Three Fiber 9, Zustand, TanStack Query
- **Companion PWA:** Next.js 15, TypeScript, MUI (Material You light)
- **Fonts:** Google Sans Display, Roboto Flex, Roboto Mono, Material Symbols
