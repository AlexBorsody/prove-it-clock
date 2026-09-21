/**
 * Shared score-history fetch for the API route and the embeddable widget.
 *
 * Reads the append-only `score_snapshots` table (Supabase, server-side) and
 * returns every scored metric as a dated series, each point tagged with the
 * methodology version that produced it. `project_events` ride along as
 * timeline annotations.
 *
 * Hard rules (mirror the active model):
 * - Methodology v0.2.0 only. Speculative v0.3.0 rows are append-only history:
 *   never active output.
 * - Null values pass through as null — charts render them as gaps, never as
 *   zero. Missing data is missing.
 *
 * 5-minute in-memory cache, same discipline as the history API.
 */
import { getSupabase } from "./supabase";

const HISTORY_TTL_MS = 5 * 60_000;

export interface HistoryPoint {
  date: string;
  methodology_version: string | null;
  value: number | null;
  confidence: number | null;
  status: string;
}

export interface HistoryEvent {
  date: string;
  type: string;
  title: string;
  evidence_summary: string;
  evidence_url: string | null;
}

export interface ProjectHistory {
  slug: string;
  name: string;
  symbol: string;
  metrics: Record<string, HistoryPoint[]>;
  events: HistoryEvent[];
  generated_at: string;
}

export interface HistoryQuery {
  metrics?: string[] | null;
  from?: string | null;
  to?: string | null;
}

const cache = new Map<string, { at: number; body: ProjectHistory | null }>();

const num = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * Returns the project history body, or null when the slug is unknown.
 * Callers must check `supabaseEnabled()` first (mirrors the API route's 503).
 */
export async function getProjectHistory(
  slug: string,
  q: HistoryQuery = {},
): Promise<ProjectHistory | null> {
  const metricCodes = q.metrics?.length ? q.metrics : null;
  const cacheKey = `${slug}|${metricCodes?.join(",") ?? "all"}|${q.from ?? ""}|${q.to ?? ""}`;
  const now = Date.now();
  const hit = cache.get(cacheKey);
  if (hit && now - hit.at < HISTORY_TTL_MS) return hit.body;

  const sb = getSupabase();

  const { data: proj, error: pErr } = await sb
    .from("projects")
    .select("id,slug,name,symbol")
    .eq("slug", slug)
    .maybeSingle();
  if (pErr) throw pErr;
  if (!proj) {
    cache.set(cacheKey, { at: now, body: null });
    return null;
  }

  let query = sb
    .from("score_snapshots")
    .select(
      "snapshot_date,score_code,value,confidence,status,unavailable_reason,methodology_versions!inner(version)",
    )
    .eq("project_id", proj.id)
    // Speculative v0.3.0 rows are append-only history: never active output.
    .neq("methodology_versions.version", "0.3.0")
    .order("snapshot_date", { ascending: true });
  if (metricCodes && metricCodes.length > 0) query = query.in("score_code", metricCodes);
  if (q.from) query = query.gte("snapshot_date", q.from);
  if (q.to) query = query.lte("snapshot_date", q.to);
  const { data: rows, error: sErr } = await query;
  if (sErr) throw sErr;

  const { data: events, error: eErr } = await sb
    .from("project_events")
    .select("event_date,event_type,title,description,evidence_url")
    .eq("project_id", proj.id)
    .order("event_date", { ascending: true });
  if (eErr) throw eErr;

  const metrics: Record<string, HistoryPoint[]> = {};
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

  const body: ProjectHistory = {
    slug: proj.slug,
    name: proj.name,
    symbol: proj.symbol,
    metrics,
    events: ((events ?? []) as Array<Record<string, unknown>>).map((e) => ({
      date: String(e.event_date),
      type: String(e.event_type),
      title: String(e.title),
      // DB column is `description`; seeds and the API surface call it
      // `evidence_summary`. Same field, no rename in the append-only DB.
      evidence_summary: e.description == null ? "" : String(e.description),
      evidence_url: e.evidence_url == null ? null : String(e.evidence_url),
    })),
    generated_at: new Date().toISOString(),
  };
  cache.set(cacheKey, { at: now, body });
  return body;
}
