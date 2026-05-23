# StadiumOps Digital Twin — Phase-0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Phase-0 prototype: two-surface product (Ops digital twin + Fan PWA) with end-to-end demo flow (entry surge → weather → threat → exit), Material Design 3 + Google fonts throughout, Gemini agent in the loop, architecture-shaped for zero-throwaway swap to Phase-1 microservices.

**Architecture:** Single FastAPI process containing modular services (density, anomaly, agent, protocol, comms, weather, threat, ticketing, staff, medical, audit, inbound) behind an `EventBus` interface. Two Next.js 15 apps: `ops/` (StadiumOps Command with React Three Fiber twin) and `companion/` (MatchDay PWA). WebSocket for live updates. Procedural stadium model. Deterministic crowd simulator drives the demo.

**Tech Stack:** Python 3.11 + FastAPI + Pydantic + pytest + google-genai + uvicorn. Next.js 15 + TypeScript + MUI (Material Design 3) + React Three Fiber + deck.gl + TanStack Query + Vitest + Playwright. Google Sans Display + Roboto Flex + Material Symbols.

**Reference spec:** `docs/superpowers/specs/2026-05-23-stadiumops-digital-twin-design.md`

---

## File structure (created by this plan)

```
Version_1/
├── .git/                           # initialized in Task 1
├── .gitignore
├── .env.example
├── README.md                        # demo script + run instructions
├── requirements.txt
├── pytest.ini
├── docs/
│   └── superpowers/
│       ├── specs/2026-05-23-stadiumops-digital-twin-design.md
│       └── plans/2026-05-23-stadiumops-digital-twin-plan.md
├── backend/
│   ├── __init__.py
│   ├── main.py                      # FastAPI app entrypoint
│   ├── config.py                    # env + settings
│   ├── event_bus.py                 # in-process Pub/Sub-shaped bus
│   ├── schemas.py                   # Pydantic models (the shared contracts)
│   ├── stadium_layout.json          # zones, gates, exits, AEDs
│   ├── layout.py                    # layout loader + helpers
│   ├── services/
│   │   ├── __init__.py
│   │   ├── crowd_sim.py             # deterministic simulator
│   │   ├── density.py               # L1 Fruin LOS + forecast
│   │   ├── anomaly.py               # L3 behavioural anomaly engine
│   │   ├── agent.py                 # AI agent (Gemini grounded)
│   │   ├── protocol.py              # L5 SOP catalog + auto-arm
│   │   ├── comms.py                 # L6 unified comms bus
│   │   ├── weather.py               # G3 weather intelligence
│   │   ├── threat.py                # G4 threat intelligence
│   │   ├── inbound.py               # L2 pre-match inbound
│   │   ├── ticketing.py             # L8 ticketing & access
│   │   ├── staff.py                 # L9 staff coordination
│   │   ├── medical.py               # L4 medical & accessibility
│   │   ├── audit.py                 # L7 multi-agency audit
│   │   └── orchestrator.py          # demo scene runner
│   ├── api/
│   │   ├── __init__.py
│   │   ├── ws.py                    # WebSocket endpoint
│   │   ├── ops.py                   # ops REST endpoints
│   │   └── fan.py                   # fan REST endpoints
│   └── tests/
│       ├── __init__.py
│       ├── test_event_bus.py
│       ├── test_crowd_sim.py
│       ├── test_density.py
│       ├── test_anomaly.py
│       ├── test_protocol.py
│       ├── test_comms.py
│       └── test_orchestrator.py
├── ops/                              # Next.js 15 ops dashboard
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── app/
│   │   ├── layout.tsx               # MD3 dark theme + Google fonts
│   │   ├── page.tsx                 # twin scene + drawer shell
│   │   ├── providers.tsx            # MUI theme + Query + WS provider
│   │   └── globals.css
│   ├── components/
│   │   ├── twin/
│   │   │   ├── Scene.tsx            # R3F canvas
│   │   │   ├── Stadium.tsx          # procedural bowl + concourses
│   │   │   ├── Zones.tsx            # density-painted zones
│   │   │   ├── DispatchedTeams.tsx  # moving dots
│   │   │   ├── WeatherFront.tsx     # storm overlay
│   │   │   ├── SuggestionPaths.tsx  # AI arrow overlays
│   │   │   └── CameraRig.tsx        # bird/iso/walkthrough
│   │   ├── drawers/
│   │   │   ├── AlertConsole.tsx
│   │   │   ├── DispatchBoard.tsx
│   │   │   ├── ProtocolArmed.tsx
│   │   │   ├── AgentPane.tsx
│   │   │   ├── CommsDrafter.tsx
│   │   │   └── InboundPipeline.tsx
│   │   ├── controls/
│   │   │   ├── TimeScrubber.tsx
│   │   │   ├── ForecastLens.tsx
│   │   │   └── WhatIfButton.tsx
│   │   └── ui/
│   │       ├── DensityLegend.tsx
│   │       ├── KPIChip.tsx
│   │       └── Drawer.tsx
│   ├── lib/
│   │   ├── ws.ts                    # WebSocket client + reconnect
│   │   ├── api.ts                   # REST client
│   │   ├── store.ts                 # zustand store
│   │   ├── theme.ts                 # MD3 dark theme
│   │   └── types.ts                 # shared types (mirrors backend schemas)
│   └── tests/
│       └── twin.test.tsx
└── companion/                        # Next.js 15 PWA
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json
    ├── public/
    │   ├── manifest.json
    │   └── icons/
    ├── app/
    │   ├── layout.tsx               # MD3 light + Material You + Google fonts
    │   ├── page.tsx                 # onboarding / persona picker
    │   ├── plan/page.tsx            # F1 personalized timing
    │   ├── gates/page.tsx           # F2 gate picker
    │   ├── queue/page.tsx           # F3 smart queue
    │   ├── seat/page.tsx            # F5 break copilot
    │   ├── alert/page.tsx           # F6 calm-path crisis
    │   ├── exit/page.tsx            # F8 + F9 staggered exit
    │   ├── reunify/page.tsx         # F10 family-mode
    │   └── providers.tsx
    ├── components/
    │   ├── PersonaPicker.tsx
    │   ├── CalmPath.tsx
    │   ├── StaggeredCountdown.tsx
    │   ├── TransitSlot.tsx
    │   └── ui/Card.tsx
    ├── lib/
    │   ├── ws.ts
    │   ├── api.ts
    │   ├── persona.ts
    │   ├── theme.ts
    │   └── types.ts
    └── tests/
        └── persona.test.tsx
```

---

## Execution principles

- **TDD on backend logic** (event bus, simulator, density, anomaly, protocol, comms). Tests first, implementation minimal.
- **Visual TDD on frontend** — Playwright smoke per page, not full unit coverage.
- **Commit after every task** with `feat:` / `test:` / `chore:` prefixes.
- **Each step is 2-5 minutes.** If a step balloons, split it.
- **No throwaway code:** each service module's interface = its Phase-1 microservice contract.

---

## Milestone overview

| Milestone | Tasks | Outcome |
|---|---|---|
| **A. Foundation** | 1–5 | Git, env, deps, layout JSON, FastAPI skeleton, event bus |
| **B. Simulation core** | 6–11 | Crowd simulator, density, anomaly, orchestrator |
| **C. AI + protocol + comms** | 12–15 | Gemini agent, protocol engine, comms bus |
| **D. External intelligence** | 16–18 | Weather, threat, inbound |
| **E. Domain services** | 19–23 | Ticketing, staff, medical, audit, fan check-in |
| **F. API surface** | 24–25 | WebSocket + REST endpoints |
| **G. Ops dashboard scaffold** | 26–29 | Next.js + MD3 + WS client + app shell |
| **H. Digital twin** | 30–36 | R3F scene, stadium, zones, overlays, controls |
| **I. Ops drawers** | 37–42 | All operator panels |
| **J. Companion scaffold** | 43–45 | PWA + MD3 light + persona |
| **K. Companion flows** | 46–52 | F1, F2, F3, F5, F6, F8, F10 |
| **L. Demo & polish** | 53–56 | Demo runner, README, smoke test |

---

## Milestone A — Foundation

### Task 1: Initialize project, git, .gitignore

**Files:**
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Initialize git**

Run from `/Users/nsubashbabu/HashedIn/APL/APL_Final/Version_1`:
```bash
git init
git branch -M main
```

- [ ] **Step 2: Write .gitignore**

```gitignore
# Python
__pycache__/
*.py[cod]
.venv/
venv/
.pytest_cache/
.mypy_cache/

# Node
node_modules/
.next/
out/
dist/

# Env / secrets
.env
.env.local

# OS
.DS_Store

# Editor
.vscode/
.idea/
```

- [ ] **Step 3: Write .env.example**

```bash
# Google AI Studio key — https://aistudio.google.com (free, no credit card)
GOOGLE_API_KEY=your_key_here

# Backend
HOST=127.0.0.1
PORT=8000

# Demo mode: real | simulated  (real uses Gemini for narration; simulated uses canned text)
AGENT_MODE=real
```

- [ ] **Step 4: Initial commit**

```bash
git add .gitignore .env.example docs/
git commit -m "chore: initialize project with spec, plan, gitignore"
```

---

### Task 2: Python environment + dependencies

**Files:**
- Create: `requirements.txt`
- Create: `pytest.ini`

- [ ] **Step 1: Write requirements.txt**

```text
fastapi==0.115.5
uvicorn[standard]==0.32.1
pydantic==2.10.3
pydantic-settings==2.7.0
google-genai==0.3.0
httpx==0.28.1
python-dotenv==1.0.1
websockets==14.1

# Tests
pytest==8.3.4
pytest-asyncio==0.25.0
pytest-cov==6.0.0
```

- [ ] **Step 2: Write pytest.ini**

```ini
[pytest]
testpaths = backend/tests
asyncio_mode = auto
addopts = -v --tb=short
```

- [ ] **Step 3: Create virtualenv + install**

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

- [ ] **Step 4: Verify install**

```bash
python -c "import fastapi, pydantic, google.genai; print('ok')"
```

Expected: `ok`

- [ ] **Step 5: Commit**

```bash
git add requirements.txt pytest.ini
git commit -m "chore: add python deps and pytest config"
```

---

### Task 3: Stadium layout JSON

**Files:**
- Create: `backend/stadium_layout.json`
- Create: `backend/__init__.py`
- Create: `backend/layout.py`
- Test: `backend/tests/test_layout.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_layout.py`:
```python
from backend.layout import load_layout, Zone, Gate

def test_load_layout_returns_zones_and_gates():
    layout = load_layout()
    assert len(layout.zones) >= 10
    assert len(layout.gates) >= 6
    assert all(isinstance(z, Zone) for z in layout.zones)
    assert all(isinstance(g, Gate) for g in layout.gates)

def test_zones_have_required_fields():
    layout = load_layout()
    z = layout.zones[0]
    assert z.id and z.name and z.capacity > 0
    assert z.area_m2 > 0
    assert len(z.polygon) >= 3  # at least a triangle
```

- [ ] **Step 2: Run test, expect FAIL**

```bash
pytest backend/tests/test_layout.py -v
```
Expected: ImportError on `backend.layout`.

- [ ] **Step 3: Write stadium_layout.json**

`backend/stadium_layout.json`:
```json
{
  "venue": {
    "id": "chinnaswamy",
    "name": "M. Chinnaswamy Stadium",
    "city": "Bengaluru",
    "capacity": 40000,
    "center": [12.9788, 77.5996]
  },
  "zones": [
    {"id": "stand_a", "name": "Stand A (East)", "type": "stand", "capacity": 8000, "area_m2": 1600, "polygon": [[0,40],[40,40],[40,0],[0,0]]},
    {"id": "stand_b", "name": "Stand B (North)", "type": "stand", "capacity": 8000, "area_m2": 1600, "polygon": [[0,80],[40,80],[40,40],[0,40]]},
    {"id": "stand_c", "name": "Stand C (West)", "type": "stand", "capacity": 8000, "area_m2": 1600, "polygon": [[40,80],[80,80],[80,40],[40,40]]},
    {"id": "stand_d", "name": "Stand D (South)", "type": "stand", "capacity": 8000, "area_m2": 1600, "polygon": [[40,40],[80,40],[80,0],[40,0]]},
    {"id": "concourse_n", "name": "Concourse North", "type": "concourse", "capacity": 1200, "area_m2": 600, "polygon": [[0,90],[80,90],[80,80],[0,80]]},
    {"id": "concourse_s", "name": "Concourse South", "type": "concourse", "capacity": 1200, "area_m2": 600, "polygon": [[0,0],[80,0],[80,-10],[0,-10]]},
    {"id": "concourse_e", "name": "Concourse East", "type": "concourse", "capacity": 800, "area_m2": 400, "polygon": [[-10,80],[0,80],[0,0],[-10,0]]},
    {"id": "concourse_w", "name": "Concourse West", "type": "concourse", "capacity": 800, "area_m2": 400, "polygon": [[80,80],[90,80],[90,0],[80,0]]},
    {"id": "food_court", "name": "Food Court", "type": "concession", "capacity": 400, "area_m2": 300, "polygon": [[-10,30],[-30,30],[-30,50],[-10,50]]},
    {"id": "restroom_n", "name": "Restroom North", "type": "restroom", "capacity": 80, "area_m2": 100, "polygon": [[30,90],[50,90],[50,100],[30,100]]},
    {"id": "restroom_s", "name": "Restroom South", "type": "restroom", "capacity": 80, "area_m2": 100, "polygon": [[30,-10],[50,-10],[50,-20],[30,-20]]}
  ],
  "gates": [
    {"id": "gate_1", "name": "Gate 1", "stand": "stand_a", "position": [-10, 20], "capacity_per_min": 60, "status": "open"},
    {"id": "gate_2", "name": "Gate 2", "stand": "stand_a", "position": [-10, 60], "capacity_per_min": 60, "status": "open"},
    {"id": "gate_3", "name": "Gate 3", "stand": "stand_b", "position": [20, 90], "capacity_per_min": 60, "status": "open"},
    {"id": "gate_4", "name": "Gate 4", "stand": "stand_b", "position": [60, 90], "capacity_per_min": 60, "status": "open"},
    {"id": "gate_5", "name": "Gate 5", "stand": "stand_c", "position": [90, 60], "capacity_per_min": 60, "status": "open"},
    {"id": "gate_6", "name": "Gate 6", "stand": "stand_c", "position": [90, 20], "capacity_per_min": 60, "status": "closed"},
    {"id": "gate_7", "name": "Gate 7", "stand": "stand_d", "position": [60, -10], "capacity_per_min": 60, "status": "open"},
    {"id": "gate_8", "name": "Gate 8", "stand": "stand_d", "position": [20, -10], "capacity_per_min": 60, "status": "open"}
  ],
  "aeds": [
    {"id": "aed_1", "position": [10, 85]},
    {"id": "aed_2", "position": [70, 85]},
    {"id": "aed_3", "position": [10, -5]},
    {"id": "aed_4", "position": [70, -5]}
  ],
  "transit": [
    {"id": "metro_mg_road", "name": "MG Road Metro", "distance_m": 600, "modes": ["walk"]},
    {"id": "metro_cubbon_park", "name": "Cubbon Park Metro", "distance_m": 800, "modes": ["walk"]},
    {"id": "parking_north", "name": "North Parking", "distance_m": 200, "capacity": 800, "modes": ["walk"]}
  ]
}
```

- [ ] **Step 4: Write backend/__init__.py**

```python
```

(Empty file — makes `backend` a package.)

- [ ] **Step 5: Write backend/layout.py**

```python
"""Stadium layout loader — single source of truth for venue geometry."""
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

LAYOUT_PATH = Path(__file__).parent / "stadium_layout.json"

ZoneType = Literal["stand", "concourse", "concession", "restroom"]
GateStatus = Literal["open", "closed", "reserved"]


@dataclass(frozen=True)
class Zone:
    id: str
    name: str
    type: ZoneType
    capacity: int
    area_m2: float
    polygon: list[list[float]]


@dataclass(frozen=True)
class Gate:
    id: str
    name: str
    stand: str
    position: list[float]
    capacity_per_min: int
    status: GateStatus


@dataclass(frozen=True)
class AED:
    id: str
    position: list[float]


@dataclass(frozen=True)
class TransitNode:
    id: str
    name: str
    distance_m: int
    modes: list[str]
    capacity: int | None = None


@dataclass(frozen=True)
class Layout:
    venue_id: str
    venue_name: str
    capacity: int
    zones: list[Zone]
    gates: list[Gate]
    aeds: list[AED]
    transit: list[TransitNode]


def load_layout(path: Path = LAYOUT_PATH) -> Layout:
    raw = json.loads(path.read_text())
    return Layout(
        venue_id=raw["venue"]["id"],
        venue_name=raw["venue"]["name"],
        capacity=raw["venue"]["capacity"],
        zones=[Zone(**z) for z in raw["zones"]],
        gates=[Gate(**g) for g in raw["gates"]],
        aeds=[AED(**a) for a in raw["aeds"]],
        transit=[TransitNode(**t) for t in raw["transit"]],
    )
```

- [ ] **Step 6: Run test, expect PASS**

```bash
pytest backend/tests/test_layout.py -v
```
Expected: 2 passed.

- [ ] **Step 7: Commit**

```bash
git add backend/__init__.py backend/layout.py backend/stadium_layout.json backend/tests/
git commit -m "feat(layout): add stadium layout schema and loader"
```

---

### Task 4: Event bus (in-process Pub/Sub-shaped)

**Files:**
- Create: `backend/event_bus.py`
- Test: `backend/tests/test_event_bus.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_event_bus.py`:
```python
import asyncio
import pytest
from backend.event_bus import EventBus, Event

@pytest.mark.asyncio
async def test_publish_subscribe_delivers_event():
    bus = EventBus()
    received = []

    async def handler(event: Event):
        received.append(event)

    bus.subscribe("density.tick", handler)
    await bus.publish(Event(topic="density.tick", payload={"zone": "stand_a", "los": "C"}))
    await asyncio.sleep(0.01)
    assert len(received) == 1
    assert received[0].payload["zone"] == "stand_a"

@pytest.mark.asyncio
async def test_multiple_subscribers_each_receive():
    bus = EventBus()
    a, b = [], []
    bus.subscribe("alert.fired", lambda e: a.append(e))
    bus.subscribe("alert.fired", lambda e: b.append(e))
    await bus.publish(Event(topic="alert.fired", payload={}))
    await asyncio.sleep(0.01)
    assert len(a) == 1 and len(b) == 1

@pytest.mark.asyncio
async def test_topic_isolation():
    bus = EventBus()
    received = []
    bus.subscribe("a.x", lambda e: received.append(e))
    await bus.publish(Event(topic="b.y", payload={}))
    await asyncio.sleep(0.01)
    assert received == []
```

- [ ] **Step 2: Run test, expect FAIL**

```bash
pytest backend/tests/test_event_bus.py -v
```
Expected: ImportError.

- [ ] **Step 3: Write backend/event_bus.py**

```python
"""In-process event bus. Same shape as Pub/Sub for Phase-1 swap-in.

Topics use dot notation: density.tick, anomaly.detected, protocol.armed, etc.
Subscribers may be sync (callable) or async coroutine functions.
At-least-once semantics; subscriber exceptions are logged, not re-raised.
"""
from __future__ import annotations

import asyncio
import inspect
import logging
import time
import uuid
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable, Union

log = logging.getLogger(__name__)

Handler = Union[Callable[["Event"], None], Callable[["Event"], Awaitable[None]]]


@dataclass
class Event:
    topic: str
    payload: dict[str, Any]
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    ts: float = field(default_factory=time.time)


class EventBus:
    def __init__(self) -> None:
        self._subs: dict[str, list[Handler]] = defaultdict(list)
        self._history: list[Event] = []  # for time-scrubber replay

    def subscribe(self, topic: str, handler: Handler) -> None:
        self._subs[topic].append(handler)

    async def publish(self, event: Event) -> None:
        self._history.append(event)
        for handler in list(self._subs.get(event.topic, [])):
            try:
                result = handler(event)
                if inspect.isawaitable(result):
                    asyncio.create_task(self._await_safely(result, event))
            except Exception:
                log.exception("subscriber failed on %s", event.topic)

    @staticmethod
    async def _await_safely(coro: Awaitable[None], event: Event) -> None:
        try:
            await coro
        except Exception:
            log.exception("async subscriber failed on %s", event.topic)

    def history(self, since_ts: float | None = None) -> list[Event]:
        if since_ts is None:
            return list(self._history)
        return [e for e in self._history if e.ts >= since_ts]


# module-level singleton for app-wide use
bus = EventBus()
```

- [ ] **Step 4: Run tests, expect PASS**

```bash
pytest backend/tests/test_event_bus.py -v
```
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/event_bus.py backend/tests/test_event_bus.py
git commit -m "feat(bus): add in-process event bus with sync+async subscribers"
```

---

### Task 5: Shared schemas + FastAPI skeleton

**Files:**
- Create: `backend/schemas.py`
- Create: `backend/config.py`
- Create: `backend/main.py`
- Test: `backend/tests/test_main.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_main.py`:
```python
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert "venue" in body

def test_layout_endpoint():
    r = client.get("/api/layout")
    assert r.status_code == 200
    body = r.json()
    assert len(body["zones"]) >= 10
    assert len(body["gates"]) >= 6
```

- [ ] **Step 2: Run, expect FAIL**

```bash
pytest backend/tests/test_main.py -v
```
Expected: ImportError on `backend.main`.

- [ ] **Step 3: Write backend/config.py**

```python
"""Runtime settings — loaded from env via pydantic-settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    google_api_key: str = ""
    host: str = "127.0.0.1"
    port: int = 8000
    agent_mode: str = "simulated"  # "real" or "simulated"


settings = Settings()
```

- [ ] **Step 4: Write backend/schemas.py**

```python
"""Pydantic schemas — shared contracts across services and over the wire."""
from typing import Literal
from pydantic import BaseModel, Field

LOS = Literal["A", "B", "C", "D", "E", "F"]
Severity = Literal["info", "warning", "critical"]


class ZoneState(BaseModel):
    zone_id: str
    density_per_m2: float
    los: LOS
    occupancy: int
    capacity: int
    los_forecast_5m: LOS
    los_forecast_10m: LOS
    los_forecast_15m: LOS


class GateState(BaseModel):
    gate_id: str
    queue_length: int
    scans_per_min: int
    status: Literal["open", "closed", "reserved"]
    eta_to_full_min: float | None = None


class Alert(BaseModel):
    id: str
    severity: Severity
    title: str
    body: str
    zone_id: str | None = None
    created_ts: float
    source: str  # "anomaly", "weather", "threat", "operator"


class Protocol(BaseModel):
    id: str
    name: str
    severity: Severity
    armed_ts: float
    confirmed_by: str | None = None
    confirmed_ts: float | None = None
    checklist: list[str]
    trigger_alert_id: str | None = None


class AgentRecommendation(BaseModel):
    id: str
    title: str
    rationale: str
    actions: list[str]
    confidence: float = Field(ge=0, le=1)
    affected_zones: list[str] = []


class FanPush(BaseModel):
    fan_id: str
    section: str
    channel: Literal["push", "sms", "signage"]
    title: str
    body: str
    route_hint: str | None = None
    stagger_offset_sec: int = 0


class WeatherState(BaseModel):
    summary: str
    storm_eta_min: int | None = None
    lightning_within_km: float | None = None
    heat_index_c: float | None = None
    wind_gust_kmh: float | None = None


class ThreatSignal(BaseModel):
    id: str
    summary: str
    severity: Severity
    confidence: float
    sources: list[str]
    distance_km: float | None = None
```

- [ ] **Step 5: Write backend/main.py**

```python
"""FastAPI application entrypoint."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.layout import load_layout


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.layout = load_layout()
    yield


