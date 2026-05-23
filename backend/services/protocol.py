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
