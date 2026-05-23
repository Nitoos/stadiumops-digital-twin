import asyncio
import pytest
from backend.event_bus import EventBus, Event

@pytest.mark.asyncio
async def test_publish_subscribe_delivers_event():
    bus = EventBus()
    received = []

    async def handler(event: Event):
        received.append(event)

    bus.subscribe("density.tick", handler)
    await bus.publish(Event(topic="density.tick", payload={"zone": "stand_a", "los": "C"}))
    await asyncio.sleep(0.01)
    assert len(received) == 1
    assert received[0].payload["zone"] == "stand_a"

@pytest.mark.asyncio
async def test_multiple_subscribers_each_receive():
    bus = EventBus()
    a, b = [], []
    bus.subscribe("alert.fired", lambda e: a.append(e))
    bus.subscribe("alert.fired", lambda e: b.append(e))
    await bus.publish(Event(topic="alert.fired", payload={}))
    await asyncio.sleep(0.01)
    assert len(a) == 1 and len(b) == 1

@pytest.mark.asyncio
async def test_topic_isolation():
    bus = EventBus()
    received = []
    bus.subscribe("a.x", lambda e: received.append(e))
    await bus.publish(Event(topic="b.y", payload={}))
    await asyncio.sleep(0.01)
    assert received == []
