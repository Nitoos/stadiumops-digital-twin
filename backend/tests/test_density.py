from backend.services.density import classify_los, DensityService
from backend.layout import load_layout
from backend.services.crowd_sim import CrowdSim, Snapshot, ZoneSnap, GateSnap

def test_fruin_los_thresholds():
    # Fruin pedestrian LOS for queue / standing: A < 0.3, B < 0.45, C < 0.7,
    # D < 1.0, E < 2.0, F >= 2.0 (people per m²)
    assert classify_los(0.1) == "A"
    assert classify_los(0.4) == "B"
    assert classify_los(0.6) == "C"
    assert classify_los(0.9) == "D"
    assert classify_los(1.5) == "E"
    assert classify_los(3.0) == "F"

def test_density_service_emits_zone_states():
    layout = load_layout()
    svc = DensityService(layout=layout)
    snap = Snapshot(
        sim_time_sec=0, phase="live",
        zones=[ZoneSnap(zone_id="stand_a", occupancy=8000, capacity=8000)] +
              [ZoneSnap(zone_id=z.id, occupancy=0, capacity=z.capacity) for z in layout.zones if z.id != "stand_a"],
        gates=[GateSnap(gate_id=g.id, queue_length=0, scans_last_min=0) for g in layout.gates],
    )
    states = svc.compute(snap)
    a = next(s for s in states if s.zone_id == "stand_a")
    assert a.density_per_m2 == 5.0  # 8000 / 1600 m²
    assert a.los == "F"

def test_forecast_uses_recent_trend():
    layout = load_layout()
    svc = DensityService(layout=layout)
    # Feed three increasing snapshots
    for occ in (1000, 1500, 2000):
        snap = Snapshot(sim_time_sec=0, phase="pre",
            zones=[ZoneSnap(zone_id="concourse_n", occupancy=occ, capacity=1200)] +
                  [ZoneSnap(zone_id=z.id, occupancy=0, capacity=z.capacity) for z in layout.zones if z.id != "concourse_n"],
            gates=[GateSnap(gate_id=g.id, queue_length=0, scans_last_min=0) for g in layout.gates])
        states = svc.compute(snap)
    c = next(s for s in states if s.zone_id == "concourse_n")
    # current density already F (2000/600 > 3); forecast must stay F or worsen
    assert c.los_forecast_5m in ("E", "F")
