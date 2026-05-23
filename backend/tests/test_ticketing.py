from backend.services.ticketing import TicketingService

def test_scan_increments_counter():
    t = TicketingService(total_tickets=40000)
    t.scan(ticket_id="T1", gate_id="gate_1", zone_id="stand_a")
    assert t.scanned() == 1
    assert t.zone_occupancy("stand_a") == 1

def test_duplicate_scan_returns_fraud_flag():
    t = TicketingService(total_tickets=40000)
    r1 = t.scan(ticket_id="T1", gate_id="gate_1", zone_id="stand_a")
    r2 = t.scan(ticket_id="T1", gate_id="gate_2", zone_id="stand_a")
    assert r1.fraud is False
    assert r2.fraud is True
    assert r2.reason == "duplicate_scan"

def test_zone_overcapacity_blocked():
    t = TicketingService(total_tickets=10, zone_caps={"stand_a": 1})
    t.scan(ticket_id="T1", gate_id="g", zone_id="stand_a")
    r = t.scan(ticket_id="T2", gate_id="g", zone_id="stand_a")
    assert r.fraud is True
    assert r.reason == "zone_full"