app = FastAPI(title="StadiumOps Command", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "venue": app.state.layout.venue_name,
        "agent_mode": settings.agent_mode,
    }


@app.get("/api/layout")
def get_layout():
    layout = app.state.layout
    return {
        "venue": {"id": layout.venue_id, "name": layout.venue_name, "capacity": layout.capacity},
        "zones": [vars(z) for z in layout.zones],
        "gates": [vars(g) for g in layout.gates],
        "aeds": [vars(a) for a in layout.aeds],
        "transit": [vars(t) for t in layout.transit],
    }
```

- [ ] **Step 6: Run tests, expect PASS**

```bash
pytest backend/tests/test_main.py -v
```
Expected: 2 passed.

- [ ] **Step 7: Smoke run**

```bash
uvicorn backend.main:app --reload --port 8000 &
sleep 1
curl -s http://127.0.0.1:8000/health | python -m json.tool
pkill -f "uvicorn backend.main"
```
Expected: JSON with `"status": "ok"`.

- [ ] **Step 8: Commit**

```bash
git add backend/main.py backend/config.py backend/schemas.py backend/tests/test_main.py
git commit -m "feat(api): scaffold FastAPI app with /health and /api/layout"
```

---

## Milestone B — Simulation core

### Task 6: Crowd simulator (deterministic)

**Files:**
- Create: `backend/services/__init__.py`
- Create: `backend/services/crowd_sim.py`
- Test: `backend/tests/test_crowd_sim.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_crowd_sim.py`:
```python
from backend.layout import load_layout
from backend.services.crowd_sim import CrowdSim

def test_sim_starts_empty():
    sim = CrowdSim(layout=load_layout(), seed=42)
    state = sim.snapshot()
    assert all(z.occupancy == 0 for z in state.zones)

def test_sim_advances_time_and_fills():
    sim = CrowdSim(layout=load_layout(), seed=42)
    for _ in range(30):
        sim.tick(seconds=10)  # advance 5 min total
    state = sim.snapshot()
    total = sum(z.occupancy for z in state.zones)
    assert total > 0, "fans should arrive during pre-match window"

def test_sim_is_deterministic():
    a = CrowdSim(layout=load_layout(), seed=42)
    b = CrowdSim(layout=load_layout(), seed=42)
    for _ in range(20):
        a.tick(seconds=10)
        b.tick(seconds=10)
    sa, sb = a.snapshot(), b.snapshot()
    for za, zb in zip(sa.zones, sb.zones):
        assert za.occupancy == zb.occupancy

def test_inject_surge_increases_zone_density():
    sim = CrowdSim(layout=load_layout(), seed=42)
    for _ in range(30):
        sim.tick(seconds=10)
    before = next(z.occupancy for z in sim.snapshot().zones if z.zone_id == "concourse_n")
    sim.inject_surge(zone_id="concourse_n", magnitude=300)
    sim.tick(seconds=5)
    after = next(z.occupancy for z in sim.snapshot().zones if z.zone_id == "concourse_n")
    assert after > before + 200
```

- [ ] **Step 2: Run, expect FAIL**

```bash
pytest backend/tests/test_crowd_sim.py -v
```
Expected: ImportError.

- [ ] **Step 3: Write backend/services/__init__.py**

```python
```

- [ ] **Step 4: Write backend/services/crowd_sim.py**

```python
"""Deterministic crowd simulator.

Models the match-day curve: pre-match arrivals (0-90 min), in-match steady
(90-300 min), innings break spike (mid), post-match egress (300-360 min).
Each tick advances simulated time; occupancy shifts between gates → concourses
→ stands and back at exit. Surges can be injected for demo.
"""
from __future__ import annotations

import math
import random
from dataclasses import dataclass

from backend.layout import Layout, Zone


@dataclass
class ZoneSnap:
    zone_id: str
    occupancy: int
    capacity: int


@dataclass
class GateSnap:
    gate_id: str
    queue_length: int
    scans_last_min: int


@dataclass
class Snapshot:
    sim_time_sec: int
    phase: str  # "pre", "live", "break", "post"
    zones: list[ZoneSnap]
    gates: list[GateSnap]


# Match-day phases (sim seconds)
PRE_END = 90 * 60       # 0–90 min: arrivals
LIVE_END = 240 * 60     # 90–240 min: live match
BREAK_END = 260 * 60    # 240–260 min: innings break
POST_END = 360 * 60     # 260–360 min: egress


class CrowdSim:
    def __init__(self, layout: Layout, seed: int = 42, total_fans: int = 40000) -> None:
        self.layout = layout
        self.rng = random.Random(seed)
        self.total_fans = total_fans
        self.sim_time_sec = 0
        self._zone_occ: dict[str, int] = {z.id: 0 for z in layout.zones}
        self._gate_queue: dict[str, int] = {g.id: 0 for g in layout.gates}
        self._gate_scans_last_min: dict[str, int] = {g.id: 0 for g in layout.gates}
        self._surge_queue: list[tuple[str, int]] = []  # (zone_id, magnitude)

    @property
    def phase(self) -> str:
        if self.sim_time_sec < PRE_END:
            return "pre"
        if self.sim_time_sec < LIVE_END:
            return "live"
        if self.sim_time_sec < BREAK_END:
            return "break"
        return "post"

    def inject_surge(self, zone_id: str, magnitude: int) -> None:
        self._surge_queue.append((zone_id, magnitude))

    def tick(self, seconds: int = 5) -> Snapshot:
        self.sim_time_sec += seconds
        self._step_arrivals(seconds)
        self._step_movement(seconds)
        self._step_egress(seconds)
        self._apply_surges()
        return self.snapshot()

    def _arrival_rate_per_sec(self) -> float:
        # Bell curve centered ~45 min into pre-match
        if self.phase != "pre":
            return 0.0
        t = self.sim_time_sec
        peak = 45 * 60
        sigma = 20 * 60
        # rate scaled so cumulative ≈ total_fans by PRE_END
        amp = self.total_fans / (sigma * math.sqrt(2 * math.pi))
        return amp * math.exp(-((t - peak) ** 2) / (2 * sigma ** 2))

    def _step_arrivals(self, seconds: int) -> None:
        rate = self._arrival_rate_per_sec()
        arrivals = int(rate * seconds + self.rng.random())
        if arrivals <= 0:
            return
        # Distribute arrivals into gate queues weighted by capacity
        open_gates = [g for g in self.layout.gates if g.status == "open"]
        if not open_gates:
            return
        per_gate = arrivals // len(open_gates)
        leftover = arrivals - per_gate * len(open_gates)
        for i, g in enumerate(open_gates):
            extra = 1 if i < leftover else 0
            self._gate_queue[g.id] += per_gate + extra

    def _step_movement(self, seconds: int) -> None:
        # Gates scan into concourses; concourses move into stands
        per_min = seconds / 60.0
        for g in self.layout.gates:
            if g.status != "open":
                self._gate_scans_last_min[g.id] = 0
                continue
            scans = min(self._gate_queue[g.id], int(g.capacity_per_min * per_min))
            self._gate_queue[g.id] -= scans
            self._gate_scans_last_min[g.id] = int(scans / per_min) if per_min else 0
            # Route scanned fans to the stand's adjacent concourse
            concourse_id = self._concourse_for_stand(g.stand)
            self._zone_occ[concourse_id] += scans
        # Concourse → stand drain (people sit down before play)
        for z in self.layout.zones:
            if z.type != "concourse":
                continue
            drain = int(self._zone_occ[z.id] * 0.15 * per_min)
            self._zone_occ[z.id] -= drain
            stand_id = self._stand_for_concourse(z.id)
            if stand_id:
                cap = next(zz.capacity for zz in self.layout.zones if zz.id == stand_id)
                room = cap - self._zone_occ[stand_id]
                self._zone_occ[stand_id] += min(drain, max(room, 0))

    def _step_egress(self, seconds: int) -> None:
        if self.phase != "post":
            return
        per_min = seconds / 60.0
        # Stands drain to concourses, concourses drain to gates (exits)
        for z in self.layout.zones:
            if z.type != "stand":
                continue
            drain = int(self._zone_occ[z.id] * 0.10 * per_min)
            self._zone_occ[z.id] -= drain
            concourse_id = self._concourse_for_stand(z.id)
            self._zone_occ[concourse_id] += drain
        for z in self.layout.zones:
            if z.type != "concourse":
                continue
            drain = int(self._zone_occ[z.id] * 0.20 * per_min)
            self._zone_occ[z.id] = max(0, self._zone_occ[z.id] - drain)

    def _apply_surges(self) -> None:
        while self._surge_queue:
            zone_id, mag = self._surge_queue.pop()
            if zone_id in self._zone_occ:
                self._zone_occ[zone_id] += mag

    def _concourse_for_stand(self, stand_id: str) -> str:
        mapping = {
            "stand_a": "concourse_e",
            "stand_b": "concourse_n",
            "stand_c": "concourse_w",
            "stand_d": "concourse_s",
        }
        return mapping.get(stand_id, "concourse_n")

    def _stand_for_concourse(self, concourse_id: str) -> str | None:
        mapping = {
            "concourse_e": "stand_a",
            "concourse_n": "stand_b",
            "concourse_w": "stand_c",
            "concourse_s": "stand_d",
        }
        return mapping.get(concourse_id)

    def snapshot(self) -> Snapshot:
        zones = [
            ZoneSnap(zone_id=z.id, occupancy=self._zone_occ[z.id], capacity=z.capacity)
            for z in self.layout.zones
        ]
        gates = [
            GateSnap(
                gate_id=g.id,
                queue_length=self._gate_queue[g.id],
                scans_last_min=self._gate_scans_last_min[g.id],
            )
            for g in self.layout.gates
        ]
        return Snapshot(
            sim_time_sec=self.sim_time_sec,
            phase=self.phase,
            zones=zones,
            gates=gates,
        )
```

- [ ] **Step 5: Run tests, expect PASS**

```bash
pytest backend/tests/test_crowd_sim.py -v
```
Expected: 4 passed.

- [ ] **Step 6: Commit**

```bash
git add backend/services/__init__.py backend/services/crowd_sim.py backend/tests/test_crowd_sim.py
git commit -m "feat(sim): add deterministic crowd simulator with phase model"
```

---

### Task 7: Density service (Fruin LOS + forecast)

**Files:**
- Create: `backend/services/density.py`
- Test: `backend/tests/test_density.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_density.py`:
```python
from backend.services.density import classify_los, DensityService
from backend.layout import load_layout
from backend.services.crowd_sim import CrowdSim, Snapshot, ZoneSnap, GateSnap

def test_fruin_los_thresholds():
    # Fruin pedestrian LOS for queue / standing: A < 0.3, B < 0.45, C < 0.7,
    # D < 1.0, E < 2.0, F >= 2.0 (people per m²)
    assert classify_los(0.1) == "A"
    assert classify_los(0.4) == "B"
    assert classify_los(0.6) == "C"
    assert classify_los(0.9) == "D"
    assert classify_los(1.5) == "E"
    assert classify_los(3.0) == "F"

def test_density_service_emits_zone_states():
    layout = load_layout()
    svc = DensityService(layout=layout)
    snap = Snapshot(
        sim_time_sec=0, phase="live",
        zones=[ZoneSnap(zone_id="stand_a", occupancy=8000, capacity=8000)] +
              [ZoneSnap(zone_id=z.id, occupancy=0, capacity=z.capacity) for z in layout.zones if z.id != "stand_a"],
        gates=[GateSnap(gate_id=g.id, queue_length=0, scans_last_min=0) for g in layout.gates],
    )
    states = svc.compute(snap)
    a = next(s for s in states if s.zone_id == "stand_a")
    assert a.density_per_m2 == 5.0  # 8000 / 1600 m²
    assert a.los == "F"

def test_forecast_uses_recent_trend():
    layout = load_layout()
    svc = DensityService(layout=layout)
    # Feed three increasing snapshots
    for occ in (1000, 1500, 2000):
        snap = Snapshot(sim_time_sec=0, phase="pre",
            zones=[ZoneSnap(zone_id="concourse_n", occupancy=occ, capacity=1200)] +
                  [ZoneSnap(zone_id=z.id, occupancy=0, capacity=z.capacity) for z in layout.zones if z.id != "concourse_n"],
            gates=[GateSnap(gate_id=g.id, queue_length=0, scans_last_min=0) for g in layout.gates])
        states = svc.compute(snap)
    c = next(s for s in states if s.zone_id == "concourse_n")
    # current density already F (2000/600 > 3); forecast must stay F or worsen
    assert c.los_forecast_5m in ("E", "F")
```

- [ ] **Step 2: Run, expect FAIL**

```bash
pytest backend/tests/test_density.py -v
```

- [ ] **Step 3: Write backend/services/density.py**

```python
"""L1 — Predictive Density (Fruin LOS + 5/10/15-min forecast).

Fruin pedestrian Level of Service thresholds (people/m²):
  A < 0.3    free flow
  B < 0.45   minor crowding
  C < 0.7    reduced speed
  D < 1.0    restricted
  E < 2.0    severely restricted
  F >= 2.0   critical / crush risk
"""
from __future__ import annotations

from collections import deque
from typing import Iterable

from backend.layout import Layout
from backend.schemas import LOS, ZoneState
from backend.services.crowd_sim import Snapshot

LOS_THRESHOLDS: list[tuple[float, LOS]] = [
    (0.3, "A"),
    (0.45, "B"),
    (0.7, "C"),
    (1.0, "D"),
    (2.0, "E"),
]


def classify_los(density_per_m2: float) -> LOS:
    for threshold, grade in LOS_THRESHOLDS:
        if density_per_m2 < threshold:
            return grade
    return "F"


class DensityService:
    """Computes Fruin LOS + forecasts per zone.

    Forecast uses exponential smoothing on a sliding window of recent samples.
    Phase-1 swap: Vertex AI time-series model.
    """

    WINDOW = 6  # ~30 s of ticks at 5 s cadence

    def __init__(self, layout: Layout) -> None:
        self.layout = layout
        self._history: dict[str, deque[float]] = {
            z.id: deque(maxlen=self.WINDOW) for z in layout.zones
        }
        self._area: dict[str, float] = {z.id: z.area_m2 for z in layout.zones}
        self._cap: dict[str, int] = {z.id: z.capacity for z in layout.zones}

    def compute(self, snap: Snapshot) -> list[ZoneState]:
        out: list[ZoneState] = []
        for z in snap.zones:
            area = self._area[z.zone_id]
            density = z.occupancy / area if area > 0 else 0.0
            self._history[z.zone_id].append(density)
            forecast = self._forecast(z.zone_id, density)
            out.append(ZoneState(
                zone_id=z.zone_id,
                density_per_m2=round(density, 3),
                los=classify_los(density),
                occupancy=z.occupancy,
                capacity=self._cap[z.zone_id],
                los_forecast_5m=classify_los(forecast[0]),
                los_forecast_10m=classify_los(forecast[1]),
                los_forecast_15m=classify_los(forecast[2]),
            ))
        return out

    def _forecast(self, zone_id: str, current: float) -> tuple[float, float, float]:
        hist = list(self._history[zone_id])
        if len(hist) < 2:
            return current, current, current
        # First-order exponential smoothing: trend = avg delta
        deltas = [hist[i] - hist[i - 1] for i in range(1, len(hist))]
        trend_per_tick = sum(deltas) / len(deltas)
        # Tick assumed 5 s; project ahead in tick units
        ticks_5m = 60
        ticks_10m = 120
        ticks_15m = 180
        return (
            max(0.0, current + trend_per_tick * ticks_5m),
            max(0.0, current + trend_per_tick * ticks_10m),
            max(0.0, current + trend_per_tick * ticks_15m),
        )
```

- [ ] **Step 4: Run tests, expect PASS**

```bash
pytest backend/tests/test_density.py -v
```
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/services/density.py backend/tests/test_density.py
git commit -m "feat(density): add Fruin LOS classifier and trend-based forecast"
```

---

### Task 8: Anomaly engine (L3)

**Files:**
- Create: `backend/services/anomaly.py`
- Test: `backend/tests/test_anomaly.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_anomaly.py`:
```python
import asyncio
import pytest
from backend.event_bus import EventBus, Event
from backend.services.anomaly import AnomalyEngine
from backend.schemas import ZoneState

@pytest.mark.asyncio
async def test_anomaly_fires_on_los_e_or_f():
    bus = EventBus()
    engine = AnomalyEngine(bus=bus)
    received = []
    bus.subscribe("anomaly.detected", lambda e: received.append(e))
    states = [ZoneState(
        zone_id="concourse_n", density_per_m2=2.5, los="F",
        occupancy=1500, capacity=1200,
        los_forecast_5m="F", los_forecast_10m="F", los_forecast_15m="F",
    )]
    await engine.evaluate(states)
    await asyncio.sleep(0.01)
    assert len(received) == 1
    assert received[0].payload["zone_id"] == "concourse_n"
    assert received[0].payload["severity"] == "critical"

@pytest.mark.asyncio
async def test_no_anomaly_on_los_c_or_below():
    bus = EventBus()
    engine = AnomalyEngine(bus=bus)
    received = []
    bus.subscribe("anomaly.detected", lambda e: received.append(e))
    states = [ZoneState(
        zone_id="stand_a", density_per_m2=0.5, los="C",
        occupancy=800, capacity=8000,
        los_forecast_5m="C", los_forecast_10m="C", los_forecast_15m="C",
    )]
    await engine.evaluate(states)
    await asyncio.sleep(0.01)
    assert received == []

@pytest.mark.asyncio
async def test_anomaly_dedup_within_window():
    bus = EventBus()
    engine = AnomalyEngine(bus=bus, dedup_window_sec=30)
    received = []
    bus.subscribe("anomaly.detected", lambda e: received.append(e))
    bad = [ZoneState(zone_id="z", density_per_m2=3, los="F",
        occupancy=100, capacity=50,
        los_forecast_5m="F", los_forecast_10m="F", los_forecast_15m="F")]
    await engine.evaluate(bad)
    await engine.evaluate(bad)
    await asyncio.sleep(0.01)
    assert len(received) == 1
```

- [ ] **Step 2: Run, expect FAIL**

```bash
pytest backend/tests/test_anomaly.py -v
```

- [ ] **Step 3: Write backend/services/anomaly.py**

```python
"""L3 — Behavioural anomaly engine.

Phase 0: detects density anomalies (LOS E/F) and forecast anomalies (LOS D
projected to E within 10m). Emits `anomaly.detected` events.
Phase 1+: ingests G5 edge CV signals (counter-flow, sway, dwell).
"""
from __future__ import annotations

import time
import uuid
from dataclasses import dataclass

from backend.event_bus import EventBus, Event
from backend.schemas import LOS, Severity, ZoneState


@dataclass
class AnomalyRecord:
    zone_id: str
    last_fired_ts: float


class AnomalyEngine:
    def __init__(self, bus: EventBus, dedup_window_sec: int = 60) -> None:
        self.bus = bus
        self.dedup_window_sec = dedup_window_sec
        self._last: dict[str, float] = {}

    async def evaluate(self, states: list[ZoneState]) -> None:
        now = time.time()
        for s in states:
            severity = self._severity_for(s)
            if not severity:
                continue
            last = self._last.get(s.zone_id, 0)
            if now - last < self.dedup_window_sec:
                continue
            self._last[s.zone_id] = now
            await self.bus.publish(Event(
                topic="anomaly.detected",
                payload={
                    "id": str(uuid.uuid4()),
                    "zone_id": s.zone_id,
                    "severity": severity,
                    "los": s.los,
                    "los_forecast_5m": s.los_forecast_5m,
                    "density_per_m2": s.density_per_m2,
                    "reason": self._reason(s),
                },
            ))

    @staticmethod
    def _severity_for(s: ZoneState) -> Severity | None:
        if s.los == "F":
            return "critical"
        if s.los == "E":
            return "warning"
        if s.los == "D" and s.los_forecast_10m in ("E", "F"):
            return "warning"
        return None

    @staticmethod
    def _reason(s: ZoneState) -> str:
        if s.los == "F":
            return f"Critical density {s.density_per_m2:.1f}/m² in {s.zone_id} — crush risk"
        if s.los == "E":
            return f"Severe density {s.density_per_m2:.1f}/m² in {s.zone_id}"
        return f"Density rising in {s.zone_id}; forecast {s.los_forecast_10m} at +10 min"
```

- [ ] **Step 4: Run tests, expect PASS**

```bash
pytest backend/tests/test_anomaly.py -v
```

- [ ] **Step 5: Commit**

```bash
git add backend/services/anomaly.py backend/tests/test_anomaly.py
git commit -m "feat(anomaly): add LOS-based anomaly detection with dedup"
```

---

### Task 9: Orchestrator — wires sim → density → anomaly on a clock

**Files:**
- Create: `backend/services/orchestrator.py`
- Test: `backend/tests/test_orchestrator.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_orchestrator.py`:
```python
import asyncio
import pytest
from backend.event_bus import EventBus
from backend.layout import load_layout
from backend.services.crowd_sim import CrowdSim
from backend.services.density import DensityService
from backend.services.anomaly import AnomalyEngine
from backend.services.orchestrator import Orchestrator

@pytest.mark.asyncio
async def test_orchestrator_emits_density_tick():
    bus = EventBus()
    layout = load_layout()
    sim = CrowdSim(layout=layout, seed=42)
    orch = Orchestrator(
        bus=bus,
        sim=sim,
        density=DensityService(layout=layout),
        anomaly=AnomalyEngine(bus=bus),
        sim_tick_sec=10,
    )
    received = []
    bus.subscribe("density.tick", lambda e: received.append(e))
    await orch.step()
    await asyncio.sleep(0.01)
    assert len(received) == 1
    payload = received[0].payload
    assert "zones" in payload and len(payload["zones"]) >= 10

@pytest.mark.asyncio
async def test_orchestrator_forwards_surge_to_anomaly():
    bus = EventBus()
    layout = load_layout()
    sim = CrowdSim(layout=layout, seed=42, total_fans=40000)
    orch = Orchestrator(
        bus=bus, sim=sim,
        density=DensityService(layout=layout),
        anomaly=AnomalyEngine(bus=bus),
        sim_tick_sec=10,
    )
    anomalies = []
    bus.subscribe("anomaly.detected", lambda e: anomalies.append(e))
    # Run pre-match for a while to populate, then surge
    for _ in range(20):
        await orch.step()
    sim.inject_surge("concourse_n", magnitude=5000)
    await orch.step()
    await asyncio.sleep(0.05)
    assert any(a.payload["zone_id"] == "concourse_n" for a in anomalies)
```

- [ ] **Step 2: Run, expect FAIL**

```bash
pytest backend/tests/test_orchestrator.py -v
```

- [ ] **Step 3: Write backend/services/orchestrator.py**

