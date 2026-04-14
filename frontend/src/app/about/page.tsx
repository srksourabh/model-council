"use client";

import { Navbar } from "@/components/Navbar";
import { GridSection } from "@/components/GridSection";
import { SidebarLabel } from "@/components/SidebarLabel";

const COUNCIL_MEMBERS = [
  {
    index: "01",
    model: "GPT-4o",
    provider: "OpenAI",
    role: "The Analyst",
    description:
      "Structured, data-driven, methodical. Leads with facts, frameworks, and evidence-based reasoning.",
  },
  {
    index: "02",
    model: "Claude Sonnet 4.6",
    provider: "Anthropic",
    role: "The Reasoner",
    description:
      "Nuanced, considers edge cases, bridges perspectives. Explores deeper implications and second-order effects.",
  },
  {
    index: "03",
    model: "Gemini 3.1 Pro",
    provider: "Google",
    role: "The Challenger",
    description:
      "Contrarian, stress-tests assumptions. Questions what others take for granted and challenges weak reasoning.",
  },
  {
    index: "04",
    model: "Grok 4",
    provider: "xAI",
    role: "The Maverick",
    description:
      "Unconventional, bold, cuts through noise. Brings fresh angles and challenges conventional wisdom.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* WHAT */}
      <GridSection className="min-h-[50vh] items-start">
        <div className="col-span-12 lg:col-span-3">
          <SidebarLabel>What</SidebarLabel>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <h1 className="text-5xl lg:text-7xl font-black leading-[0.85] tracking-[-0.04em]">
            FOUR MODELS.
            <br />
            THREE ROUNDS.
            <br />
            ONE <span className="text-[#1351AA]">VERDICT</span>.
          </h1>
          <p className="mt-8 max-w-[600px] text-lg text-[#444343]">
            Model Council is a multi-model AI deliberation platform. Instead of
            trusting a single AI, your question is debated by four frontier
            models from different providers. They challenge each other across
            three structured rounds, then an independent Chairperson reads the
            full transcript and delivers a unified verdict.
          </p>
        </div>
      </GridSection>

      {/* HOW */}
      <GridSection>
        <div className="col-span-12 lg:col-span-3">
          <SidebarLabel>How</SidebarLabel>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <h2 className="text-4xl lg:text-5xl font-bold leading-[0.9] tracking-[-0.03em] mb-8">
            THE PROCESS
          </h2>
          <div className="space-y-6 max-w-[600px]">
            <div className="border-t border-[#C7C7C7] pt-4">
              <span className="font-mono text-sm text-[#7A7A7A]">01</span>
              <h3 className="mt-1 text-xl font-bold">Opening Statements</h3>
              <p className="mt-1 text-sm text-[#444343]">
                Four models answer your question independently and in parallel.
                No model sees another&apos;s response.
              </p>
            </div>
            <div className="border-t border-[#C7C7C7] pt-4">
              <span className="font-mono text-sm text-[#7A7A7A]">02</span>
              <h3 className="mt-1 text-xl font-bold">Cross-Examination</h3>
              <p className="mt-1 text-sm text-[#444343]">
                Each model reads all other responses. They critique claims,
                acknowledge strong points, and refine their positions.
              </p>
            </div>
            <div className="border-t border-[#C7C7C7] pt-4">
              <span className="font-mono text-sm text-[#7A7A7A]">03</span>
              <h3 className="mt-1 text-xl font-bold">Final Arguments</h3>
              <p className="mt-1 text-sm text-[#444343]">
                Models present their final positions. Consensus is highlighted,
                disagreements are flagged with reasoning.
              </p>
            </div>
            <div className="border-t border-[#C7C7C7] pt-4">
              <span className="font-mono text-sm text-[#7A7A7A]">04</span>
              <h3 className="mt-1 text-xl font-bold">Chairperson Verdict</h3>
              <p className="mt-1 text-sm text-[#444343]">
                An independent judge (Claude Opus 4.6) reads the entire debate
                and delivers a structured verdict with confidence scoring.
              </p>
            </div>
          </div>
        </div>
      </GridSection>

      {/* COUNCIL */}
      <GridSection>
        <div className="col-span-12 lg:col-span-3">
          <SidebarLabel>Council</SidebarLabel>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <h2 className="text-4xl lg:text-5xl font-bold leading-[0.9] tracking-[-0.03em] mb-8">
            THE MEMBERS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COUNCIL_MEMBERS.map((member) => (
              <div
                key={member.index}
                className="border border-[#C7C7C7] p-6"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-sm text-[#7A7A7A]">
                    {member.index}
                  </span>
                  <span className="text-xs text-[#7A7A7A]">
                    {member.provider}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-bold text-[#141414]">
                  {member.model}
                </h3>
                <p className="mt-1 text-sm font-semibold text-[#1351AA]">
                  {member.role}
                </p>
                <p className="mt-2 text-sm text-[#444343]">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </GridSection>

      {/* BUILT BY */}
      <GridSection className="min-h-[30vh] items-center">
        <div className="col-span-12 lg:col-span-3">
          <SidebarLabel>Built By</SidebarLabel>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <p className="text-lg text-[#444343]">
            Model Council is built by{" "}
            <span className="font-bold text-[#141414]">Sourabh Bhaumik</span>.
          </p>
          <p className="mt-2 text-sm text-[#7A7A7A]">
            Powered by OpenRouter. All models accessed via a single API.
          </p>
        </div>
      </GridSection>
    </>
  );
}
