"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Prove-It timeline: handwritten SVG, zero dependencies.
 *
 * - One line per scored metric (toggleable via the legend).
 * - Nulls break the line (gaps, never interpolation or zero-fill).
 * - Methodology changes get a vertical dashed marker + version label, so the
 *   viewer always knows which methodology produced which stretch of line.
 * - Project events are annotated dots: hover for a title, click for the full
 *   evidence summary in the panel below.
 * - Unscored projects render an explicit score-unavailable state, never an
 *   empty chart and never chart lines.
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
  evidence_summary: string;
}

interface HistoryBody {
  slug: string;
  name: string;
  metrics: Record<string, Point[]>;
  events: HistEvent[];
}

const W = 680;
const H = 230;
const PAD_L = 44;
const PAD_R = 16;
const PAD_T = 30;
const PAD_B = 30;

const PALETTE = [
  "var(--accent)",
  "var(--blue)",
  "var(--green)",
  "var(--purple)",
  "var(--red)",
  "var(--text-dim)",
];

function day(d: string): number {
  return new Date(d + "T00:00:00Z").getTime();
}

function prettyCode(code: string): string {
  return code.replace(/_/g, " ");
}

export default function TimelineChart({ slug }: { slug: string }) {
  const [body, setBody] = useState<HistoryBody | null>(null);
  const [failed, setFailed] = useState(false);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<HistEvent | null>(null);

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

  const model = useMemo(() => {
    if (!body) return null;
    const codes = Object.keys(body.metrics).filter((c) =>
      body.metrics[c].some((p) => p.value != null),
    );
    if (codes.length === 0) return null;
    const all = codes
      .flatMap((c) => body.metrics[c])
      .sort((a, b) => day(a.date) - day(b.date));
    const scored = all.filter((p) => p.value != null);
    const t0 = Math.min(day(scored[0].date), ...body.events.map((e) => day(e.date)));
    const t1 = Math.max(
      day(scored[scored.length - 1].date),
      ...body.events.map((e) => day(e.date)),
    );
    const span = Math.max(t1 - t0, 86400000);
    const X = (d: string) => PAD_L + ((day(d) - t0) / span) * (W - PAD_L - PAD_R);
    const Y = (v: number) => PAD_T + (1 - v / 10) * (H - PAD_T - PAD_B);

    // Methodology change markers across the union of points.
    const markers: { x: number; version: string }[] = [];
    let lastVer: string | null = null;
    for (const p of all.slice().sort((a, b) => day(a.date) - day(b.date))) {
      if (p.methodology_version !== lastVer) {
        lastVer = p.methodology_version;
        if (lastVer) markers.push({ x: X(p.date), version: lastVer });
      }
    }

    const colorOf = (code: string) => PALETTE[codes.indexOf(code) % PALETTE.length];
    return { codes, X, Y, markers, colorOf, scored };
  }, [body]);

  if (failed) {
    return <p className="panel-sub" style={{ margin: 0 }}>Timeline unavailable — history request failed.</p>;
  }
  if (!body) {
    return <p className="panel-sub" style={{ margin: 0 }}>Loading timeline…</p>;
  }
  if (!model) {
    const eventCount = body.events.length;
    return (
      <div>
        <p className="panel-sub" style={{ margin: "0 0 8px" }}>
          <b>No scored history.</b> No verified snapshot history exists for this
          project — it is explicitly unavailable, not estimated and not zero-filled.
        </p>
        {eventCount > 0 && (
          <p className="panel-sub" style={{ margin: 0 }}>
            {eventCount} recorded event{eventCount === 1 ? "" : "s"} below — events are
            evidence, not scores.
          </p>
        )}
      </div>
    );
  }

  const { codes, X, Y, markers, colorOf } = model;
  const gridVals = [0, 2.5, 5, 7.5, 10];

  const toggle = (code: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  // Per-metric line segments: break wherever a value is null.
  const segmentsFor = (code: string): Point[][] => {
    const pts = body.metrics[code].slice().sort((a, b) => day(a.date) - day(b.date));
    const segs: Point[][] = [];
    let cur: Point[] = [];
    for (const p of pts) {
      if (p.value == null) {
        if (cur.length) segs.push(cur);
        cur = [];
      } else cur.push(p);
    }
    if (cur.length) segs.push(cur);
    return segs;
  };

  const scoredDates = model.scored.map((p) => p.date).sort();
  const tickStep = Math.max(1, Math.ceil(scoredDates.length / 6));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720 }} role="img" aria-label={`Score history for ${body.name}`}>
        {gridVals.map((g) => (
          <g key={g}>
            <line x1={PAD_L} x2={W - PAD_R} y1={Y(g)} y2={Y(g)} stroke="var(--border)" strokeWidth="1" />
            <text x={PAD_L - 8} y={Y(g) + 4} fontSize="10" fill="var(--text-faint)" textAnchor="end" fontFamily="monospace">
              {g}
            </text>
          </g>
        ))}
        {markers.map((m, i) => (
          <g key={`v-${i}`}>
            <line x1={m.x} x2={m.x} y1={PAD_T - 12} y2={H - PAD_B} stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
            <text x={m.x} y={PAD_T - 16} fontSize="10" fill="var(--accent)" textAnchor="middle" fontFamily="monospace" fontWeight="700">
              v{m.version}
            </text>
          </g>
        ))}
        {codes.map((code) =>
          hidden.has(code) ? null : (
            <g key={code}>
              {segmentsFor(code).map((s, i) => (
                <path
                  key={i}
                  d={s.map((p, j) => `${j ? "L" : "M"}${X(p.date).toFixed(1)},${Y(p.value!).toFixed(1)}`).join(" ")}
                  fill="none"
                  stroke={colorOf(code)}
                  strokeWidth="2.5"
                />
              ))}
            </g>
          ),
        )}
        {codes.map((code) =>
          hidden.has(code)
            ? null
            : body.metrics[code]
                .filter((p) => p.value != null)
                .map((p) => (
                  <circle
                    key={`${code}-${p.date}-${p.methodology_version}`}
                    cx={X(p.date)}
                    cy={Y(p.value!)}
                    r="3.5"
                    fill={colorOf(code)}
                    stroke="var(--bg)"
                    strokeWidth="1.5"
                  >
                    <title>{`${p.date} · ${prettyCode(code)} ${p.value!.toFixed(1)} · v${p.methodology_version ?? "?"} · ${p.status}`}</title>
                  </circle>
                )),
        )}
        {body.events.map((e, i) => {
          const selected = selectedEvent === e;
          return (
            <g key={`ev-${i}`} onClick={() => setSelectedEvent(selected ? null : e)} style={{ cursor: "pointer" }}>
              <line x1={X(e.date)} x2={X(e.date)} y1={PAD_T - 12} y2={PAD_T - 4} stroke={selected ? "var(--accent)" : "var(--text-dim)"} strokeWidth="1.5" />
              <circle cx={X(e.date)} cy={PAD_T - 14} r={selected ? "5" : "3"} fill={selected ? "var(--accent)" : "var(--text-dim)"}>
                <title>{`${e.date} · ${e.type.replace(/_/g, " ")} — ${e.title}`}</title>
              </circle>
            </g>
          );
        })}
        {scoredDates.map((d, i) =>
          i % tickStep === 0 ? (
            <text key={`lbl-${d}`} x={X(d)} y={H - 8} fontSize="10" fill="var(--text-faint)" textAnchor="middle" fontFamily="monospace">
              {d.slice(5)}
            </text>
          ) : null,
        )}
      </svg>

      <div className="legend" style={{ marginTop: 8 }}>
        {codes.map((code) => (
          <span
            key={code}
            onClick={() => toggle(code)}
            style={{ cursor: "pointer", opacity: hidden.has(code) ? 0.4 : 1, textDecoration: hidden.has(code) ? "line-through" : "none" }}
            title="Toggle metric"
          >
            <span className="dot" style={{ background: colorOf(code) }} /> {prettyCode(code)}
          </span>
        ))}
        <span><span className="dot" style={{ background: "var(--text-dim)" }} /> Project event (click)</span>
        <span style={{ color: "var(--text-faint)" }}>Dashed ticks mark methodology versions. Gaps are missing data — lines break, never interpolate.</span>
      </div>

      {selectedEvent && (
        <div className="panel" style={{ marginTop: 12, marginBottom: 0, padding: "12px 14px" }}>
          <div className="num" style={{ color: "var(--text-faint)", fontSize: 12 }}>
            {selectedEvent.date} · {selectedEvent.type.replace(/_/g, " ")}
          </div>
          <div style={{ fontWeight: 700, margin: "4px 0" }}>{selectedEvent.title}</div>
          <p className="panel-sub" style={{ margin: 0 }}>{selectedEvent.evidence_summary}</p>
        </div>
      )}
    </div>
  );
}
