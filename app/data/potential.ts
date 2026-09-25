/**
 * One-line potential rationale per project, drafted from the case studies
 * (docs/case-studies/*.md). The denominator of the hearts meter is the
 * project's POTENTIAL: the capacity tier {5,10,20} assigned from the scope
 * of the project's stated vision, never defaulted. Current numeric
 * capacities stand as assigned by the analyst at carving time.
 */
export const POTENTIAL_RATIONALE: Record<string, string> = {
  btc: "Promised to rewire global money, so the ceiling is the full 20.",
  xrp: "Promised global settlement infrastructure for banks, so the ceiling is the full 20.",
  bat: "Promised to fix digital advertising, one sector, so the ceiling is 10.",
  link: "Promised the oracle layer every smart contract needs, so the ceiling is the full 20.",
  eth: "Promised a general platform for anything anyone can build, so the ceiling is the full 20.",
  sol: "Promised a web-scale blockchain at payment-network speed, so the ceiling is the full 20.",
  dash: "Promised global everyday digital cash, so the ceiling is the full 20.",
  avax: "Promised the platform for global DeFi and traditional finance, so the ceiling is the full 20.",
};

/** One-line vision rationale for a project's potential ceiling, or null if unset. */
export function potentialRationale(slug: string): string | null {
  return POTENTIAL_RATIONALE[slug] ?? null;
}
