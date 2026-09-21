"use client";

import { useEffect, useState } from "react";

/**
 * Prove-It timeline: handwritten SVG. One line per scored stretch — nulls
 * break the line (gaps, never interpolation). Methodology changes get a
 * vertical marker; project events get annotated dots. Unscored projects
 * render an explicit unavailable state, never an empty chart.
 */

interface Point {
  date: string;
  methodology_version: string | null;
  value: number | null;
  status: string;
}

interface HistEvent {
  date: string;
  type: string;
  title: string;
}

interface HistoryBody {
  slug: string;
  metrics: Record<string, Point[]>;
  events: HistEvent[];
}

const W = 680;
const H = 220;
const PAD_L = 44;
const PAD_R = 16;
const PAD_T = 26;
const PAD_B = 30;

function day(d: string): number {
  return new Date(d + "T00:00:00Z").getTime();
}

export default function ScoreTimeline({ slug }: { slug: string }) {
  const [body, setBody] = useState<HistoryBody | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(`/api/projects/${slug}/history`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => {
        if (live) setBody(j);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [slug]);

  if (failed) {
    return <p className="panel-sub" style={{ margin: 0 }}>Timeline unavailable — history request failed.</p>;
  }
  if (!body) {
    return <p className="panel-sub" style={{ margin: 0 }}>Loading timeline…</p>;
  }

  const pts = (body.metrics.reality ?? []).slice().sort((a, b) => day(a.date) - day(b.date));
  const scored = pts.filter((p) => p.value != null);

  if (scored.length === 0) {
    return (
      <div>
        <p className="panel-sub" style={{ margin: "0 0 8px" }}>
          <b>Not scored under v0.2.0.</b> No verified snapshot history exists for this
          project — it is explicitly unavailable, not estimated and not zero-filled.
        </p>
        {body.events.length > 0 && (
          <p className="panel-sub" style={{ margin: 0 }}>
            {body.events.length} recorded event{body.events.length === 1 ? "" : "s"} below — events
            are evidence, not scores.
          </p>
        )}
      </div>
    );
  }

  const t0 = Math.min(day(scored[0].date), ...body.events.map((e) => day(e.date)));
  const t1 = Math.max(day(scored[scored.length - 1].date), ...body.events.map((e) => day(e.date)));
  const span = Math.max(t1 - t0, 86400000);
  const X = (d: string) => PAD_L + ((day(d) - t0) / span) * (W - PAD_L - PAD_R);
  const Y = (v: number) => PAD_T + (1 - v / 10) * (H - PAD_T - PAD_B);

  // Segments: break the line wherever a value is null.
  const segs: Point[][] = [];
  let cur: Point[] = [];
  for (const p of pts) {
    if (p.value == null) {
      if (cur.length) segs.push(cur);
      cur = [];
    } else {
      cur.push(p);
    }
  }
  if (cur.length) segs.push(cur);

  // Methodology change markers.
  const markers: { x: number; version: string }[] = [];
  let lastVer: string | null = null;
  for (const p of pts) {
    if (p.methodology_version !== lastVer) {
      lastVer = p.methodology_version;
      if (lastVer) markers.push({ x: X(p.date), version: lastVer });
    }
  }

  const gridVals = [0, 2.5, 5, 7.5, 10];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720 }} role="img" aria-label={`Reality score history for ${slug}`}>
        {gridVals.map((g) => (
          <g key={g}>
            <line x1={PAD_L} x2={W - PAD_R} y1={Y(g)} y2={Y(g)} stroke="var(--border)" strokeWidth="1" />
            <text x={PAD_L - 8} y={Y(g) + 4} fontSize="10" fill="var(--text-faint)" textAnchor="end" fontFamily="monospace">
              {g}
            </text>
          </g>
        ))}
        {markers.map((m, i) => (
          <g key={i}>
            <line x1={m.x} x2={m.x} y1={PAD_T - 12} y2={H - PAD_B} stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
            <text x={m.x} y={PAD_T - 16} fontSize="10" fill="var(--accent)" textAnchor="middle" fontFamily="monospace" fontWeight="700">
              v{m.version}
            </text>
          </g>
        ))}
        {segs.map((s, i) => (
          <path
            key={i}
            d={s.map((p, j) => `${j ? "L" : "M"}${X(p.date).toFixed(1)},${Y(p.value!).toFixed(1)}`).join(" ")}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
          />
        ))}
        {scored.map((p) => (
          <g key={p.date + p.methodology_version}>
            <circle cx={X(p.date)} cy={Y(p.value!)} r="4" fill="var(--accent)" stroke="var(--bg)" strokeWidth="1.5">
              <title>{`${p.date} · Reality ${p.value!.toFixed(1)} · v${p.methodology_version ?? "?"} · ${p.status}`}</title>
            </circle>
          </g>
        ))}
        {pts
          .filter((p) => p.value == null)
          .map((p, i) => (
            <g key={`gap-${i}`}>
              <circle cx={X(p.date)} cy={H - PAD_B} r="3.5" fill="none" stroke="var(--text-faint)" strokeWidth="1.5">
                <title>{`${p.date} · no data (gap)`}</title>
              </circle>
            </g>
        ))}
        {body.events.map((e, i) => (
          <g key={`ev-${i}`}>
            <line x1={X(e.date)} x2={X(e.date)} y1={PAD_T - 12} y2={PAD_T - 4} stroke="var(--text-dim)" strokeWidth="1.5" />
            <circle cx={X(e.date)} cy={PAD_T - 14} r="3" fill="var(--text-dim)">
              <title>{`${e.date} · ${e.type.replace(/_/g, " ")} — ${e.title}`}</title>
            </circle>
          </g>
        ))}
        {scored.map((p, i) =>
          i % Math.ceil(scored.length / 6) === 0 ? (
            <text key={`lbl-${i}`} x={X(p.date)} y={H - 8} fontSize="10" fill="var(--text-faint)" textAnchor="middle" fontFamily="monospace">
              {p.date.slice(5)}
            </text>
          ) : null,
        )}
      </svg>
      <div className="legend" style={{ marginTop: 8 }}>
        <span><span className="dot" style={{ background: "var(--accent)" }} /> Reality score</span>
        <span><span className="dot" style={{ background: "transparent", border: "1.5px solid var(--text-faint)" }} /> Data gap (no line drawn)</span>
        <span><span className="dot" style={{ background: "var(--text-dim)" }} /> Project event (hover)</span>
        <span style={{ color: "var(--text-faint)" }}>Dashed ticks mark methodology versions.</span>
      </div>
    </div>
  );
}
