import Link from "next/link";
import type { VerdictCategory } from "@/lib/verdict";
import Icon from "@/components/chrome-icons";

/**
 * Shitcoin Score as a circular 1-10 gauge.
 *
 * The underlying rating stays categorical and rule-based (lib/verdict.ts):
 * the number is the category's fixed position on the dial, not a computed
 * score. 1 = clean delivery record, 10 = core delivery failure.
 */
const GAUGE: Record<
  VerdictCategory,
  { score: number; color: string; warn: boolean }
> = {
  "Not a shitcoin": { score: 1, color: "var(--green)", warn: false },
  Watch: { score: 4, color: "#8a93a6", warn: false },
  "Shitcoin risk": { score: 7, color: "var(--amber)", warn: true },
  Shitcoin: { score: 10, color: "var(--red)", warn: true },
};

export function shitcoinGauge(category: VerdictCategory) {
  return GAUGE[category];
}

function Dial({ score, color, size }: { score: number; color: string; size: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0.02, score / 10);
  return (
    <svg
      viewBox="0 0 44 44"
      width={size}
      height={size}
      className="shitcoin-dial"
      aria-hidden="true"
    >
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--bg-raised)" strokeWidth="5" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${frac * c} ${c}`}
        transform="rotate(-90 22 22)"
      />
      <text
        x="22"
        y="27.5"
        textAnchor="middle"
        fontSize="16"
        fontWeight="800"
        fill="var(--text)"
        className="num"
      >
        {score}
      </text>
    </svg>
  );
}

export interface ShitcoinInput {
  criteria: string;
  state: string;
  core: boolean;
  evidenceHref?: string;
}

export default function ShitcoinMeter({
  category,
  compact,
  size,
  inputs,
  emptyText,
}: {
  category: VerdictCategory;
  /** Compact: dial + meter name, for dense rows/cards. */
  compact?: boolean;
  size?: number;
  /** The failed promises feeding the meter. Shown on the full meter only. */
  inputs?: ShitcoinInput[];
  /** Text when nothing failed. Shown on the full meter only. */
  emptyText?: string;
}) {
  const { score, color, warn } = GAUGE[category];
  const dialSize = size ?? (compact ? 40 : 84);
  return (
    <div
      className={`shitcoin-meter${compact ? " compact" : ""}`}
      role={compact ? "img" : "group"}
      aria-label={`Shitcoin warning ${score} of 10`}
      title={`Shitcoin warning ${score}/10`}
    >
      <span className="shitcoin-gauge">
        <Dial score={score} color={color} size={dialSize} />
        {!compact && (
          <span className="shitcoin-gauge-meta">
            <span className="shitcoin-meter-label">Shitcoin warning</span>
          </span>
        )}
      </span>
      {compact && <span className="shitcoin-caption">SHITCOIN WARNING</span>}
      {!compact && warn && (
        <p className="shitcoin-warn">
          <Icon name="alert" size={15} />
          <span>Documented delivery failures against promises.</span>
        </p>
      )}
      {!compact && inputs && (
        <div className="shitcoin-inputs">
          <div className="shitcoin-inputs-label">What feeds this meter</div>
          {inputs.length > 0 ? (
            <ul className="shitcoin-inputs-list">
              {inputs.map((inp, i) => (
                <li key={i}>
                  {inp.evidenceHref ? (
                    <Link className="shitcoin-input-criteria evidence-link" href={inp.evidenceHref}>{inp.criteria} — View evidence ↗</Link>
                  ) : <span className="shitcoin-input-criteria">{inp.criteria}</span>}
                  <span className="shitcoin-input-state num">
                    {inp.state}
                    {inp.core ? " · core" : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="shitcoin-inputs-empty">{emptyText}</p>
          )}
        </div>
      )}
      {!compact && (
        <p className="shitcoin-meter-meaning">
          A delivery rating against promises, never fraud or investment risk.
        </p>
      )}
    </div>
  );
}
