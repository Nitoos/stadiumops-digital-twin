"""Pydantic schemas — shared contracts across services and over the wire."""
from typing import Literal
from pydantic import BaseModel, Field

LOS = Literal["A", "B", "C", "D", "E", "F"]
Severity = Literal["info", "warning", "critical"]


class ZoneState(BaseModel):
    zone_id: str
    density_per_m2: float
    los: LOS
    occupancy: int
    capacity: int
    los_forecast_5m: LOS
    los_forecast_10m: LOS
    los_forecast_15m: LOS


class GateState(BaseModel):
    gate_id: str
    queue_length: int
    scans_per_min: int
    status: Literal["open", "closed", "reserved"]
    eta_to_full_min: float | None = None


class Alert(BaseModel):
    id: str
    severity: Severity
    title: str
    body: str
    zone_id: str | None = None
    created_ts: float
    source: str  # "anomaly", "weather", "threat", "operator"


class Protocol(BaseModel):
    id: str
    name: str
    severity: Severity
    armed_ts: float
    confirmed_by: str | None = None
    confirmed_ts: float | None = None
    checklist: list[str]
    trigger_alert_id: str | None = None


class AgentRecommendation(BaseModel):
    id: str
    title: str
    rationale: str
    actions: list[str]
    confidence: float = Field(ge=0, le=1)
    affected_zones: list[str] = []


class FanPush(BaseModel):
    fan_id: str
    section: str
    channel: Literal["push", "sms", "signage"]
    title: str
    body: str
    route_hint: str | None = None
    stagger_offset_sec: int = 0


class WeatherState(BaseModel):
    summary: str
    storm_eta_min: int | None = None
    lightning_within_km: float | None = None
    heat_index_c: float | None = None
    wind_gust_kmh: float | None = None


class ThreatSignal(BaseModel):
    id: str
    summary: str
    severity: Severity
    confidence: float
    sources: list[str]
    distance_km: float | None = None
