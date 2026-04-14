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

        while not gather_task.done() or not event_queue.empty():
            try:
                event = await asyncio.wait_for(event_queue.get(), timeout=0.1)
                yield event
            except asyncio.TimeoutError:
                continue

        round_responses = gather_task.result()

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
