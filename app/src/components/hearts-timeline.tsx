"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/**
 * Hearts timeline: filled hearts through time. One point per published run.
 * Rises and falls are the product — a flat line means nothing changed.
 */
export type HeartPoint = { as_of: string; filled: number; capacity: number };

interface HeartDatum {
  date: string;
  filled: number;
  capacity: number;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso.slice(0, 10) : d.toISOString().slice(0, 10);
}

const TOOLTIP_STYLE = {
  background: "#151c28",
  border: "1px solid #2d3a4f",
  borderRadius: 6,
  color: "#e6edf3",
  fontSize: 14,
  padding: "6px 10px",
};

function HeartsTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: HeartDatum }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div style={TOOLTIP_STYLE}>
      <div>{p.date}</div>
      <div>
        {p.filled} of {p.capacity} potential
      </div>
    </div>
  );
}

/** Minimal sparkline for cards: the line only, no labels. Rises and falls at a glance. */
export function HeartSparkline({ points }: { points: HeartPoint[] }) {
  const ordered = [...points].sort((a, b) => a.as_of.localeCompare(b.as_of));
  if (ordered.length < 2) return null;
  const cap = Math.max(...ordered.map((p) => p.capacity), 1);
  const data: HeartDatum[] = ordered.map((p) => ({
    date: fmtDate(p.as_of),
    filled: p.filled,
    capacity: p.capacity,
  }));
  return (
    <div style={{ width: "100%", height: 30 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 3, right: 3, bottom: 3, left: 3 }}>
          <YAxis hide domain={[0, cap]} />
          <Line
            type="monotone"
            dataKey="filled"
            stroke="#3fb950"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function HeartsTimeline({ points }: { points: HeartPoint[] }) {
  if (!points.length) {
    return <p className="panel-sub" style={{ marginBottom: 0 }}>No scores published yet.</p>;
  }
  const ordered = [...points].sort((a, b) => a.as_of.localeCompare(b.as_of));
  const cap = Math.max(...ordered.map((p) => p.capacity), 1);
  const data: HeartDatum[] = ordered.map((p) => ({
    date: fmtDate(p.as_of),
    filled: p.filled,
    capacity: p.capacity,
  }));

  // At most 3 x ticks (first / middle / last), labeled by year so they never collide.
  const tickDates =
    data.length <= 3
      ? data.map((d) => d.date)
      : [data[0].date, data[Math.floor(data.length / 2)].date, data[data.length - 1].date];

  return (
    <div
      style={{ width: "100%", height: 260 }}
      role="img"
      aria-label={`Heart history: ${data.map((p) => `${p.date} ${p.filled} of ${p.capacity} potential`).join(", ")}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
          <CartesianGrid vertical={false} stroke="#1f2937" />
          <XAxis
            dataKey="date"
            ticks={tickDates}
            tickFormatter={(d: string) => d.slice(0, 4)}
            tick={{ fontSize: 13 }}
            stroke="#5b6577"
          />
          <YAxis
            domain={[0, cap]}
            ticks={[0, cap / 2, cap]}
            tickFormatter={(v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))}
            tick={{ fontSize: 13 }}
            stroke="#5b6577"
            width={30}
          />
          <Tooltip content={<HeartsTooltip />} cursor={{ stroke: "#2d3a4f" }} />
          <Line
            type="monotone"
            dataKey="filled"
            stroke="#3fb950"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "#3fb950" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
