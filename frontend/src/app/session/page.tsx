"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { GridSection } from "@/components/GridSection";
import { SidebarLabel } from "@/components/SidebarLabel";
import { ModelCard } from "@/components/ModelCard";
import { VerdictPanel } from "@/components/VerdictPanel";
import { useCouncilSession } from "@/hooks/useCouncilSession";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ROUND_LABELS = ["OPENING STATEMENTS", "CROSS-EXAMINATION", "FINAL ARGUMENTS"];
const ROLES = ["The Analyst", "The Reasoner", "The Challenger", "The Maverick"];

interface SavedRound {
  round: number;
  responses: Record<string, { model: string; role: string; content: string; latency_ms?: number }>;
}

interface SavedSession {
  id: string;
  question: string;
  tier: string;
  status: string;
  confidence: string;
  duration_ms: number;
  verdict_full: string;
  responses: Array<{
    round: number;
    model_id: string;
    role_name: string;
    content: string;
    latency_ms: number;
  }>;
}

function SessionContent() {
  const searchParams = useSearchParams();
  const question = searchParams.get("q") || "";
  const sessionId = searchParams.get("id") || "";
  const tier = searchParams.get("tier") || "frontier";

  // Live session state (for new debates)
  const session = useCouncilSession();

  // Saved session state (for history playback)
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  const [savedRounds, setSavedRounds] = useState<SavedRound[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load saved session if ?id= is present
  useEffect(() => {
    if (!sessionId) return;
    setLoadingHistory(true);
    fetch(`${API_BASE}/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((data: SavedSession) => {
        setSavedSession(data);
        // Group responses by round
        const roundsMap: Record<number, SavedRound> = {};
        for (const resp of data.responses || []) {
          if (resp.round === 4) continue; // verdict is separate
          if (!roundsMap[resp.round]) {
            roundsMap[resp.round] = { round: resp.round, responses: {} };
          }
          roundsMap[resp.round].responses[resp.role_name] = {
            model: resp.model_id,
            role: resp.role_name,
            content: resp.content,
            latency_ms: resp.latency_ms,
          };
        }
        setSavedRounds(Object.values(roundsMap).sort((a, b) => a.round - b.round));
        setLoadingHistory(false);
      })
      .catch(() => setLoadingHistory(false));
  }, [sessionId]);

  // Start live session if ?q= is present
  useEffect(() => {
    if (question && !sessionId && session.status === "idle") {
      session.startSession(question, tier);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, sessionId]);

  // Determine if we're showing a saved session or a live one
  const isHistoryView = !!sessionId && !!savedSession;

  const displayQuestion = isHistoryView ? savedSession.question : question;
  const displayTier = isHistoryView ? savedSession.tier : tier;
  const displayStatus = isHistoryView ? savedSession.status : session.status;
  const displayDuration = isHistoryView ? savedSession.duration_ms : session.durationMs;
  const displaySessionId = isHistoryView ? savedSession.id : session.sessionId;
  const displayConfidence = isHistoryView ? savedSession.confidence : session.confidence;
  const displayVerdict = isHistoryView ? (savedSession.verdict_full || "") : session.verdict;
  const displayRounds = isHistoryView ? savedRounds : session.rounds;

  const currentRoundNum =
    session.status === "round_1" ? 1 :
    session.status === "round_2" ? 2 :
    session.status === "round_3" ? 3 : 0;

  if (loadingHistory) {
    return (
      <>
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center">
          <p className="text-[#7A7A7A] text-sm uppercase tracking-wider">Loading session...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Progress bar */}
      {!isHistoryView && (
        <div className="h-0.5 bg-[#C7C7C7]">
          <div
            className="h-full bg-[#1351AA] transition-all duration-500"
            style={{
              width:
                session.status === "idle" ? "0%" :
                session.status === "connecting" ? "2%" :
                session.status === "round_1" ? "20%" :
                session.status === "round_2" ? "45%" :
                session.status === "round_3" ? "70%" :
                session.status === "verdict" ? "85%" :
                "100%",
            }}
          />
        </div>
      )}

      {/* Question header */}
      <GridSection>
        <div className="col-span-12 lg:col-span-3">
          <SidebarLabel meta={displaySessionId ? `#${displaySessionId.slice(0, 8)}` : undefined}>
            Question
          </SidebarLabel>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <h1 className="text-2xl lg:text-4xl font-bold leading-tight text-[#141414]">
            &ldquo;{displayQuestion}&rdquo;
          </h1>
          <div className="mt-3 flex gap-4 text-xs text-[#7A7A7A]">
            <span className="font-mono uppercase">Tier: {displayTier}</span>
            {displayStatus !== "idle" && displayStatus !== "connecting" && (
              <span className="font-mono uppercase">Status: {displayStatus.replace("_", " ")}</span>
            )}
            {displayDuration > 0 && (
              <span className="font-mono">Duration: {(displayDuration / 1000).toFixed(1)}s</span>
            )}
          </div>
        </div>
      </GridSection>

      {/* Debate rounds */}
      {displayRounds.map((round) => (
        <GridSection key={round.round}>
          <div className="col-span-12 lg:col-span-3">
            <SidebarLabel
              meta={
                isHistoryView ? "Complete" :
                ("complete" in round && round.complete) ? "Complete" :
                currentRoundNum === round.round ? "In progress..." :
                undefined
              }
            >
              {`Round ${String(round.round).padStart(2, "0")}`}
              <br />
              {ROUND_LABELS[round.round - 1]}
            </SidebarLabel>
          </div>
          <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROLES.map((role) => {
              const resp = round.responses[role];
              return (
                <ModelCard
                  key={role}
                  role={role}
                  model={resp?.model || ""}
                  content={resp?.content || ""}
                  complete={isHistoryView ? true : ("complete" in resp ? (resp as { complete: boolean }).complete : false)}
                  latencyMs={resp?.latency_ms}
                />
              );
            })}
          </div>
        </GridSection>
      ))}

      {/* Verdict */}
      {(displayStatus === "verdict" || displayStatus === "complete" || displayVerdict) && (
        <GridSection>
          <div className="col-span-12 lg:col-span-3">
            <SidebarLabel meta={displayStatus === "complete" ? "Final" : "Synthesizing..."}>
              Verdict
            </SidebarLabel>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <VerdictPanel
              content={displayVerdict}
              confidence={displayConfidence}
              complete={displayStatus === "complete"}
            />
          </div>
        </GridSection>
      )}

      {/* Error */}
      {session.status === "error" && !isHistoryView && (
        <GridSection>
          <div className="col-span-12 lg:col-span-3">
            <SidebarLabel>Error</SidebarLabel>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <div className="border border-[#AA1313] bg-[#F7E8E8] p-6">
              <p className="text-[#AA1313] font-bold">{session.error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-3 text-xs font-bold uppercase tracking-wider bg-[#141414] text-[#E3E2DE] cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        </GridSection>
      )}
    </>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <p className="text-[#7A7A7A] text-sm uppercase tracking-wider">Loading session...</p>
      </div>
    }>
      <SessionContent />
    </Suspense>
  );
}
