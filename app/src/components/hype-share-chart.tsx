"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import type { HypeSnapshot } from "@/lib/heart-data";

/**
 * Stacked area chart: each tracked project's share of observed HYPE
 * (7-day news mentions) over time. Shares are of observed mentions only;
 * a project with a failed collection simply does not contribute that day.
 * Renders an honest collecting state until at least 2 snapshot dates exist.
 */

const PALETTE = [
  "#f0b429", "#58a6ff", "#3fb950", "#bc8cff",
  "#f85149", "#39c5cf", "#ff7b72", "#a371f7",
];

const TOOLTIP_STYLE = {
  background: "#151c28",
  border: "1px solid #2d3a4f",
  borderRadius: 6,
  color: "#e6edf3",
  fontSize: 13,
  padding: "6px 10px",
};

export default function HypeShareChart({
  snapshots,
  names,
}: {
  snapshots: HypeSnapshot[];
  names: Record<string, string>;
}) {
  // Group by day.
  const byDay = new Map<string, Map<string, number>>();
  for (const s of snapshots) {
    if (s.news_mentions_7d == null) continue;
    const day = s.as_of.slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, new Map());
    byDay.get(day)!.set(s.project_slug, s.news_mentions_7d);
  }
  const days = [...byDay.keys()].sort();
  const slugs = [...new Set(snapshots.map((s) => s.project_slug))];

  if (days.length < 2) {
    return (
      <div className="chart-empty">
        Collecting HYPE snapshots. The share chart draws once snapshots
        cover more than one day.
      </div>
    );
  }

  // Order projects by total mentions, descending, for stable stacking.
  const totals = new Map<string, number>();
  for (const s of snapshots) {
    if (s.news_mentions_7d == null) continue;
    totals.set(s.project_slug, (totals.get(s.project_slug) ?? 0) + s.news_mentions_7d);
  }
  const ordered = [...slugs].sort((a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0));

  // One row per day: each project's share (fraction 0-1) of that day's
  // observed mentions. Days with no mentions for a project contribute 0.
  const rows: Array<Record<string, number | string>> = days.map((day) => {
    const m = byDay.get(day)!;
    const total = [...m.values()].reduce((sum, v) => sum + v, 0) || 1;
    const row: Record<string, number | string> = { date: day };
    for (const slug of ordered) {
      row[slug] = (m.get(slug) ?? 0) / total;
    }
    return row;
  });

  function ShareTooltip({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ dataKey?: string | number; value?: number | string }>;
    label?: string | number;
  }) {
    if (!active || !payload || payload.length === 0) return null;
    const day = String(label);
    return (
      <div style={TOOLTIP_STYLE}>
        <div>{day}</div>
        {ordered.map((slug) => {
          const mentions = byDay.get(day)?.get(slug) ?? 0;
          const entry = payload.find((e) => e.dataKey === slug);
          const pct = Math.round(Number(entry?.value ?? 0) * 100);
          return (
            <div key={slug}>
              {names[slug] ?? slug}: {mentions} mentions ({pct}%)
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <div style={{ width: "100%", height: 240 }} role="img" aria-label="HYPE share over time">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <XAxis
              dataKey="date"
              ticks={[days[0], days[days.length - 1]]}
              tick={{ fontSize: 12 }}
              stroke="#5b6577"
            />
            <YAxis hide domain={[0, 1]} />
            <Tooltip content={<ShareTooltip />} />
            {ordered.map((slug, si) => (
              <Area
                key={slug}
                type="monotone"
                dataKey={slug}
                stackId="1"
                stroke={PALETTE[si % PALETTE.length]}
                fill={PALETTE[si % PALETTE.length]}
                fillOpacity={0.75}
                strokeWidth={1}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="legend">
        {ordered.map((slug, si) => (
          <span key={slug}>
            <span className="dot" style={{ background: PALETTE[si % PALETTE.length] }} />
            {names[slug] ?? slug}
          </span>
        ))}
      </div>
    </div>
  );
}
