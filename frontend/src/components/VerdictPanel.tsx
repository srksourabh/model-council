"use client";

import ReactMarkdown from "react-markdown";

interface VerdictPanelProps {
  content: string;
  confidence: string;
  complete: boolean;
}

const CONFIDENCE_STYLES: Record<string, string> = {
  high: "bg-[#E8EEF7] text-[#1351AA]",
  medium: "bg-[#F5F0E0] text-[#8B6914]",
  low: "bg-[#F7E8E8] text-[#AA1313]",
};

export function VerdictPanel({ content, confidence, complete }: VerdictPanelProps) {
  function copyVerdict() {
    navigator.clipboard.writeText(content);
  }

  return (
    <div className="border-t-2 border-t-[#1351AA] bg-white p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#141414] uppercase tracking-wide">Council Verdict</h2>
        {confidence && (
          <span
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${CONFIDENCE_STYLES[confidence] || CONFIDENCE_STYLES.medium}`}
            style={{ borderRadius: "4px" }}
          >
            Confidence: {confidence.toUpperCase()}
          </span>
        )}
      </div>
      {content ? (
        <div className="prose prose-sm max-w-none text-[#444343] leading-relaxed">
          <ReactMarkdown>{content}</ReactMarkdown>
          {!complete && <span className="inline-block w-1.5 h-4 bg-[#1351AA] ml-0.5 animate-pulse" />}
        </div>
      ) : (
        <p className="text-sm text-[#7A7A7A] italic">Waiting for all rounds to complete...</p>
      )}
      {complete && content && (
        <div className="mt-8 flex gap-4 border-t border-[#C7C7C7] pt-6">
          <button
            onClick={copyVerdict}
            className="px-6 py-3 text-xs font-bold uppercase tracking-wider bg-[#1351AA] text-[#E3E2DE] hover:bg-[#141414] transition-colors duration-300 cursor-pointer"
          >
            Copy Verdict
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="px-6 py-3 text-xs font-bold uppercase tracking-wider bg-[#141414] text-[#E3E2DE] hover:bg-[#1351AA] transition-colors duration-300 cursor-pointer"
          >
            New Session
          </button>
        </div>
      )}
    </div>
  );
}
