# Model Council Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web app where 4 AI models (GPT-5, Claude Sonnet, Gemini, Grok) debate a question through 3 rounds via OpenRouter, then a Chairperson delivers a verdict — all streamed in real time.

**Architecture:** Python FastAPI backend handles debate orchestration and streams SSE events to a Next.js 15 frontend. All model calls go through OpenRouter (single API key). SQLite for MVP storage (upgrade to Supabase later). Frontend uses the Poster Modernist design system.

**Tech Stack:** Python 3.13 + FastAPI + httpx (backend), Next.js 15 + React 19 + Tailwind CSS v4 (frontend), OpenRouter API, SSE streaming, SQLite (MVP)

---

## Task 1: Backend — Project Setup & Dependencies

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/app/__init__.py`
- Create: `backend/app/config.py`
- Create: `backend/.env` (symlink to root .env)

**Step 1: Create backend directory and install dependencies**

```bash
cd C:/Users/soura/Dropbox/AI/Projects/model-council
mkdir -p backend/app
```

**Step 2: Create requirements.txt**

```
fastapi==0.115.12
uvicorn[standard]==0.34.2
httpx==0.28.1
sse-starlette==2.3.5
python-dotenv==1.1.0
pydantic==2.11.3
aiosqlite==0.21.0
```

**Step 3: Install dependencies**

```bash
cd backend
pip install -r requirements.txt
```

**Step 4: Create config.py**

```python
# backend/app/config.py
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

COUNCIL_MODELS = {
    "frontier": {
        "analyst":    {"id": "openai/gpt-5",                  "role": "The Analyst"},
        "reasoner":   {"id": "anthropic/claude-sonnet-4.6",   "role": "The Reasoner"},
        "challenger": {"id": "google/gemini-3.1-pro-preview", "role": "The Challenger"},
        "maverick":   {"id": "x-ai/grok-4",                  "role": "The Maverick"},
    },
    "budget": {
        "analyst":    {"id": "openai/gpt-5-mini",             "role": "The Analyst"},
        "reasoner":   {"id": "anthropic/claude-haiku-4.5",    "role": "The Reasoner"},
        "challenger": {"id": "google/gemini-2.5-flash",       "role": "The Challenger"},
        "maverick":   {"id": "x-ai/grok-4.1-fast",           "role": "The Maverick"},
    },
    "chairperson": {
        "frontier": "anthropic/claude-opus-4.6",
        "budget":   "anthropic/claude-opus-4.5",
    }
}
```

**Step 5: Create __init__.py**

Empty file: `backend/app/__init__.py`

**Step 6: Commit**

```bash
git add backend/
git commit -m "feat: backend project setup with dependencies and config"
```

---

## Task 2: Backend — System Prompts

**Files:**
- Create: `backend/app/prompts.py`

**Step 1: Create prompts.py with all role and round prompts**

```python
# backend/app/prompts.py

ROLE_PROMPTS = {
    "analyst": {
        "base": """You are "The Analyst" — a council member in a four-member deliberation.

Your approach: structured, data-driven, methodical.
- Lead with facts, statistics, and established frameworks
- Break complex questions into measurable components
- Cite specific examples, case studies, and research
- Present clear pros/cons with evidence

Rules:
- Be direct and decisive — take a clear position
- Reference other members by their role name (The Reasoner, The Challenger, The Maverick)
- When you disagree, say so clearly with evidence
- When another member makes a strong point, acknowledge it
- Do NOT hedge with "it depends" — commit to a position""",
    },
    "reasoner": {
        "base": """You are "The Reasoner" — a council member in a four-member deliberation.

Your approach: nuanced, considers edge cases, bridges perspectives.
- Explore deeper implications and second-order effects
- Consider who is affected and how — the human impact
- Find the nuance that others miss
- Bridge disagreements by finding common ground without sacrificing rigor

Rules:
- Be direct and decisive — take a clear position
- Reference other members by their role name (The Analyst, The Challenger, The Maverick)
- When you disagree, say so clearly with evidence
- When another member makes a strong point, acknowledge it
- Do NOT hedge with "it depends" — commit to a position""",
    },
    "challenger": {
        "base": """You are "The Challenger" — a council member in a four-member deliberation.

Your approach: contrarian, stress-tests ideas, exposes weak reasoning.
- Question assumptions that others take for granted
- Bring counterexamples and real-world edge cases
- Play devil's advocate when there is too much agreement
- Challenge popular conclusions with unpopular but valid evidence

Rules:
- Be direct and decisive — take a clear position
- Reference other members by their role name (The Analyst, The Reasoner, The Maverick)
- When you disagree, say so clearly with evidence
- When another member makes a strong point, acknowledge it reluctantly — don't concede easily
- Do NOT hedge with "it depends" — commit to a position""",
    },
    "maverick": {
        "base": """You are "The Maverick" — a council member in a four-member deliberation.

Your approach: unconventional, bold, cuts through noise.
- Bring fresh angles that no one else considers
- Challenge conventional wisdom and status quo thinking
- Willing to take controversial or unpopular positions if well-reasoned
- Use sharp, direct language — no corporate-speak or academic hedging
- Inject clarity by reframing the question when others are talking past each other

Rules:
- Be direct and decisive — take a clear position
- Reference other members by their role name (The Analyst, The Reasoner, The Challenger)
- When you disagree, say so directly — don't soften it
- When another member makes a genuinely strong point, acknowledge it
- Do NOT hedge with "it depends" — commit to a position""",
    },
}

ROUND_PROMPTS = {
    1: "\n\nKeep your response focused and substantive (500-800 words).",
    2: """\n\nROUND 2 INSTRUCTIONS:
You have now read all four council members' opening statements.

In this round you MUST:
1. Directly address at least TWO other members by role name
2. Identify the strongest point made by another member and explain why it's strong
3. Challenge at least ONE claim you believe is wrong, weakly supported, or misleading
4. Refine your own position based on what you've learned — show how your thinking evolved
5. Do NOT simply summarize Round 1 — add NEW reasoning, evidence, or perspective

Format: Address other members directly. Example: "The Analyst claims X, but this overlooks..."

Keep your response focused (400-600 words).""",
    3: """\n\nROUND 3 INSTRUCTIONS:
This is your FINAL statement to the council. Two full rounds of debate have occurred.

In this round you MUST:
1. State your FINAL position clearly and decisively in the first paragraph
2. Acknowledge the strongest argument made against your position during the debate
3. Explain why you hold your position despite that counterargument (or why you changed your mind)
4. Identify areas of consensus — what do all or most members agree on?
5. Flag any irreconcilable disagreements with a clear "I disagree because..."

If the council has reached consensus: say so explicitly and state what was agreed.
If you changed your position during the debate: explain what persuaded you.
Keep this response concise (300-500 words). The debate is concluding.""",
}

