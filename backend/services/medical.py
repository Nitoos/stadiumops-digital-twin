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
