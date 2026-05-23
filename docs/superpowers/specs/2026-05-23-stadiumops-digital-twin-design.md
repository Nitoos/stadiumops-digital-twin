# StadiumOps Command + MatchDay Companion — Design Spec

**Date:** 2026-05-23
**Status:** Approved for implementation planning
**Owner:** nsubashbabu@deloitte.com

---

## 1. Problem and goal

### Problem statement
Massive crowds at cricket matches create dangerous bottlenecks, severe security vulnerabilities, and logistical chaos during congested pre- and post-match movements. Current stadium operations rely on fragmented, manual systems, leaving security and volunteers unable to adapt instantly to rapid crowd surges, unpredictable weather shifts, or emerging threats. Organizers need an integrated, real-time command platform to unify ticketing, dynamically route crowd flow, and automate emergency responses for a safe and seamless fan experience.

### Product goal
A two-surface, single-platform product that turns stadium operations from reactive monitoring into proactive command:

- **StadiumOps Command** — operator surface, a 3D **digital twin** of the venue with live overlays, time scrubber, forecast lens, and what-if simulation. Hosts every ops layer (L1–L9) and every GAP-closure infrastructure component (G1–G5).
- **MatchDay Companion** — fan surface, a Material You PWA with personalized timing, calm-path crisis guidance, and transit-synced exit (F1–F10). SMS + dynamic signage carry the same payload for fans without the app.

The two surfaces share one event bus and one source of truth.

### Non-goals (explicitly out of scope)
- Building a sports betting/fan-engagement product (handled by the separate APL fan-engagement app)
- Replacing existing CCTV, RFID, ticketing, or PA hardware — we integrate, we don't replace
- Autonomous emergency-response actions without a human-in-the-loop
- A native iOS/Android app for fans in Phase 0 (PWA; native via Capacitor in Phase 2)
- Replacing official emergency services (police, fire, EMS) — we coordinate them, not impersonate them

---

## 2. Coverage matrix — every brief clause to a named component

| Brief clause | Primary owner | Supporting |
|---|---|---|
| Dangerous bottlenecks | L1 Predictive Density, L2 Inbound Pipeline | F2, F5, F8, F9, T forecast lens |
| Security vulnerabilities | L5 Protocol Engine, L7 Multi-Agency, G4 Threat Intelligence | L8, Identity Platform, Cloud Armor |
| Pre-/post-match chaos | L2, F1, F8, F9 | T forecast lens |
| **Fragmented, manual systems** | **G1 Integration Hub** | T digital twin, Pub/Sub bus, Identity Platform |
| **Volunteers can't adapt instantly** | **G2 Field Response Network** | L5, L6, L9, AI Agent reasoning |
| **Rapid crowd surges** | **G5 Edge CV** + L1 + L3 | F6 staggered push, T spatial view |
| **Unpredictable weather** | **G3 Weather Intelligence** | L5 (storm/heat SOPs), F6 weather routing, T overlay |
| **Emerging threats** | **G4 Threat Intelligence** | L5, L7, G1 drone adapter |
| Integrated real-time platform | T Digital Twin + G1 + Pub/Sub bus | RBAC, audit, observability |
| Unify ticketing | L8 Ticketing & Access + G1 ticketing-adapter + F4 | Multi-tenant Identity |
| Dynamic crowd routing | L1 → L6 → F2/F5/F6/F8/F9 | T spatial paths, AI Agent draft |
| Automate emergency response | L5 Protocol Engine | L4, L9, G2, G3, G4, audit |
| Safe, seamless fan experience | All of F1–F10 | Material You, persona, no-app fallback |

---

## 3. Component specification

### 3.1 GAP-closure infrastructure (cross-cutting)

#### G1 — Integration Hub *(closes "fragmented, manual systems")*

iPaaS-style connector mesh. Normalizes every external system into Pub/Sub events.

