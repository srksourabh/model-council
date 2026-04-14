# backend/app/main.py
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse
from app.database import init_db, get_session, list_sessions
from app.orchestrator import run_council_session


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Model Council API",
    description="Multi-model AI deliberation platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://modelcouncil.ai"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SessionCreate(BaseModel):
    question: str = Field(..., min_length=5, max_length=2000)
    tier: str = Field(default="frontier", pattern="^(frontier|budget)$")


@app.post("/api/sessions")
async def create_session_endpoint(body: SessionCreate):
    return {"message": "Use /api/sessions/stream to start and stream a session", "question": body.question, "tier": body.tier}


@app.get("/api/sessions/stream")
async def stream_session(question: str, tier: str = "frontier"):
    if len(question) < 5:
        raise HTTPException(status_code=400, detail="Question must be at least 5 characters")

    async def event_generator():
        try:
            async for event in run_council_session(question, tier):
                yield {
                    "event": event["event"],
                    "data": json.dumps(event["data"]),
                }
        except Exception as e:
            yield {
                "event": "session_error",
                "data": json.dumps({"error": str(e)}),
            }

    return EventSourceResponse(event_generator())


@app.get("/api/sessions/{session_id}")
async def get_session_endpoint(session_id: str):
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@app.get("/api/sessions")
async def list_sessions_endpoint(limit: int = 20, offset: int = 0):
    sessions = await list_sessions(limit=limit, offset=offset)
    return {"sessions": sessions, "limit": limit, "offset": offset}


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "model-council-api"}
