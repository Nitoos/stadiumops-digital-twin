from backend.services.medical import MedicalService

def test_create_incident_and_close():
    m = MedicalService()
    inc = m.report(zone_id="stand_a", description="Fainting, possibly heat-related")
    assert inc.status == "open"
    closed = m.close(inc.id, outcome="treated_on_site")
    assert closed.status == "closed"
    assert closed.outcome == "treated_on_site"

def test_register_lost_person_and_find():
    m = MedicalService()
    lp = m.report_lost_person(name="Aarav", age=7, last_seen_zone="concourse_n",
                              contact="+91999...")
    assert lp.status == "missing"
    m.mark_found(lp.id, found_zone="lost_and_found_3")
    found = next(p for p in m.lost_people() if p.id == lp.id)
    assert found.status == "found"
