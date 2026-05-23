"""In-memory time-indexed state store for time scrubber + replay.

Phase 1 swap: BigQuery for long-term, Firestore for hot state.
"""
from __future__ import annotations

import bisect
import time
from collections import defaultdict
from typing import Any


class StateStore:
    def __init__(self, window_sec: int = 3600) -> None:
        self.window_sec = window_sec
        # kind → sorted list of (ts, payload)
        self._data: dict[str, list[tuple[float, dict[str, Any]]]] = defaultdict(list)

    def record(self, ts: float, kind: str, payload: dict[str, Any]) -> None:
        self._data[kind].append((ts, payload))

    def latest(self, kind: str) -> dict[str, Any] | None:
        items = self._data.get(kind)
        return items[-1][1] if items else None

    def at(self, ts: float, kind: str) -> dict[str, Any] | None:
        items = self._data.get(kind, [])
        if not items:
            return None
        keys = [t for t, _ in items]
        idx = bisect.bisect_right(keys, ts) - 1
        if idx < 0:
            return None
        return items[idx][1]

    def history(self, kind: str) -> list[tuple[float, dict[str, Any]]]:
        return list(self._data.get(kind, []))

    def prune(self) -> None:
        cutoff = time.time() - self.window_sec
        for kind, items in self._data.items():
            self._data[kind] = [(t, p) for t, p in items if t >= cutoff]
