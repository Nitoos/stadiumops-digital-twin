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