```python
"""Demo orchestrator — drives the clock and chains sim → density → anomaly.

In production, each service is a separate Cloud Run instance subscribing to
Pub/Sub topics. Phase 0: this class wires them in-process.
"""
from __future__ import annotations

import asyncio

from backend.event_bus import EventBus, Event
from backend.services.crowd_sim import CrowdSim
from backend.services.density import DensityService
from backend.services.anomaly import AnomalyEngine


class Orchestrator:
    def __init__(
        self,
        bus: EventBus,
        sim: CrowdSim,
        density: DensityService,
        anomaly: AnomalyEngine,
        sim_tick_sec: int = 5,
    ) -> None:
        self.bus = bus
        self.sim = sim
        self.density = density
        self.anomaly = anomaly
        self.sim_tick_sec = sim_tick_sec
        self._running = False

    async def step(self) -> None:
        snap = self.sim.tick(seconds=self.sim_tick_sec)
        states = self.density.compute(snap)
        await self.bus.publish(Event(
            topic="density.tick",
            payload={
                "sim_time_sec": snap.sim_time_sec,
                "phase": snap.phase,
                "zones": [s.model_dump() for s in states],
                "gates": [g.__dict__ for g in snap.gates],
            },
        ))
        await self.anomaly.evaluate(states)

    async def run_forever(self, real_seconds_per_tick: float = 1.0) -> None:
        self._running = True
        while self._running:
            await self.step()
            await asyncio.sleep(real_seconds_per_tick)

    def stop(self) -> None:
        self._running = False
```

- [ ] **Step 4: Run tests, expect PASS**

```bash
pytest backend/tests/test_orchestrator.py -v
```

- [ ] **Step 5: Commit**

```bash
git add backend/services/orchestrator.py backend/tests/test_orchestrator.py
git commit -m "feat(orchestrator): wire sim → density → anomaly on async clock"
```

---

### Task 10: State store + time scrubber

**Files:**
- Create: `backend/services/state_store.py`
- Test: `backend/tests/test_state_store.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_state_store.py`:
```python
import time
from backend.services.state_store import StateStore

def test_store_appends_and_returns_latest():
    s = StateStore()
    s.record(ts=1.0, kind="density", payload={"a": 1})
    s.record(ts=2.0, kind="density", payload={"a": 2})
    assert s.latest("density")["a"] == 2

def test_scrub_returns_state_at_or_before_ts():
    s = StateStore()
    s.record(ts=10.0, kind="density", payload={"v": "ten"})
    s.record(ts=20.0, kind="density", payload={"v": "twenty"})
    s.record(ts=30.0, kind="density", payload={"v": "thirty"})
    assert s.at(ts=15.0, kind="density")["v"] == "ten"
    assert s.at(ts=25.0, kind="density")["v"] == "twenty"
    assert s.at(ts=99.0, kind="density")["v"] == "thirty"

def test_prune_keeps_only_window():
    s = StateStore(window_sec=10)
    now = time.time()
    s.record(ts=now - 100, kind="density", payload={"old": True})
    s.record(ts=now, kind="density", payload={"new": True})
    s.prune()
    history = s.history("density")
    assert len(history) == 1
    assert history[0][1] == {"new": True}
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Write backend/services/state_store.py**

```python
"""In-memory time-indexed state store for time scrubber + replay.

Phase 1 swap: BigQuery for long-term, Firestore for hot state.
"""
from __future__ import annotations

import bisect
import time
from collections import defaultdict
from typing import Any


class StateStore:
    def __init__(self, window_sec: int = 3600) -> None:
        self.window_sec = window_sec
        # kind → sorted list of (ts, payload)
        self._data: dict[str, list[tuple[float, dict[str, Any]]]] = defaultdict(list)

    def record(self, ts: float, kind: str, payload: dict[str, Any]) -> None:
        self._data[kind].append((ts, payload))

    def latest(self, kind: str) -> dict[str, Any] | None:
        items = self._data.get(kind)
        return items[-1][1] if items else None

    def at(self, ts: float, kind: str) -> dict[str, Any] | None:
        items = self._data.get(kind, [])
        if not items:
            return None
        keys = [t for t, _ in items]
        idx = bisect.bisect_right(keys, ts) - 1
        if idx < 0:
            return None
        return items[idx][1]

    def history(self, kind: str) -> list[tuple[float, dict[str, Any]]]:
        return list(self._data.get(kind, []))

    def prune(self) -> None:
        cutoff = time.time() - self.window_sec
        for kind, items in self._data.items():
            self._data[kind] = [(t, p) for t, p in items if t >= cutoff]
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add backend/services/state_store.py backend/tests/test_state_store.py
git commit -m "feat(state): add time-indexed store for scrubber and replay"
```

---

### Task 11: Wire orchestrator into FastAPI lifespan + state store subscriber

**Files:**
- Modify: `backend/main.py`

- [ ] **Step 1: Update `backend/main.py`**

Replace the entire file with:
```python
"""FastAPI application entrypoint with live simulator."""
import asyncio
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.event_bus import bus, Event
from backend.layout import load_layout
from backend.services.crowd_sim import CrowdSim
from backend.services.density import DensityService
from backend.services.anomaly import AnomalyEngine
from backend.services.orchestrator import Orchestrator
from backend.services.state_store import StateStore


@asynccontextmanager
async def lifespan(app: FastAPI):
    layout = load_layout()
    app.state.layout = layout
    app.state.bus = bus
    app.state.store = StateStore()
    sim = CrowdSim(layout=layout, seed=42, total_fans=40000)
    app.state.sim = sim
    app.state.orch = Orchestrator(
        bus=bus,
        sim=sim,
        density=DensityService(layout=layout),
        anomaly=AnomalyEngine(bus=bus),
        sim_tick_sec=10,
    )

    # Subscribe state store to every event for scrubber/replay
    def record(e: Event) -> None:
        app.state.store.record(ts=e.ts, kind=e.topic, payload=e.payload)

    for topic in ("density.tick", "anomaly.detected", "protocol.armed",
                  "comms.broadcast", "weather.alert", "threat.signal"):
        bus.subscribe(topic, record)

    task = asyncio.create_task(app.state.orch.run_forever(real_seconds_per_tick=1.0))
    try:
        yield
    finally:
        app.state.orch.stop()
        task.cancel()


app = FastAPI(title="StadiumOps Command", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "venue": app.state.layout.venue_name,
        "agent_mode": settings.agent_mode,
        "sim_time_sec": app.state.sim.sim_time_sec,
        "phase": app.state.sim.phase,
    }


@app.get("/api/layout")
def get_layout():
    layout = app.state.layout
    return {
        "venue": {"id": layout.venue_id, "name": layout.venue_name, "capacity": layout.capacity},
        "zones": [vars(z) for z in layout.zones],
        "gates": [vars(g) for g in layout.gates],
        "aeds": [vars(a) for a in layout.aeds],
        "transit": [vars(t) for t in layout.transit],
    }


@app.get("/api/state")
def get_state():
    return {
        "density": app.state.store.latest("density.tick"),
        "phase": app.state.sim.phase,
        "sim_time_sec": app.state.sim.sim_time_sec,
    }
```

- [ ] **Step 2: Smoke run**

```bash
uvicorn backend.main:app --port 8000 &
sleep 3
curl -s http://127.0.0.1:8000/api/state | python -m json.tool
pkill -f "uvicorn backend.main"
```
Expected: JSON with `density` populated after a few seconds.

- [ ] **Step 3: Commit**

```bash
git add backend/main.py
git commit -m "feat(api): wire orchestrator into lifespan + state store subscriber"
```

---

## Milestone C — AI agent, protocol engine, comms bus

### Task 12: AI agent service (Gemini grounded + simulated fallback)

**Files:**
- Create: `backend/services/agent.py`
- Test: `backend/tests/test_agent.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_agent.py`:
```python
import pytest
from backend.services.agent import AIAgent, AgentResponse

@pytest.mark.asyncio
async def test_simulated_agent_returns_recommendation():
    agent = AIAgent(mode="simulated")
    resp = await agent.recommend(
        context="LOS=F detected at concourse_n with 2.5 ppl/m² and forecast +10m=F",
    )
    assert isinstance(resp, AgentResponse)
    assert resp.title and resp.rationale
    assert 0 <= resp.confidence <= 1
    assert len(resp.actions) >= 1

@pytest.mark.asyncio
async def test_simulated_agent_narrates():
    agent = AIAgent(mode="simulated")
    narration = await agent.narrate("Surge at Gate 4")
    assert isinstance(narration, str)
    assert len(narration) > 10
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Write backend/services/agent.py**

```python
"""AI Agent — Gemini 2.0 Flash with Google Search grounding (tactical).

Modes:
  real      — calls Gemini; uses google_search grounding tool
  simulated — returns canned, structured responses (no network, deterministic)

The simulated mode is used in tests and when GOOGLE_API_KEY is missing.
"""
from __future__ import annotations

import json
import os
import re
import uuid
from dataclasses import dataclass

from backend.config import settings


@dataclass
class AgentResponse:
    id: str
    title: str
    rationale: str
    actions: list[str]
    confidence: float
    affected_zones: list[str]


SYSTEM_PROMPT = """You are the tactical AI co-pilot for a stadium command center.
You receive live density/anomaly/weather/threat context and recommend operator
actions. Be specific, time-bounded, and explain reasoning. Never authorize
fan-facing broadcasts autonomously — every action requires operator confirmation.

Output STRICT JSON with this schema:
{
  "title": "short imperative — e.g., Open Gate 6, reroute via West Concourse",
  "rationale": "1-3 sentences explaining the why, citing density/forecast/weather",
  "actions": ["concrete operator-executable step", "..."],
  "confidence": 0.0 to 1.0,
  "affected_zones": ["zone_id", ...]
}
"""


class AIAgent:
    def __init__(self, mode: str | None = None) -> None:
        self.mode = mode or settings.agent_mode
        if self.mode == "real" and not settings.google_api_key:
            self.mode = "simulated"
        self._client = None
        if self.mode == "real":
            from google import genai
            self._client = genai.Client(api_key=settings.google_api_key)

    async def recommend(self, context: str) -> AgentResponse:
        if self.mode == "simulated":
            return self._simulate(context)
        return await self._call_gemini(context)

    async def narrate(self, event_text: str) -> str:
        if self.mode == "simulated":
            return f"Operator note: {event_text}. Recommend verifying via CCTV."
        prompt = (
            "Narrate this stadium event in one sentence of calm, operational language "
            "for a command-center log: " + event_text
        )
        # Sync call wrapped — google-genai client is sync
        resp = self._client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt,
        )
        return (resp.text or "").strip()

    def _simulate(self, context: str) -> AgentResponse:
        # Deterministic canned responses keyed off keywords
        c = context.lower()
        if "concourse_n" in c or "gate_4" in c:
            return AgentResponse(
                id=str(uuid.uuid4()),
                title="Open Gate 6, reroute Section B via West Concourse",
                rationale="Concourse North at LOS F with forecast worsening. "
                          "Gate 6 currently closed has spare capacity. West Concourse uncrowded.",
                actions=[
                    "Open Gate 6",
                    "Push F6 calm-path to Section B fans, staggered 90s sub-groups",
                    "Dispatch Team Alpha to direct flow at Concourse North",
                ],
                confidence=0.84,
                affected_zones=["concourse_n", "stand_b"],
            )
        if "storm" in c or "weather" in c:
            return AgentResponse(
                id=str(uuid.uuid4()),
                title="Arm STORM_INBOUND protocol, covered-concourse routing",
                rationale="Storm cell ETA under 15 min with lightning within 8 km. "
                          "Open-stand sections at risk; covered concourses available.",
                actions=[
                    "Arm STORM_INBOUND SOP",
                    "Push F6 covered-concourse routing to open-stand sections",
                    "Halt drone shows; ground all aerial operations",
                ],
                confidence=0.91,
                affected_zones=["stand_a", "stand_b", "stand_c", "stand_d"],
            )
        if "drone" in c or "threat" in c:
            return AgentResponse(
                id=str(uuid.uuid4()),
                title="Notify police; arm UNAUTHORIZED_DRONE protocol",
                rationale="Airspace adapter reports unauthorized drone within perimeter. "
                          "Per L7, police lead; ops support with shelter routing.",
                actions=[
                    "Notify police agency channel",
                    "Arm UNAUTHORIZED_DRONE SOP",
                    "Hold any planned fan broadcasts pending agency clearance",
                ],
                confidence=0.78,
                affected_zones=[],
            )
        return AgentResponse(
            id=str(uuid.uuid4()),
            title="Continue monitoring",
            rationale="No critical signals. Maintain current dispatch posture.",
            actions=["Monitor density forecast every 60s"],
            confidence=0.6,
            affected_zones=[],
        )

    async def _call_gemini(self, context: str) -> AgentResponse:
        prompt = f"{SYSTEM_PROMPT}\n\nLive context:\n{context}\n\nRespond with JSON only."
        resp = self._client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt,
        )
        text = resp.text or ""
        data = self._extract_json(text)
        return AgentResponse(
            id=str(uuid.uuid4()),
            title=data.get("title", "Continue monitoring"),
            rationale=data.get("rationale", ""),
            actions=data.get("actions", []),
            confidence=float(data.get("confidence", 0.5)),
            affected_zones=data.get("affected_zones", []),
        )

    @staticmethod
    def _extract_json(text: str) -> dict:
        # Strip markdown fences if present
        cleaned = re.sub(r"```(?:json)?\n?", "", text).strip("`\n ")
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if not match:
            return {}
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            return {}
```

- [ ] **Step 4: Run tests, expect PASS**

```bash
pytest backend/tests/test_agent.py -v
```

- [ ] **Step 5: Commit**

```bash
git add backend/services/agent.py backend/tests/test_agent.py
git commit -m "feat(agent): add Gemini AI agent with simulated fallback mode"
```

---

### Task 13: Protocol engine (L5) — SOP catalog + auto-arm

**Files:**
- Create: `backend/services/protocol.py`
- Test: `backend/tests/test_protocol.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_protocol.py`:
```python
import asyncio
import pytest
from backend.event_bus import EventBus, Event
from backend.services.protocol import ProtocolEngine

@pytest.mark.asyncio
async def test_critical_anomaly_arms_crush_protocol():
    bus = EventBus()
    engine = ProtocolEngine(bus=bus)
    armed = []
    bus.subscribe("protocol.armed", lambda e: armed.append(e))
    engine.attach()
    await bus.publish(Event(topic="anomaly.detected", payload={
        "zone_id": "concourse_n", "severity": "critical",
        "los": "F", "density_per_m2": 2.5, "reason": "crush risk",
    }))
    await asyncio.sleep(0.05)
    assert len(armed) == 1
    assert armed[0].payload["sop"] == "CROWD_CRUSH_RISK"
    assert armed[0].payload["confirmed_by"] is None

@pytest.mark.asyncio
async def test_storm_alert_arms_storm_protocol():
    bus = EventBus()
    engine = ProtocolEngine(bus=bus)
    armed = []
    bus.subscribe("protocol.armed", lambda e: armed.append(e))
    engine.attach()
    await bus.publish(Event(topic="weather.alert", payload={
        "summary": "Storm cell approaching", "storm_eta_min": 12,
        "lightning_within_km": 8.0,
    }))
    await asyncio.sleep(0.05)
    assert any(a.payload["sop"] == "STORM_INBOUND" for a in armed)

@pytest.mark.asyncio
async def test_confirm_protocol_emits_confirmed_event():
    bus = EventBus()
    engine = ProtocolEngine(bus=bus)
    confirmed = []
    bus.subscribe("protocol.confirmed", lambda e: confirmed.append(e))
    engine.attach()
    # Trigger an arm
    await bus.publish(Event(topic="anomaly.detected", payload={
        "zone_id": "z", "severity": "critical", "los": "F",
        "density_per_m2": 3.0, "reason": "test",
    }))
    await asyncio.sleep(0.05)
    proto_id = next(iter(engine.armed.keys()))
    await engine.confirm(proto_id, operator="ops.commander.test")
    await asyncio.sleep(0.05)
    assert confirmed[0].payload["confirmed_by"] == "ops.commander.test"
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Write backend/services/protocol.py**

```python
"""L5 — Protocol engine: SOP catalog + auto-arm on trigger events.

SOPs are pre-built playbooks. The engine subscribes to bus events and arms the
matching SOP. Arming creates a Protocol record; the operator must confirm
before any externally-visible action runs. Every confirm/dismiss is audited.
"""
from __future__ import annotations

import asyncio
import time
import uuid
from dataclasses import dataclass, field
from typing import Any

from backend.event_bus import EventBus, Event


@dataclass
class SOP:
    id: str
    name: str
    severity: str
    checklist: list[str]


SOP_CATALOG: dict[str, SOP] = {
    "CROWD_CRUSH_RISK": SOP(
        id="CROWD_CRUSH_RISK",
        name="Crowd Crush Risk Mitigation",
        severity="critical",
        checklist=[
            "Halt inbound at affected gate(s)",
            "Open relief gate / alternative route",
            "Dispatch crowd marshals to redirect",
            "Push F6 calm-path to affected sections, staggered",
            "Notify EMS to standby",
        ],
    ),
    "STORM_INBOUND": SOP(
        id="STORM_INBOUND",
        name="Storm Inbound",
        severity="critical",
        checklist=[
            "Announce lightning hold via PA + jumbotron",
            "Route open-stand sections to covered concourses",
            "Halt drone shows / ground all aerial",
            "Secure loose equipment",
            "Standby evacuation if escalates",
        ],
    ),
    "HEAT_RISK": SOP(
        id="HEAT_RISK",
        name="Heat Index Risk",
        severity="warning",
        checklist=[
            "Open additional hydration points",
            "Push F5 hydration reminder to all fans",
            "Deploy roving water teams to sun-exposed sections",
        ],
    ),
    "UNAUTHORIZED_DRONE": SOP(
        id="UNAUTHORIZED_DRONE",
        name="Unauthorized Drone Detected",
        severity="critical",
        checklist=[
            "Notify police agency channel",
            "Verify via airspace radar + visual",
            "Hold any fan broadcasts pending agency clearance",
            "Standby shelter-in-place protocol",
        ],
    ),
    "MEDICAL_MASS_CASUALTY": SOP(
        id="MEDICAL_MASS_CASUALTY",
        name="Medical Mass Casualty",
        severity="critical",
        checklist=[
            "Activate hospital diversion plan",
            "Deploy all on-duty paramedics + AEDs",
            "Open dedicated EMS egress lane",
            "Notify regional EMS coordinator",
        ],
    ),
    "PITCH_INVASION": SOP(
        id="PITCH_INVASION",
        name="Pitch Invasion",
        severity="warning",
        checklist=[
            "Deploy ground security to perimeter",
            "Hold play; coordinate with match officials",
            "Identify and escort invader",
        ],
    ),
}


@dataclass
class Protocol:
    id: str
    sop: str
    name: str
    severity: str
    checklist: list[str]
    armed_ts: float
    trigger: dict[str, Any]
    confirmed_by: str | None = None
    confirmed_ts: float | None = None


class ProtocolEngine:
    def __init__(self, bus: EventBus) -> None:
        self.bus = bus
        self.armed: dict[str, Protocol] = {}

    def attach(self) -> None:
        self.bus.subscribe("anomaly.detected", self._on_anomaly)
        self.bus.subscribe("weather.alert", self._on_weather)
        self.bus.subscribe("threat.signal", self._on_threat)

    async def _on_anomaly(self, e: Event) -> None:
        p = e.payload
        if p.get("severity") == "critical" and p.get("los") in ("E", "F"):
            await self._arm("CROWD_CRUSH_RISK", trigger=p)

    async def _on_weather(self, e: Event) -> None:
        p = e.payload
        if (p.get("storm_eta_min") or 999) < 20 or (p.get("lightning_within_km") or 99) < 10:
            await self._arm("STORM_INBOUND", trigger=p)
        if (p.get("heat_index_c") or 0) > 38:
            await self._arm("HEAT_RISK", trigger=p)

    async def _on_threat(self, e: Event) -> None:
        p = e.payload
        if "drone" in p.get("summary", "").lower():
            await self._arm("UNAUTHORIZED_DRONE", trigger=p)

    async def _arm(self, sop_id: str, trigger: dict[str, Any]) -> None:
        sop = SOP_CATALOG[sop_id]
        # Dedup: don't re-arm same SOP within 5 min
        for p in self.armed.values():
            if p.sop == sop_id and time.time() - p.armed_ts < 300 and p.confirmed_by is None:
                return
        proto = Protocol(
            id=str(uuid.uuid4()),
            sop=sop.id,
            name=sop.name,
            severity=sop.severity,
            checklist=list(sop.checklist),
            armed_ts=time.time(),
            trigger=trigger,
        )
        self.armed[proto.id] = proto
        await self.bus.publish(Event(
            topic="protocol.armed",
            payload={
                "id": proto.id, "sop": proto.sop, "name": proto.name,
                "severity": proto.severity, "checklist": proto.checklist,
                "trigger": proto.trigger, "confirmed_by": None,
            },
        ))

    async def confirm(self, proto_id: str, operator: str) -> None:
        proto = self.armed.get(proto_id)
        if not proto or proto.confirmed_by:
            return
        proto.confirmed_by = operator
        proto.confirmed_ts = time.time()
        await self.bus.publish(Event(
            topic="protocol.confirmed",
            payload={
                "id": proto.id, "sop": proto.sop,
                "confirmed_by": operator,
                "confirmed_ts": proto.confirmed_ts,
            },
        ))
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add backend/services/protocol.py backend/tests/test_protocol.py
git commit -m "feat(protocol): add SOP catalog with auto-arm + operator confirm"
```

---

### Task 14: Comms bus (L6) — staggered fan-out

**Files:**
- Create: `backend/services/comms.py`
- Test: `backend/tests/test_comms.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_comms.py`:
```python
import asyncio
import pytest
from backend.event_bus import EventBus
from backend.services.comms import CommsBus, Broadcast

@pytest.mark.asyncio
async def test_broadcast_creates_staggered_messages():
    bus = EventBus()
    comms = CommsBus(bus=bus)
    sent = []
    bus.subscribe("comms.broadcast", lambda e: sent.append(e))
    bc = Broadcast(
        title="Move calmly to West Concourse",
        body="Take the West Concourse, 3-minute walk, calm pace.",
        sections=["stand_b", "stand_c"],
        channels=["push", "sms"],
        stagger_sec=90,
    )
    await comms.send(bc, draft_by="ops.commander.test")
    await asyncio.sleep(0.05)
    # 2 sections × 2 channels = 4 events
    assert len(sent) == 4
    offsets = sorted(e.payload["stagger_offset_sec"] for e in sent)
    assert 0 in offsets and 90 in offsets

@pytest.mark.asyncio
async def test_broadcast_requires_operator():
    bus = EventBus()
    comms = CommsBus(bus=bus)
    with pytest.raises(ValueError):
        await comms.send(Broadcast(title="x", body="y", sections=["a"]), draft_by="")
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Write backend/services/comms.py**

