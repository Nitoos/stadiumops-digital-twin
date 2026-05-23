import asyncio
import pytest
from backend.event_bus import EventBus, Event
from backend.services.protocol import ProtocolEngine

@pytest.mark.asyncio
async def test_critical_anomaly_arms_crush_protocol():
    bus = EventBus()
    engine = ProtocolEngine(bus=bus)
    armed = []
    bus.subscribe("protocol.armed", lambda e: armed.append(e))
    engine.attach()
    await bus.publish(Event(topic="anomaly.detected", payload={
        "zone_id": "concourse_n", "severity": "critical",
        "los": "F", "density_per_m2": 2.5, "reason": "crush risk",
    }))
    await asyncio.sleep(0.05)
    assert len(armed) == 1
    assert armed[0].payload["sop"] == "CROWD_CRUSH_RISK"
    assert armed[0].payload["confirmed_by"] is None

@pytest.mark.asyncio
async def test_storm_alert_arms_storm_protocol():
    bus = EventBus()
    engine = ProtocolEngine(bus=bus)
    armed = []
    bus.subscribe("protocol.armed", lambda e: armed.append(e))
    engine.attach()
    await bus.publish(Event(topic="weather.alert", payload={
        "summary": "Storm cell approaching", "storm_eta_min": 12,
        "lightning_within_km": 8.0,
    }))
    await asyncio.sleep(0.05)
    assert any(a.payload["sop"] == "STORM_INBOUND" for a in armed)

@pytest.mark.asyncio
async def test_confirm_protocol_emits_confirmed_event():
    bus = EventBus()
    engine = ProtocolEngine(bus=bus)
    confirmed = []
    bus.subscribe("protocol.confirmed", lambda e: confirmed.append(e))
    engine.attach()
    # Trigger an arm
    await bus.publish(Event(topic="anomaly.detected", payload={
        "zone_id": "z", "severity": "critical", "los": "F",
        "density_per_m2": 3.0, "reason": "test",
    }))
    await asyncio.sleep(0.05)
    proto_id = next(iter(engine.armed.keys()))
    await engine.confirm(proto_id, operator="ops.commander.test")
    await asyncio.sleep(0.05)
    assert confirmed[0].payload["confirmed_by"] == "ops.commander.test"
