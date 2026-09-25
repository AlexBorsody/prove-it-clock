/**
 * Prove-It timeline — pure presentational SVG, zero dependencies, no client JS.
 *
 * This is the shared renderer behind both the interactive project-page chart
 * (`timeline-chart.tsx`, a client wrapper that adds legend toggles and the
 * event panel) and the server-rendered embeddable widget
 * (`app/(embed)/embed/projects/[slug]/timeline`).
 *
 * Render contract (never change without a methodology reason):
 * - One line per scored metric. Nulls break the line — gaps, never
 *   interpolation or zero-fill.
 * - Methodology changes get a vertical dashed marker + version label.
 * - Project events are annotated dots with SVG <title> tooltips.
 * - Unscored projects render the explicit unavailable state — never an empty
 *   chart and never chart lines.
 *
 * Colors are explicit hexes (light/dark palettes), never CSS vars, so the SVG
 * renders identically inside the app and inside a third-party iframe.
 */

export interface SvgPoint {
  date: string;
  methodology_version: string | null;
  value: number | null;
  status: string;
}

export interface SvgEvent {
  date: string;
  type: string;
  title: string;
  evidence_summary: string;
}

export interface TimelineBody {
  slug: string;
  name: string;
  metrics: Record<string, SvgPoint[]>;
  events: SvgEvent[];
}

export interface TimelinePalette {
  bg: string;
  border: string;
  text: string;
  dim: string;
  faint: string;
  accent: string;
  blue: string;
  green: string;
  purple: string;
  red: string;
  teal: string;
  pink: string;
  orange: string;
}

/** Matches the app's research-terminal theme (globals.css :root). */
export const DARK_PALETTE: TimelinePalette = {
  bg: "#0a0e14",
  border: "#1f2937",
  text: "#d7dee9",
  dim: "#8b96a8",
  faint: "#5b6577",
  accent: "#f0b429",
  blue: "#58a6ff",
  green: "#3fb950",
  purple: "#bc8cff",
  red: "#f85149",
  teal: "#39c5cf",
  pink: "#f778ba",
  orange: "#f0883e",
};

export const LIGHT_PALETTE: TimelinePalette = {
  bg: "#ffffff",
  border: "#dfe4ea",
  text: "#17202e",
  dim: "#5b6577",
  faint: "#8b96a8",
  accent: "#a86e00",
  blue: "#0969da",
  green: "#1a7f37",
  purple: "#8250df",
  red: "#cf222e",
  teal: "#0d7d8c",
  pink: "#d34b8f",
  orange: "#c2510c",
};

const W = 680;
const H = 230;
const PAD_L = 44;
const PAD_R = 16;
const PAD_T = 30;
const PAD_B = 30;

function day(d: string): number {
  return new Date(d + "T00:00:00Z").getTime();
}

function prettyCode(code: string): string {
  return code.replace(/_/g, " ");
}

export interface TimelineSvgProps {
  body: TimelineBody;
  palette: TimelinePalette;
  /** Metric codes to hide (client legend toggles). */
  hidden?: ReadonlySet<string>;
  /** When provided, legend entries become clickable toggles. */
  onToggleMetric?: (code: string) => void;
  selectedEvent?: SvgEvent | null;
  /** When provided, event dots become clickable. */
  onSelectEvent?: (e: SvgEvent | null) => void;
  /** Fills the SVG background (embed); the in-app chart is transparent. */
  fillBackground?: boolean;
}

