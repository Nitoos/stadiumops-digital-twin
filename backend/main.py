"""FastAPI application entrypoint."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.layout import load_layout


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.layout = load_layout()
    yield


app = FastAPI(title="StadiumOps Command", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "venue": app.state.layout.venue_name,
        "agent_mode": settings.agent_mode,
    }


@app.get("/api/layout")
def get_layout():
    layout = app.state.layout
    return {
        "venue": {"id": layout.venue_id, "name": layout.venue_name, "capacity": layout.capacity},
        "zones": [vars(z) for z in layout.zones],
        "gates": [vars(g) for g in layout.gates],
        "aeds": [vars(a) for a in layout.aeds],
        "transit": [vars(t) for t in layout.transit],
    }
