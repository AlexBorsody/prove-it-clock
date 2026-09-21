/**
 * GET /api/projects/[slug]/history — per-project score time-series.
 *
 * Reads the append-only `score_snapshots` table (Supabase, server-side) and
 * returns every scored metric as a dated series, each point tagged with the
 * methodology version that produced it. `project_events` ride along as
 * timeline annotations.
 *
 * Null values pass through as null — the chart renders them as gaps, never
 * as zero. Missing data is missing.
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
import { getSupabase, supabaseEnabled } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const HISTORY_TTL_MS = 5 * 60_000;

const cache = new Map<string, { at: number; body: unknown }>();

type Point = {
  date: string;
  methodology_version: string | null;
  value: number | null;
  confidence: number | null;
  status: string;
};

const num = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
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
      { status: 503 }
    );
  }

  const cacheKey = `${slug}|${metricCodes?.join(",") ?? "all"}|${from ?? ""}|${to ?? ""}`;
  const now = Date.now();
  const hit = cache.get(cacheKey);
  if (hit && now - hit.at < HISTORY_TTL_MS) {
    return Response.json(hit.body);
  }

  try {
    const sb = getSupabase();

    const { data: proj, error: pErr } = await sb
      .from("projects")
      .select("id,slug,name,symbol")
      .eq("slug", slug)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!proj) {
      return Response.json(
        { error: "not_found", message: `No project with slug '${slug}'.` },
        { status: 404 }
      );
    }

    let q = sb
      .from("score_snapshots")
      .select(
        "snapshot_date,score_code,value,confidence,status,unavailable_reason,methodology_versions!inner(version)"
      )
      .eq("project_id", proj.id)
      // Speculative v0.3.0 rows are append-only history: never active output.
      .neq("methodology_versions.version", "0.3.0")
      .order("snapshot_date", { ascending: true });
    if (metricCodes && metricCodes.length > 0) q = q.in("score_code", metricCodes);
    if (from) q = q.gte("snapshot_date", from);
    if (to) q = q.lte("snapshot_date", to);
    const { data: rows, error: sErr } = await q;
    if (sErr) throw sErr;

    const { data: events, error: eErr } = await sb
      .from("project_events")
      .select("event_date,event_type,title,description,evidence_url")
      .eq("project_id", proj.id)
      .order("event_date", { ascending: true });
    if (eErr) throw eErr;

    const metrics: Record<string, Point[]> = {};
    for (const r of (rows ?? []) as Array<Record<string, unknown>>) {
      const code = String(r.score_code);
      const mv = r.methodology_versions as { version?: string } | null;
      (metrics[code] ??= []).push({
        date: String(r.snapshot_date),
        methodology_version: mv?.version ?? null,
        value: num(r.value),
        confidence: num(r.confidence),
        status: String(r.status),
      });
    }

    const body = {
      slug: proj.slug,
      name: proj.name,
      symbol: proj.symbol,
      metrics,
      events: ((events ?? []) as Array<Record<string, unknown>>).map((e) => ({
        date: e.event_date,
        type: e.event_type,
        title: e.title,
        // DB column is `description`; seeds and the API surface call it
        // `evidence_summary`. Same field, no rename in the append-only DB.
        evidence_summary: e.description,
        evidence_url: e.evidence_url,
      })),
      generated_at: new Date().toISOString(),
    };
    cache.set(cacheKey, { at: now, body });
    return Response.json(body);
  } catch (err) {
    return Response.json(
      {
        error: "history_failed",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
