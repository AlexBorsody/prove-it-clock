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
}: {
  score: number;
  capacity: number;
}) {
  const sev = score <= capacity / 2 ? "ok" : score < capacity ? "warn" : "bad";
  return (
    <a
      className={`shitcoin-badge sev-${sev}`}
      href="/methodology#shitcoin-score"
      title="Failed promises plus heart deficit. Higher is worse. Tap for the formula."
    >
      <Icon name="alert" size={20} style={{ color: "var(--sev-color)" }} />
      <span className="shitcoin-num num">{score}</span>
      <span className="shitcoin-label">
        shitcoin
        <br />
        score
      </span>
    </a>
  );
}
