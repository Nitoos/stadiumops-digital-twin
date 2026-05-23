import time
from backend.services.state_store import StateStore

def test_store_appends_and_returns_latest():
    s = StateStore()
    s.record(ts=1.0, kind="density", payload={"a": 1})
    s.record(ts=2.0, kind="density", payload={"a": 2})
    assert s.latest("density")["a"] == 2

def test_scrub_returns_state_at_or_before_ts():
    s = StateStore()
    s.record(ts=10.0, kind="density", payload={"v": "ten"})
    s.record(ts=20.0, kind="density", payload={"v": "twenty"})
    s.record(ts=30.0, kind="density", payload={"v": "thirty"})
    assert s.at(ts=15.0, kind="density")["v"] == "ten"
    assert s.at(ts=25.0, kind="density")["v"] == "twenty"
    assert s.at(ts=99.0, kind="density")["v"] == "thirty"

def test_prune_keeps_only_window():
    s = StateStore(window_sec=10)
    now = time.time()
    s.record(ts=now - 100, kind="density", payload={"old": True})
    s.record(ts=now, kind="density", payload={"new": True})
    s.prune()
    history = s.history("density")
    assert len(history) == 1
    assert history[0][1] == {"new": True}
