/**
 * Analyst-written verdict one-liners, one per project. Names the evidence:
 * what was delivered, or what failed. Updated only when promise states
 * change. DRAFTS shipped as-is 2026-09-25; Alex edits on the verification
 * pass (implementation.md open question 4).
 */
export const VERDICT_LINES: Record<string, string> = {
  btc: "Delivered payments at scale and the store-of-value case.",
  eth: "Delivered the Merge, rollups, and a live dapp ecosystem.",
  sol: "Delivered high-throughput mainnet and a live ecosystem.",
  link: "Delivered oracle feeds and CCIP.",
  avax: "Delivered subnets and a live DeFi ecosystem.",
  bat: "Delivered the Brave Ads loop and creator payouts.",
  xrp: "MoneyGram corridor retired; bank settlement never delivered.",
  dash: "Merchant economy lapsed; core privacy features holding.",
};

export function verdictLine(slug: string): string | null {
  return Object.prototype.hasOwnProperty.call(VERDICT_LINES, slug)
    ? VERDICT_LINES[slug]
    : null;
}
