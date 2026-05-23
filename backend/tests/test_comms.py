import asyncio
import pytest
from backend.event_bus import EventBus
from backend.services.comms import CommsBus, Broadcast

@pytest.mark.asyncio
async def test_broadcast_creates_staggered_messages():
    bus = EventBus()
    comms = CommsBus(bus=bus)
    sent = []
    bus.subscribe("comms.broadcast", lambda e: sent.append(e))
    bc = Broadcast(
        title="Move calmly to West Concourse",
        body="Take the West Concourse, 3-minute walk, calm pace.",
        sections=["stand_b", "stand_c"],
        channels=["push", "sms"],
        stagger_sec=90,
    )
    await comms.send(bc, draft_by="ops.commander.test")
    await asyncio.sleep(0.05)
    # 2 sections × 2 channels = 4 events
    assert len(sent) == 4
    offsets = sorted(e.payload["stagger_offset_sec"] for e in sent)
    assert 0 in offsets and 90 in offsets

@pytest.mark.asyncio
async def test_broadcast_requires_operator():
    bus = EventBus()
    comms = CommsBus(bus=bus)
    with pytest.raises(ValueError):
        await comms.send(Broadcast(title="x", body="y", sections=["a"]), draft_by="")
