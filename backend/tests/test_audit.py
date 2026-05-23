import asyncio
import pytest
from backend.event_bus import EventBus, Event
from backend.services.audit import AuditService

@pytest.mark.asyncio
async def test_audit_records_protocol_confirmations():
    bus = EventBus()
    a = AuditService(bus=bus)
    a.attach()
    await bus.publish(Event(topic="protocol.confirmed", payload={
        "id": "p1", "sop": "CROWD_CRUSH_RISK",
        "confirmed_by": "ops.commander.alice", "confirmed_ts": 1700000000,
    }))
    await asyncio.sleep(0.05)
    records = a.records()
    assert len(records) == 1
    assert records[0]["operator"] == "ops.commander.alice"

@pytest.mark.asyncio
async def test_generate_aar_returns_structured_summary():
    bus = EventBus()
    a = AuditService(bus=bus)
    a.attach()
    await bus.publish(Event(topic="protocol.confirmed", payload={
        "id": "p1", "sop": "STORM_INBOUND",
        "confirmed_by": "ops", "confirmed_ts": 1700000000,
    }))
    await asyncio.sleep(0.05)
    aar = a.generate_aar()
    assert "STORM_INBOUND" in aar["protocols_confirmed"]
    assert aar["total_decisions"] >= 1
