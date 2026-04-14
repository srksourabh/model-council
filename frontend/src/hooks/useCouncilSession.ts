"use client";

import { useState, useCallback, useRef } from "react";

interface ModelResponse {
  model: string;
  role: string;
  content: string;
  latency_ms?: number;
  complete: boolean;
}

interface RoundData {
  round: number;
  responses: Record<string, ModelResponse>;
  complete: boolean;
}

interface SessionState {
  sessionId: string | null;
  status: "idle" | "connecting" | "round_1" | "round_2" | "round_3" | "verdict" | "complete" | "error";
  rounds: RoundData[];
  verdict: string;
  confidence: string;
  durationMs: number;
  error: string | null;
}

const ROLES = ["The Analyst", "The Reasoner", "The Challenger", "The Maverick"];

function formatTranscript(
  rounds: Array<{ round: number; responses: Array<{ role_name: string; content: string }> }>,
): string {
  return rounds
    .map((r) => {
      const lines = [`--- ROUND ${r.round} ---`];
      for (const resp of r.responses) {
        lines.push(`\n### ${resp.role_name}:\n${resp.content}\n`);
      }
      return lines.join("\n");
    })
    .join("\n");
}

export function useCouncilSession() {
  const [state, setState] = useState<SessionState>({
    sessionId: null,
    status: "idle",
    rounds: [],
    verdict: "",
    confidence: "",
    durationMs: 0,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const startSession = useCallback((question: string, tier: string = "frontier") => {
    const sessionId = crypto.randomUUID();
    const sessionStart = Date.now();

    setState({
      sessionId,
      status: "connecting",
      rounds: [],
      verdict: "",
      confidence: "",
      durationMs: 0,
      error: null,
    });

    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const allRoundData: Array<{
          round: number;
          responses: Array<{ model_id: string; role_name: string; content: string; latency_ms: number }>;
        }> = [];

        // Run 3 rounds sequentially
        for (let roundNum = 1; roundNum <= 3; roundNum++) {
          if (controller.signal.aborted) return;

          // Show round starting with empty cards
          setState((prev) => {
            const newRound: RoundData = { round: roundNum, responses: {}, complete: false };
            for (const role of ROLES) {
              newRound.responses[role] = { model: "", role, content: "", complete: false };
            }
            return {
              ...prev,
              status: `round_${roundNum}` as SessionState["status"],
              rounds: [...prev.rounds, newRound],
            };
          });

          const transcript = formatTranscript(allRoundData);

          const res = await fetch("/api/sessions/round", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question, tier, round: roundNum, transcript }),
            signal: controller.signal,
          });

          if (!res.ok) throw new Error(`Round ${roundNum} failed: ${res.status}`);
          const data = await res.json();

          allRoundData.push({ round: roundNum, responses: data.responses });

          // Update state with completed round
          setState((prev) => {
            const rounds = prev.rounds.map((r) => {
              if (r.round !== roundNum) return r;
              const responses: Record<string, ModelResponse> = {};
              for (const resp of data.responses) {
                responses[resp.role_name] = {
                  model: resp.model_id,
                  role: resp.role_name,
                  content: resp.content,
                  latency_ms: resp.latency_ms,
                  complete: true,
                };
              }
              return { ...r, responses, complete: true };
            });
            return { ...prev, rounds };
          });
        }

        if (controller.signal.aborted) return;

        // Verdict phase — stream it
        setState((prev) => ({ ...prev, status: "verdict" }));

        const fullTranscript = formatTranscript(allRoundData);
        const verdictRes = await fetch("/api/sessions/verdict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, tier, transcript: fullTranscript }),
          signal: controller.signal,
        });

        if (!verdictRes.ok) throw new Error(`Verdict failed: ${verdictRes.status}`);

        const reader = verdictRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullVerdict = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") break;
            try {
              const chunk = JSON.parse(payload);
              if (chunk.text) {
                fullVerdict += chunk.text;
                setState((prev) => ({ ...prev, verdict: prev.verdict + chunk.text }));
              }
            } catch {
              continue;
            }
          }
        }

        // Extract confidence
        let confidence = "medium";
        if (fullVerdict.includes("## Confidence")) {
          const confSection = fullVerdict.split("## Confidence")[1]?.slice(0, 200).toUpperCase() || "";
          if (confSection.includes("HIGH")) confidence = "high";
          else if (confSection.includes("LOW")) confidence = "low";
        }

        const totalDuration = Date.now() - sessionStart;

        setState((prev) => ({
          ...prev,
          status: "complete",
          confidence,
          durationMs: totalDuration,
        }));

        // Save to D1 in background
        fetch("/api/sessions/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: sessionId,
            question,
            tier,
            confidence,
            duration_ms: totalDuration,
            verdict_full: fullVerdict,
            rounds: allRoundData,
          }),
        }).catch(() => {});
      } catch (e) {
        if (controller.signal.aborted) return;
        setState((prev) => ({
          ...prev,
          status: "error",
          error: e instanceof Error ? e.message : "Connection lost. Please try again.",
        }));
      }
    })();

    return () => { controller.abort(); };
  }, []);

  const stopSession = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({ ...prev, status: "idle" }));
  }, []);

  return { ...state, startSession, stopSession };
}
