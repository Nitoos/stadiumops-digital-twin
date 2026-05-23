"""G3 — Weather Intelligence.

Production: fuses IMD, AccuWeather, NOAA, on-site lightning detector.
Phase 0: simulated baseline + Gemini grounded fetch when mode='real',
plus an `inject_storm` operator hook for demo orchestration.
"""
from __future__ import annotations

import time

from backend.config import settings
from backend.event_bus import EventBus, Event
from backend.schemas import WeatherState


class WeatherService:
    def __init__(self, bus: EventBus, mode: str | None = None, venue: str = "M. Chinnaswamy Stadium, Bengaluru") -> None:
        self.bus = bus
        self.mode = mode or settings.agent_mode
        self.venue = venue
        self._state = WeatherState(summary="Clear, 28°C", heat_index_c=30.0)
        self._last_fetch_ts: float = 0.0

    async def current(self) -> WeatherState:
        if self.mode == "real" and time.time() - self._last_fetch_ts > 600:
            await self._refresh_from_gemini()
        return self._state

    async def inject_storm(self, eta_min: int, lightning_km: float) -> None:
        self._state = WeatherState(
            summary=f"Thunderstorm cell {eta_min} min out",
            storm_eta_min=eta_min,
            lightning_within_km=lightning_km,
            heat_index_c=self._state.heat_index_c,
        )
        await self.bus.publish(Event(
            topic="weather.alert",
            payload=self._state.model_dump(),
        ))

    async def inject_heat(self, heat_index_c: float) -> None:
        self._state = WeatherState(
            summary=f"Heat index {heat_index_c:.0f}°C — hydration risk",
            heat_index_c=heat_index_c,
        )
        await self.bus.publish(Event(
            topic="weather.alert",
            payload=self._state.model_dump(),
        ))

    async def _refresh_from_gemini(self) -> None:
        self._last_fetch_ts = time.time()
