export const COUNCIL_MODELS = {
  frontier: {
    analyst:    { id: "openai/gpt-4o",                  role: "The Analyst",     maxTokens: 300 },
    reasoner:   { id: "anthropic/claude-sonnet-4.6",   role: "The Reasoner",    maxTokens: 400 },
    challenger: { id: "google/gemini-3.1-pro-preview", role: "The Challenger",  maxTokens: 2000 },
    maverick:   { id: "x-ai/grok-4",                  role: "The Maverick",    maxTokens: 1000 },
  },
  budget: {
    analyst:    { id: "openai/gpt-4o-mini",             role: "The Analyst",     maxTokens: 300 },
    reasoner:   { id: "anthropic/claude-haiku-4.5",    role: "The Reasoner",    maxTokens: 400 },
    challenger: { id: "google/gemini-2.5-flash",       role: "The Challenger",  maxTokens: 2000 },
    maverick:   { id: "x-ai/grok-4.1-fast",           role: "The Maverick",    maxTokens: 1000 },
  },
  chairperson: {
    frontier: "anthropic/claude-opus-4.6",
    budget:   "anthropic/claude-opus-4.5",
  },
} as const;

export type Tier = "frontier" | "budget";
export type RoleKey = "analyst" | "reasoner" | "challenger" | "maverick";
export const ROLE_KEYS: RoleKey[] = ["analyst", "reasoner", "challenger", "maverick"];
