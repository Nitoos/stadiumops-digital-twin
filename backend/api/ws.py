"""WebSocket endpoint for live event streaming to dashboards.

Each connection subscribes to a configurable topic set. Server pushes every
matching event. On disconnect, the subscriber is removed from the bus.
"""
from __future__ import annotations

import asyncio
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from backend.event_bus import bus, Event

log = logging.getLogger(__name__)

router = APIRouter()

DEFAULT_TOPICS = (
    "density.tick",
    "anomaly.detected",
    "protocol.armed",
    "protocol.confirmed",
    "comms.broadcast",
    "weather.alert",
    "threat.signal",
)


@router.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    queue: asyncio.Queue = asyncio.Queue(maxsize=200)

    async def forwarder(event: Event) -> None:
        if queue.full():
            return  # drop on backpressure rather than block the bus
        await queue.put({"topic": event.topic, "payload": event.payload, "ts": event.ts})

    for topic in DEFAULT_TOPICS:
        bus.subscribe(topic, forwarder)

    try:
        while True:
            try:
                msg = await asyncio.wait_for(queue.get(), timeout=15)
                await websocket.send_text(json.dumps(msg))
            except asyncio.TimeoutError:
                await websocket.send_text(json.dumps({"topic": "ping", "ts": 0, "payload": {}}))
    except WebSocketDisconnect:
        log.info("ws disconnected")
    except Exception:
        log.exception("ws error")
