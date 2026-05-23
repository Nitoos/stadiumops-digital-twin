import asyncio
import pytest
from backend.event_bus import EventBus
from backend.services.threat import ThreatService

@pytest.mark.asyncio
async def test_inject_drone_threat_publishes_signal():
    bus = EventBus()
    svc = ThreatService(bus=bus, mode="simulated")
    signals = []
    bus.subscribe("threat.signal", lambda e: signals.append(e))
    await svc.inject(summary="Unauthorized drone detected over east stand", severity="critical")
    await asyncio.sleep(0.05)
    assert len(signals) == 1
    assert "drone" in signals[0].payload["summary"].lower()
    assert signals[0].payload["severity"] == "critical"

@pytest.mark.asyncio
async def test_simulated_recent_returns_baseline_empty():
    bus = EventBus()
    svc = ThreatService(bus=bus, mode="simulated")
    items = await svc.recent()
    assert items == []
