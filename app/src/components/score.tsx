"use client";

export function colorFor(value: number | null, scale: "score" | "risk" | "gap" = "score"): string {
  if (value == null) return "var(--text-faint)";
  if (scale === "risk") {
    // reflexivity: high = warmer
    if (value >= 7) return "var(--red)";
    if (value >= 4) return "var(--accent)";
    return "var(--green)";
  }
  if (scale === "gap") {
    if (value >= 4) return "var(--red)";
    if (value >= 1.5) return "var(--accent)";
    if (value <= -0.5) return "var(--blue)";
    return "var(--green)";
  }
  if (value >= 7) return "var(--green)";
  if (value >= 4) return "var(--accent)";
  return "var(--red)";
}

export function ScoreCell({
  value,
  scale = "score",
  suffix = "",
}: {
  value: number | null;
  scale?: "score" | "risk" | "gap";
  suffix?: string;
}) {
  if (value == null) return <span className="score-na">—</span>;
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  return (
    <span className="score-cell">
      <span className="score-val num" style={{ color: colorFor(value, scale) }}>
        {value.toFixed(1)}{suffix}
      </span>
      <span className="score-bar">
        <div style={{ width: `${pct}%`, background: colorFor(value, scale) }} />
      </span>
    </span>
  );
}

export function EpistemicTag({ kind }: { kind: string }) {
  const cls = kind === "measured" ? "tag measured" : kind === "modeling" ? "tag modeling" : "tag mixed";
  const label = kind === "measured" ? "Measured fact" : kind === "modeling" ? "Modeling decision" : "Mixed";
  return <span className={cls}>{label}</span>;
}

export function StatusTag({ status }: { status: string }) {
  if (status === "provisional") return <span className="tag warn">Provisional</span>;
  if (status === "unavailable") return <span className="tag na">Unavailable</span>;
  return <span className="tag measured">Final</span>;
}

export function ScoreCard({  label,
  value,
  scale = "score",
  sub,
  status,
}: {
  label: string;
  value: number | null;
  scale?: "score" | "risk" | "gap";
  sub?: string;
  status?: string;
}) {
  return (
    <div className="score-card">
      <div className="label">{label}</div>
      <div className="big num" style={{ color: colorFor(value, scale) }}>
        {value == null ? "—" : value.toFixed(1)}
      </div>
      {(sub || status) && (
        <div className="sub">
          {sub} {status === "provisional" ? "· provisional" : ""}
        </div>
      )}
    </div>
  );
}

/**
 * Trading-card stat bar: label, 0–10 track, value. The card face of a project.
 * `display` overrides the value text (e.g. confidence shown as "62%").
 */
export function StatBar({
  label,
  value,
  scale = "score",
  sub,
  display,
}: {
  label: string;
  value: number | null;
  scale?: "score" | "risk" | "gap";
  sub?: string;
  display?: string;
}) {
  const pct = value == null ? 0 : Math.max(0, Math.min(100, (value / 10) * 100));
  const text = display ?? (value == null ? "—" : value.toFixed(1));
  return (
    <div className="stat-bar">
      <div className="stat-label">{label}</div>
      <div className="stat-track">
        <div style={{ width: `${pct}%`, background: colorFor(value, scale) }} />
      </div>
      <div className="stat-val num" style={{ color: colorFor(value, scale) }}>
        {text}
      </div>
      {sub ? <div className="stat-sub">{sub}</div> : null}
    </div>
  );
}
