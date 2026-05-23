"""In-process event bus. Same shape as Pub/Sub for Phase-1 swap-in.

Topics use dot notation: density.tick, anomaly.detected, protocol.armed, etc.
Subscribers may be sync (callable) or async coroutine functions.
At-least-once semantics; subscriber exceptions are logged, not re-raised.
"""
from __future__ import annotations

import asyncio
import inspect
import logging
import time
import uuid
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable, Union

log = logging.getLogger(__name__)

Handler = Union[Callable[["Event"], None], Callable[["Event"], Awaitable[None]]]


@dataclass
class Event:
    topic: str
    payload: dict[str, Any]
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    ts: float = field(default_factory=time.time)


class EventBus:
    def __init__(self) -> None:
        self._subs: dict[str, list[Handler]] = defaultdict(list)
        self._history: list[Event] = []  # for time-scrubber replay

    def subscribe(self, topic: str, handler: Handler) -> None:
        self._subs[topic].append(handler)

    async def publish(self, event: Event) -> None:
        self._history.append(event)
        for handler in list(self._subs.get(event.topic, [])):
            try:
                result = handler(event)
                if inspect.isawaitable(result):
                    asyncio.create_task(self._await_safely(result, event))
            except Exception:
                log.exception("subscriber failed on %s", event.topic)

    @staticmethod
    async def _await_safely(coro: Awaitable[None], event: Event) -> None:
        try:
            await coro
        except Exception:
            log.exception("async subscriber failed on %s", event.topic)

    def history(self, since_ts: float | None = None) -> list[Event]:
        if since_ts is None:
            return list(self._history)
        return [e for e in self._history if e.ts >= since_ts]


# module-level singleton for app-wide use
bus = EventBus()