export default function TimelineSvg({
  body,
  palette: p,
  hidden,
  onToggleMetric,
  selectedEvent,
  onSelectEvent,
  fillBackground = false,
}: TimelineSvgProps) {
  // One color per score category — stable across projects and renders.
  const CODE_COLORS: Record<string, keyof TimelinePalette> = {
    promises_kept: "orange",
    reality: "accent",
    execution_evidence: "green",
    world_impact_potential: "blue",
    reflexivity_risk: "red",
    token_necessity: "purple",
    token_value_capture: "dim",
    promise_gap: "teal",
    potential_outlook: "pink",
  };
  const FALLBACK = ["accent", "blue", "green", "purple", "red", "teal", "pink", "dim", "orange"] as const;
  const colorOf = (code: string) => {
    const key = CODE_COLORS[code] ?? FALLBACK[codes.indexOf(code) % FALLBACK.length];
    return p[key];
  };

  // Stable series order — the card's stat order, not API insertion order.
  const CODE_ORDER = [
    "promises_kept",
    "reality",
    "execution_evidence",
    "world_impact_potential",
    "reflexivity_risk",
    "token_necessity",
    "token_value_capture",
    "promise_gap",
    "potential_outlook",
  ];
  const codes = Object.keys(body.metrics)
    .filter((c) => body.metrics[c].some((pt) => pt.value != null))
    .sort((a, b) => {
      const ia = CODE_ORDER.indexOf(a);
      const ib = CODE_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

  if (codes.length === 0) {
    const eventCount = body.events.length;
    return (
      <div style={{ fontSize: 13, lineHeight: 1.5, color: p.dim }}>
        <p style={{ margin: "0 0 8px" }}>
          <b style={{ color: p.text }}>No scored history.</b> No verified
          snapshot history exists for this project. It is explicitly
          unavailable, not estimated and not zero-filled.
        </p>
        {eventCount > 0 && (
          <p style={{ margin: 0 }}>
            {eventCount} recorded event{eventCount === 1 ? "" : "s"}. Events
            are evidence, not scores.
          </p>
        )}
      </div>
    );
  }

  const all = codes
    .flatMap((c) => body.metrics[c])
    .sort((a, b) => day(a.date) - day(b.date));
  const scored = all.filter((pt) => pt.value != null);
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
  for (const pt of all.slice().sort((a, b) => day(a.date) - day(b.date))) {
    if (pt.methodology_version !== lastVer) {
      lastVer = pt.methodology_version;
      if (lastVer) markers.push({ x: X(pt.date), version: lastVer });
    }
  }

  // Per-metric line segments: break wherever a value is null.
  const segmentsFor = (code: string): SvgPoint[][] => {
    const pts = body.metrics[code].slice().sort((a, b) => day(a.date) - day(b.date));
    const segs: SvgPoint[][] = [];
    let cur: SvgPoint[] = [];
    for (const pt of pts) {
      if (pt.value == null) {
        if (cur.length) segs.push(cur);
        cur = [];
      } else cur.push(pt);
    }
    if (cur.length) segs.push(cur);
    return segs;
  };

  const scoredDates = scored.map((pt) => pt.date).sort();
  const tickStep = Math.max(1, Math.ceil(scoredDates.length / 6));
  const gridVals = [0, 2.5, 5, 7.5, 10];
  const isHidden = (code: string) => hidden?.has(code) ?? false;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", display: "block" }}
        role="img"
        aria-label={`Score history for ${body.name}`}
      >
        {fillBackground && <rect x="0" y="0" width={W} height={H} fill={p.bg} />}
        {gridVals.map((g) => (
          <g key={g}>
            <line x1={PAD_L} x2={W - PAD_R} y1={Y(g)} y2={Y(g)} stroke={p.border} strokeWidth="1" />
            <text x={PAD_L - 8} y={Y(g) + 4} fontSize="10" fill={p.faint} textAnchor="end" fontFamily="monospace">
              {g}
            </text>
          </g>
        ))}
        {markers.map((m, i) => (
          <g key={`v-${i}`}>
            <line x1={m.x} x2={m.x} y1={PAD_T - 12} y2={H - PAD_B} stroke={p.accent} strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
            <text x={m.x} y={PAD_T - 16} fontSize="10" fill={p.accent} textAnchor="middle" fontFamily="monospace" fontWeight="700">
              v{m.version}
            </text>
          </g>
        ))}
        {codes.map((code) =>
          isHidden(code) ? null : (
            <g key={code}>
              {segmentsFor(code).map((s, i) => (
                <path
                  key={i}
                  d={s.map((pt, j) => `${j ? "L" : "M"}${X(pt.date).toFixed(1)},${Y(pt.value!).toFixed(1)}`).join(" ")}
                  fill="none"
                  stroke={colorOf(code)}
                  strokeWidth="2.5"
                />
              ))}
            </g>
          ),
        )}
        {codes.map((code) =>
          isHidden(code)
            ? null
            : body.metrics[code]
                .filter((pt) => pt.value != null)
                .map((pt) => (
                  <circle
                    key={`${code}-${pt.date}-${pt.methodology_version}`}
                    cx={X(pt.date)}
                    cy={Y(pt.value!)}
                    r="3.5"
                    fill={colorOf(code)}
                    stroke={fillBackground ? p.bg : p.bg}
                    strokeWidth="1.5"
                  >
                    <title>{`${pt.date} · ${prettyCode(code)} ${pt.value!.toFixed(1)} · v${pt.methodology_version ?? "?"} · ${pt.status}`}</title>
                  </circle>
                )),
        )}
        {body.events.map((e, i) => {
          const selected = selectedEvent === e;
          return (
            <g
              key={`ev-${i}`}
              onClick={onSelectEvent ? () => onSelectEvent(selected ? null : e) : undefined}
              style={onSelectEvent ? { cursor: "pointer" } : undefined}
            >
              <line x1={X(e.date)} x2={X(e.date)} y1={PAD_T - 12} y2={PAD_T - 4} stroke={selected ? p.accent : p.dim} strokeWidth="1.5" />
              <circle cx={X(e.date)} cy={PAD_T - 14} r={selected ? "5" : "3"} fill={selected ? p.accent : p.dim}>
                <title>{`${e.date} · ${e.type.replace(/_/g, " ")}: ${e.title}`}</title>
              </circle>
            </g>
          );
        })}
        {scoredDates.map((d, i) =>
          i % tickStep === 0 ? (
            <text key={`lbl-${d}`} x={X(d)} y={H - 8} fontSize="10" fill={p.faint} textAnchor="middle" fontFamily="monospace">
              {d.slice(5)}
            </text>
          ) : null,
        )}
      </svg>

      <div style={{ marginTop: 8, fontSize: 12, color: p.dim, display: "flex", flexWrap: "wrap", gap: "4px 14px", alignItems: "center" }}>
        {codes.map((code) => (
          <span
            key={code}
            onClick={onToggleMetric ? () => onToggleMetric(code) : undefined}
            style={
              onToggleMetric
                ? { cursor: "pointer", opacity: isHidden(code) ? 0.4 : 1, textDecoration: isHidden(code) ? "line-through" : "none", display: "inline-flex", alignItems: "center", gap: 6 }
                : { display: "inline-flex", alignItems: "center", gap: 6 }
            }
            title={onToggleMetric ? "Toggle metric" : undefined}
          >
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: colorOf(code) }} /> {prettyCode(code)}
          </span>
        ))}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: p.dim }} /> Project event{onToggleMetric ? " (click)" : ""}
        </span>
        <span style={{ color: p.faint }}>Dashed ticks mark methodology versions. Gaps are missing data: lines break, never interpolate.</span>
      </div>
    </div>
  );
}
