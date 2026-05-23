from backend.layout import load_layout
from backend.services.inbound import InboundPipeline

def test_inbound_returns_per_source_eta():
    layout = load_layout()
    p = InboundPipeline(layout=layout, seed=42)
    state = p.tick(sim_time_sec=30*60)  # 30 min into pre-match window
    assert len(state.sources) >= 3
    metro = next(s for s in state.sources if "metro" in s.source_id.lower())
    assert metro.arrival_rate_per_min > 0
    assert metro.eta_gate_min > 0

def test_inbound_zero_outside_pre_window():
    layout = load_layout()
    p = InboundPipeline(layout=layout, seed=42)
    state = p.tick(sim_time_sec=200*60)  # mid-match
    assert all(s.arrival_rate_per_min == 0 for s in state.sources)
