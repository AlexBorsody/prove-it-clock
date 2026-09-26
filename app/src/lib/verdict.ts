/**
 * Categorical Shitcoin Score: a delivery-accountability rating, not a fraud
 * or investment-risk rating. Rule-based, computed from reviewed promise
 * records. Humans resolve ambiguous evidence; this function only applies
 * the category.
 *
 * Rules (vision.md):
 * - Core promise confirmed retired/lapsed -> "Shitcoin"
 * - Supporting promise confirmed retired/lapsed -> "Shitcoin risk"
 * - No verified failure -> "Not a shitcoin"
 * - "Watch" is reserved for verified overdue promises after deadline
 *   research; it has no v1 trigger and this function never returns it.
 *
 * CODE, USAGE and HYPE never move the verdict directly in v1.
 */

export type VerdictCategory =
  | "Not a shitcoin"
  | "Watch"
  | "Shitcoin risk"
  | "Shitcoin";

export interface VerdictPromise {
  lineage: string;
  /** Canonical promise state: 'open' | 'active' | 'fulfilled' | 'lapsed' | 'retired' */
  state: string;
  core: boolean;
}

export interface Verdict {
  category: VerdictCategory;
  /** Lineages whose confirmed failure drove the category. Empty when clean. */
  failedLineages: string[];
}

const FAILED_STATES = new Set(["lapsed", "retired"]);

export function verdictFor(promises: VerdictPromise[]): Verdict {
  const failed = promises.filter((p) => FAILED_STATES.has(p.state));
  const coreFailed = failed.filter((p) => p.core);
  if (coreFailed.length > 0) {
    return {
      category: "Shitcoin",
      failedLineages: coreFailed.map((p) => p.lineage),
    };
  }
  if (failed.length > 0) {
    return {
      category: "Shitcoin risk",
      failedLineages: failed.map((p) => p.lineage),
    };
  }
  return { category: "Not a shitcoin", failedLineages: [] };
}
