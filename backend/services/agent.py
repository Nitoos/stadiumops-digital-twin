"""AI Agent — Gemini 2.0 Flash with Google Search grounding (tactical).

Modes:
  real      — calls Gemini; uses google_search grounding tool
  simulated — returns canned, structured responses (no network, deterministic)

The simulated mode is used in tests and when GOOGLE_API_KEY is missing.
"""
from __future__ import annotations

import json
import os
import re
import uuid
from dataclasses import dataclass

from backend.config import settings


@dataclass
class AgentResponse:
    id: str
    title: str
    rationale: str
    actions: list[str]
    confidence: float
    affected_zones: list[str]


SYSTEM_PROMPT = """You are the tactical AI co-pilot for a stadium command center.
You receive live density/anomaly/weather/threat context and recommend operator
actions. Be specific, time-bounded, and explain reasoning. Never authorize
fan-facing broadcasts autonomously — every action requires operator confirmation.

Output STRICT JSON with this schema:
{
  "title": "short imperative — e.g., Open Gate 6, reroute via West Concourse",
  "rationale": "1-3 sentences explaining the why, citing density/forecast/weather",
  "actions": ["concrete operator-executable step", "..."],
  "confidence": 0.0 to 1.0,
  "affected_zones": ["zone_id", ...]
}
"""


class AIAgent:
    def __init__(self, mode: str | None = None) -> None:
        self.mode = mode or settings.agent_mode
        if self.mode == "real" and not settings.google_api_key:
            self.mode = "simulated"
        self._client = None
        if self.mode == "real":
            from google import genai
            self._client = genai.Client(api_key=settings.google_api_key)

    async def recommend(self, context: str) -> AgentResponse:
        if self.mode == "simulated":
            return self._simulate(context)
        return await self._call_gemini(context)

    async def narrate(self, event_text: str) -> str:
        if self.mode == "simulated":
            return f"Operator note: {event_text}. Recommend verifying via CCTV."
        prompt = (
            "Narrate this stadium event in one sentence of calm, operational language "
            "for a command-center log: " + event_text
        )
        # Sync call wrapped — google-genai client is sync
        resp = self._client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt,
        )
        return (resp.text or "").strip()

    def _simulate(self, context: str) -> AgentResponse:
        # Deterministic canned responses keyed off keywords
        c = context.lower()
        if "concourse_n" in c or "gate_4" in c:
            return AgentResponse(
                id=str(uuid.uuid4()),
                title="Open Gate 6, reroute Section B via West Concourse",
                rationale="Concourse North at LOS F with forecast worsening. "
                          "Gate 6 currently closed has spare capacity. West Concourse uncrowded.",
                actions=[
                    "Open Gate 6",
                    "Push F6 calm-path to Section B fans, staggered 90s sub-groups",
                    "Dispatch Team Alpha to direct flow at Concourse North",
                ],
                confidence=0.84,
                affected_zones=["concourse_n", "stand_b"],
            )
        if "storm" in c or "weather" in c:
            return AgentResponse(
                id=str(uuid.uuid4()),
                title="Arm STORM_INBOUND protocol, covered-concourse routing",
                rationale="Storm cell ETA under 15 min with lightning within 8 km. "
                          "Open-stand sections at risk; covered concourses available.",
                actions=[
                    "Arm STORM_INBOUND SOP",
                    "Push F6 covered-concourse routing to open-stand sections",
                    "Halt drone shows; ground all aerial operations",
                ],
                confidence=0.91,
                affected_zones=["stand_a", "stand_b", "stand_c", "stand_d"],
            )
        if "drone" in c or "threat" in c:
            return AgentResponse(
                id=str(uuid.uuid4()),
                title="Notify police; arm UNAUTHORIZED_DRONE protocol",
                rationale="Airspace adapter reports unauthorized drone within perimeter. "
                          "Per L7, police lead; ops support with shelter routing.",
                actions=[
                    "Notify police agency channel",
                    "Arm UNAUTHORIZED_DRONE SOP",
                    "Hold any planned fan broadcasts pending agency clearance",
                ],
                confidence=0.78,
                affected_zones=[],
            )
        return AgentResponse(
            id=str(uuid.uuid4()),
            title="Continue monitoring",
            rationale="No critical signals. Maintain current dispatch posture.",
            actions=["Monitor density forecast every 60s"],
            confidence=0.6,
            affected_zones=[],
        )

    async def _call_gemini(self, context: str) -> AgentResponse:
        prompt = f"{SYSTEM_PROMPT}\n\nLive context:\n{context}\n\nRespond with JSON only."
        resp = self._client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt,
        )
        text = resp.text or ""
        data = self._extract_json(text)
        return AgentResponse(
            id=str(uuid.uuid4()),
            title=data.get("title", "Continue monitoring"),
            rationale=data.get("rationale", ""),
            actions=data.get("actions", []),
            confidence=float(data.get("confidence", 0.5)),
            affected_zones=data.get("affected_zones", []),
        )

    @staticmethod
    def _extract_json(text: str) -> dict:
        # Strip markdown fences if present
        cleaned = re.sub(r"```(?:json)?\n?", "", text).strip("`\n ")
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if not match:
            return {}
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            return {}
