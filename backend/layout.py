"""Stadium layout loader — single source of truth for venue geometry."""
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

LAYOUT_PATH = Path(__file__).parent / "stadium_layout.json"

ZoneType = Literal["stand", "concourse", "concession", "restroom"]
GateStatus = Literal["open", "closed", "reserved"]


@dataclass(frozen=True)
class Zone:
    id: str
    name: str
    type: ZoneType
    capacity: int
    area_m2: float
    polygon: list[list[float]]


@dataclass(frozen=True)
class Gate:
    id: str
    name: str
    stand: str
    position: list[float]
    capacity_per_min: int
    status: GateStatus


@dataclass(frozen=True)
class AED:
    id: str
    position: list[float]


@dataclass(frozen=True)
class TransitNode:
    id: str
    name: str
    distance_m: int
    modes: list[str]
    capacity: int | None = None


@dataclass(frozen=True)
class Layout:
    venue_id: str
    venue_name: str
    capacity: int
    zones: list[Zone]
    gates: list[Gate]
    aeds: list[AED]
    transit: list[TransitNode]


def load_layout(path: Path = LAYOUT_PATH) -> Layout:
    raw = json.loads(path.read_text())
    return Layout(
        venue_id=raw["venue"]["id"],
        venue_name=raw["venue"]["name"],
        capacity=raw["venue"]["capacity"],
        zones=[Zone(**z) for z in raw["zones"]],
        gates=[Gate(**g) for g in raw["gates"]],
        aeds=[AED(**a) for a in raw["aeds"]],
        transit=[TransitNode(**t) for t in raw["transit"]],
    )
