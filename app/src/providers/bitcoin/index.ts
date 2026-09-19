/**
 * Bitcoin on-chain fee provider (blockchain.info charts API, keyless).
 *
 * Why this exists: DefiLlama has no Bitcoin fee series (it tracks chains
 * with DeFi activity; miner fees are outside its fees dimension), and
 * CoinGecko has no fee data at all. Without this adapter, Bitcoin — a
 * primary test case — would have no measured economic throughput, and
 * its Reflexivity score would be computed without its highest-weight
 * input. This is a measured-data addition, not a methodology change:
 * the scoring config is untouched.
 *
 * Endpoints:
 *   GET /charts/transaction-fees?timespan=30days&format=json  (daily, BTC)
 *   GET /ticker                                                (BTC->USD)
 */
import type { NormalizedMetric, ProjectIngest, RawFetch } from "../types";

const BASE = "https://api.blockchain.info";
const PROVIDER = "bitcoin" as const;

async function getJson(endpoint: string): Promise<{ fetch: RawFetch }> {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { "User-Agent": "prove-it-clock/0.1 (research pipeline)" },
  });
  if (!res.ok) throw new Error(`blockchain.info ${endpoint} -> HTTP ${res.status}`);
  return {
    fetch: { provider: PROVIDER, endpoint, fetchedAt: new Date().toISOString(), payload: await res.json() },
  };
}

export async function ingestBitcoinFees(): Promise<ProjectIngest> {
  const ing: ProjectIngest = { slug: "btc", rawFetches: [], metrics: [], unavailable: [] };
  const observedAt = new Date().toISOString().slice(0, 10);
  try {
    const { fetch: feesFetch } = await getJson("/charts/transaction-fees?timespan=30days&format=json");
    const { fetch: tickerFetch } = await getJson("/ticker");
    ing.rawFetches.push(feesFetch, tickerFetch);

    const vals = ((feesFetch.payload as { values?: { x: number; y: number }[] }).values ?? []).filter(
      (v) => Number.isFinite(v.y),
    );
    const usd = (tickerFetch.payload as { USD?: { last?: number } }).USD?.last ?? null;
    if (!vals.length || usd == null) {
      for (const code of ["fees_30d_usd", "fees_annualized_usd"] as const) {
        ing.unavailable.push({ metricCode: code, reason: "blockchain.info returned empty series or no USD price" });
      }
      return ing;
    }
    const btcSum = vals.reduce((a, v) => a + v.y, 0);
    const usd30 = btcSum * usd;
    const mk = (
      code: NormalizedMetric["metricCode"],
      value: number,
      meta: Record<string, unknown>,
    ): NormalizedMetric => ({
      projectSlug: "btc",
      metricCode: code,
      observedAt,
      value,
      meta,
      source: { provider: PROVIDER, endpoint: feesFetch.endpoint, fetchedAt: feesFetch.fetchedAt },
    });
    ing.metrics.push(
      mk("fees_30d_usd", usd30, { days: vals.length, btc_sum: btcSum, btc_usd: usd }),
      mk("fees_annualized_usd", (usd30 * 365) / vals.length, {
        method: "trailing window annualized",
        days: vals.length,
      }),
    );
  } catch (err) {
    for (const code of ["fees_30d_usd", "fees_annualized_usd"] as const) {
      ing.unavailable.push({
        metricCode: code,
        reason: `blockchain.info fetch failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }
  return ing;
}
