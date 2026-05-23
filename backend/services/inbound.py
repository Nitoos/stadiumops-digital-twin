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
        peak_time = 45 * 60
        sigma = 18 * 60
        scale = math.exp(-((sim_time_sec - peak_time) ** 2) / (2 * sigma ** 2))
        sources: list[SourceState] = []
        total = 0.0
        for t in self.layout.transit:
            peak = self._peak.get(t.id, 50)
            rate = peak * scale * (0.9 + 0.2 * self.rng.random())
            self._fills[t.id] = min(1.0, self._fills[t.id] + rate / 6000)
            eta = max(1, t.distance_m / 80)
            sources.append(SourceState(
                source_id=t.id, name=t.name,
                arrival_rate_per_min=round(rate, 1),
                fill_pct=round(self._fills[t.id], 2),
                eta_gate_min=round(eta, 1),
            ))
            total += rate
        return InboundState(sources=sources, total_inbound_per_min=round(total, 1))
