from fastapi.testclient import TestClient
from backend.main import app


def test_health_endpoint():
    with TestClient(app) as client:
        r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert "venue" in body


def test_layout_endpoint():
    with TestClient(app) as client:
        r = client.get("/api/layout")
    assert r.status_code == 200
    body = r.json()
    assert len(body["zones"]) >= 10
    assert len(body["gates"]) >= 6
