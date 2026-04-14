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
