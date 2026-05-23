from backend.services.fan import FanService

def test_check_in_returns_personalized_plan():
    f = FanService()
    plan = f.check_in(fan_id="f1", persona="family", section="stand_b",
                      transit="metro_mg_road")
    assert plan.fan_id == "f1"
    assert plan.section == "stand_b"
    assert plan.assigned_gate
    assert plan.arrive_by_min > 0
    assert plan.persona == "family"

def test_pmr_persona_gets_separate_gate():
    f = FanService()
    a = f.check_in(fan_id="a", persona="pmr", section="stand_a", transit="metro_mg_road")
    b = f.check_in(fan_id="b", persona="standard", section="stand_a", transit="metro_mg_road")
    assert a.assigned_gate != b.assigned_gate or a.lane == "pmr_lane"
