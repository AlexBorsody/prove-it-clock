/**
 * CoinGecko provider adapter (keyless, free tier).
 *
 * Endpoints used:
 *   GET /api/v3/coins/markets  — price, mcap, FDV, volume, supplies, 30d change
 *   GET /api/v3/coins/{id}     — genesis_date, developer_data (spotty upstream)
 *
 * Rate discipline: free tier is roughly 5–15 calls/minute. The adapter
 * spaces calls and the ingest script reuses same-day disk cache, so a
 * daily pipeline run costs ~7 calls total for six projects.
 */
import type {
  NormalizedMetric,
  ProjectIngest,
  RawFetch,
} from "../types";

const BASE = "https://api.coingecko.com/api/v3";
const PROVIDER = "coingecko" as const;

async function getJson(endpoint: string, options: RequestInit = {}): Promise<{ fetch: RawFetch }> {
  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: { "User-Agent": "prove-it-clock/0.1 (research pipeline)" },
  });
  if (!res.ok) {
    throw new Error(`CoinGecko ${endpoint} -> HTTP ${res.status}`);
  }
  const payload = await res.json();
  return {
    fetch: {
      provider: PROVIDER,
      endpoint,
      fetchedAt: new Date().toISOString(),
      payload,
    },
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface MarketsRow {
  id: string;
  symbol: string;
  current_price: number | null;
  market_cap: number | null;
  fully_diluted_valuation: number | null;
  total_volume: number | null;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
  price_change_percentage_30d_in_currency: number | null;
}

interface CoinDetail {
  genesis_date: string | null;
  developer_data?: {
    forks: number | null;
    stars: number | null;
    subscribers: number | null;
    total_issues: number | null;
    closed_issues: number | null;
    pull_requests_merged: number | null;
    pull_request_contributors: number | null;
    code_additions_deletions_4_weeks?: { additions: number | null; deletions: number | null };
    commit_count_4_weeks: number | null;
  } | null;
}

function m(
  slug: string,
  metricCode: NormalizedMetric["metricCode"],
  value: number | null,
  observedAt: string,
  fetch: RawFetch,
  meta?: Record<string, unknown>,
): NormalizedMetric {
  return {
    projectSlug: slug,
    metricCode,
    observedAt,
    value: typeof value === "number" && Number.isFinite(value) ? value : null,
    meta,
    source: { provider: PROVIDER, endpoint: fetch.endpoint, fetchedAt: fetch.fetchedAt },
  };
}

export interface UniverseRow {
  market_cap_rank: number | null;
  id: string;
  symbol: string;
  name: string;
  current_price: number | null;
  market_cap: number | null;
  fully_diluted_valuation: number | null;
  total_volume: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_30d_in_currency: number | null;
}

/**
 * Fetch the market-cap-ranked universe (one batched call). Used by the
 * ingest universe step and by the /api/projects realtime endpoint.
 */
export async function fetchUniverseMarkets(size = 20): Promise<UniverseRow[]> {
  const endpoint =
    `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${size}&page=1` +
    `&price_change_percentage=24h,30d&precision=full`;
  const { fetch } = await getJson(endpoint, { signal: AbortSignal.timeout(3000), next: { revalidate: 90 } });
  return fetch.payload as UniverseRow[];
}

/**
 * Fetch + normalize market + project-fact metrics for a batch of projects.
 * @param entries [{slug, coingeckoId}]
 */
export async function ingestCoinGecko(
  entries: { slug: string; coingeckoId: string }[],
): Promise<ProjectIngest[]> {
  const bySlug = new Map<string, ProjectIngest>();
  for (const e of entries) {
    bySlug.set(e.slug, { slug: e.slug, rawFetches: [], metrics: [], unavailable: [] });
  }

  // --- markets (one batched call) ---
  const ids = entries.map((e) => e.coingeckoId).join(",");
  const marketsEndpoint =
    `/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids)}` +
    `&price_change_percentage=30d&precision=full`;
  const { fetch: marketsFetch } = await getJson(marketsEndpoint);
  const rows = marketsFetch.payload as MarketsRow[];
  const rowById = new Map(rows.map((r) => [r.id, r]));
  const observedAt = new Date().toISOString().slice(0, 10);

  for (const e of entries) {
    const ing = bySlug.get(e.slug)!;
    ing.rawFetches.push(marketsFetch);
    const row = rowById.get(e.coingeckoId);
    if (!row) {
      for (const code of [
        "price_usd",
        "market_cap_usd",
        "fdv_usd",
        "volume_24h_usd",
        "circulating_supply",
        "total_supply",
        "max_supply",
        "price_change_30d_pct",
      ] as const) {
        ing.unavailable.push({ metricCode: code, reason: `no /coins/markets row for ${e.coingeckoId}` });
      }
      continue;
    }
    ing.metrics.push(
      m(e.slug, "price_usd", row.current_price, observedAt, marketsFetch),
      m(e.slug, "market_cap_usd", row.market_cap, observedAt, marketsFetch),
      m(e.slug, "fdv_usd", row.fully_diluted_valuation, observedAt, marketsFetch),
      m(e.slug, "volume_24h_usd", row.total_volume, observedAt, marketsFetch),
      m(e.slug, "circulating_supply", row.circulating_supply, observedAt, marketsFetch),
      m(e.slug, "total_supply", row.total_supply, observedAt, marketsFetch),
      m(e.slug, "max_supply", row.max_supply, observedAt, marketsFetch),
      m(e.slug, "price_change_30d_pct", row.price_change_percentage_30d_in_currency, observedAt, marketsFetch),
    );
  }

  // --- per-coin detail: genesis_date + developer_data (spaced for rate limits) ---
  for (const e of entries) {
    const ing = bySlug.get(e.slug)!;
    await sleep(2500); // stay well under free-tier rate limits
    try {
      const endpoint = `/coins/${encodeURIComponent(e.coingeckoId)}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=true&sparkline=false`;
      const { fetch: detailFetch } = await getJson(endpoint);
      ing.rawFetches.push(detailFetch);
      const d = detailFetch.payload as CoinDetail;
      ing.metrics.push(
        m(e.slug, "launch_date", null, observedAt, detailFetch, {
          // launch_date is seeded by analysts (genesis_date is often the
          // block timestamp, not the meaningful launch); keep the raw value
          // for audit.
          genesis_date: d.genesis_date,
          note: "analyst-seeded launch_date used for Prove-It Age; genesis_date kept for audit",
        }),
      );
      const dev = d.developer_data;
      const devMetrics = [
        ["dev_commits_4w", dev?.commit_count_4_weeks ?? null],
        ["dev_stars", dev?.stars ?? null],
        ["dev_forks", dev?.forks ?? null],
      ] as const;
      for (const [code, v] of devMetrics) {
        if (v == null) {
          ing.unavailable.push({
            metricCode: code,
            reason: "CoinGecko developer_data empty for this coin (GitHub adapter is Phase 2)",
          });
        }
        ing.metrics.push(m(e.slug, code, v, observedAt, detailFetch));
      }
    } catch (err) {
      for (const code of ["dev_commits_4w", "dev_stars", "dev_forks"] as const) {
        ing.unavailable.push({
          metricCode: code,
          reason: `detail fetch failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }
  }

  return [...bySlug.values()];
}
