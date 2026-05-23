"""L1 — Predictive Density (Fruin LOS + 5/10/15-min forecast).

Fruin pedestrian Level of Service thresholds (people/m²):
  A < 0.3    free flow
  B < 0.45   minor crowding
  C < 0.7    reduced speed
  D < 1.0    restricted
  E < 2.0    severely restricted
  F >= 2.0   critical / crush risk
"""
from __future__ import annotations

from collections import deque
from typing import Iterable

from backend.layout import Layout
from backend.schemas import LOS, ZoneState
from backend.services.crowd_sim import Snapshot

LOS_THRESHOLDS: list[tuple[float, LOS]] = [
    (0.3, "A"),
    (0.45, "B"),
    (0.7, "C"),
    (1.0, "D"),
    (2.0, "E"),
]


def classify_los(density_per_m2: float) -> LOS:
    for threshold, grade in LOS_THRESHOLDS:
        if density_per_m2 < threshold:
            return grade
    return "F"


class DensityService:
    """Computes Fruin LOS + forecasts per zone.

    Forecast uses exponential smoothing on a sliding window of recent samples.
    Phase-1 swap: Vertex AI time-series model.
    """

    WINDOW = 6  # ~30 s of ticks at 5 s cadence

    def __init__(self, layout: Layout) -> None:
        self.layout = layout
        self._history: dict[str, deque[float]] = {
            z.id: deque(maxlen=self.WINDOW) for z in layout.zones
        }
        self._area: dict[str, float] = {z.id: z.area_m2 for z in layout.zones}
        self._cap: dict[str, int] = {z.id: z.capacity for z in layout.zones}

    def compute(self, snap: Snapshot) -> list[ZoneState]:
        out: list[ZoneState] = []
        for z in snap.zones:
            area = self._area[z.zone_id]
            density = z.occupancy / area if area > 0 else 0.0
            self._history[z.zone_id].append(density)
            forecast = self._forecast(z.zone_id, density)
            out.append(ZoneState(
                zone_id=z.zone_id,
                density_per_m2=round(density, 3),
                los=classify_los(density),
                occupancy=z.occupancy,
                capacity=self._cap[z.zone_id],
                los_forecast_5m=classify_los(forecast[0]),
                los_forecast_10m=classify_los(forecast[1]),
                los_forecast_15m=classify_los(forecast[2]),
            ))
        return out

    def _forecast(self, zone_id: str, current: float) -> tuple[float, float, float]:
        hist = list(self._history[zone_id])
        if len(hist) < 2:
            return current, current, current
        # First-order exponential smoothing: trend = avg delta
        deltas = [hist[i] - hist[i - 1] for i in range(1, len(hist))]
        trend_per_tick = sum(deltas) / len(deltas)
        # Tick assumed 5 s; project ahead in tick units
        ticks_5m = 60
        ticks_10m = 120
        ticks_15m = 180
        return (
            max(0.0, current + trend_per_tick * ticks_5m),
            max(0.0, current + trend_per_tick * ticks_10m),
            max(0.0, current + trend_per_tick * ticks_15m),
        )
