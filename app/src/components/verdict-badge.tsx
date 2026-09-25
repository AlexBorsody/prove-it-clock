import type { VerdictCategory } from "@/lib/verdict";

/**
 * Categorical Shitcoin Score badge. A delivery-accountability rating, not a
 * number. Green = no concern, amber = delivery concern, red = core delivery
 * failure, grey = watch (reserved, no v1 trigger).
 */
export const VERDICT_SEVERITY: Record<VerdictCategory, number> = {
  "No concern": 0,
  "Watch": 1,
  "Delivery concern": 2,
  "Core delivery failure": 3,
};

const CLASS: Record<VerdictCategory, string> = {
  "No concern": "v-ok",
  "Watch": "v-watch",
  "Delivery concern": "v-concern",
  "Core delivery failure": "v-fail",
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
