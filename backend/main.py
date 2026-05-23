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
from backend.api.ws import router as ws_router


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
app.include_router(ws_router)


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
