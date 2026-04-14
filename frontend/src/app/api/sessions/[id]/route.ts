import { type NextRequest } from "next/server";
import { getSessionFromD1 } from "@/lib/d1";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const session = await getSessionFromD1(id);
    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }
    return Response.json(session);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
