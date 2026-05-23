import asyncio
import pytest
from backend.event_bus import EventBus
from backend.services.weather import WeatherService

@pytest.mark.asyncio
async def test_simulated_weather_emits_alert_on_inject():
    bus = EventBus()
    svc = WeatherService(bus=bus, mode="simulated")
    alerts = []
    bus.subscribe("weather.alert", lambda e: alerts.append(e))
    await svc.inject_storm(eta_min=12, lightning_km=8.0)
    await asyncio.sleep(0.05)
    assert len(alerts) == 1
    assert alerts[0].payload["storm_eta_min"] == 12
    assert alerts[0].payload["lightning_within_km"] == 8.0

@pytest.mark.asyncio
async def test_baseline_returns_calm_when_idle():
    bus = EventBus()
    svc = WeatherService(bus=bus, mode="simulated")
    state = await svc.current()
    assert state.summary
    assert state.storm_eta_min is None or state.storm_eta_min > 30
