"""WebSocket endpoint for live event streaming to dashboards.

Authenticated via the ops bearer token. The token can be passed via:
  - `Authorization: Bearer <t>` header (non-browser clients)
  - `?token=<t>` query string (browser clients — WS API can't set headers)

On invalid token, the socket is closed with code 1008.
Each connection has a bounded queue with drop-on-backpressure semantics.
"""
from __future__ import annotations

import asyncio
import json
import logging

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from backend.config import settings
from backend.event_bus import bus, Event
from backend.security.auth import authenticate_ws

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
async def ws_endpoint(websocket: WebSocket, token: str | None = Query(default=None)):
    await websocket.accept()
    if not await authenticate_ws(websocket, token):
        return

    queue: asyncio.Queue = asyncio.Queue(maxsize=200)
    handler_refs: list = []  # keep strong refs so unsubscribe works

    async def forwarder(event: Event) -> None:
        if queue.full():
            # Drop oldest to keep the connection responsive under burst.
            try:
                queue.get_nowait()
            except Exception:
                pass
        payload = json.dumps({"topic": event.topic, "payload": event.payload, "ts": event.ts})
        if len(payload) > settings.ws_max_message_bytes:
            # Truncate oversized payloads rather than dropping silently.
            payload = json.dumps({
                "topic": event.topic,
                "payload": {"_truncated": True, "_bytes": len(payload)},
                "ts": event.ts,
            })
        await queue.put(payload)

    for topic in DEFAULT_TOPICS:
        bus.subscribe(topic, forwarder)
        handler_refs.append(forwarder)

    try:
        while True:
            try:
                msg = await asyncio.wait_for(queue.get(), timeout=15)
                await websocket.send_text(msg)
            except asyncio.TimeoutError:
                await websocket.send_text(json.dumps({"topic": "ping", "ts": 0, "payload": {}}))
    except WebSocketDisconnect:
        log.info("ws disconnected")
    except Exception:
        log.exception("ws error")
