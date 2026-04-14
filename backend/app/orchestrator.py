# backend/app/orchestrator.py
import asyncio
import json
import time
from collections.abc import AsyncIterator
from app.config import COUNCIL_MODELS
from app.prompts import build_system_prompt, format_transcript, CHAIRPERSON_PROMPT
from app.openrouter import stream_model_response
from app.database import create_session, save_response, update_session_status


async def _collect_response(
    model_id: str,
    system_prompt: str,
    user_content: str,
    role_name: str,
) -> dict:
    """Call a model and collect the full response (non-streaming internally)."""
    chunks: list[str] = []
    start = time.time()

    try:
        async for text in stream_model_response(model_id, system_prompt, user_content, max_tokens=200):
            chunks.append(text)
    except Exception as e:
        return {
            "model_id": model_id,
            "role_name": role_name,
            "content": f"[Error from {model_id}: {e}]",
            "latency_ms": int((time.time() - start) * 1000),
            "error": True,
        }

    return {
        "model_id": model_id,
        "role_name": role_name,
        "content": "".join(chunks),
        "latency_ms": int((time.time() - start) * 1000),
        "error": False,
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
    session_start = time.time()

    yield {
        "event": "session_start",
        "data": {"session_id": session_id, "question": question, "tier": tier},
    }

    all_round_responses: list[list[dict]] = []

    for round_num in range(1, 4):
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

        # Launch all 4 models in parallel and wait for all to complete
        round_responses = await asyncio.gather(
            *[
                _collect_response(
                    model_id=models[key]["id"],
                    system_prompt=build_system_prompt(key, round_num),
                    user_content=user_content,
                    role_name=models[key]["role"],
                )
                for key in role_keys
            ]
        )

        # Yield each completed response as SSE events
        for resp in round_responses:
            # Send the full content as one chunk
            yield {
                "event": "model_chunk",
                "data": {
                    "model": resp["model_id"],
                    "role": resp["role_name"],
                    "round": round_num,
                    "text": resp["content"],
                },
            }
            yield {
                "event": "model_complete",
                "data": {
                    "model": resp["model_id"],
                    "role": resp["role_name"],
                    "round": round_num,
                    "latency_ms": resp["latency_ms"],
                },
            }

            # Save to database
            await save_response(
                session_id=session_id,
                round_num=round_num,
                model_id=resp["model_id"],
                role_name=resp["role_name"],
                content=resp["content"],
                latency_ms=resp["latency_ms"],
            )

        all_round_responses.append(list(round_responses))
        yield {"event": "round_complete", "data": {"round": round_num}}

    # VERDICT: Chairperson
    await update_session_status(session_id, "verdict")
    yield {"event": "verdict_start", "data": {"chairperson": chair_model_id}}

    full_transcript = ""
    for round_idx, rr in enumerate(all_round_responses, start=1):
        full_transcript += format_transcript(rr, round_idx) + "\n"

    verdict_input = f"QUESTION: {question}\n\nFULL DEBATE TRANSCRIPT:\n{full_transcript}"

    verdict_chunks: list[str] = []
    verdict_start_time = time.time()
    async for text in stream_model_response(chair_model_id, CHAIRPERSON_PROMPT, verdict_input):
        verdict_chunks.append(text)
        yield {"event": "verdict_chunk", "data": {"text": text}}

    verdict_content = "".join(verdict_chunks)
    verdict_latency = int((time.time() - verdict_start_time) * 1000)

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
    if "## Confidence" in verdict_content:
        conf_section = verdict_content.split("## Confidence")[1][:200].upper()
        if "HIGH" in conf_section:
            confidence = "high"
        elif "LOW" in conf_section:
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
