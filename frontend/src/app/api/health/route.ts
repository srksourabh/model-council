export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    status: "ok",
    service: "model-council",
    runtime: "vercel-nextjs",
  });
}
