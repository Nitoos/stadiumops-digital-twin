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


class SceneRequest(BaseModel):
    name: str  # "entry_surge" | "storm" | "drone_threat" | "exit_surge"


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


@router.post("/demo/scene")
async def run_scene(req: SceneRequest, request: Request):
    s = request.app.state
    name = req.name
    if name == "entry_surge":
        s.sim.inject_surge(zone_id="concourse_n", magnitude=4500)
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
        for zone_id in ("stand_a", "stand_b", "stand_c", "stand_d"):
            s.sim.inject_surge(zone_id=zone_id, magnitude=-200)
        for zone_id in ("concourse_n", "concourse_s", "concourse_e", "concourse_w"):
            s.sim.inject_surge(zone_id=zone_id, magnitude=200)
        return {"ok": True, "scene": name}
    raise HTTPException(400, f"unknown scene: {name}")
