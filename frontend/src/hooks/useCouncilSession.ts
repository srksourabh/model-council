"use client";

import { useState, useCallback, useRef } from "react";
import { saveSession, type StoredResponse } from "@/lib/session-storage";

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
  const eventSourceRef = useRef<EventSource | null>(null);
  const questionRef = useRef("");
  const tierRef = useRef("frontier");

  const startSession = useCallback((question: string, tier: string = "frontier") => {
    questionRef.current = question;
    tierRef.current = tier;

    setState({
      sessionId: null,
      status: "connecting",
      rounds: [],
      verdict: "",
      confidence: "",
      durationMs: 0,
      error: null,
    });

    const url = `/api/sessions/stream?question=${encodeURIComponent(question)}&tier=${tier}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("session_start", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setState((prev) => ({ ...prev, sessionId: data.session_id }));
    });

    es.addEventListener("round_start", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      const roundNum = data.round;
      setState((prev) => {
        if (prev.rounds.some((r) => r.round === roundNum)) {
          return { ...prev, status: `round_${roundNum}` as SessionState["status"] };
        }
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
    });

    es.addEventListener("model_chunk", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setState((prev) => {
        const rounds = prev.rounds.map((r, i) => {
          if (i !== prev.rounds.length - 1) return r;
          const resp = r.responses[data.role] || { model: data.model, role: data.role, content: "", complete: false };
          return {
            ...r,
            responses: {
              ...r.responses,
              [data.role]: { ...resp, model: data.model, content: resp.content + data.text },
            },
          };
        });
        return { ...prev, rounds };
      });
    });

    es.addEventListener("model_complete", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setState((prev) => {
        const rounds = prev.rounds.map((r, i) => {
          if (i !== prev.rounds.length - 1) return r;
          if (!r.responses[data.role]) return r;
          return {
            ...r,
            responses: {
              ...r.responses,
              [data.role]: { ...r.responses[data.role], complete: true, latency_ms: data.latency_ms },
            },
          };
        });
        return { ...prev, rounds };
      });
    });

    es.addEventListener("round_complete", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setState((prev) => {
        const rounds = prev.rounds.map((r) =>
          r.round === data.round ? { ...r, complete: true } : r
        );
        return { ...prev, rounds };
      });
    });

    es.addEventListener("verdict_start", () => {
      setState((prev) => ({ ...prev, status: "verdict" }));
    });

    es.addEventListener("verdict_chunk", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setState((prev) => ({ ...prev, verdict: prev.verdict + data.text }));
    });

    es.addEventListener("session_complete", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setState((prev) => {
        const completed = { ...prev, status: "complete" as const, confidence: data.confidence, durationMs: data.duration_ms };

        // Save to localStorage
        const responses: StoredResponse[] = [];
        for (const round of completed.rounds) {
          for (const role of ROLES) {
            const resp = round.responses[role];
            if (resp && resp.content) {
              responses.push({
                round: round.round,
                model_id: resp.model,
                role_name: resp.role,
                content: resp.content,
                latency_ms: resp.latency_ms || 0,
              });
            }
          }
        }
        // Add verdict as round 4
        if (completed.verdict) {
          responses.push({
            round: 4,
            model_id: "chairperson",
            role_name: "Chairperson",
            content: completed.verdict,
            latency_ms: 0,
          });
        }

        saveSession({
          id: completed.sessionId || data.session_id,
          question: questionRef.current,
          tier: tierRef.current,
          status: "complete",
          confidence: data.confidence,
          duration_ms: data.duration_ms,
          verdict_full: completed.verdict,
          created_at: new Date().toISOString(),
          responses,
        });

        return completed;
      });
      es.close();
    });

    es.addEventListener("model_error", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      console.error("Model error:", data);
    });

    es.onerror = () => {
      setState((prev) => {
        if (prev.status === "complete") return prev;
        return { ...prev, status: "error", error: "Connection lost. Please try again." };
      });
      es.close();
    };

    return () => { es.close(); };
  }, []);

  const stopSession = useCallback(() => {
    eventSourceRef.current?.close();
    setState((prev) => ({ ...prev, status: "idle" }));
  }, []);

  return { ...state, startSession, stopSession };
}
