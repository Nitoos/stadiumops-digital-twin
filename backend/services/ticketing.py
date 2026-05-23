"""L8 — Ticketing & Access unification.

Tracks scans, detects duplicates, enforces zone capacity. Phase 1+: replaces
in-memory dicts with Firestore + Memorystore for hot path.
"""
from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass


@dataclass
class ScanResult:
    accepted: bool
    fraud: bool
    reason: str | None = None


class TicketingService:
    def __init__(self, total_tickets: int, zone_caps: dict[str, int] | None = None) -> None:
        self.total_tickets = total_tickets
        self.zone_caps = zone_caps or {}
        self._scanned: set[str] = set()
        self._zone_occ: dict[str, int] = defaultdict(int)
        self._gate_scans: dict[str, int] = defaultdict(int)

    def scan(self, ticket_id: str, gate_id: str, zone_id: str) -> ScanResult:
        if ticket_id in self._scanned:
            return ScanResult(accepted=False, fraud=True, reason="duplicate_scan")
        cap = self.zone_caps.get(zone_id)
        if cap is not None and self._zone_occ[zone_id] >= cap:
            return ScanResult(accepted=False, fraud=True, reason="zone_full")
        self._scanned.add(ticket_id)
        self._zone_occ[zone_id] += 1
        self._gate_scans[gate_id] += 1
        return ScanResult(accepted=True, fraud=False)

    def scanned(self) -> int:
        return len(self._scanned)

    def zone_occupancy(self, zone_id: str) -> int:
        return self._zone_occ[zone_id]

    def reconciliation(self) -> dict:
        return {
            "total_tickets": self.total_tickets,
            "scanned": len(self._scanned),
            "remaining": self.total_tickets - len(self._scanned),
            "by_zone": dict(self._zone_occ),
            "by_gate": dict(self._gate_scans),
        }
