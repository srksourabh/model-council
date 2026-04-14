# backend/app/database.py
import json
import uuid
from datetime import datetime, timezone
import aiosqlite

import os
DB_PATH = os.getenv("DATABASE_PATH", "council.db")


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
    session_id: str, round_num: int, model_id: str, role_name: str, content: str, latency_ms: int = 0,
) -> dict:
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
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("UPDATE sessions SET status = ? WHERE id = ?", (status, session_id))
        for key, value in kwargs.items():
            if key in ("verdict_tldr", "verdict_full", "confidence", "total_tokens",
                       "total_cost_usd", "duration_ms", "completed_at"):
                val = json.dumps(value) if isinstance(value, dict) else value
                await db.execute(f"UPDATE sessions SET {key} = ? WHERE id = ?", (val, session_id))
        await db.commit()


async def get_session(session_id: str) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
        row = await cursor.fetchone()
        if not row:
            return None
        session = dict(row)
        cursor = await db.execute(
            "SELECT * FROM responses WHERE session_id = ? ORDER BY round, created_at", (session_id,))
        rows = await cursor.fetchall()
        session["responses"] = [dict(r) for r in rows]
    return session


async def list_sessions(limit: int = 20, offset: int = 0) -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, question, status, tier, confidence, created_at, completed_at FROM sessions ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset))
        rows = await cursor.fetchall()
    return [dict(r) for r in rows]