**Adapters (each is a Cloud Run service):**
- `cctv-adapter` — RTSP/ONVIF
- `access-adapter` — RFID/NFC turnstiles (SKIDATA, FortressGB)
- `ticketing-adapter` — Paytm Insider, BookMyShow, Ticketmaster, SecuTix
- `weather-adapter` — feeds G3
- `transit-adapter` — metro/bus operator APIs
- `parking-adapter` — IoT lot sensors + smart-parking platforms
- `cad-adapter` — police computer-aided dispatch
- `ems-adapter` — hospital + EMS dispatch
- `av-adapter` — PA / jumbotron control planes (Crestron, Q-SYS)
- `signage-adapter` — dynamic LED signage
- `social-adapter` — X, Reddit, regional forums
- `airspace-adapter` — drone-detection radar

**Contract:**
- Schemas in a central registry (Protobuf primary, Avro for BigQuery sinks)
- At-least-once delivery, idempotency keys mandatory
- DLQ with replay tooling
- Adapter SDK published so partners can self-build

**SLO:** ingest p99 < 1 s from external system to Pub/Sub publication.

#### G2 — Field Response Network *(closes "volunteers can't adapt instantly")*

Ground-team layer. Operator commands reach handhelds < 2 s; field telemetry flows back to the twin.

**Components:**
- **Staff Handheld App** — Flutter (Android + iOS), FCM push, offline-capable task queue, voice notes, photo evidence, AED/route guidance
- **Two-way radio gateway** — DMR/TETRA bridge (Motorola/Hytera) on Cloud Run + SIP/RTP. AI agent can transcribe inbound and broadcast outbound.
- **Bluetooth Mesh / LoRa fallback** — mesh nodes at concourse access points for low-bandwidth/dead-cell zones
- **Voice command** — Google Speech-to-Text + intent classifier ("Dispatch Alpha to Gate 4")
- **Live-location overlay** — every team renders as a moving dot on the twin

#### G3 — Weather Intelligence Service *(closes "unpredictable weather")*

Single service, multi-source fusion, feeds L5 SOPs directly.

**Sources:** IMD (India), AccuWeather, NOAA, on-site lightning detector (Boltek / Earth Networks), local barometric + anemometer sensors.

**Models:**
- Storm-cell tracking + arrival ETA
- Lightning strike radius and trend
- Heat index + humidity (hydration risk)
- Wind gusts (drone/loose-object risk)

**Outputs:**
- Structured weather events on `weather.alert` topic
- Auto-arms `STORM_INBOUND`, `HEAT_RISK`, `LIGHTNING_HOLD`, `HIGH_WIND` SOPs in L5
- Renders weather front on Digital Twin (T)
- Drives F6 weather-specific routing

#### G4 — Threat Intelligence Service *(closes "emerging threats")*

Multi-source threat fusion with human-in-loop validation. Never auto-broadcasts to fans.

**Sources:**
- News (mainstream + regional) — Gemini grounded search every 60 s
- Social (X, Reddit, local forums) — stream API + Vertex AI NLP classifier
- CERT-In / official bulletins — webhook subscription
- Police CAD via G1 — direct feed
- Airspace radar / drone detection — G1 adapter
- Anonymous tip line — SMS + voice → Vertex transcription

**Processing:**
- Geofenced (5 km radius + venue mentions) to suppress noise
- Severity scoring (1–5) + confidence (0–1)
- Logged immutably to BigQuery + Cloud Audit
- L7 operator + agency confirmation required before any fan-facing broadcast

#### G5 — Edge CV Inference *(closes "rapid crowd surges" speed dimension)*

L3 detects in seconds; G5 detects in sub-second.

- **Hardware:** Coral Edge TPU / Jetson Orin co-located with CCTV nodes
- **Models:** density grid, counter-flow, sway, dwell anomaly — TFLite/ONNX
- **Uplink:** events + heatmap tensors only (bandwidth- and privacy-friendly)
- **Failover:** falls back to cloud CV inference if edge node dies
- **Bus:** publishes to `cv.event` topic via G1's `cctv-adapter`

### 3.2 Ops layers (L1–L9)

