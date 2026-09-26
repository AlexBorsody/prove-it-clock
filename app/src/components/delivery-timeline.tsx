"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import HeartsTimeline, { type HeartPoint } from "@/components/hearts-timeline";

/**
 * Delivery Timeline: hearts through time, with the HYPE activity strip
 * below. Activity is display only; it never changes the hearts.
 */

export interface CodeWeek { week: string | number; total: number }
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

function codeWeekDate(week: CodeWeek["week"]): Date {
  return typeof week === "number" || /^\d+$/.test(week)
    ? new Date(Number(week) * 1000)
    : new Date(week);
}

function codeWeekLabel(week: CodeWeek["week"], full = false): string {
  const date = codeWeekDate(week);
  if (isNaN(date.getTime())) return String(week);
  return full
    ? date.toISOString().slice(0, 10)
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function CodeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CodeWeek }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div style={{ ...TOOLTIP_STYLE, maxWidth: 220 }}>
      <div>Week of {codeWeekLabel(p.week, true)}</div>
      <strong>{p.total.toLocaleString()} commits</strong>
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
    <div className="tl-card" role="region" aria-label="Weekly repository commits">
      {codeWeeks && codeWeeks.length > 0 ? (
        <div style={{ width: "100%", minWidth: 0, height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={codeWeeks} accessibilityLayer margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid vertical={false} stroke="#2d3a4f" strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tickFormatter={(week) => codeWeekLabel(week)}
                tick={{ fill: "#8b96a8", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#2d3a4f" }}
                minTickGap={32}
                tickMargin={10}
              />
              <YAxis
                allowDecimals={false}
                domain={[0, "auto"]}
                width={58}
                tick={{ fill: "#8b96a8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                label={{ value: "Commits", angle: -90, position: "insideLeft", fill: "#8b96a8", fontSize: 11 }}
              />
              <Tooltip content={<CodeTooltip />} cursor={{ fill: "#58a6ff", opacity: 0.12 }} />
              <Bar dataKey="total" name="Commits" fill="#58a6ff" radius={[2, 2, 0, 0]} maxBarSize={28} />
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
