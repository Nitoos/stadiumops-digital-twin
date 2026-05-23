"""L9 — Staff & Volunteer Coordination.

Phase 0: in-memory team registry + task queue with status transitions.
Phase 1+: Flutter handheld + FCM + Bluetooth Mesh fallback (G2).
"""
from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Literal

TeamStatus = Literal["idle", "responding", "on_task"]
TeamRole = Literal["crowd_marshal", "medical", "security", "transit"]


@dataclass
class Team:
    team_id: str
    role: TeamRole
    position: list[float]
    status: TeamStatus = "idle"
    current_task_id: str | None = None


@dataclass
class Task:
    id: str
    title: str
    to_position: list[float]
    assigned_team_id: str
    created_ts: float
    completed_ts: float | None = None


class StaffService:
    def __init__(self) -> None:
        self._teams: dict[str, Team] = {}
        self._tasks: dict[str, Task] = {}

    def register_team(self, team_id: str, role: TeamRole, position: list[float]) -> None:
        self._teams[team_id] = Team(team_id=team_id, role=role, position=position)

    def dispatch(self, team_id: str, title: str, to_position: list[float]) -> str:
        team = self._teams[team_id]
        task = Task(
            id=str(uuid.uuid4()),
            title=title,
            to_position=to_position,
            assigned_team_id=team_id,
            created_ts=time.time(),
        )
        self._tasks[task.id] = task
        team.status = "responding"
        team.current_task_id = task.id
        return task.id

    def complete(self, task_id: str) -> None:
        task = self._tasks[task_id]
        task.completed_ts = time.time()
        team = self._teams[task.assigned_team_id]
        team.status = "idle"
        team.current_task_id = None
        team.position = list(task.to_position)

    def teams(self) -> list[Team]:
        return list(self._teams.values())

    def open_tasks(self) -> list[Task]:
        return [t for t in self._tasks.values() if t.completed_ts is None]
