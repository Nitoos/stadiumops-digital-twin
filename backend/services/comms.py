"""L6 — Unified comms bus.

Operator approves a Broadcast → fans out to selected channels with sub-group
stagger. Sub-groups are sections (zone_ids of type 'stand'); each section's
stagger offset is index × stagger_sec.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Literal

from backend.event_bus import EventBus, Event

Channel = Literal["push", "sms", "signage", "pa", "jumbotron"]


@dataclass
class Broadcast:
    title: str
    body: str
    sections: list[str]
    channels: list[Channel] = field(default_factory=lambda: ["push", "sms"])
    stagger_sec: int = 90
    route_hint: str | None = None


class CommsBus:
    def __init__(self, bus: EventBus) -> None:
        self.bus = bus

    async def send(self, bc: Broadcast, draft_by: str) -> str:
        if not draft_by:
            raise ValueError("broadcast requires operator")
        broadcast_id = str(uuid.uuid4())
        for idx, section in enumerate(bc.sections):
            offset = idx * bc.stagger_sec
            for channel in bc.channels:
                await self.bus.publish(Event(
                    topic="comms.broadcast",
                    payload={
                        "broadcast_id": broadcast_id,
                        "section": section,
                        "channel": channel,
                        "title": bc.title,
                        "body": bc.body,
                        "route_hint": bc.route_hint,
                        "stagger_offset_sec": offset,
                        "draft_by": draft_by,
                    },
                ))
        return broadcast_id
