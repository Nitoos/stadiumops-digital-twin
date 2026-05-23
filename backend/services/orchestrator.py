"""Demo orchestrator — drives the clock and chains sim → density → anomaly.

In production, each service is a separate Cloud Run instance subscribing to
Pub/Sub topics. Phase 0: this class wires them in-process.
"""
from __future__ import annotations

import asyncio

from backend.event_bus import EventBus, Event
from backend.services.crowd_sim import CrowdSim
from backend.services.density import DensityService
from backend.services.anomaly import AnomalyEngine


class Orchestrator:
    def __init__(
        self,
        bus: EventBus,
        sim: CrowdSim,
        density: DensityService,
        anomaly: AnomalyEngine,
        sim_tick_sec: int = 5,
    ) -> None:
        self.bus = bus
        self.sim = sim
        self.density = density
        self.anomaly = anomaly
        self.sim_tick_sec = sim_tick_sec
        self._running = False

    async def step(self) -> None:
        snap = self.sim.tick(seconds=self.sim_tick_sec)
        states = self.density.compute(snap)
        await self.bus.publish(Event(
            topic="density.tick",
            payload={
                "sim_time_sec": snap.sim_time_sec,
                "phase": snap.phase,
                "zones": [s.model_dump() for s in states],
                "gates": [g.__dict__ for g in snap.gates],
            },
        ))
        await self.anomaly.evaluate(states)

    async def run_forever(self, real_seconds_per_tick: float = 1.0) -> None:
        self._running = True
        while self._running:
            await self.step()
            await asyncio.sleep(real_seconds_per_tick)

    def stop(self) -> None:
        self._running = False
