from backend.services.staff import StaffService

def test_register_team_and_dispatch():
    s = StaffService()
    s.register_team(team_id="alpha", role="crowd_marshal", position=[40, 50])
    task_id = s.dispatch(team_id="alpha", title="Direct flow at Concourse N",
                         to_position=[30, 85])
    teams = s.teams()
    a = next(t for t in teams if t.team_id == "alpha")
    assert a.status == "responding"
    assert a.current_task_id == task_id

def test_complete_task_returns_team_to_idle():
    s = StaffService()
    s.register_team(team_id="bravo", role="medical", position=[10, 10])
    task_id = s.dispatch(team_id="bravo", title="AED to Aisle 8", to_position=[20, 20])
    s.complete(task_id=task_id)
    b = next(t for t in s.teams() if t.team_id == "bravo")
    assert b.status == "idle"
    assert b.current_task_id is None
