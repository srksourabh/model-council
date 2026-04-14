import { listSessionsFromD1 } from "@/lib/d1";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  try {
    const sessions = await listSessionsFromD1(limit);
    return Response.json({ sessions });
  } catch (e) {
    return Response.json({ sessions: [], error: String(e) }, { status: 500 });
  }
}
