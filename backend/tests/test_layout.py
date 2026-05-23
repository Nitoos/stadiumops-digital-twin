from backend.layout import load_layout, Zone, Gate

def test_load_layout_returns_zones_and_gates():
    layout = load_layout()
    assert len(layout.zones) >= 10
    assert len(layout.gates) >= 6
    assert all(isinstance(z, Zone) for z in layout.zones)
    assert all(isinstance(g, Gate) for g in layout.gates)

def test_zones_have_required_fields():
    layout = load_layout()
    z = layout.zones[0]
    assert z.id and z.name and z.capacity > 0
    assert z.area_m2 > 0
    assert len(z.polygon) >= 3  # at least a triangle
