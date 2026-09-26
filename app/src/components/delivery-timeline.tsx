"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
} from "recharts";
import HeartsTimeline, { type HeartPoint } from "@/components/hearts-timeline";

/**
 * Delivery Timeline: hearts through time, with the HYPE activity strip
 * below. Activity is display only; it never changes the hearts.
 */

export interface CodeWeek { week: string; total: number }
export interface HypePoint { as_of: string; mentions: number }

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

function CodeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CodeWeek }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  const wn = typeof p.week === "string" ? parseInt(p.week, 10) : p.week;
  const weekLabel = !isNaN(wn) && wn > 0
    ? new Date(wn * 1000).toISOString().slice(0, 10)
    : fmtDate(String(p.week));
  return (
    <div style={TOOLTIP_STYLE}>
      Week of {weekLabel}: {p.total} commits
    </div>
  );
}

function HypeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { date: string; mentions: number } }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div style={TOOLTIP_STYLE}>
      {p.date}: {p.mentions} mentions
    </div>
  );
}

/**
 * CodeActivityChart: commits per week on the tracked repo, as a modular
 * card. Lives in the CODE section of project pages. Display only; it never
 * changes the hearts.
 */
export function CodeActivityChart({ codeWeeks }: { codeWeeks: CodeWeek[] | null }) {
  return (
    <div className="tl-card">
      <h3>CODE activity</h3>
      <p className="panel-sub" style={{ fontSize: 14, color: "#8b96a8" }}>
        Commits per week on the tracked repo. Display only, it never changes the hearts.
      </p>
      {codeWeeks && codeWeeks.length > 0 ? (
        <div style={{ width: "100%", height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={codeWeeks} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <Tooltip content={<CodeTooltip />} cursor={{ fill: "#1f2937", opacity: 0.4 }} />
              <Bar dataKey="total" fill="#58a6ff" maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="tl-note">No commit data available for this project.</p>
      )}
    </div>
  );
}

export default function DeliveryTimeline({
  hearts,
  hypePoints,
}: {
  hearts: HeartPoint[];
  hypePoints: HypePoint[];
}) {
  const hypeData = hypePoints.map((p) => ({
    date: fmtDate(p.as_of),
    mentions: p.mentions,
  }));

  return (
    <div>
      <HeartsTimeline points={hearts} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        <div className="tl-card">
          <h3>HYPE activity</h3>
          <p className="panel-sub" style={{ fontSize: 14, color: "#8b96a8" }}>
            News mentions per snapshot. Attention, not endorsement.
          </p>
          {hypePoints.length >= 2 ? (
            <div style={{ width: "100%", height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hypeData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                  <Tooltip content={<HypeTooltip />} cursor={{ fill: "#1f2937", opacity: 0.4 }} />
                  <Bar dataKey="mentions" fill="#f0b429" maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="tl-note">Collecting HYPE snapshots.</p>
          )}
        </div>
      </div>
    </div>
  );
}
