"use client";

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

const W = 720;
const H = 220;
const PAD_L = 8;
const PAD_R = 8;
const PAD_T = 10;
const PAD_B = 26;

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
  const ordered = slugs.sort((a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0));

  const tMin = new Date(days[0]).getTime();
  const tMax = new Date(days[days.length - 1]).getTime();
  const span = tMax - tMin || 1;
  const x = (day: string) =>
    PAD_L + ((new Date(day).getTime() - tMin) / span) * (W - PAD_L - PAD_R);
  const y = (frac: number) => PAD_T + (1 - frac) * (H - PAD_T - PAD_B);

  // Cumulative fractions per day per project.
  const cum: number[][] = days.map(() => []);
  days.forEach((day, di) => {
    const m = byDay.get(day)!;
    const total = [...m.values()].reduce((s, v) => s + v, 0) || 1;
    let acc = 0;
    ordered.forEach((slug, si) => {
      acc += (m.get(slug) ?? 0) / total;
      cum[di][si] = acc;
    });
  });

  const area = (si: number) => {
    const top = days.map((day, di) => `${x(day).toFixed(1)},${y(cum[di][si]).toFixed(1)}`).join(" L");
    const bottom = days.map((day, di) => `${x(day).toFixed(1)},${y(si === 0 ? 0 : cum[di][si - 1]).toFixed(1)}`).reverse().join(" L");
    return `M${top} L${bottom} Z`;
  };

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="hype-share" role="img" aria-label="HYPE share over time">
        {ordered.map((slug, si) => (
          <path key={slug} d={area(si)} fill={PALETTE[si % PALETTE.length]} opacity={0.75} />
        ))}
        <text x={PAD_L} y={H - 8} className="axis">{days[0]}</text>
        <text x={W - PAD_R} y={H - 8} className="axis" textAnchor="end">{days[days.length - 1]}</text>
      </svg>
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
