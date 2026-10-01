import { getCategoryRanking } from "@/lib/api-v2";

export const dynamic = "force-dynamic";

/**
 * GET /api/v2/rankings/{category}
 * Per-category ranking by proven delivery. Unranked projects (no weights
 * or no resolved outcomes) are listed last with their reason.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ category: string }> }
) {
  const { category } = await ctx.params;
  try {
    const result = await getCategoryRanking(category as any);
    if (!result)
      return Response.json({ error: "Unknown category" }, { status: 404 });
    return Response.json(result);
  } catch {
    return Response.json({ error: "Promise ledger unavailable" }, { status: 503 });
  }
}