CHAIRPERSON_PROMPT = """You are the CHAIRPERSON of this council. You did NOT participate in the debate.
You are an independent, impartial judge reading the full transcript of a 3-round
deliberation between four council members: The Analyst, The Reasoner,
The Challenger, and The Maverick.

Your job is to produce the FINAL VERDICT in this exact structure:

## TL;DR
A clear, decisive answer in 2-3 sentences. This is the headline — make it count.

## Consensus
Bullet points of what all (or most) council members agreed on by the end.

## Key Debates
Where members disagreed and how those disagreements evolved across rounds.
Did anyone change their position? What arguments were most persuasive?

## Dissenting Views
Minority opinions that are worth preserving — even if most members disagreed,
was the dissent well-reasoned? State who dissented and why.

## Confidence
ONE of: HIGH, MEDIUM, or LOW
Then 1-2 sentences justifying this rating based on the degree of consensus
and the strength of evidence presented.

## Final Reasoning
The complete logic chain: what evidence was presented, what was contested,
what survived scrutiny, and how you weighed competing arguments to arrive
at the TL;DR.

RULES:
- Be DECISIVE. The whole point of a council is to reach a decision.
- Don't default to "it depends" — give a clear recommendation with conditions.
- Weight arguments by strength of reasoning and evidence, not by headcount.
- If the council reached genuine consensus, state it confidently.
- If there's an irreconcilable disagreement, explain both sides and state
  which you find more persuasive and WHY.
- Do not introduce new arguments or evidence — synthesize only what was debated.
- Refer to members by role name, never by model name."""


def build_system_prompt(role_key: str, round_num: int) -> str:
    """Build the complete system prompt for a given role and round."""
    return ROLE_PROMPTS[role_key]["base"] + ROUND_PROMPTS[round_num]


def format_transcript(responses: list[dict], round_num: int) -> str:
    """Format responses from a round into a readable transcript."""
    lines = [f"--- ROUND {round_num} ---"]
    for resp in responses:
        lines.append(f"\n### {resp['role_name']}:\n{resp['content']}\n")
    return "\n".join(lines)
```

**Step 2: Commit**

```bash
git add backend/app/prompts.py
git commit -m "feat: add system prompts for all council roles and rounds"
```

---

## Task 3: Backend — OpenRouter Client

**Files:**
- Create: `backend/app/openrouter.py`

**Step 1: Create the OpenRouter streaming client**

```python
# backend/app/openrouter.py
import json
from collections.abc import AsyncIterator
import httpx
from app.config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL


async def stream_model_response(
    model_id: str,
    system_prompt: str,
    user_content: str,
    max_tokens: int = 2000,
) -> AsyncIterator[str]:
    """Stream a response from any model via OpenRouter.

    Yields text chunks as they arrive.
    """
    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream(
            "POST",
            OPENROUTER_BASE_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://modelcouncil.ai",
                "X-Title": "Model Council",
            },
            json={
                "model": model_id,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
                "stream": True,
                "max_tokens": max_tokens,
            },
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.startswith("data: "):
                    continue
                data = line[6:]
                if data.strip() == "[DONE]":
                    break
                try:
                    chunk = json.loads(data)
                    delta = chunk.get("choices", [{}])[0].get("delta", {})
                    if text := delta.get("content"):
                        yield text
                except json.JSONDecodeError:
                    continue


async def call_model(
    model_id: str,
    system_prompt: str,
    user_content: str,
    max_tokens: int = 2000,
) -> str:
    """Call a model and return the complete response (non-streaming)."""
    chunks: list[str] = []
    async for chunk in stream_model_response(model_id, system_prompt, user_content, max_tokens):
        chunks.append(chunk)
    return "".join(chunks)
```

**Step 2: Commit**

```bash
git add backend/app/openrouter.py
git commit -m "feat: add OpenRouter streaming client"
```

---

## Task 4: Backend — Database Layer

**Files:**
- Create: `backend/app/database.py`

**Step 1: Create SQLite database layer**

```python
# backend/app/database.py
import json
import uuid
from datetime import datetime, timezone
import aiosqlite

DB_PATH = "council.db"


async def init_db():
    """Create tables if they don't exist."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                question TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'round_1',
                tier TEXT NOT NULL DEFAULT 'frontier',
                verdict_tldr TEXT,
                verdict_full TEXT,
                confidence TEXT,
                total_tokens INTEGER DEFAULT 0,
                total_cost_usd REAL DEFAULT 0,
                duration_ms INTEGER,
                created_at TEXT NOT NULL,
                completed_at TEXT
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS responses (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL REFERENCES sessions(id),
                round INTEGER NOT NULL,
                model_id TEXT NOT NULL,
                role_name TEXT NOT NULL,
                content TEXT NOT NULL,
                tokens_input INTEGER,
                tokens_output INTEGER,
                cost_usd REAL,
                latency_ms INTEGER,
                created_at TEXT NOT NULL
            )
        """)
        await db.execute("""
            CREATE INDEX IF NOT EXISTS idx_responses_session
            ON responses(session_id, round)
        """)
        await db.commit()


async def create_session(question: str, tier: str = "frontier") -> dict:
    """Create a new council session."""
    session = {
        "id": str(uuid.uuid4()),
        "question": question,
        "status": "round_1",
        "tier": tier,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO sessions (id, question, status, tier, created_at) VALUES (?, ?, ?, ?, ?)",
            (session["id"], session["question"], session["status"], session["tier"], session["created_at"]),
        )
        await db.commit()
    return session


