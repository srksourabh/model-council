const CF_API = "https://api.cloudflare.com/client/v4";

function getConfig() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  if (!token || !accountId || !databaseId) {
    throw new Error("Missing Cloudflare D1 env vars");
  }
  return { token, accountId, databaseId };
}

interface D1Result {
  results: Record<string, unknown>[];
  success: boolean;
}

export async function queryD1(
  sql: string,
  params: string[] = [],
): Promise<D1Result[]> {
  const { token, accountId, databaseId } = getConfig();
  const response = await fetch(
    `${CF_API}/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`D1 query failed: ${response.status} ${text}`);
  }

  const data = await response.json() as { result: D1Result[] };
  return data.result;
}

export async function saveSessionToD1(session: {
  id: string;
  question: string;
  tier: string;
  confidence: string;
  duration_ms: number;
  verdict_full: string;
  created_at: string;
  responses: Array<{
    id: string;
    session_id: string;
    round: number;
    model_id: string;
    role_name: string;
    content: string;
    latency_ms: number;
    created_at: string;
  }>;
}): Promise<void> {
  // Insert session
  await queryD1(
    `INSERT INTO sessions (id, question, tier, status, confidence, duration_ms, verdict_full, created_at)
     VALUES (?, ?, ?, 'complete', ?, ?, ?, ?)`,
    [
      session.id,
      session.question,
      session.tier,
      session.confidence,
      String(session.duration_ms),
      session.verdict_full,
      session.created_at,
    ],
  );

  // Insert responses one by one (D1 REST API doesn't support batch well)
  for (const r of session.responses) {
    await queryD1(
      `INSERT INTO responses (id, session_id, round, model_id, role_name, content, latency_ms, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.session_id, String(r.round), r.model_id, r.role_name, r.content, String(r.latency_ms), r.created_at],
    );
  }
}

export async function listSessionsFromD1(limit = 50): Promise<Record<string, unknown>[]> {
  const result = await queryD1(
    `SELECT id, question, tier, status, confidence, duration_ms, created_at
     FROM sessions ORDER BY created_at DESC LIMIT ?`,
    [String(limit)],
  );
  return result[0]?.results || [];
}

export async function getSessionFromD1(sessionId: string): Promise<Record<string, unknown> | null> {
  const sessionResult = await queryD1(
    `SELECT * FROM sessions WHERE id = ?`,
    [sessionId],
  );
  const session = sessionResult[0]?.results?.[0];
  if (!session) return null;

  const responsesResult = await queryD1(
    `SELECT * FROM responses WHERE session_id = ? ORDER BY round, created_at`,
    [sessionId],
  );
  return {
    ...session,
    responses: responsesResult[0]?.results || [],
  };
}

export async function exportSessionsCSV(): Promise<string> {
  const sessions = await queryD1(
    `SELECT s.id as session_id, s.question, s.tier, s.confidence, s.duration_ms, s.created_at,
            r.round, r.role_name, r.model_id, r.content
     FROM sessions s
     JOIN responses r ON r.session_id = s.id
     ORDER BY s.created_at DESC, r.round, r.created_at`,
  );

  const rows = sessions[0]?.results || [];
  const escaped = (val: unknown) => `"${String(val ?? "").replace(/"/g, '""')}"`;

  const lines = [
    "session_id,question,tier,confidence,duration_ms,created_at,round,role,model,content",
  ];

  for (const r of rows) {
    lines.push(
      [
        r.session_id,
        escaped(r.question),
        r.tier,
        r.confidence,
        r.duration_ms,
        r.created_at,
        r.round,
        escaped(r.role_name),
        r.model_id,
        escaped(r.content),
      ].join(","),
    );
  }

  return lines.join("\n");
}
