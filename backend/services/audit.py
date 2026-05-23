"""L7 — Audit + After-Action Report.

Subscribes to decision-bearing topics and writes an immutable log.
Phase 1+: writes to Cloud Audit Logs + BigQuery; AAR rendered as PDF in
Cloud Storage.
"""
from __future__ import annotations

import time
from collections import Counter

from backend.event_bus import EventBus, Event


class AuditService:
    def __init__(self, bus: EventBus) -> None:
        self.bus = bus
        self._log: list[dict] = []

    def attach(self) -> None:
        self.bus.subscribe("protocol.armed", self._on_event)
        self.bus.subscribe("protocol.confirmed", self._on_event)
        self.bus.subscribe("comms.broadcast", self._on_event)
        self.bus.subscribe("anomaly.detected", self._on_event)

    def _on_event(self, e: Event) -> None:
        self._log.append({
            "ts": e.ts,
            "topic": e.topic,
            "operator": e.payload.get("confirmed_by") or e.payload.get("draft_by"),
            "payload": e.payload,
        })

    def records(self) -> list[dict]:
        return list(self._log)

    def generate_aar(self) -> dict:
        confirmed = [r for r in self._log if r["topic"] == "protocol.confirmed"]
        armed = [r for r in self._log if r["topic"] == "protocol.armed"]
        broadcasts = [r for r in self._log if r["topic"] == "comms.broadcast"]
        anomalies = [r for r in self._log if r["topic"] == "anomaly.detected"]
        return {
            "generated_ts": time.time(),
            "total_decisions": len(self._log),
            "protocols_armed": Counter(r["payload"].get("sop") for r in armed),
            "protocols_confirmed": Counter(r["payload"].get("sop") for r in confirmed),
            "broadcasts_sent": len(broadcasts),
            "anomalies_detected": len(anomalies),
            "first_event_ts": self._log[0]["ts"] if self._log else None,
            "last_event_ts": self._log[-1]["ts"] if self._log else None,
        }
