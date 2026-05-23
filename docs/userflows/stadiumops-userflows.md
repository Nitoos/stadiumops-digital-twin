# StadiumOps Command — Userflows

Operator journeys through the platform during a match day. Each flow names the
operator persona, the trigger, the screen they're on, the action they take, the
system response, and what happens on the fan side.

---

## 1. Personas

| Role | Symbol | Decision scope |
|---|---|---|
| **Ops Commander** (L7) | 🟦 `ops.commander` | Final call on protocol confirmations, fan broadcasts, agency hand-offs |
| **Security Lead** | 🟪 `ops.security` | Gate ops, dispatch security teams, threat triage |
| **Medical Lead** | 🟥 `ops.medical` | Medical incidents, AED dispatch, mass-casualty protocol |
| **Transit Coordinator** | 🟨 `ops.transit` | Inbound pipeline, exit staggering, transit sync |
| **Police / Fire / EMS** | ⬜ `agency.*` | Multi-agency channels, confirm hand-offs, take command of jurisdictional events |
| **Staff / Volunteers** | 🟢 `staff.volunteer` | Receive dispatch tasks on handheld; report from the field (Phase 1+) |

---

## 2. The whole match day (T-180 to T+60) — bird's-eye

```
T-180 ────────────── T-90 ────────────── T-0 ────────────── T+0 ──────────── T+60
  │                    │                   │                  │                 │
  │   READINESS        │  INBOUND          │   IN-MATCH       │   EXIT          │
  │   check-in,        │  flow shaping,    │   monitor +      │   stagger +     │
  │   systems green,   │  surge response,  │   handle break   │   transit       │
  │   teams briefed    │  weather watch    │   spikes,        │   sync, AAR     │
  │                    │                   │   threats        │   generation    │
  └────────────────────┴───────────────────┴──────────────────┴─────────────────┘

           ▲ pre-match arrivals          ▲ live match           ▲ post-match egress
```

