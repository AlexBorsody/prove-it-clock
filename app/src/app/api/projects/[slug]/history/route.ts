/**
 * GET /api/projects/[slug]/history — per-project score time-series.
 *
 * Fetch logic lives in `@/lib/history` (shared with the embeddable widget).
 * This route adds the HTTP envelope and the 503/404/500 status mapping.
 *
 * Query params:
 *   metrics  comma-separated score codes (default: all)
 *   from     ISO date, inclusive (default: none)
 *   to       ISO date, inclusive (default: none)
 *
 * Responses:
 *   200  { slug, name, symbol, metrics: { code: [...] }, events: [...], generated_at }
 *   404  unknown slug
 *   503  Supabase not configured on this deployment
 */
import { supabaseEnabled } from "@/lib/supabase";
import { getProjectHistory } from "@/lib/history";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const url = new URL(req.url);
  const metricsParam = url.searchParams.get("metrics");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const metricCodes = metricsParam
    ? metricsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : null;

  if (!supabaseEnabled()) {
    return Response.json(
      {
        error: "history_unavailable",
        message: "Score history is not configured on this deployment.",
      },
      { status: 503 },
    );
  }

  try {
    const body = await getProjectHistory(slug, {
      metrics: metricCodes,
      from,
      to,
    });
    if (!body) {
      return Response.json(
        { error: "not_found", message: `No project with slug '${slug}'.` },
        { status: 404 },
      );
    }
    return Response.json(body);
  } catch (err) {
    return Response.json(
      {
        error: "history_failed",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
