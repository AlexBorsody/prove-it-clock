/**
 * Public v1 API data layer: clean, versioned score payloads built on the
 * same verified sources as the scoreboard.
 *
 * Public naming follows the locked copy rules: the verdict is exposed as
 * the "Shitcoin warning" dial level (1-10), never the internal category
 * names.
 */
import {
  HEARTS_METHODOLOGY,
  readHeartRankings,
  readHeartHistory,
  readHypeSnapshots,
  latestHypeBySlug,
} from "@/lib/heart-data";
import { verdictFor } from "@/lib/verdict";
import { fetchVitals } from "@/lib/vitals";

/** Fixed dial positions per verdict category. Source of truth: shitcoin-meter.tsx GAUGE. */
const WARNING_LEVEL: Record<string, number> = {
  "Not a shitcoin": 1,
  "Watch": 4,
  "Shitcoin risk": 7,
  "Shitcoin": 10,
};

export interface ScoreSummary {
  slug: string;
  name: string;
  symbol: string;
  rank: number;
  hearts: { earned: number; capacity: number };
  shitcoin_warning: { level: number; scale: 10; label: "Shitcoin warning" };
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
  const promises: any[] = p.assessment?.promises ?? [];
  const category = verdictFor(
    promises.map((pr: any) => ({ lineage: pr.lineage, state: pr.state, core: !!pr.core }))
  ).category;
  return {
    slug: p.slug,
    name: p.name,
    symbol: p.symbol,
    rank,
    hearts: { earned: p.earned, capacity: p.capacity },
    shitcoin_warning: {
      level: WARNING_LEVEL[category] ?? 1,
      scale: 10,
      label: "Shitcoin warning",
    },
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
