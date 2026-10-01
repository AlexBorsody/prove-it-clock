import { getVerdictDetail } from "@/lib/api-v2";

export const dynamic = "force-dynamic";

/**
 * GET /api/v2/verdicts/{slug}
 * Three-meter verdict detail for one project, with per-category breakdown.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  try {
    const result = await getVerdictDetail(slug.toLowerCase());
    if (!result)
      return Response.json({ error: "Unknown project slug" }, { status: 404 });
    return Response.json(result);
  } catch {
    return Response.json({ error: "Promise ledger unavailable" }, { status: 503 });
  }
}
