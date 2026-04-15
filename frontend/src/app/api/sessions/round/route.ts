import { type NextRequest } from "next/server";
import { COUNCIL_MODELS, ROLE_KEYS, type Tier } from "@/lib/council-config";
import { buildSystemPrompt } from "@/lib/prompts";
import { streamModelResponse } from "@/lib/openrouter";
import { searchForContext } from "@/lib/web-search";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { question, tier, round, transcript } = body as {
    question: string;
    tier: Tier;
    round: number;
    transcript: string;
  };

  if (!question || question.length < 5) {
    return Response.json({ error: "Question too short" }, { status: 400 });
  }
  if (round < 1 || round > 3) {
    return Response.json({ error: "Round must be 1-3" }, { status: 400 });
  }

  const models = COUNCIL_MODELS[tier] || COUNCIL_MODELS.frontier;

  let userContent: string;
  if (round === 1) {
    const briefing = await searchForContext(question);
    userContent = briefing
      ? `${question}\n\n${briefing}`
      : question;
  } else {
    userContent = `${question}\n\n${transcript}`;
  }

  const results = await Promise.all(
    ROLE_KEYS.map(async (key) => {
      const model = models[key];
      const start = Date.now();
      const chunks: string[] = [];
      try {
        for await (const text of streamModelResponse(
          model.id,
          buildSystemPrompt(key, round),
          userContent,
          model.maxTokens,
        )) {
          chunks.push(text);
        }
      } catch (e) {
        chunks.push(`[Error from ${model.id}: ${e}]`);
      }
      return {
        model_id: model.id,
        role_name: model.role,
        content: chunks.join(""),
        latency_ms: Date.now() - start,
      };
    }),
  );

  return Response.json({ round, responses: results });
}