async def save_response(
    session_id: str,
    round_num: int,
    model_id: str,
    role_name: str,
    content: str,
    latency_ms: int = 0,
) -> dict:
    """Save a model response."""
    resp = {
        "id": str(uuid.uuid4()),
        "session_id": session_id,
        "round": round_num,
        "model_id": model_id,
        "role_name": role_name,
        "content": content,
        "latency_ms": latency_ms,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO responses (id, session_id, round, model_id, role_name, content, latency_ms, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (resp["id"], resp["session_id"], resp["round"], resp["model_id"],
             resp["role_name"], resp["content"], resp["latency_ms"], resp["created_at"]),
        )
        await db.commit()
    return resp


async def update_session_status(session_id: str, status: str, **kwargs):
    """Update session status and optional fields."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE sessions SET status = ? WHERE id = ?",
            (status, session_id),
        )
        for key, value in kwargs.items():
            if key in ("verdict_tldr", "verdict_full", "confidence", "total_tokens",
                       "total_cost_usd", "duration_ms", "completed_at"):
                val = json.dumps(value) if isinstance(value, dict) else value
                await db.execute(
                    f"UPDATE sessions SET {key} = ? WHERE id = ?",
                    (val, session_id),
                )
        await db.commit()


async def get_session(session_id: str) -> dict | None:
    """Get a session with all its responses."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
        row = await cursor.fetchone()
        if not row:
            return None
        session = dict(row)
        cursor = await db.execute(
            "SELECT * FROM responses WHERE session_id = ? ORDER BY round, created_at",
            (session_id,),
        )
        rows = await cursor.fetchall()
        session["responses"] = [dict(r) for r in rows]
    return session


async def list_sessions(limit: int = 20, offset: int = 0) -> list[dict]:
    """List sessions, newest first."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, question, status, tier, confidence, created_at, completed_at FROM sessions ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset),
        )
        rows = await cursor.fetchall()
    return [dict(r) for r in rows]
```

**Step 2: Commit**

```bash
git add backend/app/database.py
git commit -m "feat: add SQLite database layer for sessions and responses"
```

---

## Task 5: Backend — Debate Orchestrator

**Files:**
- Create: `backend/app/orchestrator.py`

**Step 1: Create the debate orchestrator with SSE streaming**

```python
# backend/app/orchestrator.py
import asyncio
import json
import time
from collections.abc import AsyncIterator
from app.config import COUNCIL_MODELS
from app.prompts import build_system_prompt, format_transcript, CHAIRPERSON_PROMPT
from app.openrouter import stream_model_response
from app.database import create_session, save_response, update_session_status


async def _collect_streaming_response(
    model_id: str,
    system_prompt: str,
    user_content: str,
    role_name: str,
    round_num: int,
    event_queue: asyncio.Queue,
) -> dict:
    """Stream a model response, pushing chunks to the event queue, and return the full response."""
    chunks: list[str] = []
    start = time.time()

    try:
        async for text in stream_model_response(model_id, system_prompt, user_content):
            chunks.append(text)
            await event_queue.put({
                "event": "model_chunk",
                "data": {
                    "model": model_id,
                    "role": role_name,
                    "round": round_num,
                    "text": text,
                },
            })
    except Exception as e:
        await event_queue.put({
            "event": "model_error",
            "data": {
                "model": model_id,
                "role": role_name,
                "round": round_num,
                "error": str(e),
            },
        })
        return {"model_id": model_id, "role_name": role_name, "content": f"[Error: {e}]", "latency_ms": 0}

    latency_ms = int((time.time() - start) * 1000)
    content = "".join(chunks)

    await event_queue.put({
        "event": "model_complete",
        "data": {
            "model": model_id,
            "role": role_name,
            "round": round_num,
            "latency_ms": latency_ms,
        },
    })

    return {
        "model_id": model_id,
        "role_name": role_name,
        "content": content,
        "latency_ms": latency_ms,
    }


async def run_council_session(
    question: str,
    tier: str = "frontier",
) -> AsyncIterator[dict]:
    """Run a full council session, yielding SSE events as the debate unfolds."""
    session = await create_session(question, tier)
    session_id = session["id"]
    models = COUNCIL_MODELS[tier]
    chair_model_id = COUNCIL_MODELS["chairperson"][tier]
    role_keys = ["analyst", "reasoner", "challenger", "maverick"]
    event_queue: asyncio.Queue = asyncio.Queue()
    session_start = time.time()

    yield {"event": "session_start", "data": {"session_id": session_id, "question": question, "tier": tier}}

    all_round_responses: list[list[dict]] = []

    for round_num in range(1, 4):
        # Update session status
        await update_session_status(session_id, f"round_{round_num}")
        yield {"event": "round_start", "data": {"round": round_num}}

        # Build user content: question + prior transcripts
        if round_num == 1:
            user_content = question
        else:
            transcript_parts = []
            for prev_round_idx, prev_responses in enumerate(all_round_responses, start=1):
                transcript_parts.append(format_transcript(prev_responses, prev_round_idx))
            user_content = f"{question}\n\n{''.join(transcript_parts)}"

        # Launch all 4 models in parallel
        tasks = []
        for key in role_keys:
            model = models[key]
            system_prompt = build_system_prompt(key, round_num)
            tasks.append(
                _collect_streaming_response(
                    model_id=model["id"],
                    system_prompt=system_prompt,
                    user_content=user_content,
                    role_name=model["role"],
                    round_num=round_num,
                    event_queue=event_queue,
                )
            )

        # Run models in parallel, drain events as they come
        gather_task = asyncio.create_task(asyncio.gather(*tasks))

        # Drain event queue while models are running
        while not gather_task.done() or not event_queue.empty():
            try:
                event = await asyncio.wait_for(event_queue.get(), timeout=0.1)
                yield event
            except asyncio.TimeoutError:
                continue

        round_responses = gather_task.result()

        # Save all responses to DB
        for resp in round_responses:
            await save_response(
                session_id=session_id,
                round_num=round_num,
                model_id=resp["model_id"],
                role_name=resp["role_name"],
                content=resp["content"],
                latency_ms=resp["latency_ms"],
            )

        all_round_responses.append(round_responses)
        yield {"event": "round_complete", "data": {"round": round_num}}

    # VERDICT: Chairperson
    await update_session_status(session_id, "verdict")
    yield {"event": "verdict_start", "data": {"chairperson": chair_model_id}}

    full_transcript = ""
    for round_idx, round_responses in enumerate(all_round_responses, start=1):
        full_transcript += format_transcript(round_responses, round_idx) + "\n"

    verdict_input = f"QUESTION: {question}\n\nFULL DEBATE TRANSCRIPT:\n{full_transcript}"

    verdict_chunks: list[str] = []
    verdict_start = time.time()
    async for text in stream_model_response(chair_model_id, CHAIRPERSON_PROMPT, verdict_input):
        verdict_chunks.append(text)
        yield {"event": "verdict_chunk", "data": {"text": text}}

    verdict_content = "".join(verdict_chunks)
    verdict_latency = int((time.time() - verdict_start) * 1000)

    await save_response(
        session_id=session_id,
        round_num=4,
        model_id=chair_model_id,
        role_name="Chairperson",
        content=verdict_content,
        latency_ms=verdict_latency,
    )

    # Extract TL;DR and confidence from verdict
    tldr = ""
    confidence = "medium"
    if "## TL;DR" in verdict_content:
        tldr_section = verdict_content.split("## TL;DR")[1]
        tldr = tldr_section.split("##")[0].strip()
    if "HIGH" in verdict_content.upper().split("## CONFIDENCE")[-1][:100] if "## Confidence" in verdict_content else "":
        confidence = "high"
    elif "LOW" in verdict_content.upper().split("## CONFIDENCE")[-1][:100] if "## Confidence" in verdict_content else "":
        confidence = "low"

    total_duration = int((time.time() - session_start) * 1000)

    await update_session_status(
        session_id,
        "complete",
        verdict_tldr=tldr,
        verdict_full=verdict_content,
        confidence=confidence,
        duration_ms=total_duration,
        completed_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    )

    yield {
        "event": "session_complete",
        "data": {
            "session_id": session_id,
            "confidence": confidence,
            "duration_ms": total_duration,
        },
    }
```

**Step 2: Commit**

```bash
git add backend/app/orchestrator.py
git commit -m "feat: add debate orchestrator with parallel streaming and verdict"
```

---

## Task 6: Backend — FastAPI Application & Routes

**Files:**
- Create: `backend/app/main.py`

**Step 1: Create the FastAPI app with SSE streaming endpoint**

```python
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
    """Start a new council session. Returns session_id immediately."""
    # We just return the session_id — the actual debate runs via SSE
    return {"message": "Use /api/sessions/stream to start and stream a session", "question": body.question, "tier": body.tier}


@app.get("/api/sessions/{session_id}")
async def get_session_endpoint(session_id: str):
    """Get a completed session with all rounds and verdict."""
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@app.get("/api/sessions")
async def list_sessions_endpoint(limit: int = 20, offset: int = 0):
    """List past sessions, newest first."""
    sessions = await list_sessions(limit=limit, offset=offset)
    return {"sessions": sessions, "limit": limit, "offset": offset}


@app.get("/api/sessions/stream")
async def stream_session(question: str, tier: str = "frontier"):
    """Start a council session and stream the debate via SSE.

    Connect to this endpoint with an EventSource client.
    Events: session_start, round_start, model_chunk, model_complete,
            round_complete, verdict_start, verdict_chunk, session_complete
    """
    if len(question) < 5:
        raise HTTPException(status_code=400, detail="Question must be at least 5 characters")

    async def event_generator():
        async for event in run_council_session(question, tier):
            yield {
                "event": event["event"],
                "data": json.dumps(event["data"]),
            }

    return EventSourceResponse(event_generator())


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "model-council-api"}
```

**Step 2: Verify the backend starts**

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Expected: Server starts, visit http://localhost:8000/api/health returns `{"status":"ok","service":"model-council-api"}`

**Step 3: Commit**

```bash
git add backend/app/main.py
git commit -m "feat: add FastAPI app with SSE streaming and REST endpoints"
```

---

## Task 7: Frontend — Next.js Project Setup

**Files:**
- Create: `frontend/` (via create-next-app)
- Modify: `frontend/tailwind.config.ts` (design system tokens)
- Modify: `frontend/src/app/globals.css` (design system styles)
- Modify: `frontend/src/app/layout.tsx` (font setup)

**Step 1: Create Next.js app**

```bash
cd C:/Users/soura/Dropbox/AI/Projects/model-council
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --no-import-alias --turbopack
```

**Step 2: Install General Sans font**

```bash
cd frontend
npm install @fontsource/general-sans 2>/dev/null || true
```

Note: If @fontsource/general-sans is not available, we'll use Inter as fallback and load General Sans via CSS @font-face from a CDN.

**Step 3: Update globals.css with design system**

Replace `frontend/src/app/globals.css` with:

```css
@import "tailwindcss";

:root {
  --color-bg: #E3E2DE;
  --color-accent: #1351AA;
  --color-text: #141414;
  --color-text-secondary: #444343;
  --color-text-muted: #7A7A7A;
  --color-border: #C7C7C7;
  --color-white: #FFFFFF;
  --color-bg-hover: rgba(255, 255, 255, 0.2);
  --color-bg-muted: #F0EFEB;

  --font-sans: 'General Sans', 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
}

* {
  box-sizing: border-box;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 1.125rem;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Poster Modernist: No border radius anywhere */
* {
  border-radius: 0 !important;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--color-bg);
}
::-webkit-scrollbar-thumb {
  background: var(--color-border);
}
```

**Step 4: Update layout.tsx**

Replace `frontend/src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Model Council — Don't trust one AI. Let four debate it.",
  description:
    "Four frontier AI models debate your question through 3 structured rounds, then deliver a unified verdict.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/@fontsource/general-sans@0.1.0/index.min.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

**Step 5: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold Next.js frontend with Poster Modernist design system"
```

---

## Task 8: Frontend — Shared Components

**Files:**
- Create: `frontend/src/components/Navbar.tsx`
- Create: `frontend/src/components/PosterButton.tsx`
- Create: `frontend/src/components/SidebarLabel.tsx`
- Create: `frontend/src/components/GridSection.tsx`

**Step 1: Create PosterButton**

```tsx
// frontend/src/components/PosterButton.tsx
type Variant = "primary" | "secondary";

interface PosterButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

export function PosterButton({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: PosterButtonProps) {
  const base =
    "px-8 py-4 text-sm font-bold uppercase tracking-wider transition-colors duration-300 ease-linear cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<Variant, string> = {
    primary: "bg-[#1351AA] text-[#E3E2DE] hover:bg-[#141414]",
    secondary: "bg-[#141414] text-[#E3E2DE] hover:bg-[#1351AA]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
```

**Step 2: Create SidebarLabel**

```tsx
// frontend/src/components/SidebarLabel.tsx
interface SidebarLabelProps {
  children: React.ReactNode;
  meta?: string;
}

export function SidebarLabel({ children, meta }: SidebarLabelProps) {
  return (
    <div className="sticky top-[128px] self-start">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A7A7A]">
        {children}
      </p>
      {meta && (
        <p className="mt-2 font-mono text-xs text-[#7A7A7A]">{meta}</p>
      )}
    </div>
  );
}
```

**Step 3: Create GridSection**

```tsx
// frontend/src/components/GridSection.tsx
interface GridSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function GridSection({ children, className = "" }: GridSectionProps) {
  return (
    <section
      className={`grid grid-cols-12 gap-6 border-t border-[#C7C7C7] px-6 py-12 lg:px-12 ${className}`}
    >
      {children}
    </section>
  );
}
```

**Step 4: Create Navbar**

```tsx
// frontend/src/components/Navbar.tsx
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 h-20 border-b border-[#C7C7C7] bg-[#E3E2DE]/95 backdrop-blur-sm">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-12 items-center gap-6 px-6 lg:px-12">
        {/* Logo — cols 1-3 */}
        <div className="col-span-3">
          <Link
            href="/"
            className="text-lg font-bold uppercase tracking-tight text-[#141414] no-underline"
          >
            Model Council
          </Link>
        </div>

        {/* Status area — cols 4-9 */}
        <div className="col-span-6" />

        {/* Nav links — cols 10-12 */}
        <div className="col-span-3 flex items-center justify-end gap-6">
          <Link
            href="/history"
            className="text-sm font-semibold text-[#141414] no-underline hover:text-[#1351AA] transition-colors duration-300"
          >
            History
          </Link>
          <Link
            href="/about"
            className="text-sm font-semibold text-[#141414] no-underline hover:text-[#1351AA] transition-colors duration-300"
          >
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

**Step 5: Commit**

```bash
git add frontend/src/components/
git commit -m "feat: add shared UI components (Navbar, PosterButton, SidebarLabel, GridSection)"
```

---

## Task 9: Frontend — Home Page

**Files:**
- Modify: `frontend/src/app/page.tsx`

**Step 1: Build the home page with hero, system grid, comparison list, and CTA**

```tsx
// frontend/src/app/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { PosterButton } from "@/components/PosterButton";
import { SidebarLabel } from "@/components/SidebarLabel";
import { GridSection } from "@/components/GridSection";

const EXAMPLE_QUESTIONS = [
  "Is remote work better for productivity than office work?",
  "Should startups prioritize revenue or growth in 2026?",
  "Will AI replace software engineers within 10 years?",
  "Is cryptocurrency a viable long-term store of value?",
  "Should governments regulate social media algorithms?",
];

const SYSTEM_STEPS = [
  {
    index: "01",
    title: "OPENING STATEMENTS",
    description:
      "Four AI models independently answer your question. No model sees another's response yet.",
  },
  {
    index: "02",
    title: "CROSS-EXAMINATION",
    description:
      "Each model reads the others' answers. They challenge claims, point out errors, and refine their positions.",
  },
  {
    index: "03",
    title: "FINAL ARGUMENTS",
    description:
      "Models present their final positions. Consensus points are highlighted, disagreements are flagged.",
  },
];

const DIFFERENTIATORS = [
  "MULTI-MODEL REASONING",
  "TRANSPARENT DELIBERATION",
  "CROSS-VALIDATION",
  "CONSENSUS CONFIDENCE",
  "BIAS DETECTION",
];

export default function Home() {
  const [question, setQuestion] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (question.trim().length >= 5) {
      router.push(`/session?q=${encodeURIComponent(question.trim())}`);
    }
  }

  function handleExample(q: string) {
    setQuestion(q);
    router.push(`/session?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <Navbar />

      {/* HERO */}
      <GridSection className="min-h-[85vh] items-start border-t-0">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3 border-r border-[#C7C7C7] pr-6 hidden lg:block">
          <SidebarLabel>Manifesto</SidebarLabel>
          <div className="mt-4 h-4 w-4 bg-[#141414]" />
        </div>

        {/* Main content */}
        <div className="col-span-12 lg:col-span-9">
          <h1
            className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.85] tracking-[-0.04em]"
          >
            DON&apos;T TRUST
            <br />
            ONE AI.
            <br />
            LET FOUR{" "}
            <span className="text-[#1351AA]">DEBATE</span> IT.
          </h1>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <p className="max-w-[400px] text-lg text-[#444343]">
              Four frontier AI models deliberate your question through three
              rounds of structured debate, then an independent judge delivers a
              unified verdict.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask the Council anything..."
                rows={3}
                className="w-full border border-[#C7C7C7] bg-white px-4 py-3 text-base text-[#141414] placeholder:text-[#7A7A7A] focus:border-[#1351AA] focus:outline-none transition-colors duration-300"
              />
              <PosterButton type="submit" disabled={question.trim().length < 5}>
                Ask the Council
              </PosterButton>
            </form>
          </div>

          {/* Example questions */}
          <div className="mt-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A7A7A] mb-4">
              Try an example
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleExample(q)}
                  className="border border-[#C7C7C7] bg-transparent px-3 py-2 text-sm text-[#444343] hover:border-[#1351AA] hover:text-[#1351AA] transition-colors duration-300 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GridSection>

      {/* SYSTEM — How it works */}
      <GridSection>
        <div className="col-span-12 lg:col-span-3">
          <SidebarLabel>System</SidebarLabel>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <h2 className="text-5xl lg:text-6xl font-bold leading-[0.9] tracking-[-0.03em] mb-12">
            HOW THE
            <br />
            COUNCIL
            <br />
            WORKS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {SYSTEM_STEPS.map((step) => (
              <div
                key={step.index}
                className="border border-[#C7C7C7] p-6 hover:bg-white/20 transition-colors duration-300"
              >
                <span className="font-mono text-sm text-[#7A7A7A]">
                  {step.index}
                </span>
                <h3 className="mt-3 text-lg font-bold text-[#141414]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-[#444343]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </GridSection>

      {/* WHY DIFFERENT */}
      <GridSection>
        <div className="col-span-12 lg:col-span-3">
          <SidebarLabel>Why Different</SidebarLabel>
        </div>
        <div className="col-span-12 lg:col-span-9">
          {DIFFERENTIATORS.map((item, i) => (
            <div
              key={item}
              className="group flex items-start gap-6 border-t border-[#C7C7C7] py-6 first:border-t-0"
              style={{ minHeight: "100px" }}
            >
              <span className="font-mono text-sm text-[#7A7A7A]">
                {String(i + 1).padStart(3, "0")}
              </span>
              <h3 className="text-3xl lg:text-5xl font-bold text-[#141414] group-hover:text-[#1351AA] transition-colors duration-300">
                {item}
              </h3>
            </div>
          ))}
        </div>
      </GridSection>

      {/* ACCESS */}
      <GridSection className="min-h-[50vh] items-center">
        <div className="col-span-12 lg:col-span-3">
          <SidebarLabel>Access</SidebarLabel>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <h2 className="text-6xl lg:text-8xl font-black leading-[0.85] tracking-[-0.04em]">
            START
            <br />
            EXPLORING
          </h2>
          <p className="mt-6 text-lg text-[#444343]">
            Three free sessions daily.
            <br />
            No sign-up required.
          </p>
          <div className="mt-8">
            <PosterButton
              variant="secondary"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-10 py-5"
            >
              Ask the Council
            </PosterButton>
          </div>
        </div>
      </GridSection>
    </>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat: build home page with hero, system grid, comparison list, and CTA"
```

---

## Task 10: Frontend — Session Page (Debate UI)

**Files:**
- Create: `frontend/src/app/session/page.tsx`
- Create: `frontend/src/components/ModelCard.tsx`
- Create: `frontend/src/components/VerdictPanel.tsx`
- Create: `frontend/src/hooks/useCouncilSession.ts`

**Step 1: Create the SSE hook**

```tsx
// frontend/src/hooks/useCouncilSession.ts
"use client";

import { useState, useCallback, useRef } from "react";

interface ModelResponse {
  model: string;
  role: string;
  content: string;
  latency_ms?: number;
  complete: boolean;
}

interface RoundData {
  round: number;
  responses: Record<string, ModelResponse>;
  complete: boolean;
}

interface SessionState {
  sessionId: string | null;
  status: "idle" | "connecting" | "round_1" | "round_2" | "round_3" | "verdict" | "complete" | "error";
  rounds: RoundData[];
  verdict: string;
  confidence: string;
  durationMs: number;
  error: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ROLES = ["The Analyst", "The Reasoner", "The Challenger", "The Maverick"];

export function useCouncilSession() {
  const [state, setState] = useState<SessionState>({
    sessionId: null,
    status: "idle",
    rounds: [],
    verdict: "",
    confidence: "",
    durationMs: 0,
    error: null,
  });
  const eventSourceRef = useRef<EventSource | null>(null);

  const startSession = useCallback((question: string, tier: string = "frontier") => {
    // Reset state
    setState({
      sessionId: null,
      status: "connecting",
      rounds: [],
      verdict: "",
      confidence: "",
      durationMs: 0,
      error: null,
    });

    const url = `${API_BASE}/api/sessions/stream?question=${encodeURIComponent(question)}&tier=${tier}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("session_start", (e) => {
      const data = JSON.parse(e.data);
      setState((prev) => ({ ...prev, sessionId: data.session_id }));
    });

    es.addEventListener("round_start", (e) => {
      const data = JSON.parse(e.data);
      const roundNum = data.round;
      setState((prev) => {
        const newRound: RoundData = {
          round: roundNum,
          responses: {},
          complete: false,
        };
        // Initialize empty responses for all roles
        for (const role of ROLES) {
          newRound.responses[role] = {
            model: "",
            role: role,
            content: "",
            complete: false,
          };
        }
        return {
          ...prev,
          status: `round_${roundNum}` as SessionState["status"],
          rounds: [...prev.rounds, newRound],
        };
      });
    });

    es.addEventListener("model_chunk", (e) => {
      const data = JSON.parse(e.data);
      setState((prev) => {
        const rounds = [...prev.rounds];
        const currentRound = rounds[rounds.length - 1];
        if (currentRound) {
          const resp = currentRound.responses[data.role] || {
            model: data.model,
            role: data.role,
            content: "",
            complete: false,
          };
          currentRound.responses[data.role] = {
            ...resp,
            model: data.model,
            content: resp.content + data.text,
          };
        }
        return { ...prev, rounds };
      });
    });

    es.addEventListener("model_complete", (e) => {
      const data = JSON.parse(e.data);
      setState((prev) => {
        const rounds = [...prev.rounds];
        const currentRound = rounds[rounds.length - 1];
        if (currentRound && currentRound.responses[data.role]) {
          currentRound.responses[data.role] = {
            ...currentRound.responses[data.role],
            complete: true,
            latency_ms: data.latency_ms,
          };
        }
        return { ...prev, rounds };
      });
    });

    es.addEventListener("round_complete", (e) => {
      const data = JSON.parse(e.data);
      setState((prev) => {
        const rounds = [...prev.rounds];
        const round = rounds.find((r) => r.round === data.round);
        if (round) round.complete = true;
        return { ...prev, rounds };
      });
    });

    es.addEventListener("verdict_start", () => {
      setState((prev) => ({ ...prev, status: "verdict" }));
    });

    es.addEventListener("verdict_chunk", (e) => {
      const data = JSON.parse(e.data);
      setState((prev) => ({
        ...prev,
        verdict: prev.verdict + data.text,
      }));
    });

    es.addEventListener("session_complete", (e) => {
      const data = JSON.parse(e.data);
      setState((prev) => ({
        ...prev,
        status: "complete",
        confidence: data.confidence,
        durationMs: data.duration_ms,
      }));
      es.close();
    });

    es.addEventListener("model_error", (e) => {
      const data = JSON.parse(e.data);
      console.error("Model error:", data);
    });

    es.onerror = () => {
      setState((prev) => ({ ...prev, status: "error", error: "Connection lost. Please try again." }));
      es.close();
    };

    return () => {
      es.close();
    };
  }, []);

  const stopSession = useCallback(() => {
    eventSourceRef.current?.close();
    setState((prev) => ({ ...prev, status: "idle" }));
  }, []);

  return { ...state, startSession, stopSession };
}
```

**Step 2: Create ModelCard**

```tsx
// frontend/src/components/ModelCard.tsx
interface ModelCardProps {
  role: string;
  model: string;
  content: string;
  complete: boolean;
  latencyMs?: number;
}

const ROLE_LABELS: Record<string, string> = {
  "The Analyst": "GPT-5",
  "The Reasoner": "CLAUDE",
  "The Challenger": "GEMINI",
  "The Maverick": "GROK",
};

export function ModelCard({ role, model, content, complete, latencyMs }: ModelCardProps) {
  const isStreaming = content.length > 0 && !complete;

  return (
    <div
      className={`border border-[#C7C7C7] p-5 transition-all duration-300 ${
        isStreaming ? "border-l-[3px] border-l-[#1351AA]" : ""
      } ${!content ? "bg-[#F0EFEB]" : "bg-white/50"}`}
    >
      {/* Header */}
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <span className="text-sm font-bold text-[#141414] uppercase tracking-wide">
            {ROLE_LABELS[role] || role}
          </span>
          <span className="ml-2 text-xs text-[#7A7A7A]">{role}</span>
        </div>
        {complete && latencyMs && (
          <span className="font-mono text-xs text-[#7A7A7A]">
            {(latencyMs / 1000).toFixed(1)}s
          </span>
        )}
        {isStreaming && (
          <span className="text-xs text-[#1351AA] font-semibold animate-pulse">
            Streaming...
          </span>
        )}
      </div>

      {/* Content */}
      {content ? (
        <div className="text-sm text-[#444343] leading-relaxed whitespace-pre-wrap">
          {content}
          {isStreaming && <span className="inline-block w-1.5 h-4 bg-[#1351AA] ml-0.5 animate-pulse" />}
        </div>
      ) : (
        <p className="text-sm text-[#7A7A7A] italic">Waiting...</p>
      )}
    </div>
  );
}
```

**Step 3: Create VerdictPanel**

```tsx
// frontend/src/components/VerdictPanel.tsx
"use client";

interface VerdictPanelProps {
  content: string;
  confidence: string;
  complete: boolean;
}

const CONFIDENCE_STYLES: Record<string, string> = {
  high: "bg-[#E8EEF7] text-[#1351AA]",
  medium: "bg-[#F5F0E0] text-[#8B6914]",
  low: "bg-[#F7E8E8] text-[#AA1313]",
};

export function VerdictPanel({ content, confidence, complete }: VerdictPanelProps) {
  function copyVerdict() {
    navigator.clipboard.writeText(content);
  }

  return (
    <div className="border-t-2 border-t-[#1351AA] bg-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#141414] uppercase tracking-wide">
          Council Verdict
        </h2>
        {confidence && (
          <span
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded ${
              CONFIDENCE_STYLES[confidence] || CONFIDENCE_STYLES.medium
            }`}
            style={{ borderRadius: "4px" }}
          >
            Confidence: {confidence.toUpperCase()}
          </span>
        )}
      </div>

      {/* Verdict content */}
      {content ? (
        <div className="prose prose-sm max-w-none text-[#444343] leading-relaxed">
          <div className="whitespace-pre-wrap">{content}</div>
          {!complete && (
            <span className="inline-block w-1.5 h-4 bg-[#1351AA] ml-0.5 animate-pulse" />
          )}
        </div>
      ) : (
        <p className="text-sm text-[#7A7A7A] italic">
          Waiting for all rounds to complete...
        </p>
      )}

      {/* Actions */}
      {complete && content && (
        <div className="mt-8 flex gap-4 border-t border-[#C7C7C7] pt-6">
          <button
            onClick={copyVerdict}
            className="px-6 py-3 text-xs font-bold uppercase tracking-wider bg-[#1351AA] text-[#E3E2DE] hover:bg-[#141414] transition-colors duration-300 cursor-pointer"
          >
            Copy Verdict
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="px-6 py-3 text-xs font-bold uppercase tracking-wider bg-[#141414] text-[#E3E2DE] hover:bg-[#1351AA] transition-colors duration-300 cursor-pointer"
          >
            New Session
          </button>
        </div>
      )}
    </div>
  );
}
```

**Step 4: Create the session page**

```tsx
// frontend/src/app/session/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { GridSection } from "@/components/GridSection";
import { SidebarLabel } from "@/components/SidebarLabel";
import { ModelCard } from "@/components/ModelCard";
import { VerdictPanel } from "@/components/VerdictPanel";
import { useCouncilSession } from "@/hooks/useCouncilSession";

const ROUND_LABELS = ["OPENING STATEMENTS", "CROSS-EXAMINATION", "FINAL ARGUMENTS"];
const ROLES = ["The Analyst", "The Reasoner", "The Challenger", "The Maverick"];

function SessionContent() {
  const searchParams = useSearchParams();
  const question = searchParams.get("q") || "";
  const tier = searchParams.get("tier") || "frontier";

  const session = useCouncilSession();

  useEffect(() => {
    if (question && session.status === "idle") {
      session.startSession(question, tier);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const currentRoundNum =
    session.status === "round_1" ? 1 :
    session.status === "round_2" ? 2 :
    session.status === "round_3" ? 3 : 0;

  return (
    <>
      <Navbar />

      {/* Progress bar */}
      <div className="h-0.5 bg-[#C7C7C7]">
        <div
          className="h-full bg-[#1351AA] transition-all duration-500"
          style={{
            width:
              session.status === "idle" ? "0%" :
              session.status === "connecting" ? "2%" :
              session.status === "round_1" ? "20%" :
              session.status === "round_2" ? "45%" :
              session.status === "round_3" ? "70%" :
              session.status === "verdict" ? "85%" :
              "100%",
          }}
        />
      </div>

      {/* Question header */}
      <GridSection>
        <div className="col-span-12 lg:col-span-3">
          <SidebarLabel meta={session.sessionId ? `#${session.sessionId.slice(0, 8)}` : undefined}>
            Question
          </SidebarLabel>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <h1 className="text-2xl lg:text-4xl font-bold leading-tight text-[#141414]">
            &ldquo;{question}&rdquo;
          </h1>
          <div className="mt-3 flex gap-4 text-xs text-[#7A7A7A]">
            <span className="font-mono uppercase">Tier: {tier}</span>
            {session.status !== "idle" && session.status !== "connecting" && (
              <span className="font-mono uppercase">
                Status: {session.status.replace("_", " ")}
              </span>
            )}
            {session.durationMs > 0 && (
              <span className="font-mono">
                Duration: {(session.durationMs / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        </div>
      </GridSection>

      {/* Debate rounds */}
      {session.rounds.map((round) => (
        <GridSection key={round.round}>
          <div className="col-span-12 lg:col-span-3">
            <SidebarLabel
              meta={
                round.complete
                  ? "Complete"
                  : currentRoundNum === round.round
                    ? "In progress..."
                    : undefined
              }
            >
              Round {String(round.round).padStart(2, "0")}
              <br />
              {ROUND_LABELS[round.round - 1]}
            </SidebarLabel>
          </div>
          <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROLES.map((role) => {
              const resp = round.responses[role];
              return (
                <ModelCard
                  key={role}
                  role={role}
                  model={resp?.model || ""}
                  content={resp?.content || ""}
                  complete={resp?.complete || false}
                  latencyMs={resp?.latency_ms}
                />
              );
            })}
          </div>
        </GridSection>
      ))}

      {/* Verdict */}
      {(session.status === "verdict" || session.status === "complete") && (
        <GridSection>
          <div className="col-span-12 lg:col-span-3">
            <SidebarLabel
              meta={session.status === "complete" ? "Final" : "Synthesizing..."}
            >
              Verdict
            </SidebarLabel>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <VerdictPanel
              content={session.verdict}
              confidence={session.confidence}
              complete={session.status === "complete"}
            />
          </div>
        </GridSection>
      )}

      {/* Error state */}
      {session.status === "error" && (
        <GridSection>
          <div className="col-span-12 lg:col-span-3">
            <SidebarLabel>Error</SidebarLabel>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <div className="border border-[#AA1313] bg-[#F7E8E8] p-6">
              <p className="text-[#AA1313] font-bold">{session.error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-3 text-xs font-bold uppercase tracking-wider bg-[#141414] text-[#E3E2DE] cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        </GridSection>
      )}
    </>
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-[#7A7A7A] text-sm uppercase tracking-wider">
            Loading session...
          </p>
        </div>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
```

**Step 5: Commit**

```bash
git add frontend/src/
git commit -m "feat: build session page with streaming debate UI, model cards, and verdict panel"
```

---

## Task 11: Frontend — History Page

**Files:**
- Create: `frontend/src/app/history/page.tsx`

**Step 1: Create history page**

```tsx
// frontend/src/app/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { GridSection } from "@/components/GridSection";
import { SidebarLabel } from "@/components/SidebarLabel";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SessionSummary {
  id: string;
  question: string;
  status: string;
  confidence: string | null;
  created_at: string;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/sessions?limit=50`)
      .then((r) => r.json())
      .then((data) => {
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <GridSection className="min-h-[80vh]">
        <div className="col-span-12 lg:col-span-3">
          <SidebarLabel>History</SidebarLabel>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <h1 className="text-5xl font-bold leading-[0.9] tracking-[-0.03em] mb-12">
            PAST
            <br />
            SESSIONS
          </h1>

          {loading ? (
            <p className="text-sm text-[#7A7A7A]">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-[#7A7A7A]">
              No sessions yet.{" "}
              <Link href="/" className="text-[#1351AA] underline">
                Ask the Council something.
              </Link>
            </p>
          ) : (
            <div>
              {sessions.map((s, i) => (
                <Link
                  key={s.id}
                  href={`/session?id=${s.id}`}
                  className="group flex items-start gap-6 border-t border-[#C7C7C7] py-6 no-underline"
                >
                  <span className="font-mono text-sm text-[#7A7A7A]">
                    {String(i + 1).padStart(3, "0")}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-xl lg:text-2xl font-bold text-[#141414] group-hover:text-[#1351AA] transition-colors duration-300">
                      {s.question}
                    </h3>
                    <div className="mt-1 flex gap-4 text-xs text-[#7A7A7A]">
                      <span>{new Date(s.created_at).toLocaleDateString()}</span>
                      <span className="uppercase">{s.status}</span>
                      {s.confidence && (
                        <span className="uppercase">{s.confidence}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </GridSection>
    </>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/src/app/history/
git commit -m "feat: add session history page"
```

---

## Task 12: Integration — Environment Config & Start Scripts

**Files:**
- Create: `frontend/.env.local`
- Modify: `frontend/package.json` (verify dev script)
- Create: `start.sh` (convenience script)

**Step 1: Create frontend env**

```
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Step 2: Create start script**

```bash
#!/bin/bash
# start.sh — Start both backend and frontend
echo "Starting Model Council..."
echo ""

# Start backend
echo "[Backend] Starting FastAPI on port 8000..."
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Start frontend
echo "[Frontend] Starting Next.js on port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Model Council is running:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
```

**Step 3: Commit**

```bash
git add frontend/.env.local start.sh
chmod +x start.sh
git commit -m "feat: add environment config and start script"
```

---

## Task 13: Initialize Git & Final Commit

**Step 1: Initialize git repo**

```bash
cd C:/Users/soura/Dropbox/AI/Projects/model-council
git init
```

**Step 2: Update .gitignore**

Append to `.gitignore`:
```
.env
.env.local
node_modules/
__pycache__/
*.pyc
council.db
.next/
backend/__pycache__/
```

**Step 3: Add all files and create initial commit**

```bash
git add -A
git commit -m "feat: initial Model Council — 4-model AI debate platform with streaming UI"
```

**Step 4: Verify everything works**

```bash
# Terminal 1: Backend
cd backend && python -m uvicorn app.main:app --port 8000 --reload

# Terminal 2: Frontend
cd frontend && npm run dev
```

Visit http://localhost:3000 — should show the home page. Type a question and submit — should open the session page and start streaming the debate.
