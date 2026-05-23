import asyncio
import pytest
from backend.event_bus import EventBus, Event
from backend.services.anomaly import AnomalyEngine
from backend.schemas import ZoneState

@pytest.mark.asyncio
async def test_anomaly_fires_on_los_e_or_f():
    bus = EventBus()
    engine = AnomalyEngine(bus=bus)
    received = []
    bus.subscribe("anomaly.detected", lambda e: received.append(e))
    states = [ZoneState(
        zone_id="concourse_n", density_per_m2=2.5, los="F",
        occupancy=1500, capacity=1200,
        los_forecast_5m="F", los_forecast_10m="F", los_forecast_15m="F",
    )]
    await engine.evaluate(states)
    await asyncio.sleep(0.01)
    assert len(received) == 1
    assert received[0].payload["zone_id"] == "concourse_n"
    assert received[0].payload["severity"] == "critical"

@pytest.mark.asyncio
async def test_no_anomaly_on_los_c_or_below():
    bus = EventBus()
    engine = AnomalyEngine(bus=bus)
    received = []
    bus.subscribe("anomaly.detected", lambda e: received.append(e))
    states = [ZoneState(
        zone_id="stand_a", density_per_m2=0.5, los="C",
        occupancy=800, capacity=8000,
        los_forecast_5m="C", los_forecast_10m="C", los_forecast_15m="C",
    )]
    await engine.evaluate(states)
    await asyncio.sleep(0.01)
    assert received == []

@pytest.mark.asyncio
async def test_anomaly_dedup_within_window():
    bus = EventBus()
    engine = AnomalyEngine(bus=bus, dedup_window_sec=30)
    received = []
    bus.subscribe("anomaly.detected", lambda e: received.append(e))
    bad = [ZoneState(zone_id="z", density_per_m2=3, los="F",
        occupancy=100, capacity=50,
        los_forecast_5m="F", los_forecast_10m="F", los_forecast_15m="F")]
    await engine.evaluate(bad)
    await engine.evaluate(bad)
    await asyncio.sleep(0.01)
    assert len(received) == 1