```python
"""L6 — Unified comms bus.

Operator approves a Broadcast → fans out to selected channels with sub-group
stagger. Sub-groups are sections (zone_ids of type 'stand'); each section's
stagger offset is index × stagger_sec.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Literal

from backend.event_bus import EventBus, Event

Channel = Literal["push", "sms", "signage", "pa", "jumbotron"]


@dataclass
class Broadcast:
    title: str
    body: str
    sections: list[str]
    channels: list[Channel] = field(default_factory=lambda: ["push", "sms"])
    stagger_sec: int = 90
    route_hint: str | None = None


class CommsBus:
    def __init__(self, bus: EventBus) -> None:
        self.bus = bus

    async def send(self, bc: Broadcast, draft_by: str) -> str:
        if not draft_by:
            raise ValueError("broadcast requires operator")
        broadcast_id = str(uuid.uuid4())
        for idx, section in enumerate(bc.sections):
            offset = idx * bc.stagger_sec
            for channel in bc.channels:
                await self.bus.publish(Event(
                    topic="comms.broadcast",
                    payload={
                        "broadcast_id": broadcast_id,
                        "section": section,
                        "channel": channel,
                        "title": bc.title,
                        "body": bc.body,
                        "route_hint": bc.route_hint,
                        "stagger_offset_sec": offset,
                        "draft_by": draft_by,
                    },
                ))
        return broadcast_id
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add backend/services/comms.py backend/tests/test_comms.py
git commit -m "feat(comms): add unified comms bus with sub-group stagger"
```

---

### Task 15: Wire agent + protocol + comms into lifespan

**Files:**
- Modify: `backend/main.py`

- [ ] **Step 1: Edit `backend/main.py` lifespan**

Find this block in `lifespan`:
```python
    app.state.orch = Orchestrator(
        bus=bus,
        sim=sim,
        density=DensityService(layout=layout),
        anomaly=AnomalyEngine(bus=bus),
        sim_tick_sec=10,
    )
```

Add immediately after the orchestrator construction (before the `def record` block):
```python
    from backend.services.agent import AIAgent
    from backend.services.protocol import ProtocolEngine
    from backend.services.comms import CommsBus

    app.state.agent = AIAgent()
    app.state.protocol = ProtocolEngine(bus=bus)
    app.state.protocol.attach()
    app.state.comms = CommsBus(bus=bus)
```

Also extend the subscribed topic list:
```python
    for topic in ("density.tick", "anomaly.detected", "protocol.armed",
                  "protocol.confirmed", "comms.broadcast", "weather.alert",
                  "threat.signal"):
        bus.subscribe(topic, record)
```

- [ ] **Step 2: Smoke run + verify protocol arms on injected surge**

```bash
uvicorn backend.main:app --port 8000 &
sleep 5
# Inject surge via Python shell hitting the running sim — we'll wire a real endpoint in Task 24
pkill -f "uvicorn backend.main"
```

(End-to-end smoke comes after Task 24 adds the inject endpoint; for now we trust the unit tests.)

- [ ] **Step 3: Commit**

```bash
git add backend/main.py
git commit -m "feat(api): wire agent + protocol + comms into app lifespan"
```

---

## Milestone D — External intelligence (G3, G4, L2)

### Task 16: Weather Intelligence Service (G3)

**Files:**
- Create: `backend/services/weather.py`
- Test: `backend/tests/test_weather.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_weather.py`:
```python
import asyncio
import pytest
from backend.event_bus import EventBus
from backend.services.weather import WeatherService

@pytest.mark.asyncio
async def test_simulated_weather_emits_alert_on_inject():
    bus = EventBus()
    svc = WeatherService(bus=bus, mode="simulated")
    alerts = []
    bus.subscribe("weather.alert", lambda e: alerts.append(e))
    await svc.inject_storm(eta_min=12, lightning_km=8.0)
    await asyncio.sleep(0.05)
    assert len(alerts) == 1
    assert alerts[0].payload["storm_eta_min"] == 12
    assert alerts[0].payload["lightning_within_km"] == 8.0

@pytest.mark.asyncio
async def test_baseline_returns_calm_when_idle():
    bus = EventBus()
    svc = WeatherService(bus=bus, mode="simulated")
    state = await svc.current()
    assert state.summary
    assert state.storm_eta_min is None or state.storm_eta_min > 30
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Write backend/services/weather.py**

```python
"""G3 — Weather Intelligence.

Production: fuses IMD, AccuWeather, NOAA, on-site lightning detector.
Phase 0: simulated baseline + Gemini grounded fetch when mode='real',
plus an `inject_storm` operator hook for demo orchestration.
"""
from __future__ import annotations

import time

from backend.config import settings
from backend.event_bus import EventBus, Event
from backend.schemas import WeatherState


class WeatherService:
    def __init__(self, bus: EventBus, mode: str | None = None, venue: str = "M. Chinnaswamy Stadium, Bengaluru") -> None:
        self.bus = bus
        self.mode = mode or settings.agent_mode
        self.venue = venue
        self._state = WeatherState(summary="Clear, 28°C", heat_index_c=30.0)
        self._last_fetch_ts: float = 0.0

    async def current(self) -> WeatherState:
        # Periodic refresh via Gemini grounded search when in real mode
        if self.mode == "real" and time.time() - self._last_fetch_ts > 600:
            await self._refresh_from_gemini()
        return self._state

    async def inject_storm(self, eta_min: int, lightning_km: float) -> None:
        self._state = WeatherState(
            summary=f"Thunderstorm cell {eta_min} min out",
            storm_eta_min=eta_min,
            lightning_within_km=lightning_km,
            heat_index_c=self._state.heat_index_c,
        )
        await self.bus.publish(Event(
            topic="weather.alert",
            payload=self._state.model_dump(),
        ))

    async def inject_heat(self, heat_index_c: float) -> None:
        self._state = WeatherState(
            summary=f"Heat index {heat_index_c:.0f}°C — hydration risk",
            heat_index_c=heat_index_c,
        )
        await self.bus.publish(Event(
            topic="weather.alert",
            payload=self._state.model_dump(),
        ))

    async def _refresh_from_gemini(self) -> None:
        # Phase 1+: real implementation. Phase 0 leaves baseline.
        self._last_fetch_ts = time.time()
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add backend/services/weather.py backend/tests/test_weather.py
git commit -m "feat(weather): add G3 weather intelligence with inject hooks"
```

---

### Task 17: Threat Intelligence Service (G4)

**Files:**
- Create: `backend/services/threat.py`
- Test: `backend/tests/test_threat.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_threat.py`:
```python
import asyncio
import pytest
from backend.event_bus import EventBus
from backend.services.threat import ThreatService

@pytest.mark.asyncio
async def test_inject_drone_threat_publishes_signal():
    bus = EventBus()
    svc = ThreatService(bus=bus, mode="simulated")
    signals = []
    bus.subscribe("threat.signal", lambda e: signals.append(e))
    await svc.inject(summary="Unauthorized drone detected over east stand", severity="critical")
    await asyncio.sleep(0.05)
    assert len(signals) == 1
    assert "drone" in signals[0].payload["summary"].lower()
    assert signals[0].payload["severity"] == "critical"

@pytest.mark.asyncio
async def test_simulated_recent_returns_baseline_empty():
    bus = EventBus()
    svc = ThreatService(bus=bus, mode="simulated")
    items = await svc.recent()
    assert items == []
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Write backend/services/threat.py**

```python
"""G4 — Threat Intelligence.

Production: fuses news, social (X/Reddit), CERT-In, police CAD, airspace
radar, anonymous tip-line. Phase 0: simulated baseline + operator-injection
for demo. Real mode: Gemini grounded news scan every 60s (scaffolded).

Critical guardrail: never auto-broadcasts to fans. L7 confirmation required.
"""
from __future__ import annotations

import time
import uuid

from backend.config import settings
from backend.event_bus import EventBus, Event
from backend.schemas import ThreatSignal


class ThreatService:
    def __init__(self, bus: EventBus, mode: str | None = None) -> None:
        self.bus = bus
        self.mode = mode or settings.agent_mode
        self._recent: list[ThreatSignal] = []

    async def inject(self, summary: str, severity: str = "warning",
                     confidence: float = 0.85, sources: list[str] | None = None,
                     distance_km: float | None = None) -> ThreatSignal:
        sig = ThreatSignal(
            id=str(uuid.uuid4()),
            summary=summary,
            severity=severity,
            confidence=confidence,
            sources=sources or ["operator-injected"],
            distance_km=distance_km,
        )
        self._recent.append(sig)
        await self.bus.publish(Event(
            topic="threat.signal",
            payload=sig.model_dump(),
        ))
        return sig

    async def recent(self) -> list[ThreatSignal]:
        # Trim items older than 60 min
        cutoff = time.time() - 3600
        # ThreatSignal does not carry ts in schema; keep last 50 only
        self._recent = self._recent[-50:]
        return list(self._recent)
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add backend/services/threat.py backend/tests/test_threat.py
git commit -m "feat(threat): add G4 threat intelligence with operator inject"
```

---

### Task 18: Inbound Pipeline (L2)

**Files:**
- Create: `backend/services/inbound.py`
- Test: `backend/tests/test_inbound.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_inbound.py`:
```python
from backend.layout import load_layout
from backend.services.inbound import InboundPipeline

def test_inbound_returns_per_source_eta():
    layout = load_layout()
    p = InboundPipeline(layout=layout, seed=42)
    state = p.tick(sim_time_sec=30*60)  # 30 min into pre-match window
    assert len(state.sources) >= 3
    metro = next(s for s in state.sources if "metro" in s.source_id.lower())
    assert metro.arrival_rate_per_min > 0
    assert metro.eta_gate_min > 0

def test_inbound_zero_outside_pre_window():
    layout = load_layout()
    p = InboundPipeline(layout=layout, seed=42)
    state = p.tick(sim_time_sec=200*60)  # mid-match
    assert all(s.arrival_rate_per_min == 0 for s in state.sources)
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Write backend/services/inbound.py**

```python
"""L2 — Pre-Match Inbound Pipeline.

Models arrivals from transit nodes and parking. Each source has a peak rate
and a walk time to gates. Phase 1+: replaced with real adapters from G1.
"""
from __future__ import annotations

import math
import random
from dataclasses import dataclass

from backend.layout import Layout, TransitNode

PRE_END = 90 * 60


@dataclass
class SourceState:
    source_id: str
    name: str
    arrival_rate_per_min: float
    fill_pct: float
    eta_gate_min: float


@dataclass
class InboundState:
    sources: list[SourceState]
    total_inbound_per_min: float


class InboundPipeline:
    def __init__(self, layout: Layout, seed: int = 42) -> None:
        self.layout = layout
        self.rng = random.Random(seed)
        # Per-source peak rate (fans per minute)
        self._peak: dict[str, float] = {
            "metro_mg_road": 380,
            "metro_cubbon_park": 220,
            "parking_north": 90,
        }
        self._fills: dict[str, float] = {t.id: 0.0 for t in layout.transit}

    def tick(self, sim_time_sec: int) -> InboundState:
        if sim_time_sec >= PRE_END:
            return InboundState(
                sources=[
                    SourceState(source_id=t.id, name=t.name,
                                arrival_rate_per_min=0, fill_pct=self._fills[t.id],
                                eta_gate_min=0)
                    for t in self.layout.transit
                ],
                total_inbound_per_min=0,
            )
        # Bell curve centered at 45 min
        peak_time = 45 * 60
        sigma = 18 * 60
        scale = math.exp(-((sim_time_sec - peak_time) ** 2) / (2 * sigma ** 2))
        sources: list[SourceState] = []
        total = 0.0
        for t in self.layout.transit:
            peak = self._peak.get(t.id, 50)
            rate = peak * scale * (0.9 + 0.2 * self.rng.random())
            self._fills[t.id] = min(1.0, self._fills[t.id] + rate / 6000)
            eta = max(1, t.distance_m / 80)  # 80 m/min walk
            sources.append(SourceState(
                source_id=t.id, name=t.name,
                arrival_rate_per_min=round(rate, 1),
                fill_pct=round(self._fills[t.id], 2),
                eta_gate_min=round(eta, 1),
            ))
            total += rate
        return InboundState(sources=sources, total_inbound_per_min=round(total, 1))
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add backend/services/inbound.py backend/tests/test_inbound.py
git commit -m "feat(inbound): add L2 pre-match inbound pipeline with per-source ETAs"
```

---

## Milestone E — Domain services (L8, L9, L4, L7, fan check-in)

### Task 19: Ticketing & Access (L8)

**Files:**
- Create: `backend/services/ticketing.py`
- Test: `backend/tests/test_ticketing.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_ticketing.py`:
```python
from backend.services.ticketing import TicketingService

def test_scan_increments_counter():
    t = TicketingService(total_tickets=40000)
    t.scan(ticket_id="T1", gate_id="gate_1", zone_id="stand_a")
    assert t.scanned() == 1
    assert t.zone_occupancy("stand_a") == 1

def test_duplicate_scan_returns_fraud_flag():
    t = TicketingService(total_tickets=40000)
    r1 = t.scan(ticket_id="T1", gate_id="gate_1", zone_id="stand_a")
    r2 = t.scan(ticket_id="T1", gate_id="gate_2", zone_id="stand_a")
    assert r1.fraud is False
    assert r2.fraud is True
    assert r2.reason == "duplicate_scan"

def test_zone_overcapacity_blocked():
    t = TicketingService(total_tickets=10, zone_caps={"stand_a": 1})
    t.scan(ticket_id="T1", gate_id="g", zone_id="stand_a")
    r = t.scan(ticket_id="T2", gate_id="g", zone_id="stand_a")
    assert r.fraud is True
    assert r.reason == "zone_full"
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Write backend/services/ticketing.py**

```python
"""L8 — Ticketing & Access unification.

Tracks scans, detects duplicates, enforces zone capacity. Phase 1+: replaces
in-memory dicts with Firestore + Memorystore for hot path.
"""
from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass


@dataclass
class ScanResult:
    accepted: bool
    fraud: bool
    reason: str | None = None


class TicketingService:
    def __init__(self, total_tickets: int, zone_caps: dict[str, int] | None = None) -> None:
        self.total_tickets = total_tickets
        self.zone_caps = zone_caps or {}
        self._scanned: set[str] = set()
        self._zone_occ: dict[str, int] = defaultdict(int)
        self._gate_scans: dict[str, int] = defaultdict(int)

    def scan(self, ticket_id: str, gate_id: str, zone_id: str) -> ScanResult:
        if ticket_id in self._scanned:
            return ScanResult(accepted=False, fraud=True, reason="duplicate_scan")
        cap = self.zone_caps.get(zone_id)
        if cap is not None and self._zone_occ[zone_id] >= cap:
            return ScanResult(accepted=False, fraud=True, reason="zone_full")
        self._scanned.add(ticket_id)
        self._zone_occ[zone_id] += 1
        self._gate_scans[gate_id] += 1
        return ScanResult(accepted=True, fraud=False)

    def scanned(self) -> int:
        return len(self._scanned)

    def zone_occupancy(self, zone_id: str) -> int:
        return self._zone_occ[zone_id]

    def reconciliation(self) -> dict:
        return {
            "total_tickets": self.total_tickets,
            "scanned": len(self._scanned),
            "remaining": self.total_tickets - len(self._scanned),
            "by_zone": dict(self._zone_occ),
            "by_gate": dict(self._gate_scans),
        }
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add backend/services/ticketing.py backend/tests/test_ticketing.py
git commit -m "feat(ticketing): add L8 scan + fraud + zone-cap reconciliation"
```

---

### Task 20: Staff Coordination (L9)

**Files:**
- Create: `backend/services/staff.py`
- Test: `backend/tests/test_staff.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_staff.py`:
```python
from backend.services.staff import StaffService

def test_register_team_and_dispatch():
    s = StaffService()
    s.register_team(team_id="alpha", role="crowd_marshal", position=[40, 50])
    task_id = s.dispatch(team_id="alpha", title="Direct flow at Concourse N",
                         to_position=[30, 85])
    teams = s.teams()
    a = next(t for t in teams if t.team_id == "alpha")
    assert a.status == "responding"
    assert a.current_task_id == task_id

def test_complete_task_returns_team_to_idle():
    s = StaffService()
    s.register_team(team_id="bravo", role="medical", position=[10, 10])
    task_id = s.dispatch(team_id="bravo", title="AED to Aisle 8", to_position=[20, 20])
    s.complete(task_id=task_id)
    b = next(t for t in s.teams() if t.team_id == "bravo")
    assert b.status == "idle"
    assert b.current_task_id is None
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Write backend/services/staff.py**

```python
"""L9 — Staff & Volunteer Coordination.

Phase 0: in-memory team registry + task queue with status transitions.
Phase 1+: Flutter handheld + FCM + Bluetooth Mesh fallback (G2).
"""
from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Literal

TeamStatus = Literal["idle", "responding", "on_task"]
TeamRole = Literal["crowd_marshal", "medical", "security", "transit"]


@dataclass
class Team:
    team_id: str
    role: TeamRole
    position: list[float]
    status: TeamStatus = "idle"
    current_task_id: str | None = None


@dataclass
class Task:
    id: str
    title: str
    to_position: list[float]
    assigned_team_id: str
    created_ts: float
    completed_ts: float | None = None


class StaffService:
    def __init__(self) -> None:
        self._teams: dict[str, Team] = {}
        self._tasks: dict[str, Task] = {}

    def register_team(self, team_id: str, role: TeamRole, position: list[float]) -> None:
        self._teams[team_id] = Team(team_id=team_id, role=role, position=position)

    def dispatch(self, team_id: str, title: str, to_position: list[float]) -> str:
        team = self._teams[team_id]
        task = Task(
            id=str(uuid.uuid4()),
            title=title,
            to_position=to_position,
            assigned_team_id=team_id,
            created_ts=time.time(),
        )
        self._tasks[task.id] = task
        team.status = "responding"
        team.current_task_id = task.id
        return task.id

    def complete(self, task_id: str) -> None:
        task = self._tasks[task_id]
        task.completed_ts = time.time()
        team = self._teams[task.assigned_team_id]
        team.status = "idle"
        team.current_task_id = None
        team.position = list(task.to_position)

    def teams(self) -> list[Team]:
        return list(self._teams.values())

    def open_tasks(self) -> list[Task]:
        return [t for t in self._tasks.values() if t.completed_ts is None]
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add backend/services/staff.py backend/tests/test_staff.py
git commit -m "feat(staff): add L9 team registry + task dispatch lifecycle"
```

---

### Task 21: Medical & Accessibility (L4)

**Files:**
- Create: `backend/services/medical.py`
- Test: `backend/tests/test_medical.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_medical.py`:
```python
from backend.services.medical import MedicalService

def test_create_incident_and_close():
    m = MedicalService()
    inc = m.report(zone_id="stand_a", description="Fainting, possibly heat-related")
    assert inc.status == "open"
    closed = m.close(inc.id, outcome="treated_on_site")
    assert closed.status == "closed"
    assert closed.outcome == "treated_on_site"

def test_register_lost_person_and_find():
    m = MedicalService()
    lp = m.report_lost_person(name="Aarav", age=7, last_seen_zone="concourse_n",
                              contact="+91999...")
    assert lp.status == "missing"
    m.mark_found(lp.id, found_zone="lost_and_found_3")
    found = next(p for p in m.lost_people() if p.id == lp.id)
    assert found.status == "found"
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Write backend/services/medical.py**

```python
"""L4 — Medical & Accessibility.

Tracks medical incidents and lost persons. Phase 1+: integrates with hospital
EMR via G1 ems-adapter and pushes to L9 staff dispatch.
"""
from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Literal


@dataclass
class MedicalIncident:
    id: str
    zone_id: str
    description: str
    created_ts: float
    status: Literal["open", "responding", "closed"] = "open"
    outcome: str | None = None


@dataclass
class LostPerson:
    id: str
    name: str
    age: int
    last_seen_zone: str
    contact: str
    created_ts: float
    status: Literal["missing", "found"] = "missing"
    found_zone: str | None = None


class MedicalService:
    def __init__(self) -> None:
        self._incidents: dict[str, MedicalIncident] = {}
        self._lost: dict[str, LostPerson] = {}

    def report(self, zone_id: str, description: str) -> MedicalIncident:
        inc = MedicalIncident(
            id=str(uuid.uuid4()),
            zone_id=zone_id,
            description=description,
            created_ts=time.time(),
        )
        self._incidents[inc.id] = inc
        return inc

    def close(self, incident_id: str, outcome: str) -> MedicalIncident:
        inc = self._incidents[incident_id]
        inc.status = "closed"
        inc.outcome = outcome
        return inc

    def open_incidents(self) -> list[MedicalIncident]:
        return [i for i in self._incidents.values() if i.status != "closed"]

    def report_lost_person(self, name: str, age: int, last_seen_zone: str,
                           contact: str) -> LostPerson:
        lp = LostPerson(
            id=str(uuid.uuid4()),
            name=name, age=age,
            last_seen_zone=last_seen_zone,
            contact=contact,
            created_ts=time.time(),
        )
        self._lost[lp.id] = lp
        return lp

    def mark_found(self, lost_id: str, found_zone: str) -> None:
        lp = self._lost[lost_id]
        lp.status = "found"
        lp.found_zone = found_zone

    def lost_people(self) -> list[LostPerson]:
        return list(self._lost.values())
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add backend/services/medical.py backend/tests/test_medical.py
git commit -m "feat(medical): add L4 medical incident + lost-person registry"
```

---

### Task 22: Audit / Multi-Agency (L7)

**Files:**
- Create: `backend/services/audit.py`
- Test: `backend/tests/test_audit.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_audit.py`:
```python
import asyncio
import pytest
from backend.event_bus import EventBus, Event
from backend.services.audit import AuditService

@pytest.mark.asyncio
async def test_audit_records_protocol_confirmations():
    bus = EventBus()
    a = AuditService(bus=bus)
    a.attach()
    await bus.publish(Event(topic="protocol.confirmed", payload={
        "id": "p1", "sop": "CROWD_CRUSH_RISK",
        "confirmed_by": "ops.commander.alice", "confirmed_ts": 1700000000,
    }))
    await asyncio.sleep(0.05)
    records = a.records()
    assert len(records) == 1
    assert records[0]["operator"] == "ops.commander.alice"

@pytest.mark.asyncio
async def test_generate_aar_returns_structured_summary():
    bus = EventBus()
    a = AuditService(bus=bus)
    a.attach()
    await bus.publish(Event(topic="protocol.confirmed", payload={
        "id": "p1", "sop": "STORM_INBOUND",
        "confirmed_by": "ops", "confirmed_ts": 1700000000,
    }))
    await asyncio.sleep(0.05)
    aar = a.generate_aar()
    assert "STORM_INBOUND" in aar["protocols_confirmed"]
    assert aar["total_decisions"] >= 1
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Write backend/services/audit.py**

```python
"""L7 — Audit + After-Action Report.

Subscribes to decision-bearing topics and writes an immutable log.
Phase 1+: writes to Cloud Audit Logs + BigQuery; AAR rendered as PDF in
Cloud Storage.
"""
from __future__ import annotations

import time
from collections import Counter

from backend.event_bus import EventBus, Event


