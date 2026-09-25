import type { VerdictCategory } from "@/lib/verdict";

/**
 * Categorical Shitcoin Score badge. A delivery-accountability rating, not a
 * number. Green = not a shitcoin, amber = shitcoin risk, red = shitcoin,
 * grey = watch (reserved, no v1 trigger).
 */
export const VERDICT_SEVERITY: Record<VerdictCategory, number> = {
  "Not a shitcoin": 0,
  "Watch": 1,
  "Shitcoin risk": 2,
  "Shitcoin": 3,
};

const CLASS: Record<VerdictCategory, string> = {
  "Not a shitcoin": "v-ok",
  "Watch": "v-watch",
  "Shitcoin risk": "v-concern",
  "Shitcoin": "v-fail",
};

export default function VerdictBadge({
  category,
  compact,
}: {
  category: VerdictCategory;
  compact?: boolean;
}) {
  return (
    <span className={`verdict-badge ${CLASS[category]}${compact ? " compact" : ""}`}>
      {category}
    </span>
  );
}
