import { createClient } from '@supabase/supabase-js';

/** Methodology string for the hearts instrument (promise-heart rule, adopted 2026-09-25). */
export const HEARTS_METHODOLOGY = 'hearts promise-heart rule v3 (adopted 2026-09-25; one promise = one heart; capacity = promise count)';

/** Separate read client: prefer RLS-protected credentials over the writer key. */
export function heartReadClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Heart database is not configured');
  return createClient(url, key, {auth: {persistSession: false, autoRefreshToken: false}});
}

export async function readHeartRankings(methodology: string, page: number, perPage: number) {
  const db = heartReadClient();
  const {data: run, error: runError} = await db.from('heart_runs')
    .select('id,as_of,recorded_at,methodology').eq('review_status','published').eq('methodology',methodology)
    .order('as_of',{ascending:false}).order('recorded_at',{ascending:false}).order('id',{ascending:false})
    .limit(1).maybeSingle();
  if (runError) throw runError;
  if (!run) return {run:null, projects:[], total:0};
  const {data, error, count} = await db.from('heart_rankings').select('*',{count:'exact'})
    .eq('run_id',run.id).order('market_cap_rank',{ascending:true,nullsFirst:false}).order('slug')
    .range((page-1)*perPage,page*perPage-1);
  if (error) throw error;
  return {run, projects:data, total:count};
}

export async function readHeartHistory(slug: string, methodology: string, page: number, perPage: number) {
  const db = heartReadClient();
  const {data,error,count} = await db.from('heart_rankings').select('*',{count:'exact'})
    .eq('slug',slug).eq('methodology',methodology)
    .order('as_of',{ascending:false}).order('recorded_at',{ascending:false})
    .order('run_id',{ascending:false}).range((page-1)*perPage,page*perPage-1);
  if (error) throw error;
  return {points:data,total:count};
}

export function heartQuery(request: Request) {
  const q = new URL(request.url).searchParams;
  const methodology = q.get('methodology');
  if (!methodology?.trim() || methodology.length > 200) throw new Error('methodology is required');
  function integer(key: string, fallback: number, max: number) {
    const raw = q.get(key) ?? String(fallback);
    if (!/^[1-9]\d*$/.test(raw) || Number(raw) > max) throw new Error(`Invalid ${key}`);
    return Number(raw);
  }
  return {methodology,page:integer('page',1,100000),perPage:integer('per_page',20,100)};
}

/* ------------------------------------------------------------------ */
/* Scoreboard summary helpers (Phase 1). Pure functions, unit-tested.  */
/* ------------------------------------------------------------------ */

/** CODE activity word: commits in the last 90d across the tracked repos. */
export type CodeWord = "Active" | "Quiet" | "Unknown";

export function codeWord(vitals: { commits90d: number | null } | null): CodeWord {
  if (!vitals || vitals.commits90d == null) return "Unknown";
  return vitals.commits90d > 0 ? "Active" : "Quiet";
}

/** USE has no metrics yet. The slot renders "coming", never a number. */
export function useWord(): "coming" {
  return "coming";
}

export interface HypeSummary {
  /** Latest 7-day news mentions, null when no snapshot exists. */
  mentions7d: number | null;
  /** Distinct weeks with at least one snapshot, capped at 8. */
  baselineWeeks: number;
  /** True until 8 complete weeks exist; no trend percentages before week 9. */
  collecting: boolean;
}

const WEEK_MS = 7 * 24 * 3600 * 1000;

export function hypeSummary(
  snaps: { as_of: string; news_mentions_7d: number | null }[]
): HypeSummary {
  if (!snaps.length) return { mentions7d: null, baselineWeeks: 0, collecting: true };
  const latest = snaps[0];
  const weeks = new Set(
    snaps.map((s) => Math.floor(new Date(s.as_of).getTime() / WEEK_MS))
  );
  const baselineWeeks = Math.min(8, weeks.size);
  return {
    mentions7d: latest.news_mentions_7d,
    baselineWeeks,
    collecting: baselineWeeks < 8,
  };
}

/* ------------------------------------------------------------------ */
/* HYPE snapshots (Phase 2). Reads through the public social_snapshots */
/* table; no new endpoint needed.                                       */
/* ------------------------------------------------------------------ */

export interface HypeSnapshot {
  project_slug: string;
  as_of: string;
  news_mentions_7d: number | null;
  sources_ok: string[];
}

export async function readHypeSnapshots(): Promise<HypeSnapshot[]> {
  const db = heartReadClient();
  const { data, error } = await db
    .from("social_snapshots")
    .select("project_slug,as_of,news_mentions_7d,sources_ok")
    .order("as_of", { ascending: true })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as HypeSnapshot[];
}

/** Latest snapshot per project slug. */
export function latestHypeBySlug(snaps: HypeSnapshot[]): Record<string, HypeSnapshot> {
  const out: Record<string, HypeSnapshot> = {};
  for (const s of snaps) out[s.project_slug] = s; // ascending order: last wins
  return out;
}

/** Distinct weeks with at least one snapshot, capped at 8. */
export function hypeBaselineWeeks(snaps: HypeSnapshot[]): number {
  const weeks = new Set(
    snaps.map((s) => Math.floor(new Date(s.as_of).getTime() / WEEK_MS))
  );
  return Math.min(8, weeks.size);
}

/** HYPE snapshots for a single project, oldest first. */
export async function readHypeSnapshotsFor(slug: string): Promise<HypeSnapshot[]> {
  const db = heartReadClient();
  const { data, error } = await db
    .from("social_snapshots")
    .select("project_slug,as_of,news_mentions_7d,sources_ok")
    .eq("project_slug", slug)
    .order("as_of", { ascending: true })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as HypeSnapshot[];
}