#### L1 — Predictive Density (Fruin LOS + forecast)
- Computes Fruin Level of Service A–F per zone every 5 s
- Forecasts +5 / +10 / +15 min using exponential smoothing + flow-rate regression in Phase 0; Vertex AI time-series forecast in Phase 1
- Surfaces in twin overlay; drives L5 auto-arm thresholds

#### L2 — Pre-Match Inbound Pipeline
- Ingests transit, parking, walkway, ride-share signals via G1
- Predicts gate arrival rate by source
- Recommends gate openings 15+ min ahead of surge

#### L3 — Behavioural Anomaly Engine
- Consumes G5 edge events + cloud CV
- Detects counter-flow, swaying, abnormal dwell, dispersal failure
- Emits anomaly events with severity + spatial coords

#### L4 — Medical & Accessibility
- AED registry, first-aid stations, on-duty paramedics
- Live medical incidents with triage status
- PRM lane assignments (separate evac routes)
- Lost-person registry (linked to L9 dispatch and F10)

#### L5 — Protocol Library + Auto-Armed Responses
- SOP catalog: storm, fire, medical mass-casualty, bomb threat, pitch invasion, stampede risk, power loss, unauthorized drone
- Trigger rules: subscribe to bus events; when conditions match, arm SOP (not execute)
- Operator one-click confirm; logged with operator ID + AI confidence
- Every armed protocol writes a checklist to the dispatch board

#### L6 — Unified Fan Communications Bus
- One AI-drafted message → fan-out to PA, jumbotron, SMS, FCM, signage, social
- Sub-group stagger (Section A T+0, B T+90, C T+180) — the core anti-crush lever
- Operator must approve before send

#### L7 — Multi-Agency Coordination + Audit Trail
- Police / Fire / EMS / Transit / Stadium Ops as separate signed-in roles
- Shared twin, role-scoped action panes
- Every decision: operator + role + agency + timestamp + AI reasoning (if AI-assisted)
- Auto-generates post-match After-Action Report (AAR) as a PDF in Cloud Storage

#### L8 — Ticketing & Access Unification
- Real-time scan reconciliation: bank vs scanned vs in-zone
- Duplicate-scan / cloned-ticket detection
- Zone-capacity caps with real-time enforcement
- Multi-tenant adapters for major ticketing platforms via G1

#### L9 — Staff & Volunteer Coordination
- Task engine: assigns by location, skill, status
- Live roster: idle / responding / on-task
- Shift handoff with checklist
- Surfaces on twin as moving dots

### 3.3 Digital Twin (T)

The 3D spatial command surface that hosts all of the above. The non-twin panels become **drawers** that slide over the twin; the twin is always the central context.

**Capabilities:**
- 3D stadium model (bowl, stands, concourses, gates, exits, concessions, restrooms, AEDs, signage)
- External neighborhood (parking, transit nodes, walkways) via Google Maps Photorealistic 3D Tiles
- Live overlays: density heat, queues, alerts, dispatched-team dots, weather front, AI suggestion arrows/paths
- **Time scrubber:** rewind up to 60 min, replay events
- **Forecast lens:** toggle +5 / +10 / +15 min — see predicted state as semi-transparent overlay
- **What-if branch:** fork the live state, run alternative scenarios (close G4, open G6 + reroute) and compare projected curves
- **Camera modes:** bird's eye, isometric, ground walkthrough, AR (Phase 2)
- **Role-scoped overlays:** each agency sees their layer foregrounded

**Stack:**
- React Three Fiber + Three.js (WebGL2, WebGPU when available)
- glTF/GLB stadium model — procedural for Phase 0, real venue model swap-in for Phase 1+
- deck.gl for data overlays
- Event-sourced state from Firestore + BigQuery for scrubber/replay

### 3.4 Fan Companion layers (F1–F10)

Material You PWA, mobile-first, persona-driven.