class AuditService:
    def __init__(self, bus: EventBus) -> None:
        self.bus = bus
        self._log: list[dict] = []

    def attach(self) -> None:
        self.bus.subscribe("protocol.armed", self._on_event)
        self.bus.subscribe("protocol.confirmed", self._on_event)
        self.bus.subscribe("comms.broadcast", self._on_event)
        self.bus.subscribe("anomaly.detected", self._on_event)

    def _on_event(self, e: Event) -> None:
        self._log.append({
            "ts": e.ts,
            "topic": e.topic,
            "operator": e.payload.get("confirmed_by") or e.payload.get("draft_by"),
            "payload": e.payload,
        })

    def records(self) -> list[dict]:
        return list(self._log)

    def generate_aar(self) -> dict:
        confirmed = [r for r in self._log if r["topic"] == "protocol.confirmed"]
        armed = [r for r in self._log if r["topic"] == "protocol.armed"]
        broadcasts = [r for r in self._log if r["topic"] == "comms.broadcast"]
        anomalies = [r for r in self._log if r["topic"] == "anomaly.detected"]
        return {
            "generated_ts": time.time(),
            "total_decisions": len(self._log),
            "protocols_armed": Counter(r["payload"].get("sop") for r in armed),
            "protocols_confirmed": Counter(r["payload"].get("sop") for r in confirmed),
            "broadcasts_sent": len(broadcasts),
            "anomalies_detected": len(anomalies),
            "first_event_ts": self._log[0]["ts"] if self._log else None,
            "last_event_ts": self._log[-1]["ts"] if self._log else None,
        }
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add backend/services/audit.py backend/tests/test_audit.py
git commit -m "feat(audit): add L7 immutable audit log + AAR generator"
```

---

### Task 23: Fan check-in / persona state

**Files:**
- Create: `backend/services/fan.py`
- Test: `backend/tests/test_fan.py`

- [ ] **Step 1: Write the failing test**

`backend/tests/test_fan.py`:
```python
from backend.services.fan import FanService

def test_check_in_returns_personalized_plan():
    f = FanService()
    plan = f.check_in(fan_id="f1", persona="family", section="stand_b",
                      transit="metro_mg_road")
    assert plan.fan_id == "f1"
    assert plan.section == "stand_b"
    assert plan.assigned_gate
    assert plan.arrive_by_min > 0
    assert plan.persona == "family"

def test_pmr_persona_gets_separate_gate():
    f = FanService()
    a = f.check_in(fan_id="a", persona="pmr", section="stand_a", transit="metro_mg_road")
    b = f.check_in(fan_id="b", persona="standard", section="stand_a", transit="metro_mg_road")
    assert a.assigned_gate != b.assigned_gate or a.lane == "pmr_lane"
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Write backend/services/fan.py**

```python
"""Fan check-in service — produces a personalized plan for MatchDay Companion.

Persona drives gate, lane, language, and stagger window. Phase 1+: fan
identity from Identity Platform; plan written to Firestore.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Literal

Persona = Literal["standard", "family", "pmr", "hearing_impaired", "away_fan", "first_time"]


@dataclass
class FanPlan:
    fan_id: str
    persona: Persona
    section: str
    transit: str
    assigned_gate: str
    lane: str
    arrive_by_min: int  # minutes before match start
    language: str = "en"


SECTION_GATE = {
    "stand_a": "gate_1",
    "stand_b": "gate_3",
    "stand_c": "gate_5",
    "stand_d": "gate_7",
}
SECTION_PMR_GATE = {
    "stand_a": "gate_2",
    "stand_b": "gate_4",
    "stand_c": "gate_6",
    "stand_d": "gate_8",
}


class FanService:
    def __init__(self) -> None:
        self._plans: dict[str, FanPlan] = {}

    def check_in(self, fan_id: str, persona: Persona, section: str,
                 transit: str, language: str = "en") -> FanPlan:
        if persona == "pmr":
            gate = SECTION_PMR_GATE.get(section, "gate_1")
            lane = "pmr_lane"
            arrive_by = 60
        elif persona == "family":
            gate = SECTION_GATE.get(section, "gate_1")
            lane = "family_lane"
            arrive_by = 75
        elif persona == "away_fan":
            gate = "gate_5"  # segregated
            lane = "away_lane"
            arrive_by = 90
        else:
            gate = SECTION_GATE.get(section, "gate_1")
            lane = "standard_lane"
            arrive_by = 45
        plan = FanPlan(
            fan_id=fan_id, persona=persona, section=section, transit=transit,
            assigned_gate=gate, lane=lane, arrive_by_min=arrive_by, language=language,
        )
        self._plans[fan_id] = plan
        return plan

    def get_plan(self, fan_id: str) -> FanPlan | None:
        return self._plans.get(fan_id)

    def all_plans(self) -> list[FanPlan]:
        return list(self._plans.values())
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add backend/services/fan.py backend/tests/test_fan.py
git commit -m "feat(fan): add fan check-in with persona-driven gate + lane"
```

---

## Milestone F — API surface

### Task 24: REST endpoints (ops + fan) + service wiring in lifespan

**Files:**
- Create: `backend/api/__init__.py`
- Create: `backend/api/ops.py`
- Create: `backend/api/fan.py`
- Modify: `backend/main.py`

- [ ] **Step 1: Write backend/api/__init__.py**

```python
```

- [ ] **Step 2: Write backend/api/ops.py**

```python
"""Ops REST endpoints — used by StadiumOps Command dashboard."""
from fastapi import APIRouter, HTTPException, Request, Body
from pydantic import BaseModel

router = APIRouter(prefix="/api/ops", tags=["ops"])


class SurgeRequest(BaseModel):
    zone_id: str
    magnitude: int = 2000


class ConfirmRequest(BaseModel):
    protocol_id: str
    operator: str


class BroadcastRequest(BaseModel):
    title: str
    body: str
    sections: list[str]
    channels: list[str] = ["push", "sms"]
    stagger_sec: int = 90
    route_hint: str | None = None
    operator: str


class AgentAskRequest(BaseModel):
    context: str


class InjectStormRequest(BaseModel):
    eta_min: int = 12
    lightning_km: float = 8.0


class InjectThreatRequest(BaseModel):
    summary: str
    severity: str = "warning"


@router.get("/state")
def get_state(request: Request):
    s = request.app.state
    return {
        "phase": s.sim.phase,
        "sim_time_sec": s.sim.sim_time_sec,
        "density": s.store.latest("density.tick"),
        "inbound": s.inbound.tick(s.sim.sim_time_sec).__dict__ if hasattr(s, "inbound") else None,
        "weather": s.weather._state.model_dump() if hasattr(s, "weather") else None,
        "protocols_armed": [vars(p) for p in s.protocol.armed.values()],
        "teams": [vars(t) for t in s.staff.teams()] if hasattr(s, "staff") else [],
        "medical_open": [vars(i) for i in s.medical.open_incidents()] if hasattr(s, "medical") else [],
        "ticketing": s.ticketing.reconciliation() if hasattr(s, "ticketing") else None,
    }


@router.post("/inject/surge")
def inject_surge(req: SurgeRequest, request: Request):
    request.app.state.sim.inject_surge(zone_id=req.zone_id, magnitude=req.magnitude)
    return {"ok": True, "zone_id": req.zone_id, "magnitude": req.magnitude}


@router.post("/inject/storm")
async def inject_storm(req: InjectStormRequest, request: Request):
    await request.app.state.weather.inject_storm(eta_min=req.eta_min, lightning_km=req.lightning_km)
    return {"ok": True}


@router.post("/inject/threat")
async def inject_threat(req: InjectThreatRequest, request: Request):
    sig = await request.app.state.threat.inject(summary=req.summary, severity=req.severity)
    return {"ok": True, "id": sig.id}


@router.post("/protocol/confirm")
async def confirm_protocol(req: ConfirmRequest, request: Request):
    await request.app.state.protocol.confirm(req.protocol_id, operator=req.operator)
    return {"ok": True}


@router.post("/comms/broadcast")
async def broadcast(req: BroadcastRequest, request: Request):
    from backend.services.comms import Broadcast
    bc = Broadcast(
        title=req.title, body=req.body, sections=req.sections,
        channels=req.channels, stagger_sec=req.stagger_sec, route_hint=req.route_hint,
    )
    bid = await request.app.state.comms.send(bc, draft_by=req.operator)
    return {"ok": True, "broadcast_id": bid}


@router.post("/agent/ask")
async def agent_ask(req: AgentAskRequest, request: Request):
    resp = await request.app.state.agent.recommend(req.context)
    return resp.__dict__


@router.get("/aar")
def get_aar(request: Request):
    return request.app.state.audit.generate_aar()


@router.get("/scrub")
def scrub(ts: float, request: Request):
    return {
        "density": request.app.state.store.at(ts=ts, kind="density.tick"),
    }
```

- [ ] **Step 3: Write backend/api/fan.py**

```python
"""Fan REST endpoints — used by MatchDay Companion PWA."""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter(prefix="/api/fan", tags=["fan"])


class CheckInRequest(BaseModel):
    fan_id: str
    persona: str
    section: str
    transit: str
    language: str = "en"


@router.post("/checkin")
def checkin(req: CheckInRequest, request: Request):
    plan = request.app.state.fan.check_in(
        fan_id=req.fan_id, persona=req.persona,
        section=req.section, transit=req.transit, language=req.language,
    )
    return plan.__dict__


@router.get("/plan/{fan_id}")
def get_plan(fan_id: str, request: Request):
    plan = request.app.state.fan.get_plan(fan_id)
    if not plan:
        raise HTTPException(404, "no plan")
    return plan.__dict__


@router.get("/gates")
def gate_status(request: Request):
    layout = request.app.state.layout
    sim = request.app.state.sim
    snap = sim.snapshot()
    gate_q = {g.gate_id: g.queue_length for g in snap.gates}
    gate_scans = {g.gate_id: g.scans_last_min for g in snap.gates}
    out = []
    for g in layout.gates:
        wait_min = round(gate_q[g.id] / max(1, gate_scans[g.id]), 1) if gate_scans[g.id] > 0 else 0
        out.append({
            "gate_id": g.id,
            "name": g.name,
            "status": g.status,
            "queue_length": gate_q[g.id],
            "wait_min": wait_min,
        })
    return out
```

- [ ] **Step 4: Update backend/main.py — full replacement**

```python
"""FastAPI application entrypoint."""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.event_bus import bus, Event
from backend.layout import load_layout
from backend.services.crowd_sim import CrowdSim
from backend.services.density import DensityService
from backend.services.anomaly import AnomalyEngine
from backend.services.orchestrator import Orchestrator
from backend.services.state_store import StateStore
from backend.services.agent import AIAgent
from backend.services.protocol import ProtocolEngine
from backend.services.comms import CommsBus
from backend.services.weather import WeatherService
from backend.services.threat import ThreatService
from backend.services.inbound import InboundPipeline
from backend.services.ticketing import TicketingService
from backend.services.staff import StaffService
from backend.services.medical import MedicalService
from backend.services.audit import AuditService
from backend.services.fan import FanService
from backend.api.ops import router as ops_router
from backend.api.fan import router as fan_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    layout = load_layout()
    app.state.layout = layout
    app.state.bus = bus
    app.state.store = StateStore()
    sim = CrowdSim(layout=layout, seed=42, total_fans=40000)
    app.state.sim = sim
    app.state.orch = Orchestrator(
        bus=bus, sim=sim,
        density=DensityService(layout=layout),
        anomaly=AnomalyEngine(bus=bus),
        sim_tick_sec=10,
    )
    app.state.agent = AIAgent()
    app.state.protocol = ProtocolEngine(bus=bus)
    app.state.protocol.attach()
    app.state.comms = CommsBus(bus=bus)
    app.state.weather = WeatherService(bus=bus)
    app.state.threat = ThreatService(bus=bus)
    app.state.inbound = InboundPipeline(layout=layout, seed=42)
    app.state.ticketing = TicketingService(total_tickets=40000)
    app.state.staff = StaffService()
    app.state.medical = MedicalService()
    app.state.audit = AuditService(bus=bus)
    app.state.audit.attach()
    app.state.fan = FanService()

    # Seed staff teams for the demo
    app.state.staff.register_team("alpha", "crowd_marshal", [40, 60])
    app.state.staff.register_team("bravo", "medical", [10, 40])
    app.state.staff.register_team("charlie", "security", [70, 40])
    app.state.staff.register_team("delta", "transit", [-20, 40])

    def record(e: Event) -> None:
        app.state.store.record(ts=e.ts, kind=e.topic, payload=e.payload)

    for topic in ("density.tick", "anomaly.detected", "protocol.armed",
                  "protocol.confirmed", "comms.broadcast", "weather.alert",
                  "threat.signal"):
        bus.subscribe(topic, record)

    task = asyncio.create_task(app.state.orch.run_forever(real_seconds_per_tick=1.0))
    try:
        yield
    finally:
        app.state.orch.stop()
        task.cancel()


app = FastAPI(title="StadiumOps Command", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ops_router)
app.include_router(fan_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "venue": app.state.layout.venue_name,
        "agent_mode": settings.agent_mode,
        "sim_time_sec": app.state.sim.sim_time_sec,
        "phase": app.state.sim.phase,
    }


@app.get("/api/layout")
def get_layout():
    layout = app.state.layout
    return {
        "venue": {"id": layout.venue_id, "name": layout.venue_name, "capacity": layout.capacity},
        "zones": [vars(z) for z in layout.zones],
        "gates": [vars(g) for g in layout.gates],
        "aeds": [vars(a) for a in layout.aeds],
        "transit": [vars(t) for t in layout.transit],
    }
```

- [ ] **Step 5: Smoke run**

```bash
uvicorn backend.main:app --port 8000 &
sleep 4
curl -s http://127.0.0.1:8000/api/ops/state | python -m json.tool | head -30
curl -s -X POST http://127.0.0.1:8000/api/ops/inject/surge -H "content-type: application/json" -d '{"zone_id":"concourse_n","magnitude":3000}' | python -m json.tool
sleep 2
curl -s http://127.0.0.1:8000/api/ops/state | python -m json.tool | grep -A 5 protocols_armed
pkill -f "uvicorn backend.main"
```
Expected: `protocols_armed` list contains a `CROWD_CRUSH_RISK` entry.

- [ ] **Step 6: Commit**

```bash
git add backend/api/ backend/main.py
git commit -m "feat(api): add ops + fan REST endpoints; wire all services in lifespan"
```

---

### Task 25: WebSocket endpoint for live updates

**Files:**
- Create: `backend/api/ws.py`
- Modify: `backend/main.py`

- [ ] **Step 1: Write backend/api/ws.py**

```python
"""WebSocket endpoint for live event streaming to dashboards.

Each connection subscribes to a configurable topic set. Server pushes every
matching event. On disconnect, the subscriber is removed from the bus.
"""
from __future__ import annotations

import asyncio
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from backend.event_bus import bus, Event

log = logging.getLogger(__name__)

router = APIRouter()

DEFAULT_TOPICS = (
    "density.tick",
    "anomaly.detected",
    "protocol.armed",
    "protocol.confirmed",
    "comms.broadcast",
    "weather.alert",
    "threat.signal",
)


@router.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    queue: asyncio.Queue = asyncio.Queue(maxsize=200)

    async def forwarder(event: Event) -> None:
        if queue.full():
            return  # drop on backpressure rather than block the bus
        await queue.put({"topic": event.topic, "payload": event.payload, "ts": event.ts})

    for topic in DEFAULT_TOPICS:
        bus.subscribe(topic, forwarder)

    try:
        while True:
            try:
                msg = await asyncio.wait_for(queue.get(), timeout=15)
                await websocket.send_text(json.dumps(msg))
            except asyncio.TimeoutError:
                await websocket.send_text(json.dumps({"topic": "ping", "ts": 0, "payload": {}}))
    except WebSocketDisconnect:
        log.info("ws disconnected")
    except Exception:
        log.exception("ws error")
```

- [ ] **Step 2: Mount in backend/main.py**

Add to imports:
```python
from backend.api.ws import router as ws_router
```

Add after `app.include_router(fan_router)`:
```python
app.include_router(ws_router)
```

- [ ] **Step 3: Smoke test**

```bash
uvicorn backend.main:app --port 8000 &
sleep 3
python -c "
import asyncio, websockets, json
async def t():
    async with websockets.connect('ws://127.0.0.1:8000/ws') as ws:
        for _ in range(3):
            msg = await asyncio.wait_for(ws.recv(), timeout=20)
            print(json.loads(msg)['topic'])
asyncio.run(t())
"
pkill -f "uvicorn backend.main"
```
Expected: at least `density.tick` topics streaming.

- [ ] **Step 4: Commit**

```bash
git add backend/api/ws.py backend/main.py
git commit -m "feat(ws): add WebSocket endpoint streaming bus events"
```

---

## Milestone G — Ops dashboard scaffold

### Task 26: Initialize Next.js 15 ops app

**Files:**
- Create: `ops/` directory tree

- [ ] **Step 1: Scaffold the app**

From the repo root:
```bash
cd ops 2>/dev/null || mkdir ops
cd ops
npx -y create-next-app@15 . --typescript --app --no-tailwind --eslint --src-dir=false --import-alias="@/*" --use-npm --skip-install
npm install
```

If prompted by create-next-app, accept defaults except: TypeScript yes, App Router yes, no Tailwind (we use MUI).

- [ ] **Step 2: Add core dependencies**

```bash
npm install @mui/material @mui/material-nextjs @emotion/react @emotion/cache @emotion/styled @emotion/server @mui/icons-material @mui/x-charts
npm install three @react-three/fiber @react-three/drei
npm install zustand
npm install @tanstack/react-query
npm install ws
npm install --save-dev @types/three @types/ws
```

- [ ] **Step 3: Configure ports + scripts**

Edit `ops/package.json` "scripts":
```json
"scripts": {
  "dev": "next dev -p 3000",
  "build": "next build",
  "start": "next start -p 3000",
  "lint": "next lint",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 4: Verify build**

```bash
npm run typecheck
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd ..
git add ops/
git commit -m "chore(ops): scaffold Next.js 15 with MUI + R3F + zustand"
```

---

### Task 27: Material Design 3 dark theme + Google fonts

**Files:**
- Create: `ops/app/layout.tsx` (replace)
- Create: `ops/lib/theme.ts`
- Create: `ops/app/providers.tsx`
- Create: `ops/app/globals.css` (replace)

- [ ] **Step 1: Write `ops/lib/theme.ts`**

```ts
"use client";
import { createTheme } from "@mui/material/styles";

// Material Design 3 — Command Center dark scheme
// Seeds: Primary #1A73E8 (Google Blue), Secondary #0F9D58 (Google Green),
// Tertiary #F9AB00 (Google Amber), Error #D93025 (Google Red)
// Surface Dim: #0F1115. Tonal palette derived for high info density.

export const opsTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: { main: "#8AB4F8", dark: "#1A73E8", contrastText: "#0B1220" },
    secondary: { main: "#81C995", dark: "#0F9D58", contrastText: "#0B1220" },
    warning: { main: "#FDD663", dark: "#F9AB00" },
    error: { main: "#F28B82", dark: "#D93025" },
    success: { main: "#81C995" },
    background: { default: "#0F1115", paper: "#181B21" },
    text: { primary: "#E8EAED", secondary: "#9AA0A6" },
    divider: "rgba(232,234,237,0.12)",
  },
  typography: {
    fontFamily: '"Google Sans Text","Roboto Flex","Inter",system-ui,sans-serif',
    h1: { fontFamily: '"Google Sans Display","Inter",system-ui,sans-serif', fontWeight: 600 },
    h2: { fontFamily: '"Google Sans Display","Inter",system-ui,sans-serif', fontWeight: 600 },
    h3: { fontFamily: '"Google Sans Display","Inter",system-ui,sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Google Sans Display","Inter",system-ui,sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Google Sans Display","Inter",system-ui,sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Google Sans Display","Inter",system-ui,sans-serif', fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});
```

- [ ] **Step 2: Write `ops/app/providers.tsx`**

```tsx
"use client";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { opsTheme } from "@/lib/theme";

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 1000 } },
  }));
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={opsTheme}>
        <CssBaseline />
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
```

- [ ] **Step 3: Write `ops/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "StadiumOps Command",
  description: "Digital twin command center for cricket stadium operations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Display:wght@400;500;600;700&family=Roboto+Flex:opsz,wght@8..144,300..700&family=Roboto+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,300..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
```

- [ ] **Step 4: Write `ops/app/globals.css`**

```css
html, body { padding: 0; margin: 0; height: 100%; }
body { background: #0F1115; color: #E8EAED; font-family: "Roboto Flex","Inter",sans-serif; }
#__next, body > div { height: 100%; }
.material-symbols-sharp { font-family: "Material Symbols Sharp"; font-weight: normal; font-style: normal; line-height: 1; letter-spacing: normal; text-transform: none; white-space: nowrap; word-wrap: normal; direction: ltr; }
canvas { display: block; }
```

- [ ] **Step 5: Smoke run**

```bash
cd ops && npm run dev &
sleep 6
curl -s http://localhost:3000 | grep -o "StadiumOps Command" | head -1
pkill -f "next dev"
cd ..
```
Expected: prints `StadiumOps Command`.

- [ ] **Step 6: Commit**

```bash
git add ops/app/layout.tsx ops/app/providers.tsx ops/app/globals.css ops/lib/theme.ts
git commit -m "feat(ops): add MD3 dark theme with Google Sans + Roboto Flex"
```

---

### Task 28: WebSocket client + Zustand store + REST client

**Files:**
- Create: `ops/lib/types.ts`
- Create: `ops/lib/api.ts`
- Create: `ops/lib/ws.ts`
- Create: `ops/lib/store.ts`

- [ ] **Step 1: Write `ops/lib/types.ts`**

```ts
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
```

- [ ] **Step 2: Write `ops/lib/api.ts`**

```ts
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
};
```

- [ ] **Step 3: Write `ops/lib/ws.ts`**

```ts
const WS = process.env.NEXT_PUBLIC_WS ?? "ws://127.0.0.1:8000/ws";

export type BusEvent = { topic: string; payload: any; ts: number };
export type Handler = (e: BusEvent) => void;

export class WsClient {
  private socket: WebSocket | null = null;
  private handlers = new Set<Handler>();
  private retry = 0;

  connect() {
    if (typeof window === "undefined") return;
    this.socket = new WebSocket(WS);
    this.socket.onmessage = (ev) => {
      try {
        const m = JSON.parse(ev.data) as BusEvent;
        this.handlers.forEach((h) => h(m));
      } catch {}
    };
    this.socket.onclose = () => {
      this.retry = Math.min(this.retry + 1, 6);
      setTimeout(() => this.connect(), 500 * 2 ** this.retry);
    };
    this.socket.onopen = () => { this.retry = 0; };
  }

  on(h: Handler) {
    this.handlers.add(h);
    return () => this.handlers.delete(h);
  }
}

export const wsClient = new WsClient();
```

- [ ] **Step 4: Write `ops/lib/store.ts`**

```ts
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
  scrubTs: number | null; // null = follow live
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
```

- [ ] **Step 5: Commit**

```bash
git add ops/lib/
git commit -m "feat(ops): add WS client, REST client, zustand store, shared types"
```

---

### Task 29: App shell with twin canvas + drawer rail

**Files:**
- Create: `ops/app/page.tsx`
- Create: `ops/components/ui/Drawer.tsx`
- Create: `ops/components/ui/DensityLegend.tsx`
- Create: `ops/components/ui/KPIChip.tsx`

- [ ] **Step 1: Write `ops/components/ui/Drawer.tsx`**

```tsx
"use client";
import { Box, Paper, Typography } from "@mui/material";
import { ReactNode } from "react";

export function Drawer({ title, children, density = "standard" }: {
  title: string;
  children: ReactNode;
  density?: "compact" | "standard";
}) {
  return (
    <Paper elevation={0} sx={{
      bgcolor: "background.paper", border: "1px solid", borderColor: "divider",
      borderRadius: 2, p: density === "compact" ? 1.5 : 2, height: "100%", overflowY: "auto",
    }}>
      <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: 1 }}>
        {title}
      </Typography>
      <Box sx={{ mt: 1 }}>{children}</Box>
    </Paper>
  );
}
```

- [ ] **Step 2: Write `ops/components/ui/DensityLegend.tsx`**

```tsx
"use client";
import { Box, Typography } from "@mui/material";

