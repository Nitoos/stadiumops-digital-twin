import asyncio
import pytest
from backend.event_bus import EventBus
from backend.layout import load_layout
from backend.services.crowd_sim import CrowdSim
from backend.services.density import DensityService
from backend.services.anomaly import AnomalyEngine
from backend.services.orchestrator import Orchestrator

@pytest.mark.asyncio
async def test_orchestrator_emits_density_tick():
    bus = EventBus()
    layout = load_layout()
    sim = CrowdSim(layout=layout, seed=42)
    orch = Orchestrator(
        bus=bus,
        sim=sim,
        density=DensityService(layout=layout),
        anomaly=AnomalyEngine(bus=bus),
        sim_tick_sec=10,
    )
    received = []
    bus.subscribe("density.tick", lambda e: received.append(e))
    await orch.step()
    await asyncio.sleep(0.01)
    assert len(received) == 1
    payload = received[0].payload
    assert "zones" in payload and len(payload["zones"]) >= 10

@pytest.mark.asyncio
async def test_orchestrator_forwards_surge_to_anomaly():
    bus = EventBus()
    layout = load_layout()
    sim = CrowdSim(layout=layout, seed=42, total_fans=40000)
    orch = Orchestrator(
        bus=bus, sim=sim,
        density=DensityService(layout=layout),
        anomaly=AnomalyEngine(bus=bus),
        sim_tick_sec=10,
    )
    anomalies = []
    bus.subscribe("anomaly.detected", lambda e: anomalies.append(e))
    # Run pre-match for a while to populate, then surge
    for _ in range(20):
        await orch.step()
    sim.inject_surge("concourse_n", magnitude=5000)
    await orch.step()
    await asyncio.sleep(0.05)
    assert any(a.payload["zone_id"] == "concourse_n" for a in anomalies)
