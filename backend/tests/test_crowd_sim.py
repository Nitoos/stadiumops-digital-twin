from backend.layout import load_layout
from backend.services.crowd_sim import CrowdSim

def test_sim_starts_empty():
    sim = CrowdSim(layout=load_layout(), seed=42)
    state = sim.snapshot()
    assert all(z.occupancy == 0 for z in state.zones)

def test_sim_advances_time_and_fills():
    sim = CrowdSim(layout=load_layout(), seed=42)
    for _ in range(30):
        sim.tick(seconds=10)  # advance 5 min total
    state = sim.snapshot()
    total = sum(z.occupancy for z in state.zones)
    assert total > 0, "fans should arrive during pre-match window"

def test_sim_is_deterministic():
    a = CrowdSim(layout=load_layout(), seed=42)
    b = CrowdSim(layout=load_layout(), seed=42)
    for _ in range(20):
        a.tick(seconds=10)
        b.tick(seconds=10)
    sa, sb = a.snapshot(), b.snapshot()
    for za, zb in zip(sa.zones, sb.zones):
        assert za.occupancy == zb.occupancy

def test_inject_surge_increases_zone_density():
    sim = CrowdSim(layout=load_layout(), seed=42)
    for _ in range(30):
        sim.tick(seconds=10)
    before = next(z.occupancy for z in sim.snapshot().zones if z.zone_id == "concourse_n")
    sim.inject_surge(zone_id="concourse_n", magnitude=300)
    sim.tick(seconds=5)
    after = next(z.occupancy for z in sim.snapshot().zones if z.zone_id == "concourse_n")
    assert after > before + 200