const LEVELS: { los: string; color: string; label: string }[] = [
  { los: "A", color: "#1B5E20", label: "A — free flow" },
  { los: "B", color: "#388E3C", label: "B — minor" },
  { los: "C", color: "#FBC02D", label: "C — reduced" },
  { los: "D", color: "#F57C00", label: "D — restricted" },
  { los: "E", color: "#E64A19", label: "E — severe" },
  { los: "F", color: "#B71C1C", label: "F — critical" },
];

export function DensityLegend() {
  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
      {LEVELS.map((l) => (
        <Box key={l.los} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: l.color }} />
          <Typography variant="caption">{l.label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export const LOS_COLOR: Record<string, string> = Object.fromEntries(LEVELS.map((l) => [l.los, l.color]));
```

- [ ] **Step 3: Write `ops/components/ui/KPIChip.tsx`**

```tsx
"use client";
import { Box, Typography } from "@mui/material";

export function KPIChip({ label, value, tone = "default" }: {
  label: string; value: string | number;
  tone?: "default" | "warning" | "critical" | "success";
}) {
  const colors: Record<string, string> = {
    default: "text.primary",
    warning: "warning.main",
    critical: "error.main",
    success: "success.main",
  };
  return (
    <Box sx={{
      px: 1.5, py: 1, borderRadius: 2, border: "1px solid", borderColor: "divider",
      bgcolor: "background.paper", minWidth: 100,
    }}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>{label}</Typography>
      <Typography variant="h6" sx={{ color: colors[tone], fontFamily: "Roboto Mono" }}>
        {value}
      </Typography>
    </Box>
  );
}
```

- [ ] **Step 4: Write `ops/app/page.tsx`** (skeleton — twin scene fills in next milestone)

```tsx
"use client";
import { Box, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { wsClient } from "@/lib/ws";
import { useStore } from "@/lib/store";
import { Drawer } from "@/components/ui/Drawer";
import { DensityLegend } from "@/components/ui/DensityLegend";
import { KPIChip } from "@/components/ui/KPIChip";

export default function Page() {
  const setLayout = useStore((s) => s.setLayout);
  const onDensity = useStore((s) => s.onDensity);
  const addAlert = useStore((s) => s.addAlert);
  const setWeather = useStore((s) => s.setWeather);
  const addThreat = useStore((s) => s.addThreat);
  const density = useStore((s) => s.density);

  useQuery({ queryKey: ["layout"], queryFn: async () => {
    const l = await api.layout(); setLayout(l); return l;
  }});

  useEffect(() => {
    wsClient.connect();
    const off = wsClient.on((e) => {
      if (e.topic === "density.tick") onDensity(e.payload);
      if (e.topic === "anomaly.detected") addAlert({
        id: e.payload.id, severity: e.payload.severity,
        zone_id: e.payload.zone_id, reason: e.payload.reason,
        los: e.payload.los, density_per_m2: e.payload.density_per_m2,
      });
      if (e.topic === "weather.alert") setWeather(e.payload);
      if (e.topic === "threat.signal") addThreat({
        id: e.payload.id, summary: e.payload.summary, severity: e.payload.severity,
      });
    });
    return () => { off(); };
  }, [onDensity, addAlert, setWeather, addThreat]);

  const phase = density?.phase ?? "—";
  const sim_min = density ? Math.round(density.sim_time_sec / 60) : 0;
  const peak = density ? Math.max(...density.zones.map((z) => z.density_per_m2)) : 0;

  return (
    <Box sx={{ height: "100vh", display: "grid", gridTemplateRows: "auto 1fr auto", gap: 1, p: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1 }}>
        <Typography variant="h5">StadiumOps Command</Typography>
        <Box sx={{ flex: 1 }} />
        <KPIChip label="Phase" value={phase} />
        <KPIChip label="Sim time (min)" value={sim_min} />
        <KPIChip label="Peak density (ppl/m²)" value={peak.toFixed(2)}
          tone={peak >= 2 ? "critical" : peak >= 1 ? "warning" : "success"} />
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 1, minHeight: 0 }}>
        <Box id="twin-host" sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", position: "relative" }}>
          {/* Twin canvas will mount here (Task 30) */}
          <Typography sx={{ p: 2, color: "text.secondary" }}>Digital twin will render here.</Typography>
        </Box>
        <Stack spacing={1} sx={{ overflow: "hidden" }}>
          <Drawer title="Drawer rail">
            <Typography variant="body2" color="text.secondary">
              Alert / Dispatch / Protocol / Agent / Comms drawers wire in next milestones.
            </Typography>
          </Drawer>
        </Stack>
      </Box>

      <Box sx={{ px: 2, py: 1 }}>
        <DensityLegend />
      </Box>
    </Box>
  );
}
```

- [ ] **Step 5: Smoke run (both backend + ops up)**

```bash
uvicorn backend.main:app --port 8000 &
sleep 3
cd ops && npm run dev &
sleep 8
curl -s http://localhost:3000 | grep -o "StadiumOps Command" | head -1
pkill -f "next dev"
pkill -f "uvicorn backend.main"
cd ..
```
Expected: page renders and KPI chips appear after ~5s.

- [ ] **Step 6: Commit**

```bash
git add ops/app/page.tsx ops/components/ui/
git commit -m "feat(ops): app shell with KPI bar, drawer rail, density legend"
```

---

## Milestone H — Digital Twin

### Task 30: R3F scene with procedural stadium geometry

**Files:**
- Create: `ops/components/twin/Scene.tsx`
- Create: `ops/components/twin/Stadium.tsx`
- Create: `ops/components/twin/CameraRig.tsx`

- [ ] **Step 1: Write `ops/components/twin/Stadium.tsx`**

```tsx
"use client";
import { useMemo } from "react";
import * as THREE from "three";

// Procedural stadium: rectangular bowl with raised stands. Coordinates use
// the same XY plane as stadium_layout.json (X: 0–80, Y: 0–80).
export function Stadium() {
  const pitchGeo = useMemo(() => new THREE.PlaneGeometry(60, 60), []);
  const pitchMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2E7D32", roughness: 0.8 }), []);

  const standMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1F232B", roughness: 0.7 }), []);

  return (
    <group position={[0, 0, 0]}>
      {/* Ground / outside ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, 0, 40]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0F1419" />
      </mesh>

      {/* Pitch (centered on layout midpoint) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, 0.01, 40]} geometry={pitchGeo} material={pitchMat} />

      {/* Four stand walls (raised seating areas) */}
      <mesh position={[10, 4, 40]} material={standMat}>
        <boxGeometry args={[20, 8, 70]} />
      </mesh>
      <mesh position={[70, 4, 40]} material={standMat}>
        <boxGeometry args={[20, 8, 70]} />
      </mesh>
      <mesh position={[40, 4, 10]} material={standMat}>
        <boxGeometry args={[70, 8, 20]} />
      </mesh>
      <mesh position={[40, 4, 70]} material={standMat}>
        <boxGeometry args={[70, 8, 20]} />
      </mesh>

      {/* Subtle ambient grid for spatial reference */}
      <gridHelper args={[200, 40, "#1E2632", "#161B22"]} position={[40, 0.02, 40]} />
    </group>
  );
}
```

- [ ] **Step 2: Write `ops/components/twin/CameraRig.tsx`**

```tsx
"use client";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect } from "react";

export type CameraMode = "bird" | "iso" | "walk";

export function CameraRig({ mode }: { mode: CameraMode }) {
  const { camera } = useThree();

  useEffect(() => {
    if (mode === "bird") {
      camera.position.set(40, 110, 40);
      camera.lookAt(40, 0, 40);
    } else if (mode === "iso") {
      camera.position.set(110, 70, 110);
      camera.lookAt(40, 0, 40);
    } else {
      camera.position.set(40, 6, 110);
      camera.lookAt(40, 4, 40);
    }
  }, [mode, camera]);

  return <OrbitControls target={[40, 0, 40]} enableDamping dampingFactor={0.1} />;
}
```

- [ ] **Step 3: Write `ops/components/twin/Scene.tsx`**

```tsx
"use client";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Stadium } from "./Stadium";
import { CameraRig, type CameraMode } from "./CameraRig";

export function Scene({ children }: { children?: React.ReactNode }) {
  const [mode, setMode] = useState<CameraMode>("iso");
  return (
    <Box sx={{ position: "absolute", inset: 0 }}>
      <Canvas shadows camera={{ fov: 45, near: 0.1, far: 1000 }}>
        <color attach="background" args={["#0B0F14"]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[50, 80, 30]} intensity={0.9} castShadow />
        <Stadium />
        {children}
        <CameraRig mode={mode} />
      </Canvas>
      <Box sx={{ position: "absolute", top: 8, right: 8 }}>
        <ToggleButtonGroup
          size="small" exclusive value={mode}
          onChange={(_, v) => v && setMode(v)}
          sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}
        >
          <ToggleButton value="bird">Bird</ToggleButton>
          <ToggleButton value="iso">Iso</ToggleButton>
          <ToggleButton value="walk">Walk</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 4: Mount the Scene in page.tsx**

In `ops/app/page.tsx`, replace the placeholder `<Typography sx={{ p: 2, color: "text.secondary" }}>...` line inside `#twin-host` with:
```tsx
<Scene />
```

And add the import near the top:
```tsx
import { Scene } from "@/components/twin/Scene";
```

- [ ] **Step 5: Smoke run + visual check**

```bash
uvicorn backend.main:app --port 8000 &
sleep 3
cd ops && npm run dev &
sleep 8
echo "Open http://localhost:3000 — confirm 3D stadium renders, camera modes switch."
# leave running for manual check, then:
read -p "Press enter when verified..."
pkill -f "next dev"
pkill -f "uvicorn backend.main"
cd ..
```

- [ ] **Step 6: Commit**

```bash
git add ops/components/twin/ ops/app/page.tsx
git commit -m "feat(twin): add R3F scene with procedural stadium and camera modes"
```

---

### Task 31: Density-painted zone meshes

**Files:**
- Create: `ops/components/twin/Zones.tsx`

- [ ] **Step 1: Write `ops/components/twin/Zones.tsx`**

```tsx
"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { useStore } from "@/lib/store";
import { LOS_COLOR } from "@/components/ui/DensityLegend";

function polyToShape(polygon: number[][]): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(polygon[0][0], polygon[0][1]);
  for (let i = 1; i < polygon.length; i++) shape.lineTo(polygon[i][0], polygon[i][1]);
  shape.closePath();
  return shape;
}

export function Zones() {
  const layout = useStore((s) => s.layout);
  const density = useStore((s) => s.density);
  const horizon = useStore((s) => s.forecastHorizon);

  const zoneStates = useMemo(() => {
    const m = new Map<string, string>();
    for (const z of density?.zones ?? []) {
      const los = horizon === 0 ? z.los : horizon === 5 ? z.los_forecast_5m : horizon === 10 ? z.los_forecast_10m : z.los_forecast_15m;
      m.set(z.zone_id, LOS_COLOR[los] ?? "#444");
    }
    return m;
  }, [density, horizon]);

  if (!layout) return null;

  return (
    <group>
      {layout.zones.map((z) => {
        const shape = polyToShape(z.polygon);
        const geom = new THREE.ShapeGeometry(shape);
        const color = zoneStates.get(z.id) ?? "#333";
        return (
          <mesh key={z.id} geometry={geom} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <meshStandardMaterial color={color} transparent opacity={horizon === 0 ? 0.7 : 0.45} />
          </mesh>
        );
      })}
    </group>
  );
}
```

- [ ] **Step 2: Mount Zones inside Scene**

In `ops/components/twin/Scene.tsx`, add inside the `<Canvas>` after `<Stadium />`:
```tsx
import { Zones } from "./Zones";
```
And in JSX:
```tsx
<Stadium />
<Zones />
{children}
```

- [ ] **Step 3: Smoke run**

```bash
uvicorn backend.main:app --port 8000 &
sleep 3
cd ops && npm run dev &
sleep 8
echo "Open http://localhost:3000 — zones should color-paint and update as sim ticks (~30s of dwell to see arrivals)."
read -p "Press enter when verified..."
pkill -f "next dev"; pkill -f "uvicorn backend.main"; cd ..
```

- [ ] **Step 4: Commit**

```bash
git add ops/components/twin/
git commit -m "feat(twin): paint zones by Fruin LOS, forecast-aware"
```

---

### Task 32: Dispatched-team dots + alert markers + weather front

**Files:**
- Create: `ops/components/twin/DispatchedTeams.tsx`
- Create: `ops/components/twin/AlertMarkers.tsx`
- Create: `ops/components/twin/WeatherFront.tsx`

- [ ] **Step 1: Write `ops/components/twin/DispatchedTeams.tsx`**

```tsx
"use client";
import { useStore } from "@/lib/store";

export function DispatchedTeams() {
  const teams = useStore((s) => s.teams);
  return (
    <group>
      {teams.map((t) => {
        const color = t.status === "responding" ? "#F9AB00" : t.status === "on_task" ? "#8AB4F8" : "#9AA0A6";
        return (
          <mesh key={t.team_id} position={[t.position[0], 2, t.position[1]]}>
            <sphereGeometry args={[1.2, 12, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}
```

- [ ] **Step 2: Write `ops/components/twin/AlertMarkers.tsx`**

```tsx
"use client";
import { useStore } from "@/lib/store";

export function AlertMarkers() {
  const alerts = useStore((s) => s.alerts);
  const layout = useStore((s) => s.layout);
  if (!layout) return null;
  return (
    <group>
      {alerts.slice(0, 6).map((a) => {
        const z = layout.zones.find((zz) => zz.id === a.zone_id);
        if (!z) return null;
        const [cx, cy] = centroid(z.polygon);
        return (
          <mesh key={a.id} position={[cx, 10, cy]}>
            <coneGeometry args={[1.8, 4, 4]} />
            <meshStandardMaterial color={a.severity === "critical" ? "#F28B82" : "#FDD663"} />
          </mesh>
        );
      })}
    </group>
  );
}

function centroid(poly: number[][]): [number, number] {
  const n = poly.length;
  const [sx, sy] = poly.reduce(([ax, ay], [px, py]) => [ax + px, ay + py], [0, 0]);
  return [sx / n, sy / n];
}
```

- [ ] **Step 3: Write `ops/components/twin/WeatherFront.tsx`**

```tsx
"use client";
import { useStore } from "@/lib/store";

export function WeatherFront() {
  const w = useStore((s) => s.weather);
  if (!w || (w.storm_eta_min ?? 999) > 30) return null;
  // Approach line — translucent disc sliding toward stadium
  const dist = (w.storm_eta_min ?? 30) * 0.8;
  return (
    <mesh position={[40 + dist, 12, 40 - dist]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[35, 32]} />
      <meshBasicMaterial color="#5B6CFF" transparent opacity={0.18} />
    </mesh>
  );
}
```

- [ ] **Step 4: Mount in Scene**

In `ops/components/twin/Scene.tsx`, import and render:
```tsx
import { DispatchedTeams } from "./DispatchedTeams";
import { AlertMarkers } from "./AlertMarkers";
import { WeatherFront } from "./WeatherFront";
```
Inside `<Canvas>` after `<Zones />`:
```tsx
<Zones />
<DispatchedTeams />
<AlertMarkers />
<WeatherFront />
```

- [ ] **Step 5: Commit**

```bash
git add ops/components/twin/
git commit -m "feat(twin): overlay teams, alert markers, weather front on scene"
```

---

### Task 33: Time scrubber + Forecast lens + What-if controls

**Files:**
- Create: `ops/components/controls/TimeScrubber.tsx`
- Create: `ops/components/controls/ForecastLens.tsx`
- Create: `ops/components/controls/WhatIfButton.tsx`

- [ ] **Step 1: Write `ops/components/controls/ForecastLens.tsx`**

```tsx
"use client";
import { ToggleButton, ToggleButtonGroup, Box, Typography } from "@mui/material";
import { useStore } from "@/lib/store";

export function ForecastLens() {
  const h = useStore((s) => s.forecastHorizon);
  const set = useStore((s) => s.setForecastHorizon);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>Forecast lens</Typography>
      <ToggleButtonGroup size="small" exclusive value={h} onChange={(_, v) => v !== null && set(v)}>
        <ToggleButton value={0}>Now</ToggleButton>
        <ToggleButton value={5}>+5m</ToggleButton>
        <ToggleButton value={10}>+10m</ToggleButton>
        <ToggleButton value={15}>+15m</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
```

- [ ] **Step 2: Write `ops/components/controls/TimeScrubber.tsx`**

```tsx
"use client";
import { Box, Slider, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useStore } from "@/lib/store";

export function TimeScrubber() {
  const scrubTs = useStore((s) => s.scrubTs);
  const setScrub = useStore((s) => s.setScrubTs);
  const [offset, setOffset] = useState(0);  // seconds back from now
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 360 }}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>Replay</Typography>
      <Slider
        size="small" min={0} max={3600} step={10}
        value={offset}
        onChange={(_, v) => {
          const o = Array.isArray(v) ? v[0] : v;
          setOffset(o);
          setScrub(o === 0 ? null : Date.now() / 1000 - o);
        }}
        sx={{ flex: 1 }}
      />
      <Typography variant="caption" sx={{ fontFamily: "Roboto Mono" }}>
        {scrubTs === null ? "LIVE" : `-${Math.round(offset / 60)}m`}
      </Typography>
      <Button size="small" onClick={() => { setOffset(0); setScrub(null); }}>Live</Button>
    </Box>
  );
}
```

- [ ] **Step 3: Write `ops/components/controls/WhatIfButton.tsx`**

```tsx
"use client";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Stack } from "@mui/material";
import { useState } from "react";
import { api } from "@/lib/api";

export function WhatIfButton() {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);

  async function runScenario() {
    setRunning(true);
    try {
      // Phase 0 what-if: ask the agent to project an alternative action's outcome
      await api.agentAsk(
        "What-if scenario: close Gate 4 and open Gate 6, reroute Section B " +
        "via West Concourse. Project density curve impact at +10 min."
      );
    } finally { setRunning(false); }
  }

  return (
    <>
      <Button size="small" variant="outlined" color="warning" onClick={() => setOpen(true)}>
        What-if branch
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>What-if scenario</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            <Typography variant="body2">
              Branch the live state and project an alternative. Phase 0 uses the AI agent
              to forecast the impact; Phase 1 runs a sandbox sim on Pub/Sub.
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Default scenario: close Gate 4, open Gate 6, reroute Section B via West Concourse.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={runScenario} disabled={running} variant="contained">
            {running ? "Running…" : "Run scenario"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 4: Wire controls into the top bar in page.tsx**

Imports:
```tsx
import { TimeScrubber } from "@/components/controls/TimeScrubber";
import { ForecastLens } from "@/components/controls/ForecastLens";
import { WhatIfButton } from "@/components/controls/WhatIfButton";
```

Modify the top Stack to:
```tsx
<Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1, flexWrap: "wrap", gap: 1 }}>
  <Typography variant="h5">StadiumOps Command</Typography>
  <Box sx={{ flex: 1 }} />
  <ForecastLens />
  <WhatIfButton />
  <KPIChip label="Phase" value={phase} />
  <KPIChip label="Sim time (min)" value={sim_min} />
  <KPIChip label="Peak density (ppl/m²)" value={peak.toFixed(2)}
    tone={peak >= 2 ? "critical" : peak >= 1 ? "warning" : "success"} />
</Stack>
```

Replace the bottom legend bar with:
```tsx
<Stack direction="row" spacing={2} alignItems="center" sx={{ px: 2, py: 1 }}>
  <DensityLegend />
  <Box sx={{ flex: 1 }} />
  <TimeScrubber />
</Stack>
```

- [ ] **Step 5: Smoke run + visual check**

```bash
uvicorn backend.main:app --port 8000 &
sleep 3
cd ops && npm run dev &
sleep 8
echo "Verify: forecast lens toggles change zone color saturation; what-if dialog opens; time scrubber moves."
read -p "Press enter when verified..."
pkill -f "next dev"; pkill -f "uvicorn backend.main"; cd ..
```

- [ ] **Step 6: Commit**

```bash
git add ops/components/controls/ ops/app/page.tsx
git commit -m "feat(twin): add forecast lens, time scrubber, what-if branch controls"
```

---

## Milestone I — Ops drawers

### Task 34: Alert console drawer

**Files:**
- Create: `ops/components/drawers/AlertConsole.tsx`

- [ ] **Step 1: Write `ops/components/drawers/AlertConsole.tsx`**

```tsx
"use client";
import { Stack, Typography, Chip, Box } from "@mui/material";
import { Drawer } from "@/components/ui/Drawer";
import { useStore } from "@/lib/store";

const COLORS: Record<string, "error" | "warning" | "info"> = {
  critical: "error", warning: "warning", info: "info",
};

