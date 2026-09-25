/** Shitcoin score badge: failed promises + heart deficit, one number. Higher is worse. */
import Icon from "@/components/chrome-icons";

export function shitcoinScore({
  promises,
  capacity,
  filled,
  peak,
}: {
  promises: Array<{ state?: string }>;
  capacity: number;
  filled: number;
  peak: number;
}): number {
  const retired = promises.filter((p) => p.state === "retired").length;
  const lapsed = promises.filter((p) => p.state === "lapsed").length;
  return retired + lapsed + (capacity - filled) + (peak - filled);
}

export default function ShitcoinBadge({
  score,
  capacity,
  compact = false,
  noLink = false,
}: {
  score: number;
  capacity: number;
  compact?: boolean;
  noLink?: boolean;
}) {
  const sev = score <= capacity / 2 ? "ok" : score < capacity ? "warn" : "bad";
  const cls = `shitcoin-badge sev-${sev}${compact ? " compact" : ""}`;
  const inner = (
    <>
      <Icon name="alert" size={compact ? 14 : 20} style={{ color: "var(--sev-color)" }} />
      <span className="shitcoin-num num">{score}</span>
      <span className="shitcoin-label">
        {compact ? (
          "shitcoin score"
        ) : (
          <>
            shitcoin
            <br />
            score
          </>
        )}
      </span>
    </>
  );
  if (noLink) {
    return (
      <span className={cls} title="Failed promises plus heart deficit. Higher is worse.">
        {inner}
      </span>
    );
  }
  return (
    <a
      className={cls}
      href="/methodology#shitcoin-score"
      title="Failed promises plus heart deficit. Higher is worse. Tap for the formula."
    >
      {inner}
    </a>
  );
}
