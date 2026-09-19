/**
 * Internal metric schema for the Prove-It Clock.
 *
 * Provider adapters (coingecko/, defillama/) fetch vendor payloads and
 * normalize them into NormalizedMetric. Scoring code NEVER sees vendor
 * schemas — only these codes.
 *
 * A metric value of null means "the provider has no data for this".
 * That is not zero: it marks the metric UNAVAILABLE and reduces
 * Evidence Confidence instead of being invented.
 */

export type ProviderCode = "coingecko" | "defillama" | "bitcoin" | "analyst";

/** A raw provider response, cached to disk before any normalization. */
export interface RawFetch {
  provider: Exclude<ProviderCode, "analyst">;
  endpoint: string; // e.g. "coins/markets"
  fetchedAt: string; // ISO timestamp of the fetch
  payload: unknown; // untouched vendor response (auditable)
}

/**
 * Internal metric codes. Convention: <domain>_<name>_<unit?>.
 *
 * Market (CoinGecko /coins/markets):
 */
export const METRIC_CODES = [
  // market
  "price_usd",
  "market_cap_usd",
  "fdv_usd",
  "volume_24h_usd",
  "circulating_supply",
  "total_supply",
  "max_supply",
  "price_change_30d_pct",
  // chain (DefiLlama)
  "tvl_usd",
  "fees_30d_usd",
  "fees_annualized_usd",
  // development (CoinGecko developer_data; GitHub adapter is Phase 2)
  "dev_commits_4w",
  "dev_stars",
  "dev_forks",
  // project facts (seeded, analyst-sourced with evidence links)
  "launch_date",
] as const;

export type MetricCode = (typeof METRIC_CODES)[number];

/** One normalized observation, ready for scoring. */
export interface NormalizedMetric {
  projectSlug: string;
  metricCode: MetricCode;
  observedAt: string; // ISO date the data point refers to
  value: number | null; // null => UNAVAILABLE at this provider
  meta?: Record<string, unknown>;
  source: {
    provider: ProviderCode;
    endpoint: string;
    fetchedAt: string;
  };
}

/** What the adapter layer hands the pipeline per project. */
export interface ProjectIngest {
  slug: string;
  rawFetches: RawFetch[];
  metrics: NormalizedMetric[];
  /** metric codes the adapter attempted but the provider had no data for */
  unavailable: { metricCode: MetricCode; reason: string }[];
}
