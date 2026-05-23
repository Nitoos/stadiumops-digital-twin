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
