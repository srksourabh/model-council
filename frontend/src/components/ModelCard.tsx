interface ModelCardProps {
  role: string;
  model: string;
  content: string;
  complete: boolean;
  latencyMs?: number;
}

const ROLE_LABELS: Record<string, string> = {
  "The Analyst": "GPT-5",
  "The Reasoner": "CLAUDE",
  "The Challenger": "GEMINI",
  "The Maverick": "GROK",
};

export function ModelCard({ role, content, complete, latencyMs }: ModelCardProps) {
  const isStreaming = content.length > 0 && !complete;

  return (
    <div className={`border border-[#C7C7C7] p-5 transition-all duration-300 ${isStreaming ? "border-l-[3px] border-l-[#1351AA]" : ""} ${!content ? "bg-[#F0EFEB]" : "bg-white/50"}`}>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <span className="text-sm font-bold text-[#141414] uppercase tracking-wide">{ROLE_LABELS[role] || role}</span>
          <span className="ml-2 text-xs text-[#7A7A7A]">{role}</span>
        </div>
        {complete && latencyMs && (
          <span className="font-mono text-xs text-[#7A7A7A]">{(latencyMs / 1000).toFixed(1)}s</span>
        )}
        {isStreaming && (
          <span className="text-xs text-[#1351AA] font-semibold animate-pulse">Streaming...</span>
        )}
      </div>
      {content ? (
        <div className="text-sm text-[#444343] leading-relaxed whitespace-pre-wrap">
          {content}
          {isStreaming && <span className="inline-block w-1.5 h-4 bg-[#1351AA] ml-0.5 animate-pulse" />}
        </div>
      ) : (
        <p className="text-sm text-[#7A7A7A] italic">Waiting...</p>
      )}
    </div>
  );
}