| ID | Feature | Notes |
|---|---|---|
| F1 | Personalized arrival timing | T-24h push; staggered by ticket zone |
| F2 | Live gate & transit picker | Fed by L1 + L2; updates en route |
| F3 | Smart queue | Position, ETA, personal lane-switch SMS (not broadcast) |
| F4 | Frictionless scan | NFC/QR + biometric opt-in for season pass; offline-first cache |
| F5 | In-seat concourse copilot | Restroom + concession timing optimizer |
| F6 | Crisis calm-path | Staggered sub-group push with map-rendered route, calm TTS audio, distinct vibration/ringtone |
| F7 | PRM & family mode | Persona drives routing + messaging adaptation |
| F8 | Staggered exit incentive | "Stay 8 min, free drink + metro slot" |
| F9 | Transit-synced exit | Reserved metro/bus slot, platform/bay assignment |
| F10 | Reunification & lost-person | Group registry, live group-member location, nearest reunification point |

**Channels:**
- In-app push (FCM)
- SMS bridge (works without data; same payload, role-stratified)
- Wear OS smartwatch buzz
- Calm-voice TTS via Web Speech API + Bluetooth headset
- Stadium WiFi captive portal as no-app fallback

**Design principles:**
- **Stagger, don't broadcast** — sub-group waves, never simultaneous mass notifications
- **Path, not direction** — every instruction includes a route from where the fan is
- **No-app-required fallback** — SMS + dynamic signage + PA carry the same payload
- **Calm vocabulary** — "Move calmly with the people around you" not "EVACUATE NOW"
- **Persona-driven** — standard / family / PRM / hearing-impaired / language / away-fan / first-time

---

## 4. Architecture (production target — Phase 1+)

```
┌──────────────────────────────────────────────────────────────────────┐
│                      Cloud Armor (WAF + DDoS)                        │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
                       Cloud Load Balancer (HTTPS)
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
  Cloud CDN              Cloud API Gateway          Firebase Hosting
  (static, maps)       (REST + gRPC + WS)         (Companion PWA)
                                 │
   ┌─────────────────────────────┼─────────────────────────────┐
   │                             │                             │
   ▼                             ▼                             ▼
┌────────────┐         ┌────────────────────┐        ┌──────────────────┐
│ Identity   │         │ GKE Autopilot      │        │ Realtime Edge    │
│ Platform   │         │ + Cloud Run        │        │ Firestore + FCM  │
│ (RBAC,SSO) │         │ (services)         │        │ + WebSocket fan- │
│            │         │                    │        │ out (80k conns)  │
└────────────┘         └─────────┬──────────┘        └────────┬─────────┘
                                 │                            │
                       Event Backbone: Pub/Sub               │
                                 │                            │
┌──────────┬──────────┬──────────┼──────────┬──────────┬─────┴────────┐
▼          ▼          ▼          ▼          ▼          ▼              ▼
density   anomaly   ticketing  comms-bus  protocol  inbound       AI agent
(L1)      (L3)      (L8)       (L6)       (L5)      (L2)       (Gemini+Vertex)

G1 Integration Hub adapters (Cloud Run, one per external system)
G2 Field Response (Flutter handheld + DMR/TETRA gateway + LoRa mesh)
G3 Weather Intelligence Service (Cloud Run)
G4 Threat Intelligence Service (Cloud Run)
G5 Edge CV Inference (Coral/Jetson at CCTV nodes)

Persistence:
  Firestore (live state)  |  BigQuery (telemetry, AAR)  |  Cloud Storage (artefacts)
  Memorystore Redis (hot path: WS sessions, queue counters, dedup)

Observability: Cloud Logging + Trace + Monitoring (OpenTelemetry)
Security: Cloud KMS, Secret Manager, VPC-SC, Workload Identity
Audit: Cloud Audit Logs (immutable), AAR in BigQuery + Cloud Storage
```

---

## 5. Service catalogue (Phase 1+ target)

