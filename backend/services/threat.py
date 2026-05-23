"""G4 — Threat Intelligence.

Production: fuses news, social (X/Reddit), CERT-In, police CAD, airspace
radar, anonymous tip-line. Phase 0: simulated baseline + operator-injection
for demo. Real mode: Gemini grounded news scan every 60s (scaffolded).

Critical guardrail: never auto-broadcasts to fans. L7 confirmation required.
"""
from __future__ import annotations

import time
import uuid

from backend.config import settings
from backend.event_bus import EventBus, Event
from backend.schemas import ThreatSignal


class ThreatService:
    def __init__(self, bus: EventBus, mode: str | None = None) -> None:
        self.bus = bus
        self.mode = mode or settings.agent_mode
        self._recent: list[ThreatSignal] = []

    async def inject(self, summary: str, severity: str = "warning",
                     confidence: float = 0.85, sources: list[str] | None = None,
                     distance_km: float | None = None) -> ThreatSignal:
        sig = ThreatSignal(
            id=str(uuid.uuid4()),
            summary=summary,
            severity=severity,
            confidence=confidence,
            sources=sources or ["operator-injected"],
            distance_km=distance_km,
        )
        self._recent.append(sig)
        await self.bus.publish(Event(
            topic="threat.signal",
            payload=sig.model_dump(),
        ))
        return sig

    async def recent(self) -> list[ThreatSignal]:
        self._recent = self._recent[-50:]
        return list(self._recent)
