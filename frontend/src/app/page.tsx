"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { PosterButton } from "@/components/PosterButton";
import { SidebarLabel } from "@/components/SidebarLabel";
import { GridSection } from "@/components/GridSection";

const EXAMPLE_QUESTIONS = [
  "Is remote work better for productivity than office work?",
  "Should startups prioritize revenue or growth in 2026?",
  "Will AI replace software engineers within 10 years?",
  "Is cryptocurrency a viable long-term store of value?",
  "Should governments regulate social media algorithms?",
];

const SYSTEM_STEPS = [
  {
    index: "01",
    title: "OPENING STATEMENTS",
    description: "Four AI models independently answer your question. No model sees another's response yet.",
  },
  {
    index: "02",
    title: "CROSS-EXAMINATION",
    description: "Each model reads the others' answers. They challenge claims, point out errors, and refine their positions.",
  },
  {
    index: "03",
    title: "FINAL ARGUMENTS",
    description: "Models present their final positions. Consensus points are highlighted, disagreements are flagged.",
  },
];

const DIFFERENTIATORS = [
  "MULTI-MODEL REASONING",
  "TRANSPARENT DELIBERATION",
  "CROSS-VALIDATION",
  "CONSENSUS CONFIDENCE",
  "BIAS DETECTION",
];

export default function Home() {
  const [question, setQuestion] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (question.trim().length >= 5) {
      router.push(`/session?q=${encodeURIComponent(question.trim())}`);
    }
  }

  function handleExample(q: string) {
    setQuestion(q);
    router.push(`/session?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <Navbar />

      {/* HERO */}
      <GridSection className="min-h-[85vh] items-start border-t-0">
        <div className="col-span-12 lg:col-span-3 border-r border-[#C7C7C7] pr-6 hidden lg:block">
          <SidebarLabel>Manifesto</SidebarLabel>
          <div className="mt-4 h-4 w-4 bg-[#141414]" />
        </div>

        <div className="col-span-12 lg:col-span-9">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.85] tracking-[-0.04em]">
            DON&apos;T TRUST
            <br />
            ONE AI.
            <br />
            LET FOUR{" "}
            <span className="text-[#1351AA]">DEBATE</span> IT.
          </h1>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <p className="max-w-[400px] text-lg text-[#444343]">
              Four frontier AI models deliberate your question through three
              rounds of structured debate, then an independent judge delivers a
              unified verdict.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask the Council anything..."
                rows={3}
                className="w-full border border-[#C7C7C7] bg-white px-4 py-3 text-base text-[#141414] placeholder:text-[#7A7A7A] focus:border-[#1351AA] focus:outline-none transition-colors duration-300"
              />
              <PosterButton type="submit" disabled={question.trim().length < 5}>
                Ask the Council
              </PosterButton>
            </form>
          </div>

          <div className="mt-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A7A7A] mb-4">
              Try an example
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleExample(q)}
                  className="border border-[#C7C7C7] bg-transparent px-3 py-2 text-sm text-[#444343] hover:border-[#1351AA] hover:text-[#1351AA] transition-colors duration-300 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GridSection>

      {/* SYSTEM */}
      <GridSection>
        <div className="col-span-12 lg:col-span-3">
          <SidebarLabel>System</SidebarLabel>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <h2 className="text-5xl lg:text-6xl font-bold leading-[0.9] tracking-[-0.03em] mb-12">
            HOW THE
            <br />
            COUNCIL
            <br />
            WORKS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {SYSTEM_STEPS.map((step) => (
              <div
                key={step.index}
                className="border border-[#C7C7C7] p-6 hover:bg-white/20 transition-colors duration-300"
              >
                <span className="font-mono text-sm text-[#7A7A7A]">{step.index}</span>
                <h3 className="mt-3 text-lg font-bold text-[#141414]">{step.title}</h3>
                <p className="mt-2 text-sm text-[#444343]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </GridSection>

      {/* WHY DIFFERENT */}
      <GridSection>
        <div className="col-span-12 lg:col-span-3">
          <SidebarLabel>Why Different</SidebarLabel>
        </div>
        <div className="col-span-12 lg:col-span-9">
          {DIFFERENTIATORS.map((item, i) => (
            <div
              key={item}
              className="group flex items-start gap-6 border-t border-[#C7C7C7] py-6 first:border-t-0"
              style={{ minHeight: "100px" }}
            >
              <span className="font-mono text-sm text-[#7A7A7A]">
                {String(i + 1).padStart(3, "0")}
              </span>
              <h3 className="text-3xl lg:text-5xl font-bold text-[#141414] group-hover:text-[#1351AA] transition-colors duration-300">
                {item}
              </h3>
            </div>
          ))}
        </div>
      </GridSection>

      {/* ACCESS */}
      <GridSection className="min-h-[50vh] items-center">
        <div className="col-span-12 lg:col-span-3">
          <SidebarLabel>Access</SidebarLabel>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <h2 className="text-6xl lg:text-8xl font-black leading-[0.85] tracking-[-0.04em]">
            START
            <br />
            EXPLORING
          </h2>
          <p className="mt-6 text-lg text-[#444343]">
            Three free sessions daily.
            <br />
            No sign-up required.
          </p>
          <div className="mt-8">
            <PosterButton
              variant="secondary"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-10 py-5"
            >
              Ask the Council
            </PosterButton>
          </div>
        </div>
      </GridSection>
    </>
  );
}