| Service | Language | Scaling target | Role |
|---|---|---|---|
| `api-gateway` | Node 22 | 50k WS, 5k RPS | Edge, WS fan-out, auth verify |
| `ops-bff` | Next.js API (Node) | 1k WS | Ops dashboard BFF |
| `companion-bff` | Next.js API (Node) | 80k WS | Fan PWA BFF |
| `density-service` | Python | 500 events/s | Fruin LOS + forecast |
| `anomaly-engine` | Python + Vertex AI | 500 events/s | Counter-flow, sway, dwell |
| `ai-agent` | Python (FastAPI) | 10 RPS | Gemini grounded + Vertex strategic |
| `access-service` | Go | 5k RPS | RFID/NFC validation, capacity |
| `protocol-engine` | Python | 100 RPS | SOPs, auto-arm |
| `comms-bus` | Node | 10k push/s | PA/jumbotron/SMS/FCM/signage |
| `inbound-pipeline` | Python | 200 RPS | Transit/parking/walkway |
| `weather-intel` | Python | 50 RPS | G3 |
| `threat-intel` | Python | 50 RPS | G4 |
| `audit-service` | Go | 5k events/s | Immutable Audit Log writer |
| `g1-adapters` | mix (Go/Node/Python) | per-adapter | G1 integration adapters |

---

## 6. Data model (high-level)

**Firestore collections (live state):**
- `tenants/{tenantId}` — venue metadata
- `tenants/{tenantId}/matches/{matchId}` — match state, lifecycle
- `tenants/{tenantId}/zones/{zoneId}` — current density, LOS, forecast
- `tenants/{tenantId}/alerts/{alertId}` — active alerts
- `tenants/{tenantId}/protocols/{protocolId}` — armed/active protocols
- `tenants/{tenantId}/teams/{teamId}` — field team status + location
- `tenants/{tenantId}/fans/{fanId}` — fan check-in state (ephemeral, 24h TTL)

**BigQuery datasets (analytics + audit):**
- `events_raw` — every Pub/Sub event, partitioned by date
- `aar` — post-match After-Action Reports
- `audit` — every operator action, immutable

**Pub/Sub topics:**
- `density.tick` — every 5 s per zone
- `anomaly.detected` — CV anomaly events
- `access.scan` — turnstile scans
- `weather.alert` — G3 outputs
- `threat.signal` — G4 outputs
- `protocol.armed` / `protocol.confirmed` — L5 lifecycle
- `comms.broadcast` — L6 sent messages
- `fan.checkin` / `fan.location` — fan companion telemetry
- `team.location` — staff handheld telemetry

---

## 7. Identity, RBAC, multi-tenancy

- **Identity:** Firebase Auth / Identity Platform. Ops via SAML/OIDC to stadium IdP. Fans via Google/Apple/phone OTP.
- **Roles:**
  `ops.commander`, `ops.security`, `ops.medical`, `ops.transit`,
  `agency.police`, `agency.fire`, `agency.ems`,
  `staff.volunteer`, `staff.captain`,
  `fan`, `fan.pmr`, `fan.family`
- **Tenancy:** every Firestore document and BigQuery row tagged with `tenantId`. Cloud IAM enforces tenant isolation at the service boundary. VPC-SC perimeter around BigQuery/Firestore.
- **Audit:** every write stamped (user, role, tenant, timestamp, AI confidence if AI-assisted). Cloud Audit Logs immutable.

---

## 8. UI/UX design system

### 8.1 Typography (Google fonts)

| Token | Font | Usage |
|---|---|---|
| Display | **Google Sans Display** (fallback Inter) | Hero numbers, headlines, panel titles |
| Body / UI | **Roboto Flex** (variable axes) | All body, controls, table data |
| Mono / data | **Roboto Mono** | Telemetry, IDs, timestamps |
| Icons | **Material Symbols** (Rounded for Companion, Sharp for Command) | All iconography |

### 8.2 Color (Material You M3 schemes)

| Token | Value | Notes |
|---|---|---|
| Primary | `#1A73E8` Google Blue | Calm/operational |
| Secondary | `#0F9D58` Google Green | Safety/go |
| Tertiary | `#F9AB00` Google Amber | Caution |
| Error | `#D93025` Google Red | Critical |
| Surface Dim (Command) | `#0F1115` | Dark default |
| Surface Bright (Companion) | `#FFFBFE` | Light default |

Full tonal palette derived from seeds via Material You. Color-blind safe variants ship as alternate schemes.

