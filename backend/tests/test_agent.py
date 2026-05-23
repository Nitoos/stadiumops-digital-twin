import pytest
from backend.services.agent import AIAgent, AgentResponse

@pytest.mark.asyncio
async def test_simulated_agent_returns_recommendation():
    agent = AIAgent(mode="simulated")
    resp = await agent.recommend(
        context="LOS=F detected at concourse_n with 2.5 ppl/m² and forecast +10m=F",
    )
    assert isinstance(resp, AgentResponse)
    assert resp.title and resp.rationale
    assert 0 <= resp.confidence <= 1
    assert len(resp.actions) >= 1

@pytest.mark.asyncio
async def test_simulated_agent_narrates():
    agent = AIAgent(mode="simulated")
    narration = await agent.narrate("Surge at Gate 4")
    assert isinstance(narration, str)
    assert len(narration) > 10
