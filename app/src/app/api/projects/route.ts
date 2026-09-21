/**
 * GET /api/projects — the Prove-It Clock projects API.
 *
 * Serves the full scored universe (top 20 by CoinGecko market cap):
 *   - scores from the latest verified daily snapshot (methodology v0.2.0:
 *     six scored projects, fourteen explicitly unavailable)
 *   - market data fetched LIVE from CoinGecko on each request, with a
 *     short server-side TTL cache (90s) so upstream is never hammered
 *     and page loads never call vendors directly
 *
 * Pagination is built into the envelope now (page/per_page), so the
 * frontend can paginate later without an API change.
 *
 * Query params:
 *   page      default 1
 *   per_page  default 20, max 100
 *
 * Market cap determines universe membership and display rank ONLY.
 * It is never a scoring input (see methodology).
 */
import { getStore } from "@/lib/data";
import { loadSeeds } from "@/methodology/index";
import { ACTIVE_METHODOLOGY_VERSION } from "@/lib/active-methodology";
import { fetchUniverseMarkets, type UniverseRow } from "@/providers/coingecko/index";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MARKET_TTL_MS = 90_000;

let marketCache: { at: number; rows: UniverseRow[] } | null = null;

async function liveMarkets(): Promise<{ rows: UniverseRow[]; live: boolean; asof: string }> {
  const now = Date.now();
  if (marketCache && now - marketCache.at < MARKET_TTL_MS) {
    return { rows: marketCache.rows, live: true, asof: new Date(marketCache.at).toISOString() };
  }
  try {
    const rows = await fetchUniverseMarkets(20);
    marketCache = { at: now, rows };
    return { rows, live: true, asof: new Date(now).toISOString() };
  } catch {
    // Upstream down: fall back to the last cached payload if we have one,
    // otherwise report degraded and let callers use snapshot metrics.
    if (marketCache) {
      return { rows: marketCache.rows, live: false, asof: new Date(marketCache.at).toISOString() };
    }
    return { rows: [], live: false, asof: new Date(now).toISOString() };
  }
}

const num = (v: number | null | undefined) =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get("per_page") ?? "20", 10) || 20));

  const store = getStore();
  const seeds = loadSeeds();
  const [scores, snapshotDate, metrics, market] = await Promise.all([
    store.getLatestScores(),
    store.getLatestSnapshotDate(),
    store.getLatestMetrics(),
    liveMarkets(),
  ]);

  const marketById = new Map(market.rows.map((r) => [r.id, r]));
  // Rank by market-cap order (universe order), not by score.
  const ordered = [...seeds].sort((a, b) => {
    const ra = marketById.get(a.coingecko_id)?.market_cap_rank ?? 999;
    const rb = marketById.get(b.coingecko_id)?.market_cap_rank ?? 999;
    return ra - rb;
  });

  const methodologyVersion = ACTIVE_METHODOLOGY_VERSION;

  const items = ordered.map((seed) => {
    const snap = scores[seed.slug] ?? null;
    const m = marketById.get(seed.coingecko_id);
    const sm = metrics[seed.slug] ?? {};
    const s = (code: string) => snap?.scores[code] ?? null;
    const sv = (code: string) => s(code)?.value ?? null;

    return {
      slug: seed.slug,
      name: seed.name,
      symbol: seed.symbol,
      market_cap_rank: m?.market_cap_rank ?? null,
      thesis_category: seed.thesis_category,
      thesis: seed.thesis,
      provisional: seed.provisional === true,
      provisional_reason: seed.provisional_reason ?? null,
      prove_it_age_years: snap?.prove_it_age_years ?? null,
      status: snap ? snap.scores.reality.status : "unavailable",
      market: {
        price_usd: num(m?.current_price ?? sm.price_usd),
        market_cap_usd: num(m?.market_cap ?? sm.market_cap_usd),
        fdv_usd: num(m?.fully_diluted_valuation ?? sm.fdv_usd),
        volume_24h_usd: num(m?.total_volume ?? sm.volume_24h_usd),
        change_24h_pct: num(m?.price_change_percentage_24h),
        change_30d_pct: num(m?.price_change_percentage_30d_in_currency ?? sm.price_change_30d_pct),
      },
      scores: snap
        ? {
            reality: { value: sv("reality"), status: s("reality")?.status, confidence: s("reality")?.confidence },
            world_impact_potential: { value: sv("world_impact_potential"), status: s("world_impact_potential")?.status },
            execution_evidence: { value: sv("execution_evidence"), status: s("execution_evidence")?.status },
            reflexivity_risk: { value: sv("reflexivity_risk"), status: s("reflexivity_risk")?.status },
            evidence_confidence: { value: s("reality")?.confidence ?? null, status: s("reality")?.status },
            token_necessity: { value: sv("token_necessity"), status: s("token_necessity")?.status },
            token_value_capture: { value: sv("token_value_capture"), status: s("token_value_capture")?.status },
          }
        : null,
      derived: snap
        ? {
            promise_gap: snap.derived.promise_gap ?? null,
            build_gap: snap.derived.build_gap ?? null,
            potential_outlook: snap.derived.potential_outlook ?? null,
          }
        : null,
    };
  });

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const paged = items.slice((page - 1) * perPage, page * perPage);

  return Response.json({
    meta: {
      universe: "coingecko_top20",
      universe_size: 20,
      methodology_version: methodologyVersion,
      scores_snapshot_date: snapshotDate,
      market_data: {
        live: market.live,
        asof: market.asof,
        note: "Live CoinGecko quote overlay (90s server cache). Market cap sets universe membership and rank only — never a scoring input.",
      },
      generated_at: new Date().toISOString(),
    },
    pagination: {
      page,
      per_page: perPage,
      total,
      total_pages: totalPages,
      has_more: page < totalPages,
    },
    projects: paged,
  });
}
