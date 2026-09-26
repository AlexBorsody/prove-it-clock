import { getScoreDetail } from "@/lib/public-api";

export const dynamic = "force-dynamic";

/** GET /api/v1/scores/{slug} — full public score detail for one project. */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  try {
    const detail = await getScoreDetail(slug.toLowerCase());
    if (!detail) return Response.json({ error: "Unknown project slug" }, { status: 404 });
    return Response.json(detail);
  } catch {
    return Response.json({ error: "Score database unavailable" }, { status: 503 });
  }
}
