"""Fan REST endpoints — used by MatchDay Companion PWA.

Fan endpoints don't require the ops bearer token (fans authenticate via the
Identity Platform in Phase 1+). Input validation here is just as strict —
fans can't supply unbounded payloads.
"""
from typing import Literal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/fan", tags=["fan"])

_PERSONAS = {"standard", "family", "pmr", "hearing_impaired", "away_fan", "first_time"}
_SECTIONS = {"stand_a", "stand_b", "stand_c", "stand_d"}
_TRANSITS = {"metro_mg_road", "metro_cubbon_park", "parking_north"}


class CheckInRequest(BaseModel):
    fan_id: str = Field(..., min_length=4, max_length=64, pattern=r"^[a-zA-Z0-9_-]+$")
    persona: Literal["standard", "family", "pmr", "hearing_impaired", "away_fan", "first_time"]
    section: Literal["stand_a", "stand_b", "stand_c", "stand_d"]
    transit: Literal["metro_mg_road", "metro_cubbon_park", "parking_north"]
    language: str = Field("en", min_length=2, max_length=8, pattern=r"^[a-z]{2}(-[A-Z]{2})?$")


@router.post("/checkin")
def checkin(req: CheckInRequest, request: Request):
    plan = request.app.state.fan.check_in(
        fan_id=req.fan_id, persona=req.persona,
        section=req.section, transit=req.transit, language=req.language,
    )
    return plan.__dict__


@router.get("/plan/{fan_id}")
def get_plan(fan_id: str, request: Request):
    # Defensive input check (path parameter)
    if not fan_id or len(fan_id) > 64 or not fan_id.replace("_", "").replace("-", "").isalnum():
        raise HTTPException(400, "invalid fan_id")
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
