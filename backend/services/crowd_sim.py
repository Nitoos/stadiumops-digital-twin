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
        # West stand A → West concourse, North B → North, East C → East, South D → South
        mapping = {
            "stand_a": "concourse_w",
            "stand_b": "concourse_n",
            "stand_c": "concourse_e",
            "stand_d": "concourse_s",
        }
        return mapping.get(stand_id, "concourse_n")

    def _stand_for_concourse(self, concourse_id: str) -> str | None:
        mapping = {
            "concourse_w": "stand_a",
            "concourse_n": "stand_b",
            "concourse_e": "stand_c",
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