Operator's attention shifts left to right. The platform surfaces the right
information at the right phase automatically (KPI cards reflect phase, drawers
highlight what's hot).

---

## 3. Sign-in & readiness (T-180 to T-120 min)

```
┌───────────────────────────────────────────────────────────────────────┐
│  IdP SSO          → role check          → Command Center dashboard    │
│  (Identity        →   ops.commander     →   app bar shows phase=PRE   │
│   Platform)       →   agency.police     →   live banner, sim time = 0 │
└───────────────────────────────────────────────────────────────────────┘
```

| Step | Operator action | Screen / Surface | System response |
|---|---|---|---|
| 1 | Log in via stadium IdP | (Phase 1 — Identity Platform) | RBAC loads role + tenant; routes to ops dashboard |
| 2 | Eyeball the app bar | Top app bar | Phase pill shows **Pre-match · T-180:00**, status dot green |
| 3 | Open *Teams* tab | Operations Panel → **Teams** | 4 seed teams loaded (Alpha crowd, Bravo medical, Charlie security, Delta transit) — all "Idle" |
| 4 | Open *Inbound* tab | Operations Panel → **Inbound** | All sources at 0/min, ETA still in the future |
| 5 | Verify AI Agent online | Operations Panel → **AI Agent** | Click *Ask agent* with a "systems check" prompt → response confirms simulated mode (or real Gemini if `GOOGLE_API_KEY` set) |

---

## 4. Inbound flow shaping (T-120 to T-0 min)

The bell-curve of fan arrivals peaks around T-45. The platform predicts
bottlenecks **before** they happen.

```
                                              FAN-SIDE TRIGGER
   OPERATOR JOURNEY                           ────────────────
   ────────────────                           Companion sends F1
                                              "Leave home by 5:42 PM,
   Phase pill   ─── pre-match T-90            take Green Line to MG Road,
                                              enter via Gate 6"
   KPI strip    ─── Occupancy: 0
                ─── Peak density: 0.00
                                              Fans arrive at metro station
   Inbound tab  ─── MG Road Metro             ─────────────────────────
                    Cubbon Park Metro
                    North Parking

                ▼ T-60 — surge predicted

   AI Agent     "Inbound rate at MG Road       Operator clicks AI Agent
                approaching peak. Open         Ask agent on the inbound
                Gate 6 by T-45 to absorb       context. Gets recommendation
                Section C flow."                with confidence + actions.

                ▼ T-50 — operator acts

   Twin         Click "Open Gate 6" action     Gate 6 status flips from
                in the recommendation card.    closed → open. Density on
                                               Concourse East starts dropping.
```

| Step | Trigger | Operator action | Screen | System / fan response |
|---|---|---|---|---|
| 1 | T-90, sim ticks start | Watch KPI strip | App bar + KPI cards | Density beings rising on east concourses |
| 2 | Inbound rate climbs | Switch to *Inbound* tab | Operations Panel → Inbound | Per-source ETA + fill % progress bars update every 5 s |
| 3 | AI flags congestion risk | Click *Ask agent* on AI tab | Operations Panel → AI Agent | Returns recommendation with rationale + 3 actions + confidence bar |
| 4 | Operator accepts | Click *Open Gate 6* | (Phase 1 — actuated; Phase 0 — sim) | Gate status flips on twin; companion app gets gate update |
| 5 | Fan-side effect | — | Companion `/gates` | Wait times re-rank; Gate 6 jumps to top of the list |

---

## 5. The headline crisis flow — Crowd surge (the demo)

This is the canonical demo. Click **Demo: Entry surge** at the bottom of the
ops dashboard.

```
┌──────── T+0  ────────┐ ┌──────── T+90s ────────┐ ┌──────── T+180s ───────┐
│                       │ │                        │ │                        │
│  Section A (wave 1)   │ │  Section B (wave 2)    │ │  Section C (wave 3)    │
│  pushed FIRST         │ │  pushed AFTER          │ │  pushed AFTER          │
│  via calm-path        │ │  Section A is clear    │ │  Section B is clear    │
│                       │ │                        │ │                        │
└───────────────────────┘ └────────────────────────┘ └────────────────────────┘

                    ↑ This stagger is the single biggest crush-prevention lever
```

### Step-by-step

| # | Operator action | Screen | What appears / fires |
|---|---|---|---|
| 1 | Click **Demo: Entry surge** | Footer rail | Sim injects 4,500 fans into Concourse North zone |
| 2 | Watch the twin | Twin canvas | Concourse North zone painted **amber → red**; a pulsing red beacon pole rises from the centre of the zone |
| 3 | Tab auto-switches to **Alerts** | Operations Panel | New alert card: *Severity CRITICAL · concourse_n · LOS F · 2.50 ppl/m² — crush risk* |
| 4 | Below it, **Protocols armed** badge updates | Operations Panel tab indicator | `CROWD_CRUSH_RISK` SOP **armed** (orange shimmer). Operator sees 5-step checklist |
| 5 | Tap **AI Agent** tab | Operations Panel | Pre-filled context "Concourse North at LOS F..."; click *Ask agent* |
| 6 | Read recommendation | AI Agent card | "Open Gate 6, reroute Section B via West Concourse" + 3 actions + 84% confidence |
| 7 | Open **Comms drafter** | Operations Panel → Comms | Pre-filled title "Move calmly via West Concourse"; sections=[B, C], channels=[push, sms], stagger=90s |
| 8 | Tweak as needed, click **Approve & broadcast** | Comms drafter | Backend creates broadcast events; 2 sections × 2 channels = 4 staggered events on the bus |
| 9 | Open **Teams** tab | Operations Panel → Teams | Alpha (crowd marshal) shows status **Responding** (amber chip). Their dot on the twin glows orange and moves to the surge zone |
| 10 | Open **Protocols armed** tab | Operations Panel | Click **Confirm & execute** on the `CROWD_CRUSH_RISK` card |
| 11 | System logs decision | (Internal) | `protocol.confirmed` event written to audit log; AAR will include it |
| 12 | Re-eyeball KPIs | KPI strip | Peak density starts trending down as the staggered push drains the zone |

### What the fan sees (parallel timeline)

| T+ | Section | Fan-side event |
|---|---|---|
| **+0s** | A | Companion screen shifts to F6 calm-path. Distinct vibration. Calm-voice TTS: "Move calmly with the people around you. Route is safe. You will be outside in 4 minutes." Map renders the West Concourse route from the fan's seat. |
| **+90s** | B | Same calm-path appears. Their phone was on a *holding state* countdown until now ("Holding — your wave in 90s"). |
| **+180s** | C | Same — wave 3 fires. |
| any | All | If the fan is on Family persona, group-member tracking opens automatically on F10. |
| any | All | Hearing-impaired persona: vibration + text only, no audio. |

### The "Why" labels operators can show new staff

When training new operators, **click the label toggle** on the twin (top-right). They'll see:

- "Stand A / B / C / D" labels float above each tier
- "Gate 1–8" tags at each entrance
- "Concourse · North / South / East / West" tags on the apron
- "PITCH" centred
- "Food Court", "Restroom N/S" amenity chips

Toggle off for a clean view during the actual demo.

---

## 6. Weather event flow — Storm inbound

| Step | Operator action | Screen | System response |
|---|---|---|---|
| 1 | Click **Demo: Storm** | Footer rail | G3 Weather Service injects a 12-min storm cell with lightning within 8 km |
| 2 | Watch the twin | Twin canvas | Cloud disc appears in the distance with a dark ground shadow; gets closer as ETA shrinks |
| 3 | Switch to **Protocols armed** | Operations Panel | `STORM_INBOUND` SOP armed automatically. Checklist includes lightning hold, covered-concourse routing, halt drone shows, secure equipment |
| 4 | Confirm protocol | Click *Confirm & execute* | `protocol.confirmed` audit event |
| 5 | Draft comms | **Comms** tab | Pre-fill: "Storm expected in 12 min — route to covered concourses" |
| 6 | Approve broadcast | Sub-group stagger applied | Open-stand sections (A, B, C, D) get F6 push with weather-specific routing |
| 7 | Fan-side | Companion `/alert` → Storm scenario | Calm-path shows: "Take the South Concourse exit — covered, 2-minute walk" |

---

## 7. Threat flow — Unauthorized drone

The most sensitive flow — police lead, ops support. Never auto-broadcasts.

```
G4 Threat Intelligence
       │
       │  drone signal detected
       ▼
┌─────────────────────────────────┐
│  threat.signal event published  │
└────────────┬────────────────────┘
             │
             ▼
   ┌────────────────────────────┐         ┌──────────────────────────┐
   │ L5 Protocol Engine arms    │  ────▶  │ Operations Panel         │
   │ UNAUTHORIZED_DRONE SOP     │         │ Protocols armed tab      │
   └────────────────────────────┘         │ shows armed but NOT      │
                                          │ confirmed                │
                                          └────────┬─────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────────────┐
                                          │ Ops Commander reads SOP │
                                          │ checklist: notify       │
                                          │ police, verify, hold    │
                                          │ broadcasts              │
                                          └────────┬────────────────┘
                                                   │
              ╔════════════════════════════════════▼══════════════════════════╗
              ║  Phase 1 — multi-agency channel: police role confirms          ║
              ║  intercept, fire/EMS standby. Ops broadcasts only AFTER        ║
              ║  agency clearance.                                             ║
              ╚════════════════════════════════════════════════════════════════╝
```

| Step | Operator action | Notes |
|---|---|---|
| 1 | Click **Demo: Drone threat** | Threat injected with severity=critical, distance 300 m |
| 2 | Auto-tab switch to Alerts | Critical alert visible |
| 3 | Read `UNAUTHORIZED_DRONE` SOP | Police lead; ops supports |
| 4 | (Phase 1) Notify police channel | Multi-agency drawer |
| 5 | Hold any fan broadcasts | Until police clearance — **deliberately no auto-broadcast** |

---

## 8. Exit + transit sync (T+0 to T+60)

| Step | Operator action | Screen | System / fan response |
|---|---|---|---|
| 1 | Final ball → click **Demo: Exit surge** | Footer rail | Sim shifts to post-match phase; stands drain into concourses |
| 2 | Watch density patterns | Twin canvas | Stands turn green (emptying), concourses turn amber (filling) |
| 3 | Draft F8/F9 exit comms | **Comms** tab | "Stay 8 min — free drink + reserved metro slot" — staggered by section |
| 4 | Approve broadcast | Comms drafter | 4 sections × stagger offsets → 24-min total stretch |
| 5 | Fan-side | Companion `/exit` | Each fan sees their reserved metro slot countdown (line + platform + carriage). Section A leaves first; D leaves last |
| 6 | Watch egress curve | KPI strip | Total occupancy ticks down smoothly (vs. a flat-sprint without intervention) |

---

## 9. After-Action Report (T+90 to next day)

```
Operator → Operations Panel → Audit drawer (Phase 1)
                │
                │   click "Generate AAR"
                ▼
       /api/ops/aar endpoint
                │
                ▼
       {
         total_decisions: 24,
         protocols_armed: { CROWD_CRUSH_RISK: 2, STORM_INBOUND: 1, UNAUTHORIZED_DRONE: 1 },
         protocols_confirmed: { CROWD_CRUSH_RISK: 2, STORM_INBOUND: 1 },
         broadcasts_sent: 6,
         anomalies_detected: 11,
         first_event_ts: ..., last_event_ts: ...
       }
                │
                ▼
       Phase 1+: Vertex AI renders a narrative PDF
       to Cloud Storage; emails commander + agencies.
```

---

## 10. Failure modes (what if?)

| If… | The platform does | The operator does |
|---|---|---|
| Backend dies mid-match | WebSocket reconnects with exponential backoff up to 16 s; companion falls back to last-cached state | Phase 1: page DR runbook |
| CV/edge feeds drop | L3 anomaly switches to density-only signals; alert badge surfaces in the Alerts tab | Investigate via dispatch; visual confirmation |
| Gemini agent times out | AI Agent returns the simulated fallback so the operator never sees a dead UI | Carry on with their own judgment; AI is co-pilot, not pilot |
| Operator wants to undo a broadcast | (Phase 1) recall message; (Phase 0) cannot — broadcasts are append-only by design | Send a corrective broadcast |
| Multiple SOPs armed simultaneously | Each arms independently; dedup window 5 min prevents re-arm spam; operator confirms in priority order | Triage by severity (critical first) |

---

## 11. Cross-surface touchpoint summary

| Operator action | Fan-side effect | Staff-side effect (Phase 1+) | Agency-side effect |
|---|---|---|---|
| Confirm `CROWD_CRUSH_RISK` | F6 calm-path pushed (staggered) | Crowd marshals get dispatch task on handheld | EMS gets standby ping |
| Confirm `STORM_INBOUND` | F6 weather routing pushed | All teams secure equipment | Lightning notification to local met |
| Confirm `UNAUTHORIZED_DRONE` | Nothing — held pending agency | Security teams shelter-in-place ready | Police lead, fire/EMS on standby |
| Approve a fan broadcast | Push + SMS + signage + PA + jumbotron | None (info only) | None |
| Open Gate 6 | Companion gates re-rank | Gate staff get "open" task | None |
| Generate AAR | None | None | PDF emailed to multi-agency leads |

---

## 12. Keyboard shortcuts (Phase 1+ proposal)

| Key | Action |
|---|---|
| `1`–`6` | Switch Operations Panel tab |
| `L` | Toggle twin labels |
| `B/I/W` | Camera mode Bird / Iso / Walk |
| `Cmd+Enter` | Confirm currently-focused protocol |
| `?` | Show shortcut overlay |
| `Esc` | Close dialogs / cancel actions |

---

*Last updated: 2026-05-23 — Phase 0 prototype.*
