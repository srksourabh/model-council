import { exportSessionsCSV } from "@/lib/d1";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const csv = await exportSessionsCSV();
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="model-council-sessions-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
