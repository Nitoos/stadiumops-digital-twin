"""L3 — Behavioural anomaly engine.

Phase 0: detects density anomalies (LOS E/F) and forecast anomalies (LOS D
projected to E within 10m). Emits `anomaly.detected` events.
Phase 1+: ingests G5 edge CV signals (counter-flow, sway, dwell).
"""
from __future__ import annotations

import time
import uuid
from dataclasses import dataclass

from backend.event_bus import EventBus, Event
from backend.schemas import LOS, Severity, ZoneState


@dataclass
class AnomalyRecord:
    zone_id: str
    last_fired_ts: float


class AnomalyEngine:
    def __init__(self, bus: EventBus, dedup_window_sec: int = 60) -> None:
        self.bus = bus
        self.dedup_window_sec = dedup_window_sec
        self._last: dict[str, float] = {}

    async def evaluate(self, states: list[ZoneState]) -> None:
        now = time.time()
        for s in states:
            severity = self._severity_for(s)
            if not severity:
                continue
            last = self._last.get(s.zone_id, 0)
            if now - last < self.dedup_window_sec:
                continue
            self._last[s.zone_id] = now
            await self.bus.publish(Event(
                topic="anomaly.detected",
                payload={
                    "id": str(uuid.uuid4()),
                    "zone_id": s.zone_id,
                    "severity": severity,
                    "los": s.los,
                    "los_forecast_5m": s.los_forecast_5m,
                    "density_per_m2": s.density_per_m2,
                    "reason": self._reason(s),
                },
            ))

    @staticmethod
    def _severity_for(s: ZoneState) -> Severity | None:
        if s.los == "F":
            return "critical"
        if s.los == "E":
            return "warning"
        if s.los == "D" and s.los_forecast_10m in ("E", "F"):
            return "warning"
        return None

    @staticmethod
    def _reason(s: ZoneState) -> str:
        if s.los == "F":
            return f"Critical density {s.density_per_m2:.1f}/m² in {s.zone_id} — crush risk"
        if s.los == "E":
            return f"Severe density {s.density_per_m2:.1f}/m² in {s.zone_id}"
        return f"Density rising in {s.zone_id}; forecast {s.los_forecast_10m} at +10 min"
