import { type NextRequest } from "next/server";
import { COUNCIL_MODELS, type Tier } from "@/lib/council-config";
import { CHAIRPERSON_PROMPT } from "@/lib/prompts";
import { streamModelResponse } from "@/lib/openrouter";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { question, tier, transcript } = body as {
    question: string;
    tier: Tier;
    transcript: string;
  };

  const chairModelId = COUNCIL_MODELS.chairperson[tier] || COUNCIL_MODELS.chairperson.frontier;
  const verdictInput = `QUESTION: ${question}\n\nFULL DEBATE TRANSCRIPT:\n${transcript}`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const text of streamModelResponse(chairModelId, CHAIRPERSON_PROMPT, verdictInput)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (e) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: String(e) })}\n\n`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
