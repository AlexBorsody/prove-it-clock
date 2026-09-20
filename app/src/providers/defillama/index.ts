/**
 * DefiLlama provider adapter (keyless, free).
 *
 * Endpoints used:
 *   GET /overview/fees/{chain}?dataType=dailyFees  — daily chain fees (USD)
 *   GET /v2/historicalChainTvl/{chain}              — historical chain TVL (USD)
 *
 * Coverage note (recorded, not hidden): DefiLlama tracks chains and DeFi
 * protocols. It has no meaningful series for Bitcoin (miner fees are not
 * in its fees dimension), XRP, or Chainlink-the-oracle-network. Those
 * projects get explicit UNAVAILABLE markers, which flow into Evidence
 * Confidence instead of being estimated.
 */
import type {
  NormalizedMetric,
  ProjectIngest,
  RawFetch,
} from "../types";

const BASE = "https://api.llama.fi";
const PROVIDER = "defillama" as const;

/** project slug -> DefiLlama chain name. Absent = no coverage. */
export const CHAIN_MAP: Record<string, string> = {
  eth: "Ethereum",
  sol: "Solana",
  ada: "Cardano",
  bnb: "BSC",
  trx: "Tron",
  hype: "Hyperliquid L1",
};

async function getJson(endpoint: string): Promise<{ fetch: RawFetch }> {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { "User-Agent": "prove-it-clock/0.1 (research pipeline)" },
  });
  if (!res.ok) {
    throw new Error(`DefiLlama ${endpoint} -> HTTP ${res.status}`);
  }
  return {
    fetch: {
      provider: PROVIDER,
      endpoint,
      fetchedAt: new Date().toISOString(),
      payload: await res.json(),
    },
  };
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

export async function ingestDefiLlama(slugs: string[]): Promise<ProjectIngest[]> {
  const out: ProjectIngest[] = [];
  const observedAt = new Date().toISOString().slice(0, 10);

  for (const slug of slugs) {
    const ing: ProjectIngest = { slug, rawFetches: [], metrics: [], unavailable: [] };
    const chain = CHAIN_MAP[slug];
    if (!chain) {
      for (const code of ["tvl_usd", "fees_30d_usd", "fees_annualized_usd"] as const) {
        ing.unavailable.push({
          metricCode: code,
          reason:
            "no DefiLlama chain coverage for this project (DefiLlama tracks EVM/non-EVM chains and DeFi protocols; this asset has no chain series)",
        });
      }
      out.push(ing);
      continue;
    }

    // --- fees ---
    try {
      const endpoint = `/overview/fees/${encodeURIComponent(chain)}?dataType=dailyFees`;
      const { fetch: feesFetch } = await getJson(endpoint);
      ing.rawFetches.push(feesFetch);
      const chart = (feesFetch.payload as { totalDataChart?: [number, number][] }).totalDataChart ?? [];
      const last30 = chart.slice(-30);
      const sum30 = last30.reduce((a, [, v]) => a + (Number.isFinite(v) ? v : 0), 0);
      const lastDate = last30.length
        ? new Date(last30[last30.length - 1][0] * 1000).toISOString().slice(0, 10)
        : observedAt;
      ing.metrics.push(
        m(slug, "fees_30d_usd", last30.length ? sum30 : null, lastDate, feesFetch, {
          days: last30.length,
        }),
        m(
          slug,
          "fees_annualized_usd",
          last30.length >= 7 ? (sum30 * 365) / last30.length : null,
          lastDate,
          feesFetch,
          { method: "trailing window annualized", days: last30.length },
        ),
      );
      if (!last30.length) {
        ing.unavailable.push({ metricCode: "fees_30d_usd", reason: "empty fee series returned" });
        ing.unavailable.push({ metricCode: "fees_annualized_usd", reason: "empty fee series returned" });
      }
    } catch (err) {
      for (const code of ["fees_30d_usd", "fees_annualized_usd"] as const) {
        ing.unavailable.push({
          metricCode: code,
          reason: `fees fetch failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }

    // --- TVL ---
    try {
      const endpoint = `/v2/historicalChainTvl/${encodeURIComponent(chain)}`;
      const { fetch: tvlFetch } = await getJson(endpoint);
      ing.rawFetches.push(tvlFetch);
      const series = (tvlFetch.payload as { date: number; tvl: number }[]) ?? [];
      const last = series.length ? series[series.length - 1] : null;
      ing.metrics.push(
        m(
          slug,
          "tvl_usd",
          last ? last.tvl : null,
          last ? new Date(last.date * 1000).toISOString().slice(0, 10) : observedAt,
          tvlFetch,
        ),
      );
      if (!last) ing.unavailable.push({ metricCode: "tvl_usd", reason: "empty TVL series returned" });
    } catch (err) {
      ing.unavailable.push({
        metricCode: "tvl_usd",
        reason: `TVL fetch failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }

    out.push(ing);
  }
  return out;
}
