"use client";

/**
 * Hearts timeline: filled hearts through time. One point per published run.
 * Rises and falls are the product — a flat line means nothing changed.
 */
export type HeartPoint = { as_of: string; filled: number; capacity: number };

const W = 720;
const H = 260;
const PAD_L = 36;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 30;

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso.slice(0, 10) : d.toISOString().slice(0, 10);
}

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
          <circle cx={x(times[i])} cy={y(p.filled)} r={5} className="heart-dot" />
          <text x={x(times[i])} y={y(p.filled) - 12} textAnchor="middle" className="axis strong">
            {p.filled}
          </text>
          {(ordered.length <= 8 || i === 0 || i === ordered.length - 1) && (
            <text x={x(times[i])} y={H - 10} textAnchor="middle" className="axis">
              {fmtDate(p.as_of)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