export function AlertConsole() {
  const alerts = useStore((s) => s.alerts);
  return (
    <Drawer title="Alert console">
      {alerts.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No active alerts.</Typography>
      ) : (
        <Stack spacing={1}>
          {alerts.slice(0, 6).map((a) => (
            <Box key={a.id} sx={{ p: 1, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Chip size="small" color={COLORS[a.severity] ?? "default"} label={a.severity.toUpperCase()} />
                <Typography variant="caption" sx={{ fontFamily: "Roboto Mono", color: "text.secondary" }}>
                  {a.zone_id ?? "—"}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{a.reason}</Typography>
              {a.density_per_m2 !== undefined && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  LOS {a.los} · {a.density_per_m2.toFixed(2)} ppl/m²
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Drawer>
  );
}
```

- [ ] **Step 2: Mount in page.tsx drawer rail**

Replace the placeholder Drawer block in `ops/app/page.tsx` `<Stack spacing={1}>` with:
```tsx
import { AlertConsole } from "@/components/drawers/AlertConsole";
// ...
<AlertConsole />
```

- [ ] **Step 3: Commit**

```bash
git add ops/components/drawers/AlertConsole.tsx ops/app/page.tsx
git commit -m "feat(drawers): add alert console"
```

---

### Task 35: Protocol-armed drawer (with confirm action)

**Files:**
- Create: `ops/components/drawers/ProtocolArmed.tsx`

- [ ] **Step 1: Write `ops/components/drawers/ProtocolArmed.tsx`**

```tsx
"use client";
import { Stack, Typography, Button, Box, Chip, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { wsClient } from "@/lib/ws";

type Armed = {
  id: string; sop: string; name: string; severity: string;
  checklist: string[]; confirmed_by: string | null;
};

export function ProtocolArmed() {
  const [armed, setArmed] = useState<Armed[]>([]);
  const [doneSteps, setDoneSteps] = useState<Record<string, Set<number>>>({});

  useEffect(() => {
    api.opsState().then((s: any) => setArmed(s.protocols_armed ?? []));
    const off = wsClient.on((e) => {
      if (e.topic === "protocol.armed") {
        setArmed((a) => [...a, e.payload]);
      }
      if (e.topic === "protocol.confirmed") {
        setArmed((a) => a.map((p) => p.id === e.payload.id ? { ...p, confirmed_by: e.payload.confirmed_by } : p));
      }
    });
    return () => { off(); };
  }, []);

  async function confirm(id: string) {
    await api.confirmProtocol(id, "ops.commander.demo");
  }

  function toggleStep(id: string, idx: number) {
    setDoneSteps((m) => {
      const s = new Set(m[id] ?? []);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return { ...m, [id]: s };
    });
  }

  return (
    <Drawer title="Protocols armed">
      {armed.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No protocols armed.</Typography>
      ) : (
        <Stack spacing={1}>
          {armed.map((p) => (
            <Box key={p.id} sx={{ p: 1.5, border: "1px solid", borderColor: p.severity === "critical" ? "error.main" : "divider", borderRadius: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2">{p.name}</Typography>
                <Chip size="small" color={p.severity === "critical" ? "error" : "warning"} label={p.sop} />
              </Stack>
              <List dense>
                {p.checklist.map((step, i) => {
                  const done = doneSteps[p.id]?.has(i) ?? false;
                  return (
                    <ListItem key={i} disablePadding onClick={() => toggleStep(p.id, i)} sx={{ cursor: "pointer", py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {done ? <CheckBoxIcon fontSize="small" color="success" /> : <CheckBoxOutlineBlankIcon fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText primary={step} primaryTypographyProps={{ variant: "body2", sx: { textDecoration: done ? "line-through" : "none", color: done ? "text.secondary" : "text.primary" } }} />
                    </ListItem>
                  );
                })}
              </List>
              {p.confirmed_by ? (
                <Chip size="small" color="success" label={`Confirmed by ${p.confirmed_by}`} />
              ) : (
                <Button size="small" variant="contained" color="error" onClick={() => confirm(p.id)}>
                  Confirm + execute
                </Button>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Drawer>
  );
}
```

- [ ] **Step 2: Mount in page.tsx**

```tsx
import { ProtocolArmed } from "@/components/drawers/ProtocolArmed";
// ...
<ProtocolArmed />
```

- [ ] **Step 3: Commit**

```bash
git add ops/components/drawers/ProtocolArmed.tsx ops/app/page.tsx
git commit -m "feat(drawers): add protocol-armed drawer with confirm + checklist"
```

---

### Task 36: AI Agent pane

**Files:**
- Create: `ops/components/drawers/AgentPane.tsx`

- [ ] **Step 1: Write `ops/components/drawers/AgentPane.tsx`**

```tsx
"use client";
import { Stack, Typography, Button, TextField, Box, Chip, LinearProgress } from "@mui/material";
import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { api } from "@/lib/api";
import type { AgentRec } from "@/lib/types";

export function AgentPane() {
  const [ctx, setCtx] = useState("Concourse North at LOS F. Density 2.5 ppl/m². Forecast +10m = F.");
  const [rec, setRec] = useState<AgentRec | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try { setRec((await api.agentAsk(ctx)) as AgentRec); } finally { setLoading(false); }
  }

  return (
    <Drawer title="AI Agent">
      <Stack spacing={1}>
        <TextField multiline rows={2} size="small" value={ctx} onChange={(e) => setCtx(e.target.value)} />
        <Button size="small" variant="contained" onClick={ask} disabled={loading}>
          {loading ? "Thinking…" : "Ask agent"}
        </Button>
        {loading && <LinearProgress />}
        {rec && (
          <Box sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Typography variant="subtitle2">{rec.title}</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", my: 0.5 }}>{rec.rationale}</Typography>
            <Stack spacing={0.25} sx={{ mt: 1 }}>
              {rec.actions.map((a, i) => (
                <Typography key={i} variant="body2">• {a}</Typography>
              ))}
            </Stack>
            <Chip size="small" sx={{ mt: 1 }} label={`Confidence ${Math.round(rec.confidence * 100)}%`} />
          </Box>
        )}
      </Stack>
    </Drawer>
  );
}
```

- [ ] **Step 2: Mount + commit**

In page.tsx add `<AgentPane />` to drawer rail.

```bash
git add ops/components/drawers/AgentPane.tsx ops/app/page.tsx
git commit -m "feat(drawers): add AI agent pane with rationale + confidence"
```

---

### Task 37: Comms drafter drawer

**Files:**
- Create: `ops/components/drawers/CommsDrafter.tsx`

- [ ] **Step 1: Write `ops/components/drawers/CommsDrafter.tsx`**

```tsx
"use client";
import { Stack, Typography, TextField, Button, Chip, Box } from "@mui/material";
import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { api } from "@/lib/api";

const STAND_OPTIONS = ["stand_a", "stand_b", "stand_c", "stand_d"];
const CHANNELS = ["push", "sms", "signage", "pa", "jumbotron"];

export function CommsDrafter() {
  const [title, setTitle] = useState("Move calmly via West Concourse");
  const [body, setBody] = useState("Take the West Concourse, 3-minute walk, calm pace. Route is safe.");
  const [sections, setSections] = useState<string[]>(["stand_b", "stand_c"]);
  const [channels, setChannels] = useState<string[]>(["push", "sms"]);
  const [stagger, setStagger] = useState(90);
  const [sentId, setSentId] = useState<string | null>(null);

  function toggle(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  async function send() {
    const r: any = await api.broadcast({
      title, body, sections, channels, stagger_sec: stagger, operator: "ops.commander.demo",
    });
    setSentId(r.broadcast_id);
  }

  return (
    <Drawer title="Comms drafter">
      <Stack spacing={1}>
        <TextField size="small" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField size="small" label="Body" multiline rows={2} value={body} onChange={(e) => setBody(e.target.value)} />
        <Box>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>Sections (sub-group stagger):</Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}>
            {STAND_OPTIONS.map((s) => (
              <Chip key={s} size="small" label={s} clickable
                color={sections.includes(s) ? "primary" : "default"}
                onClick={() => toggle(sections, setSections, s)} />
            ))}
          </Stack>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>Channels:</Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}>
            {CHANNELS.map((c) => (
              <Chip key={c} size="small" label={c} clickable
                color={channels.includes(c) ? "secondary" : "default"}
                onClick={() => toggle(channels, setChannels, c)} />
            ))}
          </Stack>
        </Box>
        <TextField size="small" type="number" label="Sub-group stagger (sec)"
          value={stagger} onChange={(e) => setStagger(Number(e.target.value))} />
        <Button size="small" variant="contained" color="secondary" onClick={send}>
          Approve + broadcast
        </Button>
        {sentId && (
          <Typography variant="caption" sx={{ color: "success.main", fontFamily: "Roboto Mono" }}>
            Broadcast {sentId.slice(0, 8)} sent.
          </Typography>
        )}
      </Stack>
    </Drawer>
  );
}
```

- [ ] **Step 2: Mount + commit**

```bash
git add ops/components/drawers/CommsDrafter.tsx ops/app/page.tsx
git commit -m "feat(drawers): add comms drafter with section/channel/stagger"
```

---

### Task 38: Dispatch board + Inbound pipeline drawers

**Files:**
- Create: `ops/components/drawers/DispatchBoard.tsx`
- Create: `ops/components/drawers/InboundPipeline.tsx`

- [ ] **Step 1: Write `ops/components/drawers/DispatchBoard.tsx`**

```tsx
"use client";
import { Stack, Typography, Chip, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { api } from "@/lib/api";

type Team = { team_id: string; role: string; position: [number, number]; status: string };

export function DispatchBoard() {
  const [teams, setTeams] = useState<Team[]>([]);
  useEffect(() => {
    const id = setInterval(() => api.opsState().then((s: any) => setTeams(s.teams ?? [])), 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <Drawer title="Dispatch board">
      {teams.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No teams registered.</Typography>
      ) : (
        <Stack spacing={0.5}>
          {teams.map((t) => (
            <Box key={t.team_id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 0.5 }}>
              <Box>
                <Typography variant="body2" sx={{ fontFamily: "Roboto Mono" }}>{t.team_id}</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>{t.role}</Typography>
              </Box>
              <Chip size="small" label={t.status}
                color={t.status === "responding" ? "warning" : t.status === "on_task" ? "primary" : "default"} />
            </Box>
          ))}
        </Stack>
      )}
    </Drawer>
  );
}
```

- [ ] **Step 2: Write `ops/components/drawers/InboundPipeline.tsx`**

```tsx
"use client";
import { Stack, Typography, Box, LinearProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { api } from "@/lib/api";

type Source = { source_id: string; name: string; arrival_rate_per_min: number; fill_pct: number; eta_gate_min: number };

export function InboundPipeline() {
  const [sources, setSources] = useState<Source[]>([]);
  useEffect(() => {
    const id = setInterval(() => api.opsState().then((s: any) => setSources(s.inbound?.sources ?? [])), 5000);
    return () => clearInterval(id);
  }, []);
  return (
    <Drawer title="Inbound pipeline (L2)" density="compact">
      <Stack spacing={1}>
        {sources.map((s) => (
          <Box key={s.source_id}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">{s.name}</Typography>
              <Typography variant="caption" sx={{ fontFamily: "Roboto Mono", color: "text.secondary" }}>
                {s.arrival_rate_per_min.toFixed(0)}/min · ETA {s.eta_gate_min.toFixed(0)}m
              </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={Math.min(100, s.fill_pct * 100)} />
          </Box>
        ))}
      </Stack>
    </Drawer>
  );
}
```

- [ ] **Step 3: Mount in page.tsx drawer rail (all five drawers)**

Update the drawer rail Stack in `ops/app/page.tsx`:
```tsx
import { DispatchBoard } from "@/components/drawers/DispatchBoard";
import { InboundPipeline } from "@/components/drawers/InboundPipeline";
// ...
<Stack spacing={1} sx={{ overflow: "auto" }}>
  <ProtocolArmed />
  <AlertConsole />
  <AgentPane />
  <CommsDrafter />
  <DispatchBoard />
  <InboundPipeline />
</Stack>
```

- [ ] **Step 4: Commit**

```bash
git add ops/components/drawers/ ops/app/page.tsx
git commit -m "feat(drawers): add dispatch board and inbound pipeline"
```

---

## Milestone J — Companion PWA scaffold

### Task 39: Initialize Next.js 15 companion PWA

**Files:**
- Create: `companion/` tree

- [ ] **Step 1: Scaffold**

```bash
mkdir -p companion && cd companion
npx -y create-next-app@15 . --typescript --app --no-tailwind --eslint --src-dir=false --import-alias="@/*" --use-npm --skip-install
npm install
npm install @mui/material @mui/material-nextjs @emotion/react @emotion/cache @emotion/styled @mui/icons-material
npm install zustand @tanstack/react-query
```

- [ ] **Step 2: Configure port**

Edit `companion/package.json` "scripts":
```json
"scripts": {
  "dev": "next dev -p 3001",
  "build": "next build",
  "start": "next start -p 3001",
  "lint": "next lint",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 3: Write `companion/public/manifest.json`**

```json
{
  "name": "MatchDay Companion",
  "short_name": "MatchDay",
  "description": "Personalized matchday guidance",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFBFE",
  "theme_color": "#1A73E8",
  "icons": []
}
```

- [ ] **Step 4: Verify typecheck**

```bash
npm run typecheck
cd ..
```

- [ ] **Step 5: Commit**

```bash
git add companion/
git commit -m "chore(companion): scaffold Next.js 15 PWA with MUI"
```

---

### Task 40: MD3 light theme + Material You + Google fonts

**Files:**
- Create: `companion/lib/theme.ts`
- Create: `companion/lib/types.ts`
- Create: `companion/lib/api.ts`
- Create: `companion/lib/persona.ts`
- Create: `companion/lib/store.ts`
- Create: `companion/app/providers.tsx`
- Create: `companion/app/layout.tsx` (replace)
- Create: `companion/app/globals.css` (replace)

- [ ] **Step 1: Write `companion/lib/theme.ts`**

```ts
"use client";
import { createTheme } from "@mui/material/styles";

// Material You — Companion light scheme
export const companionTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: "#1A73E8", contrastText: "#FFFFFF" },
    secondary: { main: "#0F9D58", contrastText: "#FFFFFF" },
    warning: { main: "#F9AB00" },
    error: { main: "#D93025" },
    success: { main: "#0F9D58" },
    background: { default: "#FFFBFE", paper: "#FFFFFF" },
    text: { primary: "#1B1F23", secondary: "#5F6368" },
  },
  typography: {
    fontFamily: '"Google Sans Text","Roboto Flex","Inter",system-ui,sans-serif',
    h4: { fontFamily: '"Google Sans Display","Inter",sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Google Sans Display","Inter",sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Google Sans Display","Inter",sans-serif', fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 20 },  // Material You: more rounded
});
```

- [ ] **Step 2: Write `companion/lib/types.ts`**

```ts
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
```

- [ ] **Step 3: Write `companion/lib/api.ts`**

```ts
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
```

- [ ] **Step 4: Write `companion/lib/persona.ts`**

```ts
import type { Persona } from "./types";

export const PERSONAS: { id: Persona; label: string; description: string; icon: string }[] = [
  { id: "standard",         label: "Standard fan",       description: "Regular ticket holder", icon: "person" },
  { id: "family",           label: "Family with kids",    description: "Family-mode routing + reunification", icon: "groups" },
  { id: "pmr",              label: "Reduced mobility",    description: "Step-free lanes, slower stagger", icon: "accessible" },
  { id: "hearing_impaired", label: "Hearing-impaired",    description: "Text + vibration only, no audio", icon: "hearing_disabled" },
  { id: "away_fan",         label: "Away-team supporter", description: "Segregated gate + lane", icon: "shield" },
  { id: "first_time",       label: "First-time visitor",  description: "Slower pace + more guidance", icon: "explore" },
];
```

- [ ] **Step 5: Write `companion/lib/store.ts`**

```ts
import { create } from "zustand";
import type { FanPlan } from "./types";

type State = {
  fanId: string;
  plan: FanPlan | null;
  crisisActive: boolean;
  staggerWaveSec: number;  // when this fan's wave fires (0 = immediate)
  setFanId: (id: string) => void;
  setPlan: (p: FanPlan) => void;
  triggerCrisis: (waveSec: number) => void;
  clearCrisis: () => void;
};

export const useStore = create<State>((set) => ({
  fanId: "",
  plan: null,
  crisisActive: false,
  staggerWaveSec: 0,
  setFanId: (id) => set({ fanId: id }),
  setPlan: (p) => set({ plan: p }),
  triggerCrisis: (waveSec) => set({ crisisActive: true, staggerWaveSec: waveSec }),
  clearCrisis: () => set({ crisisActive: false }),
}));
```

- [ ] **Step 6: Write `companion/app/providers.tsx`**

```tsx
"use client";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { companionTheme } from "@/lib/theme";

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={companionTheme}>
        <CssBaseline />
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
```

- [ ] **Step 7: Write `companion/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "MatchDay Companion",
  description: "Personalized matchday guidance",
  manifest: "/manifest.json",
  themeColor: "#1A73E8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Display:wght@400;500;600;700&family=Roboto+Flex:opsz,wght@8..144,300..700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
```

- [ ] **Step 8: Write `companion/app/globals.css`**

```css
html, body { padding: 0; margin: 0; min-height: 100%; }
body { background: #FFFBFE; color: #1B1F23; font-family: "Roboto Flex","Inter",sans-serif; }
.material-symbols-rounded { font-family: "Material Symbols Rounded"; font-weight: normal; font-style: normal; }
```

- [ ] **Step 9: Smoke run**

```bash
cd companion && npm run dev &
sleep 6
curl -s http://localhost:3001 | grep -o "MatchDay Companion" | head -1
pkill -f "next dev"
cd ..
```

- [ ] **Step 10: Commit**

```bash
git add companion/lib/ companion/app/ companion/public/manifest.json
git commit -m "feat(companion): MD3 light theme, Google fonts, providers, persona model"
```

---

### Task 41: Persona picker (onboarding)

**Files:**
- Create: `companion/components/PersonaPicker.tsx`
- Modify: `companion/app/page.tsx`

- [ ] **Step 1: Write `companion/components/PersonaPicker.tsx`**

```tsx
"use client";
import { Box, Card, CardActionArea, CardContent, Stack, Typography, Button, MenuItem, TextField } from "@mui/material";
import { useState } from "react";
import { PERSONAS } from "@/lib/persona";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { Persona } from "@/lib/types";

const SECTIONS = ["stand_a", "stand_b", "stand_c", "stand_d"];
const TRANSITS = ["metro_mg_road", "metro_cubbon_park", "parking_north"];

export function PersonaPicker({ onDone }: { onDone: () => void }) {
  const [persona, setPersona] = useState<Persona>("standard");
  const [section, setSection] = useState("stand_b");
  const [transit, setTransit] = useState("metro_mg_road");
  const setFanId = useStore((s) => s.setFanId);
  const setPlan = useStore((s) => s.setPlan);

  async function start() {
    const fan_id = "fan_" + Math.random().toString(36).slice(2, 8);
    setFanId(fan_id);
    const plan = await api.checkin(fan_id, persona, section, transit);
    setPlan(plan);
    onDone();
  }

  return (
    <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
      <Typography variant="h4">MatchDay Companion</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
        Tell us a bit about you. We'll personalize your matchday.
      </Typography>

      <Typography variant="overline">Who are you?</Typography>
      <Stack spacing={1} sx={{ mb: 3 }}>
        {PERSONAS.map((p) => (
          <Card key={p.id} variant="outlined"
            sx={{ borderColor: persona === p.id ? "primary.main" : "divider", borderWidth: persona === p.id ? 2 : 1 }}>
            <CardActionArea onClick={() => setPersona(p.id)}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box className="material-symbols-rounded" sx={{ fontSize: 32, color: "primary.main" }}>{p.icon}</Box>
                  <Box>
                    <Typography variant="subtitle1">{p.label}</Typography>
                    <Typography variant="body2" color="text.secondary">{p.description}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>

      <Stack spacing={2}>
        <TextField select label="Your section" value={section} onChange={(e) => setSection(e.target.value)} fullWidth>
          {SECTIONS.map((s) => <MenuItem key={s} value={s}>{s.replace("_", " ").toUpperCase()}</MenuItem>)}
        </TextField>
        <TextField select label="Getting to the ground via" value={transit} onChange={(e) => setTransit(e.target.value)} fullWidth>
          {TRANSITS.map((t) => <MenuItem key={t} value={t}>{t.replace(/_/g, " ")}</MenuItem>)}
        </TextField>
        <Button variant="contained" size="large" onClick={start}>Get my plan</Button>
      </Stack>
    </Box>
  );
}
```

- [ ] **Step 2: Write `companion/app/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PersonaPicker } from "@/components/PersonaPicker";

export default function Home() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  if (done) { router.push("/plan"); return null; }
  return <PersonaPicker onDone={() => setDone(true)} />;
}
```

- [ ] **Step 3: Commit**

```bash
git add companion/components/PersonaPicker.tsx companion/app/page.tsx
git commit -m "feat(companion): persona picker onboarding"
```

---

## Milestone K — Companion flows (F1–F10)

### Task 42: F1 — Personalized arrival timing

**Files:**
- Create: `companion/app/plan/page.tsx`

- [ ] **Step 1: Write `companion/app/plan/page.tsx`**

```tsx
"use client";
import { Box, Card, CardContent, Typography, Stack, Button, Chip } from "@mui/material";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function PlanPage() {
  const plan = useStore((s) => s.plan);
  if (!plan) return <Box sx={{ p: 3 }}><Typography>No plan. Go back and set persona.</Typography></Box>;

  const leaveBy = `${Math.max(0, plan.arrive_by_min)} min before match`;
  return (
    <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
      <Typography variant="h4">Your plan</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
        Personalized for {plan.persona.replace("_", " ")}. Section {plan.section.replace("_", " ").toUpperCase()}.
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Leave home</Typography>
          <Typography variant="h5">{leaveBy}</Typography>
          <Typography variant="body2" color="text.secondary">
            Arrival staggered by your section to avoid surges.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Your gate</Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5">{plan.assigned_gate.replace("_", " ").toUpperCase()}</Typography>
            <Chip size="small" label={plan.lane.replace("_", " ")} color="primary" />
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Get here via</Typography>
          <Typography variant="h6">{plan.transit.replace(/_/g, " ")}</Typography>
        </CardContent>
      </Card>

      <Stack spacing={1}>
        <Button variant="outlined" component={Link} href="/gates">Live gate picker</Button>
        <Button variant="outlined" component={Link} href="/queue">Smart queue</Button>
        <Button variant="outlined" component={Link} href="/seat">In-seat copilot</Button>
        <Button variant="outlined" color="warning" component={Link} href="/alert">Demo: crisis push</Button>
        <Button variant="outlined" component={Link} href="/exit">Exit & transit</Button>
        <Button variant="outlined" component={Link} href="/reunify">Reunification</Button>
      </Stack>
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add companion/app/plan/
git commit -m "feat(companion): F1 personalized plan page"
```

---

### Task 43: F2 + F3 — Live gate picker and smart queue

**Files:**
- Create: `companion/app/gates/page.tsx`
- Create: `companion/app/queue/page.tsx`

- [ ] **Step 1: Write `companion/app/gates/page.tsx`**

```tsx
"use client";
import { Box, Card, CardContent, Typography, Stack, Chip, LinearProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";

export default function GatesPage() {
  const plan = useStore((s) => s.plan);
  const { data: gates, isLoading } = useQuery({
    queryKey: ["gates"], queryFn: api.gates, refetchInterval: 5000,
  });
  if (isLoading || !gates) return <LinearProgress />;
  const sorted = [...gates].sort((a, b) => a.wait_min - b.wait_min);
  return (
    <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
      <Typography variant="h4">Pick a gate</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
        Live wait times. Your assigned gate is {plan?.assigned_gate ?? "—"}.
      </Typography>
      <Stack spacing={1}>
        {sorted.map((g) => (
          <Card key={g.gate_id} variant="outlined"
            sx={{ borderColor: g.gate_id === plan?.assigned_gate ? "primary.main" : "divider", borderWidth: g.gate_id === plan?.assigned_gate ? 2 : 1 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle1">{g.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{g.status}</Typography>
                </Box>
                <Chip color={g.wait_min < 5 ? "success" : g.wait_min < 12 ? "warning" : "error"}
                  label={`${g.wait_min.toFixed(0)} min wait`} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
```

- [ ] **Step 2: Write `companion/app/queue/page.tsx`**

```tsx
"use client";
import { Box, Card, CardContent, Typography, LinearProgress, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export default function QueuePage() {
  const plan = useStore((s) => s.plan);
  // Phase-0 mock: animated countdown from a synthesized initial position
  const [pos, setPos] = useState(34);
  const [eta, setEta] = useState(7);
  useEffect(() => {
    const id = setInterval(() => {
      setPos((p) => Math.max(0, p - 2));
      setEta((e) => Math.max(0, +(e - 0.5).toFixed(1)));
    }, 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
      <Typography variant="h4">Smart queue</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
        {plan?.assigned_gate?.replace("_", " ").toUpperCase()} · {plan?.lane.replace("_", " ")}
      </Typography>
      <Card>
        <CardContent>
          <Stack alignItems="center" spacing={1}>
            <Typography variant="overline" color="text.secondary">Position in queue</Typography>
            <Typography variant="h2" sx={{ fontFamily: "Google Sans Display" }}>{pos}</Typography>
            <LinearProgress sx={{ width: "100%", height: 8, borderRadius: 4 }}
              variant="determinate" value={100 - pos * 2.5} />
            <Typography variant="body2" sx={{ mt: 1 }}>ETA to enter: {eta} min</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add companion/app/gates/ companion/app/queue/
git commit -m "feat(companion): F2 gate picker + F3 smart queue"
```

---

### Task 44: F5 — In-seat break copilot

**Files:**
- Create: `companion/app/seat/page.tsx`

- [ ] **Step 1: Write `companion/app/seat/page.tsx`**

```tsx
"use client";
import { Box, Card, CardContent, Typography, Stack, Chip, Button } from "@mui/material";

const RESTROOMS = [
  { id: "restroom_n", name: "Restroom North", wait_now: 3, wait_break: 14 },
  { id: "restroom_s", name: "Restroom South", wait_now: 1, wait_break: 12 },
];
const FOOD = [
  { id: "food_court", name: "Food Court", wait_now: 5, wait_break: 22 },
];

export default function SeatPage() {
  return (
    <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
      <Typography variant="h4">In-seat copilot</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
        Best window to break — avoid the rush at the innings break.
      </Typography>
      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Typography variant="overline">Restrooms</Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {RESTROOMS.map((r) => (
                <Stack key={r.id} direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2">{r.name}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" color="success" label={`Now ${r.wait_now}m`} />
                    <Chip size="small" color="warning" label={`At break ${r.wait_break}m`} />
                  </Stack>
                </Stack>
              ))}
            </Stack>
            <Button size="small" variant="outlined" sx={{ mt: 1 }}>Reserve now slot</Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="overline">Food</Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {FOOD.map((f) => (
                <Stack key={f.id} direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2">{f.name}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" color="success" label={`Order-ahead`} />
                    <Chip size="small" color="warning" label={`Pickup ${f.wait_now}m`} />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add companion/app/seat/
git commit -m "feat(companion): F5 in-seat restroom + food copilot"
```

---

### Task 45: F6 — Crisis calm-path (the headline scene)

**Files:**
- Create: `companion/components/CalmPath.tsx`
- Create: `companion/app/alert/page.tsx`

- [ ] **Step 1: Write `companion/components/CalmPath.tsx`**

```tsx
"use client";
import { Box, Card, CardContent, Typography, Stack, Button, LinearProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export function CalmPath({ section, waveSec, route, body }: {
  section: string; waveSec: number; route: string; body: string;
}) {
  // Until our wave fires, show a holding state
  const [secsToWave, setSecsToWave] = useState(waveSec);
  useEffect(() => {
    if (secsToWave <= 0) return;
    const id = setInterval(() => setSecsToWave((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [secsToWave]);

  // Vibrate when our wave starts (browsers support: window.navigator.vibrate)
  useEffect(() => {
    if (secsToWave === 0 && "vibrate" in navigator) {
      // distinct calm pattern: two short pulses
      navigator.vibrate([150, 100, 150]);
    }
  }, [secsToWave]);

  // TTS — calm voice via Web Speech API when wave fires
  useEffect(() => {
    if (secsToWave === 0 && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(body);
      u.rate = 0.95;
      u.pitch = 0.9;
      window.speechSynthesis.speak(u);
    }
  }, [secsToWave, body]);

  if (secsToWave > 0) {
    return (
      <Card sx={{ borderColor: "warning.main", borderWidth: 2, bgcolor: "#FFF8E1" }} variant="outlined">
        <CardContent>
          <Typography variant="overline" color="warning.main">Holding — your wave in {secsToWave}s</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            For everyone's safety, sections are guided one at a time. Please remain in your seat.
          </Typography>
          <LinearProgress sx={{ mt: 1 }} variant="determinate" value={100 - (secsToWave / waveSec) * 100} />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card sx={{ borderColor: "primary.main", borderWidth: 2, bgcolor: "#E8F0FE" }} variant="outlined">
      <CardContent>
        <Typography variant="overline" color="primary.main">Calm-path — Section {section}</Typography>
        <Typography variant="h6" sx={{ my: 1 }}>{body}</Typography>
        <Box sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">Route</Typography>
          <Typography variant="body1" sx={{ fontFamily: "Google Sans Display" }}>{route}</Typography>
        </Box>
        <Button sx={{ mt: 2 }} variant="contained" fullWidth>I'm moving</Button>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Write `companion/app/alert/page.tsx`**

```tsx
"use client";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useState } from "react";
import { CalmPath } from "@/components/CalmPath";
import { useStore } from "@/lib/store";

// Wave map: Section A first (0s), B at 90s, C at 180s, D at 270s
const WAVE: Record<string, number> = {
  stand_a: 0, stand_b: 90, stand_c: 180, stand_d: 270,
};

export default function AlertPage() {
  const plan = useStore((s) => s.plan);
  const [scenario, setScenario] = useState<"crush" | "storm" | null>(null);

  const section = plan?.section ?? "stand_b";
  const wave = WAVE[section] ?? 0;

  if (!scenario) {
    return (
      <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
        <Typography variant="h4">Crisis demo</Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
          Pick a scenario. The wave assigned to your section is {wave}s
          (Sections are staggered to avoid simultaneous mass movement.)
        </Typography>
        <Stack spacing={1}>
          <Button variant="outlined" color="error" onClick={() => setScenario("crush")}>
            Crowd surge at Concourse North
          </Button>
          <Button variant="outlined" color="warning" onClick={() => setScenario("storm")}>
            Storm cell inbound (12 min)
          </Button>
        </Stack>
      </Box>
    );
  }

  const body = scenario === "crush"
    ? "Move calmly with the people around you. Route is safe. You will be outside in 4 minutes."
    : "Move calmly to the covered concourse. Storm expected in 12 minutes. The route is safe.";
  const route = scenario === "crush"
    ? "Take the West Concourse, 3-minute walk."
    : "Take the South Concourse exit — covered, 2-minute walk.";

  return (
    <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Alert</Typography>
      <CalmPath section={section} waveSec={wave} route={route} body={body} />
      <Button sx={{ mt: 2 }} fullWidth onClick={() => setScenario(null)}>Reset demo</Button>
    </Box>
  );
}
```

- [ ] **Step 3: Smoke test (manual)**

Run both apps. Open Companion → onboarding → choose Section C → open `/alert` → pick "Crowd surge". Expect: "Holding — your wave in 180s" countdown, then route + TTS + vibrate.

- [ ] **Step 4: Commit**

```bash
git add companion/components/CalmPath.tsx companion/app/alert/
git commit -m "feat(companion): F6 crisis calm-path with staggered wave + TTS + vibrate"
```

---

### Task 46: F8 + F9 — Staggered exit + transit sync

**Files:**
- Create: `companion/app/exit/page.tsx`

- [ ] **Step 1: Write `companion/app/exit/page.tsx`**

```tsx
"use client";
import { Box, Card, CardContent, Typography, Stack, Button, Chip, LinearProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";

const STAGGER_BY_SECTION: Record<string, number> = {
  stand_a: 0, stand_b: 6, stand_c: 12, stand_d: 18,  // minutes
};

export default function ExitPage() {
  const plan = useStore((s) => s.plan);
  const section = plan?.section ?? "stand_b";
  const staggerMin = STAGGER_BY_SECTION[section] ?? 0;
  const [accepted, setAccepted] = useState(false);
  const [remaining, setRemaining] = useState(staggerMin * 60);

  useEffect(() => {
    if (!accepted) return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [accepted]);

  return (
    <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
      <Typography variant="h4">Exit & transit</Typography>
      {!accepted ? (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="overline">Stay {staggerMin} extra minutes</Typography>
            <Typography variant="h6" sx={{ my: 1 }}>Get a free drink + reserved metro slot</Typography>
            <Typography variant="body2" color="text.secondary">
              Your section is in wave {staggerMin === 0 ? "A (first)" : `at +${staggerMin}m`}.
              Leaving with your wave avoids platform crush.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button variant="contained" fullWidth onClick={() => setAccepted(true)}>Accept</Button>
              <Button variant="outlined" fullWidth>Leave now</Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="overline">Your reserved metro slot</Typography>
            <Typography variant="h3" sx={{ fontFamily: "Google Sans Display", my: 1 }}>
              {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
            </Typography>
            <LinearProgress variant="determinate" value={100 - (remaining / (staggerMin * 60 || 1)) * 100} />
            <Stack spacing={0.5} sx={{ mt: 2 }}>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Line</Typography><Chip size="small" label="Purple" /></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Platform</Typography><Chip size="small" label="2" /></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Carriage</Typography><Chip size="small" label="C" /></Stack>
            </Stack>
            {remaining === 0 && (
              <Typography variant="body1" sx={{ mt: 2, color: "success.main" }}>
                Time to move. Take the {plan?.assigned_gate?.toUpperCase()} exit.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add companion/app/exit/
git commit -m "feat(companion): F8 staggered exit + F9 transit-synced metro slot"
```

---

### Task 47: F10 — Reunification (family mode)

**Files:**
- Create: `companion/app/reunify/page.tsx`

- [ ] **Step 1: Write `companion/app/reunify/page.tsx`**

```tsx
"use client";
import { Box, Card, CardContent, Typography, Stack, Button, Chip, TextField } from "@mui/material";
import { useState } from "react";
import { useStore } from "@/lib/store";

const MEMBERS = [
  { name: "Aarav", age: 7, status: "with you" },
  { name: "Diya", age: 11, status: "with you" },
];

export default function ReunifyPage() {
  const plan = useStore((s) => s.plan);
  const [missingName, setMissingName] = useState("");
  const [reported, setReported] = useState(false);

  if (plan?.persona !== "family") {
    return (
      <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
        <Typography variant="h4">Reunification</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Family mode unlocks reunification, group tracking, and child-safety routing.
          Re-onboard as a family persona to demo this.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 540, mx: "auto" }}>
      <Typography variant="h4">Family</Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
        Your group of {MEMBERS.length}.
      </Typography>
      <Stack spacing={1}>
        {MEMBERS.map((m) => (
          <Card key={m.name} variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle1">{m.name}</Typography>
                  <Typography variant="caption" color="text.secondary">Age {m.age}</Typography>
                </Box>
                <Chip size="small" color="success" label={m.status} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Typography variant="overline">Report missing</Typography>
        {!reported ? (
          <Stack spacing={1} sx={{ mt: 1 }}>
            <TextField size="small" label="Who?" value={missingName} onChange={(e) => setMissingName(e.target.value)} />
            <Button variant="contained" color="warning" disabled={!missingName} onClick={() => setReported(true)}>
              Report missing
            </Button>
          </Stack>
        ) : (
          <Card sx={{ mt: 1, bgcolor: "#FFF8E1" }}>
            <CardContent>
              <Typography variant="body1">
                {missingName} reported missing. All staff radios + the command center have been notified.
                Stay where you are — meet at <strong>Lost &amp; Found Point 3 (Concourse East)</strong>.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add companion/app/reunify/
git commit -m "feat(companion): F10 family-mode reunification + lost-person report"
```

---

## Milestone L — Demo runner, README, end-to-end smoke

### Task 48: Demo scene runner endpoint

**Files:**
- Modify: `backend/api/ops.py`
- Modify: `backend/main.py`

- [ ] **Step 1: Add scene-runner endpoint to `backend/api/ops.py`**

Append the following at the bottom of `backend/api/ops.py`:
```python
import asyncio

class SceneRequest(BaseModel):
    name: str  # "entry_surge" | "storm" | "drone_threat" | "exit_surge"


@router.post("/demo/scene")
async def run_scene(req: SceneRequest, request: Request):
    s = request.app.state
    name = req.name
    if name == "entry_surge":
        s.sim.inject_surge(zone_id="concourse_n", magnitude=4500)
        # Dispatch a team in response
        s.staff.dispatch("alpha", "Direct flow at Concourse North", [40, 80])
        return {"ok": True, "scene": name}
    if name == "storm":
        await s.weather.inject_storm(eta_min=12, lightning_km=8.0)
        return {"ok": True, "scene": name}
    if name == "drone_threat":
        await s.threat.inject(summary="Unauthorized drone detected over east stand",
                              severity="critical", confidence=0.88,
                              sources=["airspace-adapter", "social-x"], distance_km=0.3)
        return {"ok": True, "scene": name}
    if name == "exit_surge":
        # Advance sim time to post-match by injecting a big batch
        for zone_id in ("stand_a", "stand_b", "stand_c", "stand_d"):
            s.sim.inject_surge(zone_id=zone_id, magnitude=-200)  # drain stands
        for zone_id in ("concourse_n", "concourse_s", "concourse_e", "concourse_w"):
            s.sim.inject_surge(zone_id=zone_id, magnitude=200)
        return {"ok": True, "scene": name}
    raise HTTPException(400, f"unknown scene: {name}")
```

- [ ] **Step 2: Add demo controls strip in ops page**

In `ops/app/page.tsx`, add an import:
```tsx
import { Button } from "@mui/material";
```
(already present) — then add a top-of-page demo strip just under the heading Stack:
```tsx
<Stack direction="row" spacing={1} sx={{ px: 1, pb: 1 }}>
  <Button size="small" variant="outlined" color="error"
    onClick={() => fetch("http://127.0.0.1:8000/api/ops/demo/scene",
      { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "entry_surge" }) })}>
    Scene: Entry surge
  </Button>
  <Button size="small" variant="outlined" color="warning"
    onClick={() => fetch("http://127.0.0.1:8000/api/ops/demo/scene",
      { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "storm" }) })}>
    Scene: Storm
  </Button>
  <Button size="small" variant="outlined"
    onClick={() => fetch("http://127.0.0.1:8000/api/ops/demo/scene",
      { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "drone_threat" }) })}>
    Scene: Drone threat
  </Button>
  <Button size="small" variant="outlined" color="secondary"
    onClick={() => fetch("http://127.0.0.1:8000/api/ops/demo/scene",
      { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "exit_surge" }) })}>
    Scene: Exit surge
  </Button>
</Stack>
```

- [ ] **Step 3: Smoke test**

```bash
uvicorn backend.main:app --port 8000 &
sleep 3
cd ops && npm run dev &
sleep 8
echo "Open http://localhost:3000 — click 'Scene: Entry surge'. Expect: critical alert, CROWD_CRUSH_RISK protocol armed."
read -p "Press enter when verified..."
pkill -f "next dev"; pkill -f "uvicorn backend.main"; cd ..
```

- [ ] **Step 4: Commit**

```bash
git add backend/api/ops.py ops/app/page.tsx
git commit -m "feat(demo): add scene runner endpoint + ops demo strip"
```

---

### Task 49: README with run instructions + demo script

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# StadiumOps Digital Twin + MatchDay Companion

Real-time command platform for cricket stadium operations, paired with a fan
companion PWA. Phase-0 prototype mapping to the production architecture in
`docs/superpowers/specs/2026-05-23-stadiumops-digital-twin-design.md`.

## Quick start

### 1. Backend

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # add GOOGLE_API_KEY for real Gemini mode (optional)
uvicorn backend.main:app --reload --port 8000
```

Backend serves:
- `GET  /health`
- `GET  /api/layout`
- `GET  /api/ops/state`
- `POST /api/ops/inject/{surge,storm,threat}`
- `POST /api/ops/protocol/confirm`
- `POST /api/ops/comms/broadcast`
- `POST /api/ops/agent/ask`
- `POST /api/ops/demo/scene`
- `POST /api/fan/checkin`
- `GET  /api/fan/gates`
- `WS   /ws`

### 2. Ops dashboard

```bash
cd ops
npm install
npm run dev    # http://localhost:3000
```

### 3. Companion PWA

```bash
cd companion
npm install
npm run dev    # http://localhost:3001
```

## Demo script (5 minutes, side-by-side)

Open both screens. Companion onboard as **Family** persona, Section **C**.

1. **Pre-match** — Companion shows personalized plan (F1). Ops shows
   Inbound Pipeline drawer with live arrival ETAs.
2. **Entry surge** — Ops "Scene: Entry surge". Twin's Concourse North
   flashes red, Alert console fires, `CROWD_CRUSH_RISK` protocol arms.
   Click **AI Agent → Ask** with the suggested context — get reroute rec.
   Open **Comms drafter** → Sections B, C → Approve broadcast.
   Switch to Companion `/alert` → "Crowd surge" — observe holding state
   counting down 180s (Section C is wave 3), then calm-path + TTS + vibrate.
3. **Storm** — Ops "Scene: Storm". Weather front renders on twin,
   `STORM_INBOUND` armed. Companion `/alert` → "Storm" scenario.
4. **Drone threat** — Ops "Scene: Drone threat". Threat signal appears;
   `UNAUTHORIZED_DRONE` armed. Police agency would confirm in Phase 1.
5. **Exit** — Ops "Scene: Exit surge". Companion `/exit` shows staggered
   slot + transit countdown.

## Architecture (Phase 0 → Phase 1+)

| Phase 0 (this build) | Phase 1+ swap |
|---|---|
| Single FastAPI process | GKE Autopilot microservices |
| In-process `EventBus` | Cloud Pub/Sub topics |
| In-memory state store | Firestore + Memorystore |
| Procedural stadium model | Real venue glTF |
| Simulated G5 edge CV events | Coral / Jetson at CCTV |
| Mock JWT | Identity Platform SSO |

See `docs/superpowers/specs/2026-05-23-stadiumops-digital-twin-design.md` for the full target architecture.

## Tests

```bash
pytest                                # backend unit tests
cd ops && npm run typecheck            # ops typecheck
cd companion && npm run typecheck      # companion typecheck
```

## Tech stack

- **Backend:** Python 3.11, FastAPI, Pydantic, google-genai, pytest
- **Ops dashboard:** Next.js 15, TypeScript, MUI (Material Design 3), React Three Fiber, Zustand
- **Companion PWA:** Next.js 15, TypeScript, MUI (Material You)
- **Fonts:** Google Sans Display, Roboto Flex, Roboto Mono, Material Symbols
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with quick-start and 5-min demo script"
```

---

### Task 50: End-to-end smoke test (Playwright)

**Files:**
- Create: `ops/tests/twin.smoke.spec.ts`
- Modify: `ops/package.json`

- [ ] **Step 1: Install Playwright in ops**

```bash
cd ops
npm install --save-dev @playwright/test
npx playwright install chromium
cd ..
```

- [ ] **Step 2: Write `ops/tests/twin.smoke.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("ops dashboard renders header, KPI bar, density legend", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page.getByText("StadiumOps Command")).toBeVisible();
  await expect(page.getByText("Phase")).toBeVisible();
  await expect(page.getByText("A — free flow")).toBeVisible();
});

test("entry-surge scene triggers an alert", async ({ page, request }) => {
  await page.goto("http://localhost:3000");
  await request.post("http://127.0.0.1:8000/api/ops/demo/scene", {
    data: { name: "entry_surge" },
  });
  // Wait up to 12s for the anomaly to ripple through the sim
  await expect(page.getByText(/CROWD_CRUSH_RISK|crush risk/i).first()).toBeVisible({ timeout: 15000 });
});
```

- [ ] **Step 3: Add script in `ops/package.json`**

```json
"scripts": {
  "dev": "next dev -p 3000",
  "build": "next build",
  "start": "next start -p 3000",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test:smoke": "playwright test tests/twin.smoke.spec.ts"
}
```

- [ ] **Step 4: Run the smoke test**

```bash
uvicorn backend.main:app --port 8000 &
sleep 3
cd ops && npm run dev &
sleep 10
npm run test:smoke
pkill -f "next dev"; pkill -f "uvicorn backend.main"; cd ..
```
Expected: both tests pass.

- [ ] **Step 5: Commit**

```bash
git add ops/tests/ ops/package.json
git commit -m "test: add Playwright smoke test for ops dashboard + entry-surge"
```

---

### Task 51: Final polish + run-all script

**Files:**
- Create: `run.sh`
- Modify: `.gitignore`

- [ ] **Step 1: Write `run.sh`**

```bash
#!/usr/bin/env bash
# Convenience launcher for the full Phase-0 stack.
set -e
trap "pkill -P $$" EXIT

if [ ! -d ".venv" ]; then
  python3.11 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
else
  source .venv/bin/activate
fi

uvicorn backend.main:app --port 8000 &
(cd ops && npm install --silent && npm run dev) &
(cd companion && npm install --silent && npm run dev) &
echo ""
echo "Backend:    http://127.0.0.1:8000"
echo "Ops:        http://localhost:3000"
echo "Companion:  http://localhost:3001"
wait
```

- [ ] **Step 2: Make executable**

```bash
chmod +x run.sh
```

- [ ] **Step 3: Append to `.gitignore`**

```bash
echo "playwright-report/" >> .gitignore
echo "test-results/" >> .gitignore
```

- [ ] **Step 4: Final commit**

```bash
git add run.sh .gitignore
git commit -m "chore: add run.sh launcher and ignore playwright artefacts"
```

---

## Self-review

**Spec coverage check (every spec section → at least one task):**

| Spec section | Tasks |
|---|---|
| §3.1 G1 Integration Hub | Architecture documented; Phase 0 covers two adapter shapes inside G3 (T16) and G4 (T17) — explicit `g1-adapter` directory deferred to Phase 1 per §15.3 swap table |
| §3.1 G2 Field Response | T20 (staff) — handheld + radio gateway deferred per §15.3 |
| §3.1 G3 Weather Intelligence | T16 |
| §3.1 G4 Threat Intelligence | T17 |
| §3.1 G5 Edge CV | T8 (simulated via anomaly engine inputs) — Coral/Jetson per §15.3 |
| §3.2 L1 Density | T7 |
| §3.2 L2 Inbound | T18 |
| §3.2 L3 Anomaly | T8 |
| §3.2 L4 Medical | T21 |
| §3.2 L5 Protocol | T13 |
| §3.2 L6 Comms | T14 |
| §3.2 L7 Audit | T22 |
| §3.2 L8 Ticketing | T19 |
| §3.2 L9 Staff | T20 |
| §3.3 Digital Twin | T30, T31, T32, T33 |
| §3.4 F1 timing | T42 |
| §3.4 F2 gate picker | T43 |
| §3.4 F3 smart queue | T43 |
| §3.4 F4 frictionless scan | Persona-driven gate/lane assignment via T23 + T41; full NFC deferred per §15.3 |
| §3.4 F5 break copilot | T44 |
| §3.4 F6 calm-path | T45 |
| §3.4 F7 PRM & family | T23, T41, T47 |
| §3.4 F8 staggered exit | T46 |
| §3.4 F9 transit-synced | T46 |
| §3.4 F10 reunification | T47 |
| §4 Architecture | Documented in spec; Phase-0 single-process per §15.3 |
| §7 Identity/RBAC/multi-tenancy | Mock operator string in T35 confirm; full Identity Platform per §15.3 |
| §8 UI/UX (MD3 + Google fonts) | T27 (ops), T40 (companion) |
| §9 AI agent | T12 |
| §15 Demo flow | T48, T50 |

**Placeholder scan:** No "TBD", no "implement later", no "similar to Task N". Every step shows the code or the exact command.

**Type consistency:** `ZoneState`, `LOS`, `Severity`, `Protocol`, `Alert`, `AgentRec`, `FanPlan` defined once (T5/T28/T40) and used consistently. Field names match across `backend/schemas.py` and `ops/lib/types.ts` / `companion/lib/types.ts`. Methods: `inject_surge`, `inject_storm`, `inject` (threat), `confirm`, `send` (comms) — names stable across tasks.

**Risks flagged:**
- Three.js peer dependency may pull a slightly different version on `npm install` — pin in package.json after first install if needed.
- `next dev` first start can be slow (~10–15s); smoke test sleep windows reflect this.
- WebSocket reconnect in `ws.ts` uses exponential backoff; in long-running demos verify no zombie sockets.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-23-stadiumops-digital-twin-plan.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for a long plan like this (51 tasks).

**2. Inline Execution** — Execute tasks in this session using `executing-plans`, batch execution with checkpoints for review.

**Which approach?**
