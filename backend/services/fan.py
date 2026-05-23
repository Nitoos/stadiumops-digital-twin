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
