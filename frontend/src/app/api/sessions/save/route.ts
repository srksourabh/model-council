import { type NextRequest } from "next/server";
import { saveSessionToD1 } from "@/lib/d1";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, question, tier, confidence, duration_ms, verdict_full, rounds } = body as {
      id: string;
      question: string;
      tier: string;
      confidence: string;
      duration_ms: number;
      verdict_full: string;
      rounds: Array<{
        round: number;
        responses: Array<{
          model_id: string;
          role_name: string;
          content: string;
          latency_ms: number;
        }>;
      }>;
    };

    const createdAt = new Date().toISOString();
    const dbResponses: Array<{
      id: string; session_id: string; round: number; model_id: string;
      role_name: string; content: string; latency_ms: number; created_at: string;
    }> = [];

    for (const round of rounds) {
      for (const resp of round.responses) {
        dbResponses.push({
          id: randomUUID(),
          session_id: id,
          round: round.round,
          model_id: resp.model_id,
          role_name: resp.role_name,
          content: resp.content,
          latency_ms: resp.latency_ms,
          created_at: createdAt,
        });
      }
    }

    // Add verdict as round 4
    if (verdict_full) {
      dbResponses.push({
        id: randomUUID(),
        session_id: id,
        round: 4,
        model_id: "chairperson",
        role_name: "Chairperson",
        content: verdict_full,
        latency_ms: 0,
        created_at: createdAt,
      });
    }

    await saveSessionToD1({
      id,
      question,
      tier,
      confidence,
      duration_ms,
      verdict_full,
      created_at: createdAt,
      responses: dbResponses,
    });

    return Response.json({ saved: true });
  } catch (e) {
    console.error("Save failed:", e);
    return Response.json({ saved: false, error: String(e) }, { status: 500 });
  }
}
