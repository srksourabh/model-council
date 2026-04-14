const STORAGE_KEY = "model-council-sessions";

export interface StoredResponse {
  round: number;
  model_id: string;
  role_name: string;
  content: string;
  latency_ms: number;
}

export interface StoredSession {
  id: string;
  question: string;
  tier: string;
  status: string;
  confidence: string;
  duration_ms: number;
  verdict_full: string;
  created_at: string;
  responses: StoredResponse[];
}

export function saveSession(session: StoredSession): void {
  const sessions = loadAllSessions();
  const existingIdx = sessions.findIndex((s) => s.id === session.id);
  if (existingIdx >= 0) {
    sessions[existingIdx] = session;
  } else {
    sessions.unshift(session);
  }
  // Keep last 100 sessions
  const trimmed = sessions.slice(0, 100);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full — remove oldest and retry
    const reduced = trimmed.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
  }
}

export function loadAllSessions(): StoredSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredSession[];
  } catch {
    return [];
  }
}

export function loadSession(id: string): StoredSession | null {
  const sessions = loadAllSessions();
  return sessions.find((s) => s.id === id) || null;
}

export function exportSessionsCSV(): string {
  const sessions = loadAllSessions();
  const rows: string[] = [
    "session_id,question,tier,confidence,duration_ms,created_at,round,role,model,content",
  ];

  for (const s of sessions) {
    for (const r of s.responses) {
      const escaped = (val: string) => `"${val.replace(/"/g, '""')}"`;
      rows.push(
        [
          s.id,
          escaped(s.question),
          s.tier,
          s.confidence,
          s.duration_ms,
          s.created_at,
          r.round,
          escaped(r.role_name),
          r.model_id,
          escaped(r.content),
        ].join(",")
      );
    }
  }

  return rows.join("\n");
}

export function downloadCSV(): void {
  const csv = exportSessionsCSV();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `model-council-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
