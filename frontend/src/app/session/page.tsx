"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { GridSection } from "@/components/GridSection";
import { SidebarLabel } from "@/components/SidebarLabel";
import { ModelCard } from "@/components/ModelCard";
import { VerdictPanel } from "@/components/VerdictPanel";
import { useCouncilSession } from "@/hooks/useCouncilSession";

const ROUND_LABELS = ["OPENING STATEMENTS", "CROSS-EXAMINATION", "FINAL ARGUMENTS"];
const ROLES = ["The Analyst", "The Reasoner", "The Challenger", "The Maverick"];

function SessionContent() {
  const searchParams = useSearchParams();
  const question = searchParams.get("q") || "";
  const tier = searchParams.get("tier") || "frontier";
  const session = useCouncilSession();

  useEffect(() => {
    if (question && session.status === "idle") {
      session.startSession(question, tier);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const currentRoundNum =
    session.status === "round_1" ? 1 :
    session.status === "round_2" ? 2 :
    session.status === "round_3" ? 3 : 0;

  return (
    <>
      <Navbar />

      {/* Progress bar */}
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

      {/* Question header */}
      <GridSection>
        <div className="col-span-12 lg:col-span-3">
          <SidebarLabel meta={session.sessionId ? `#${session.sessionId.slice(0, 8)}` : undefined}>
            Question
          </SidebarLabel>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <h1 className="text-2xl lg:text-4xl font-bold leading-tight text-[#141414]">
            &ldquo;{question}&rdquo;
          </h1>
          <div className="mt-3 flex gap-4 text-xs text-[#7A7A7A]">
            <span className="font-mono uppercase">Tier: {tier}</span>
            {session.status !== "idle" && session.status !== "connecting" && (
              <span className="font-mono uppercase">Status: {session.status.replace("_", " ")}</span>
            )}
            {session.durationMs > 0 && (
              <span className="font-mono">Duration: {(session.durationMs / 1000).toFixed(1)}s</span>
            )}
          </div>
        </div>
      </GridSection>

      {/* Debate rounds */}
      {session.rounds.map((round) => (
        <GridSection key={round.round}>
          <div className="col-span-12 lg:col-span-3">
            <SidebarLabel
              meta={round.complete ? "Complete" : currentRoundNum === round.round ? "In progress..." : undefined}
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
                  complete={resp?.complete || false}
                  latencyMs={resp?.latency_ms}
                />
              );
            })}
          </div>
        </GridSection>
      ))}

      {/* Verdict */}
      {(session.status === "verdict" || session.status === "complete") && (
        <GridSection>
          <div className="col-span-12 lg:col-span-3">
            <SidebarLabel meta={session.status === "complete" ? "Final" : "Synthesizing..."}>
              Verdict
            </SidebarLabel>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <VerdictPanel
              content={session.verdict}
              confidence={session.confidence}
              complete={session.status === "complete"}
            />
          </div>
        </GridSection>
      )}

      {/* Error */}
      {session.status === "error" && (
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
