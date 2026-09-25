"use client";

/**
 * Hearts timeline: filled hearts through time. One point per published run.
 * Rises and falls are the product — a flat line means nothing changed.
 */
export type HeartPoint = { as_of: string; filled: number; capacity: number };

/** Minimal sparkline for cards: the line only, no labels. Rises and falls at a glance. */
export function HeartSparkline({ points }: { points: HeartPoint[] }) {
  const ordered = [...points].sort((a, b) => a.as_of.localeCompare(b.as_of));
  if (ordered.length < 2) return null;
  const W = 120;
  const H = 30;
  const PAD = 3;
  const cap = Math.max(...ordered.map((p) => p.capacity), 1);
  const times = ordered.map((p) => new Date(p.as_of).getTime());
  const tMin = Math.min(...times);
  const tMax = Math.max(...times);
  const span = tMax - tMin || 1;
  const x = (t: number) => PAD + ((t - tMin) / span) * (W - PAD * 2);
  const y = (v: number) => PAD + (1 - v / cap) * (H - PAD * 2);
  const line = ordered.map((p, i) => `${i ? "L" : "M"}${x(times[i]).toFixed(1)},${y(p.filled).toFixed(1)}`).join(" ");
  const lx = x(times[times.length - 1]);
  const ly = y(ordered[ordered.length - 1].filled);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="heart-spark" aria-hidden="true">
      <path d={line} fill="none" strokeWidth={2.5} />
      <circle cx={lx} cy={ly} r={3.5} />
    </svg>
  );
}
const PAD_L = 36;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 30;

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso.slice(0, 10) : d.toISOString().slice(0, 10);
}

function fmtYear(iso: string): string {
  return fmtDate(iso).slice(0, 4);
}

const W = 720;
const H = 260;
export default function HeartsTimeline({ points }: { points: HeartPoint[] }) {
  if (!points.length) {
    return <p className="panel-sub" style={{ marginBottom: 0 }}>No published runs yet.</p>;
  }
  const ordered = [...points].sort((a, b) => a.as_of.localeCompare(b.as_of));
  const cap = Math.max(...ordered.map((p) => p.capacity), 1);
  const times = ordered.map((p) => new Date(p.as_of).getTime());
  const tMin = Math.min(...times);
  const tMax = Math.max(...times);
  const span = tMax - tMin || 1;

  const x = (t: number) => PAD_L + ((t - tMin) / span) * (W - PAD_L - PAD_R);
  const y = (v: number) => PAD_T + (1 - v / cap) * (H - PAD_T - PAD_B);

  const line = ordered.map((p, i) => `${i ? "L" : "M"}${x(times[i]).toFixed(1)},${y(p.filled).toFixed(1)}`).join(" ");
  const gridVals = [0, cap / 2, cap];
  // Year labels, thinned so they never collide.
  const step = Math.max(1, Math.ceil(ordered.length / 6));
  const showYear = (i: number) => i === 0 || i === ordered.length - 1 || i % step === 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="hearts-timeline" role="img"
      aria-label={`Heart history: ${ordered.map((p) => `${fmtDate(p.as_of)} ${p.filled} of ${p.capacity}`).join(", ")}`}>
      {gridVals.map((v) => (
        <g key={v}>
          <line x1={PAD_L} x2={W - PAD_R} y1={y(v)} y2={y(v)} className="grid" />
          <text x={PAD_L - 8} y={y(v) + 4} textAnchor="end" className="axis">
            {Number.isInteger(v) ? v : v.toFixed(1)}
          </text>
        </g>
      ))}
      <path d={line} className="heart-line" fill="none" />
      {ordered.map((p, i) => (
        <g key={i}>
          <title>{`${fmtDate(p.as_of)} — ${p.filled} of ${p.capacity} hearts`}</title>
          <circle cx={x(times[i])} cy={y(p.filled)} r={5} className="heart-dot" />
          <text x={x(times[i])} y={y(p.filled) - 12} textAnchor="middle" className="axis strong">
            {p.filled}
          </text>
          {showYear(i) && (
            <text x={x(times[i])} y={H - 10} textAnchor="middle" className="axis">
              {fmtYear(p.as_of)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