### 8.3 Density and motion

- **Command** uses M3 high-density variant + Roboto Flex compressed axes for information-dense panels
- **Companion** uses M3 default variant + larger touch targets (48dp minimum)
- Motion: Material Motion 3, emphasized easings, sub-200ms for state changes, 400–600ms for layout transitions

### 8.4 Accessibility (both surfaces)

- WCAG 2.2 AA
- Keyboard-first navigation on Command (operators in stress conditions can't always reach for mouse)
- Screen-reader narration of all alerts
- Color-blind safe palette (deuteranopia, protanopia, tritanopia)
- Hearing-impaired fan persona: text + vibration only
- Language: i18n with auto-detection from ticket; manual override

### 8.5 Frontend stacks

- **Command:** Next.js 15 (App Router, RSC) + TypeScript + MUI (Material Design 3) + TanStack Query + WebSocket client + React Three Fiber + deck.gl + Recharts
- **Companion:** Next.js 15 PWA + TypeScript + MUI (Material You) + Firebase SDK + Workbox for offline + Web Speech API

---

## 9. AI / agent layer

Two-tier design:

- **Tactical (real-time, < 2 s):** Gemini 2.0 Flash with Google Search grounding. Drives live narration, weather, threat scan, comms drafting. Same pattern as the existing APL app — proven.
- **Strategic (background, 30–60 s):** Vertex AI long-context model. Summarizes last 15 min, drafts protocol recs, generates AAR.

**Guardrails:**
- Confidence + reasoning on every recommendation
- Operator must confirm any action affecting > N fans or arming a protocol
- All AI outputs logged immutably (BigQuery + Cloud Audit)
- Prompt versioning in Cloud Storage with rollback
- Never autonomous on safety-affecting actions

---

## 10. Scalability and SLOs

| Dimension | Target |
|---|---|
| Concurrent fan WS connections | 80,000 per venue |
| Crisis broadcast fan-out | 100k notifications in < 10 s |
| Density tick latency (sensor → ops UI) | < 2 s |
| Ops API p99 | < 250 ms |
| Crisis arm-to-fan-notification | < 5 s |
| Availability (match-day) | 99.95% |
| RTO / RPO | 5 min / 1 min |
| Multi-region | Active-active across two GCP regions |
| Cost envelope (50k fans, match-day) | ~$80–150 USD at full scale |

---

## 11. Security and compliance

- Cloud Armor WAF + DDoS, Identity-Aware Proxy on ops endpoints
- Cloud KMS envelope encryption; Secret Manager for keys
- VPC Service Controls perimeter around BigQuery / Firestore
- Workload Identity for service-to-service (no static creds)
- SAST + dependency scanning in Cloud Build
- Pen-test gate before each Phase release
- Fan location ticket-tied; anonymized after 24h
- PII isolated in a dedicated dataset with stricter ACLs
- DPDP Act (India) + GDPR-aware retention; consent flow on fan signup
- SOC 2 readiness (Phase 2): immutable logs, access reviews, change management

---

## 12. Observability

- OpenTelemetry across all services → Cloud Trace + Cloud Logging + Cloud Monitoring
- Per-service SLO dashboards
- PagerDuty integration for incident-tier alerts
- Synthetic monitors for crisis-broadcast path (probe weekly, smoke test before every match)

---

## 13. CI/CD and IaC

- IaC: Terraform modules per service
- CI/CD: Cloud Build → Artifact Registry → Cloud Deploy with canary + auto-rollback
- Envs: dev → stage → prod, all Terraform-reproducible
- Ephemeral preview envs per PR
- Feature flags: Firebase Remote Config

---

## 14. Phased delivery

| Phase | Scope | Timing |
|---|---|---|
| **Phase 0 — Session prototype** | Two-screen prototype (Ops twin + Fan PWA), single FastAPI process, Gemini agent, simulated crowd, simulated fan, Material Design 3 + Google fonts. End-to-end story works (entry surge → weather → threat → exit) on both screens. Architecture-shaped, demo-scale. | This session |
| **Phase 1 — MVP** | Decompose to 3 services (api-gateway, density+anomaly, ai-agent). Firestore + Pub/Sub. Multi-tenant scaffolding. Real auth. G1 adapters: 2–3 real connectors. | 4–6 weeks |
| **Phase 2 — Pilot** | Full microservice graph. One live stadium pilot. RFID/NFC integration. Real CV plug-in. SOC2 prep. Native handheld via Capacitor. | 3–4 months |
| **Phase 3 — GA** | Multi-tenant, multi-region, agency portals, AAR auto-gen, protocol marketplace, AR companion. | 6–9 months |

---

## 15. Phase 0 session deliverable (what we build now)

### 15.1 Concrete deliverables

| Deliverable | Detail |
|---|---|
| `server.py` (FastAPI) | Single backend process; modules per service shape (density, anomaly, agent, comms, protocol, ticketing, weather, threat, staff). In-process event bus abstracted behind a `EventBus` interface (Phase-1 swap to Pub/Sub). |
| `crowd_sim.py` | Deterministic crowd simulator: 50k fan model, zone densities, gate arrivals, anomaly events, post-match egress. |
| `stadium_layout.json` | Zones, gates, exits, concessions, AEDs, capacities, coordinates. |
| `ops/` (Next.js 15) | StadiumOps Command: 3D twin (React Three Fiber + procedural stadium), drawer panels for L1–L9, time scrubber, forecast lens, what-if branch button, Material Design 3 dark theme, Google Sans / Roboto Flex. |
| `companion/` (Next.js 15 PWA) | MatchDay Companion: persona picker, F1/F2/F3 entry flow, F5 break copilot, F6 calm-path crisis, F8 staggered exit, F9 transit sync, F10 family-mode reunification. Material You light theme. |
| `requirements.txt` / `package.json` | Pinned dependencies. |
| `.env.example` | `GOOGLE_API_KEY` only. |
| `README.md` | Run instructions, demo script, architecture diagram. |

### 15.2 Demo flow (end-to-end, both screens visible)

1. **Pre-match (T-90 min)** — Companion shows F1 personalized arrival; Ops twin shows L2 inbound forecast. Operator opens Gate 6 proactively on AI rec.
2. **Entry surge (T-30 min)** — G5 simulated edge event fires at Gate 4. Twin overlay flashes red. Forecast lens shows LOS-D at +6 min. AI rec: reroute via West Concourse. Operator confirms. **Companion (Section C) gets F6 calm-path push 90 s before Section B (stagger).** Density curve flattens visibly on the twin.
3. **Weather shift (mid-match)** — G3 detects storm cell, ETA 14 min. L5 auto-arms `STORM_INBOUND`. Companion shows F6 with covered-concourse routing for affected sections.
4. **Threat (late match)** — G4 surfaces an unauthorized-drone alert via Gemini-grounded news + airspace adapter. L7 multi-agency drawer opens. Police role confirms protocol.
5. **Exit (T+0 to T+30)** — F8 staggered exit incentive offered. F9 transit-sync countdown. Twin shows egress curve smoothed against a no-intervention baseline. AAR auto-generated.

### 15.3 Phase-0 simplifications (with prod swap-in points marked)

| Phase 0 form | Phase 1+ swap |
|---|---|
| In-process `EventBus` | Pub/Sub topics |
| In-memory Firestore mock | Firestore + Memorystore |
| Single Cloud Run-shaped process | Independent services on GKE Autopilot |
| Mock JWT | Identity Platform with SSO |
| Procedural stadium model | Real venue glTF |
| Two G1 adapter shapes (ticketing, weather) | Full adapter mesh |
| Simulated G5 edge events | Real Coral/Jetson CV |
| One simulated tenant | Multi-tenant data isolation |

No throwaway code: every Phase-0 module's interface matches its Phase-1 service contract.

---

## 16. Open questions / risks

| # | Item | Resolution |
|---|---|---|
| Q1 | Should Phase 0 commit to MUI vs Material Web for the M3 implementation? | **Resolved:** MUI. More mature, broader component surface, production-ready. |
| Q2 | Is the working directory git-initialized? | No. Recommend `git init` as first step of implementation plan. |
| Q3 | Should fan companion be native (React Native / Capacitor wrap) in Phase 0? | **Resolved:** PWA only. Native via Capacitor in Phase 2. |
| Q4 | Do we use Google Maps Photorealistic 3D Tiles for stadium exterior in Phase 0? | **Resolved:** No (cost + complexity). Procedural exterior in Phase 0; real tiles in Phase 1. |
| R1 | Three.js / React Three Fiber adds ~500KB to ops bundle | Acceptable on a desktop command console; lazy-load twin route. |
| R2 | Gemini cost at scale (10 RPS sustained) | Tactical agent rate-limited; cached at zone-update granularity. |
| R3 | 80k concurrent WS is non-trivial | Phase 1 introduces dedicated fan-out service; Phase 0 stays well below limits. |
| R4 | Real-world CCTV/RFID integration is venue-specific | G1 adapter SDK + reference adapters; venue-onboarding playbook in Phase 1. |

---

## 17. Success criteria

### Phase 0 (this session)
- Both surfaces run locally with one command
- End-to-end demo flow executes without manual intervention beyond operator confirmations
- Material Design 3 + Google fonts visibly present on both surfaces
- Digital twin renders with live density paint, forecast lens, and what-if branch button working
- Companion shows persona-driven content and stagger-aware crisis push
- AI agent narrates and recommends; operator-in-the-loop confirmed for all safety actions
- Code structured so every Phase-0 module maps cleanly to a Phase-1 service

### Phase 1+ (defined here, not built this session)
- 99.95% availability on match-day, validated by a 50k-fan load test in stage
- < 5 s crisis arm-to-fan-notification end-to-end
- At least two production adapter integrations in G1 with a third-party partner
- One live stadium pilot signed
- SOC 2 Type 1 readiness audit passed

---

## 18. Sources informing this design

- Ticket Fairy — [Mission Control: Tech Command Centers 2026](https://www.ticketfairy.com/blog/mission-control-setting-up-a-tech-command-center-in-2026-for-large-scale-events)
- Outlook — [RCB AI Cameras for Crowd Control, Chinnaswamy](https://www.outlookindia.com/sports/cricket/ipl-2026-rcb-ai-cameras-installation-crowd-management-chinnaswamy-stadium-ksca)
- Onmanorama — [IPL 2026 AI Crowd Management](https://www.onmanorama.com/sports/cricket/2026/01/16/ipl-2026-rcb-proposes-ai-cameras-crowd-management-chinnaswamy-stadium-stampede.html)
- Sky Solution — [Computer Vision for Crowd Monitoring 2025](https://skysolution.com/computer-vision-for-crowd-monitoring-in-2025)
- Innefu Labs — [AI Crowd Behaviour Analysis](https://innefu.com/from-cctv-to-crowd-behaviour-analysis-how-ai-sees-what-humans-miss/)
- Ultralytics — [Vision AI in Crowd Management](https://www.ultralytics.com/blog/vision-ai-in-crowd-management)
- Prof. Keith Still — [Fruin Levels of Service](https://www.gkstill.com/Support/crowd-flow/fruin/Fruin1.html)
- Wiley — [Kanjuruhan Stadium Disaster Lessons](https://onlinelibrary.wiley.com/doi/full/10.1002/puh2.139)
- PreventionWeb — [How Stampedes Happen](https://www.preventionweb.net/news/how-do-stampedes-happen-and-how-can-we-prevent-them)
- Ticket Fairy — [RFID Event Technology 2025](https://www.ticketfairy.com/blog/rfid-technology-for-event-ticketing-in-2025-the-complete-guide)
- SKIDATA — [Stadium Access Control](https://www.skidata.com/en-us/solutions/stadia-attractions/access-control)
- Outlook — [Rawalpindi Stadium Drone Strike](https://www.outlookindia.com/sports/cricket/india-pakistan-tensions-rawalpindi-stadium-drone-strike-psl-2025)

---

*End of design spec.*
