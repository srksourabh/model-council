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
