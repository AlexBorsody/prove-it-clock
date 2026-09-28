/**
 * Public v1 API data layer: clean, versioned score payloads built on the
 * same verified sources as the scoreboard.
 * Published promise inventory and supporting context; no project warning score.
 */
import {
  HEARTS_METHODOLOGY,
  readHeartRankings,
  readHeartHistory,
  readHypeSnapshots,
  latestHypeBySlug,
} from "@/lib/heart-data";
import { projectFlags } from "@/lib/project-policy";
import { fetchVitals } from "@/lib/vitals";

export interface ScoreSummary {
  slug: string;
  name: string;
  symbol: string;
  rank: number;
  genesis: boolean;
  hearts: { earned: number; capacity: number };
  code: { commits_90d: number | null };
  hype: { mentions_7d: number | null };
}

export interface PromiseScore {
  criteria: string;
  state: string;
  core: boolean;
  source_url: string | null;
}

export interface ScoreDetail extends ScoreSummary {
  promises: PromiseScore[];
  history: { date: string; earned: number; capacity: number }[];
}

type RawProject = {
  slug: string;
  name: string;
  symbol: string;
  earned: number;
  capacity: number;
  assessment?: { promises?: any[] } | null;
};

function toSummary(p: RawProject, rank: number, ctx: { vitals: any; hype: any }): ScoreSummary {
  const { genesis } = projectFlags(p.slug);
  return {
    slug: p.slug,
    name: p.name,
    symbol: p.symbol,
    rank,
    genesis,
    hearts: { earned: p.earned, capacity: p.capacity },
    code: { commits_90d: ctx.vitals?.commits90d ?? null },
    hype: { mentions_7d: ctx.hype?.news_mentions_7d ?? null },
  };
}

async function contextFor(slug: string) {
  const [vitals, hypeSnaps] = await Promise.all([
    fetchVitals(slug).catch(() => null),
    readHypeSnapshots().catch(() => [] as any[]),
  ]);
  return { vitals, hype: latestHypeBySlug(hypeSnaps)[slug] ?? null };
}

export async function getScoresList(page: number, perPage: number) {
  const { projects, total, run } = await readHeartRankings(HEARTS_METHODOLOGY, page, perPage);
  const data: ScoreSummary[] = await Promise.all(
    (projects as RawProject[]).map(async (p, i) =>
      toSummary(p, (page - 1) * perPage + i + 1, await contextFor(p.slug))
    )
  );
  return {
    data,
    page,
    per_page: perPage,
    total,
    as_of: run?.as_of ?? null,
  };
}

export async function getScoreDetail(slug: string): Promise<ScoreDetail | null> {
  const { projects } = await readHeartRankings(HEARTS_METHODOLOGY, 1, 100);
  const raw = (projects as RawProject[]).find((p) => p.slug === slug);
  if (!raw) return null;
  const rank = (projects as RawProject[]).findIndex((p) => p.slug === slug) + 1;
  const [ctx, history] = await Promise.all([
    contextFor(slug),
    readHeartHistory(slug, HEARTS_METHODOLOGY, 1, 100).catch(() => ({ points: [] as any[] })),
  ]);
  const summary = toSummary(raw, rank, ctx);
  const promises: PromiseScore[] = (raw.assessment?.promises ?? []).map((pr: any) => ({
    criteria: pr.criteria ?? pr.lineage ?? "Promise",
    state: pr.state ?? "open",
    core: !!pr.core,
    source_url: pr.evidence?.[0]?.url ?? null,
  }));
  const pts = (history.points ?? []).filter((pt: any) => pt.availability === "available");
  const hist = [...pts]
    .reverse()
    .map((pt: any) => ({ date: pt.as_of, earned: pt.earned, capacity: pt.capacity }));
  return { ...summary, promises, history: hist };
}

export function parsePagination(url: URL): { page: number; perPage: number } {
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get("per_page") ?? "20", 10) || 20));
  return { page, perPage };
}

/**
 * Status-change feed: recent published ledger events that count as promise
 * news (new promise, new evidence, published assessment, claim revision).
 * This is the machine-readable form of the notification feed; consumers poll
 * it. External webhook registration is undecided and NOT built here.
 */

export interface StatusChange {
  project_slug: string;
  revision_key: string;
  recorded_at: string;
  kind: "assessment" | "promise_stated" | "evidence" | "claim_repeated" | "claim_revised";
  lineage: string | null;
  state: string | null;
  summary: string | null;
  url: string;
}

const NOTIFIABLE_KINDS = new Set([
  "assessment",
  "promise_stated",
  "evidence",
  "claim_repeated",
  "claim_revised",
]);

export async function getStatusChanges(
  page: number,
  perPage: number,
  projectSlug?: string,
): Promise<{ items: StatusChange[]; page: number; per_page: number }> {
  const { getSupabase } = await import("@/lib/supabase");
  const { promiseDeepLink } = await import("@/lib/push");
  const db = getSupabase();
  // Revisions are few; flatten notifiable events in code and slice the page.
  let query = db
    .from("promise_history_revisions")
    .select("revision_key, project_slug, recorded_at, events")
    .order("recorded_at", { ascending: false })
    .limit(200);
  if (projectSlug) query = query.eq("project_slug", projectSlug);
  const { data, error } = await query;
  if (error) throw new Error(`Status-change feed unavailable: ${error.message}`);
  const items: StatusChange[] = [];
  for (const rev of data ?? []) {
    for (const e of (rev.events ?? []) as Array<Record<string, unknown>>) {
      const kind = String(e.kind ?? "");
      if (!NOTIFIABLE_KINDS.has(kind)) continue;
      const lineage = typeof e.lineage === "string" ? e.lineage : null;
      items.push({
        project_slug: rev.project_slug as string,
        revision_key: rev.revision_key as string,
        recorded_at: rev.recorded_at as string,
        kind: kind as StatusChange["kind"],
        lineage,
        state: typeof e.state === "string" ? e.state : null,
        summary: typeof e.summary === "string" ? e.summary : null,
        url: promiseDeepLink(rev.project_slug as string, lineage ?? undefined),
      });
    }
  }
  const start = (page - 1) * perPage;
  return { items: items.slice(start, start + perPage), page, per_page: perPage };
}
