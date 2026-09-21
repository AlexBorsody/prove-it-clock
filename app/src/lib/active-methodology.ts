/**
 * Active methodology — v0.2.0.
 *
 * v0.2.0 scores exactly six projects (BTC, ETH, XRP, SOL, ADA, LINK).
 * The other fourteen are explicitly unavailable: null, never zero, never
 * estimated. Market cap controls universe membership and display rank only.
 *
 * v0.3.0 is speculative and append-only: it is preserved in history but must
 * never drive the leaderboard, detail pages, or active history output.
 */
export const ACTIVE_METHODOLOGY_VERSION = "0.2.0";

/** Projects with verified real data under the active methodology. */
export const SCORED_PROJECT_SLUGS: readonly string[] = [
  "btc",
  "eth",
  "xrp",
  "sol",
  "ada",
  "link",
];

/** Methodology versions excluded from all active output (speculative). */
export const SPECULATIVE_VERSIONS: ReadonlySet<string> = new Set(["0.3.0"]);

export function isScoredProject(slug: string): boolean {
  return SCORED_PROJECT_SLUGS.includes(slug);
}

export function isSpeculativeVersion(version: string | null | undefined): boolean {
  return !!version && SPECULATIVE_VERSIONS.has(version);
}
