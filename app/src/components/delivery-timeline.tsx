"use client";

import { useState } from "react";
import HeartsTimeline, { type HeartPoint } from "@/components/hearts-timeline";

/**
 * Delivery Timeline: hearts through time, with optional CODE and HYPE
 * activity strips. The USE toggle stays hidden until USE metrics exist.
 * Activity strips are display only; they never change the hearts.
 */

export interface CodeWeek { week: string; total: number }
export interface HypePoint { as_of: string; mentions: number }

function Bars({
  values,
  label,
  color,
}: {
  values: number[];
  label: string;
  color: string;
}) {
  const max = Math.max(1, ...values);
  const W = 720;
  const H = 64;
  const bw = W / values.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="activity-bars" role="img" aria-label={label}>
      {values.map((v, i) => {
        const h = Math.max(2, (v / max) * (H - 6));
        return (
          <rect
            key={i}
            x={i * bw + 0.5}
            y={H - h}
            width={Math.max(1, bw - 1)}
            height={h}
            fill={color}
            opacity={0.85}
          />
        );
      })}
    </svg>
  );
}

export default function DeliveryTimeline({
  hearts,
  codeWeeks,
  hypePoints,
}: {
  hearts: HeartPoint[];
  codeWeeks: CodeWeek[] | null;
  hypePoints: HypePoint[];
}) {
  const [showCode, setShowCode] = useState(false);
  const [showHype, setShowHype] = useState(false);

  return (
    <div>
      <div className="tl-toggles" role="group" aria-label="Timeline activity overlays">
        <span>Overlays</span>
        <button
          className={showCode ? "active" : undefined}
          onClick={() => setShowCode((v) => !v)}
          aria-pressed={showCode}
        >
          CODE activity
        </button>
        <button
          className={showHype ? "active" : undefined}
          onClick={() => setShowHype((v) => !v)}
          aria-pressed={showHype}
        >
          HYPE activity
        </button>
      </div>

      <HeartsTimeline points={hearts} />

      {showCode ? (
        <div className="tl-strip">
          <h3>CODE activity</h3>
          <p className="panel-sub">Commits per week on the tracked repo, last 52 weeks. Display only.</p>
          {codeWeeks && codeWeeks.length > 0 ? (
            <Bars values={codeWeeks.map((w) => w.total)} label="Commits per week" color="var(--blue)" />
          ) : (
            <p className="tl-note">No commit data available for this project.</p>
          )}
        </div>
      ) : null}

      {showHype ? (
        <div className="tl-strip">
          <h3>HYPE activity</h3>
          <p className="panel-sub">7-day news mentions per snapshot. Attention, not endorsement.</p>
          {hypePoints.length >= 2 ? (
            <Bars values={hypePoints.map((p) => p.mentions)} label="News mentions per snapshot" color="var(--accent)" />
          ) : (
            <p className="tl-note">Collecting HYPE snapshots. Activity draws once more than one snapshot day exists.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
