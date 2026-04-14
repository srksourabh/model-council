import { type NextRequest } from "next/server";
import { COUNCIL_MODELS, ROLE_KEYS, type Tier } from "@/lib/council-config";
import { buildSystemPrompt, formatTranscript, CHAIRPERSON_PROMPT } from "@/lib/prompts";
import { streamModelResponse } from "@/lib/openrouter";
import { saveSessionToD1 } from "@/lib/d1";
import { randomUUID } from "crypto";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

interface RoundResponse {
  model_id: string;
  role_name: string;
  content: string;
  latency_ms: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const question = searchParams.get("question") || "";
  const tier = (searchParams.get("tier") || "frontier") as Tier;

  if (question.length < 5) {
    return new Response("Question must be at least 5 characters", { status: 400 });
  }

  if (tier !== "frontier" && tier !== "budget") {
    return new Response("Tier must be 'frontier' or 'budget'", { status: 400 });
  }

  const encoder = new TextEncoder();
  const sessionId = randomUUID();
  const models = COUNCIL_MODELS[tier];
  const chairModelId = COUNCIL_MODELS.chairperson[tier];
  const sessionStart = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: Record<string, unknown>) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        send("session_start", { session_id: sessionId, question, tier });

        const allRoundResponses: RoundResponse[][] = [];

        for (let roundNum = 1; roundNum <= 3; roundNum++) {
          send("round_start", { round: roundNum });

          let userContent: string;
          if (roundNum === 1) {
            userContent = question;
          } else {
            const transcriptParts = allRoundResponses.map((responses, idx) =>
              formatTranscript(responses, idx + 1)
            );
            userContent = `${question}\n\n${transcriptParts.join("")}`;
          }

          // Launch all 4 models in parallel, collect full responses
          const results = await Promise.all(
            ROLE_KEYS.map(async (key) => {
              const model = models[key];
              const start = Date.now();
              const chunks: string[] = [];
              try {
                for await (const text of streamModelResponse(
                  model.id,
                  buildSystemPrompt(key, roundNum),
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
            })
          );

          // Emit each completed response
          for (const resp of results) {
            send("model_chunk", {
              model: resp.model_id,
              role: resp.role_name,
              round: roundNum,
              text: resp.content,
            });
            send("model_complete", {
              model: resp.model_id,
              role: resp.role_name,
              round: roundNum,
              latency_ms: resp.latency_ms,
            });
          }

          allRoundResponses.push(results);
          send("round_complete", { round: roundNum });
        }

        // Verdict phase — stream chunks to the client
        send("verdict_start", { chairperson: chairModelId });

        const fullTranscript = allRoundResponses
          .map((responses, idx) => formatTranscript(responses, idx + 1))
          .join("\n");
        const verdictInput = `QUESTION: ${question}\n\nFULL DEBATE TRANSCRIPT:\n${fullTranscript}`;
        const verdictChunks: string[] = [];

        for await (const text of streamModelResponse(chairModelId, CHAIRPERSON_PROMPT, verdictInput)) {
          verdictChunks.push(text);
          send("verdict_chunk", { text });
        }

        const verdictContent = verdictChunks.join("");
        let confidence = "medium";
        if (verdictContent.includes("## Confidence")) {
          const confSection = verdictContent.split("## Confidence")[1]?.slice(0, 200).toUpperCase() || "";
          if (confSection.includes("HIGH")) confidence = "high";
          else if (confSection.includes("LOW")) confidence = "low";
        }

        const totalDuration = Date.now() - sessionStart;
        const createdAt = new Date().toISOString();

        // Save to Cloudflare D1
        const dbResponses: Array<{
          id: string; session_id: string; round: number; model_id: string;
          role_name: string; content: string; latency_ms: number; created_at: string;
        }> = [];
        for (const [roundIdx, roundResps] of allRoundResponses.entries()) {
          for (const resp of roundResps) {
            dbResponses.push({
              id: randomUUID(), session_id: sessionId, round: roundIdx + 1,
              model_id: resp.model_id, role_name: resp.role_name,
              content: resp.content, latency_ms: resp.latency_ms, created_at: createdAt,
            });
          }
        }
        // Add verdict as round 4
        dbResponses.push({
          id: randomUUID(), session_id: sessionId, round: 4,
          model_id: chairModelId, role_name: "Chairperson",
          content: verdictContent, latency_ms: 0, created_at: createdAt,
        });

        try {
          await saveSessionToD1({
            id: sessionId, question, tier, confidence,
            duration_ms: totalDuration, verdict_full: verdictContent,
            created_at: createdAt, responses: dbResponses,
          });
        } catch (dbErr) {
          console.error("D1 save failed:", dbErr);
        }

        send("session_complete", {
          session_id: sessionId,
          confidence,
          duration_ms: totalDuration,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        controller.enqueue(
          encoder.encode(`event: session_error\ndata: ${JSON.stringify({ error: msg })}\n\n`)
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
      "X-Accel-Buffering": "no",
    },
  });
}
