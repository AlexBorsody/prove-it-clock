"use client";

/**
 * Hype bubbles. Bubble size = absolute HYPE mentions (sqrt-scaled, so area
 * is proportional). Substance fill = hearts-filled percentage: the green
 * fill rising inside each bubble shows how much of the attention is backed
 * by earned delivery proof. Sparse and honest — no smoothing, no trend.
 */
export default function HypeBubbles({ rows }: { rows: { slug: string; symbol: string; mentions: number; filledPct: number }[] }) {
  const max = Math.max(...rows.map((r) => r.mentions), 1);
  const data = [...rows].sort((a, b) => b.mentions - a.mentions);
  return (
    <div className="bubbles">
      {data.map((r, i) => {
        const size = 44 + 72 * Math.sqrt(r.mentions / max); // 44..116 px
        const fillY = 100 - r.filledPct * 92; // fill rises from the bottom
        const clipId = `bubble-clip-${r.slug}`;
        return (
          <div key={r.slug} className="bubble" style={{ width: size }}>
            <div style={{ position: "relative", width: size, height: size }}>
              <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`${r.symbol}: ${r.mentions} mentions, ${Math.round(r.filledPct * 100)}% hearts filled`}>
              <defs>
                <clipPath id={clipId}>
                  <circle cx={50} cy={50} r={46} />
                </clipPath>
              </defs>
              <circle cx={50} cy={50} r={46} fill="var(--bg-raised)" />
              <g clipPath={`url(#${clipId})`}>
                <rect x={0} y={fillY} width={100} height={100} fill="var(--green)" opacity={0.85} />
              </g>
              <circle cx={50} cy={50} r={46} fill="none" stroke="var(--border-strong)" strokeWidth={2} />
            </svg>
              <img
                className="coin-icon"
                src={`/icons/${r.slug}.svg`}
                alt=""
                aria-hidden="true"
                style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: size * 0.38, height: size * 0.38 }}
              />
            </div>
            <div className="bubble-label">
              <span className="num" style={{ fontWeight: 700 }}>{r.symbol}</span>
              <span className="num cell-sub">{r.mentions.toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
