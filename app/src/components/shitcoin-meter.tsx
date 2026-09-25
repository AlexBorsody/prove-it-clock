import type { VerdictCategory } from "@/lib/verdict";

/**
 * Shitcoin Score meter: the categorical delivery-accountability rating as a
 * proper visual element. Never a numeric score: four hard-edged segments,
 * the active one solid-filled with its category color. Flat colors, no
 * gradients, consistent with the 8-bit visual language.
 *
 * Colors: green = No concern, grey = Watch, amber = Delivery concern,
 * red = Core delivery failure.
 */
const ORDER: Array<{ cat: VerdictCategory; cls: string }> = [
  { cat: "Not a shitcoin", cls: "sev-ok" },
  { cat: "Watch", cls: "sev-watch" },
  { cat: "Shitcoin risk", cls: "sev-warn" },
  { cat: "Shitcoin", cls: "sev-bad" },
];

export default function ShitcoinMeter({
  category,
  meaning,
  compact,
}: {
  category: VerdictCategory;
  meaning?: string;
  /** Compact: segments only, no meaning paragraph. For dense rows/cards. */
  compact?: boolean;
}) {
  return (
    <div
      className={`shitcoin-meter${compact ? " compact" : ""}`}
      role="img"
      aria-label={`Shitcoin Score: ${category}. ${meaning}`}
    >
      <div className="shitcoin-meter-label">Shitcoin Score</div>
      <div className="shitcoin-segments">
        {ORDER.map(({ cat, cls }) => (
          <span
            key={cat}
            className={`shitcoin-seg${cat === category ? ` active ${cls}` : ""}`}
            aria-hidden={cat !== category}
          >
            {cat}
          </span>
        ))}
      </div>
      {compact ? null : (
        <p className="shitcoin-meter-meaning">
          {category}: {meaning}. A delivery rating against promises, never fraud
          or investment risk.
        </p>
      )}
    </div>
  );
}
