// Historical series semantics for the Prove-It Clock chart.
//
// The main graph line is an accountability timeline. Every point on it must
// be inspectable: the viewer can ask "what did you know, and when did you
// know it?" These are the series types. Design truth lives in
// docs/implementation.md Part 1 ("The graph"); this file mirrors it.
// Decided 2026-09-21.

export type SeriesType = "observed" | "reconstructed" | "methodology-change" | "missing";

export interface SeriesTypeDef {
  type: SeriesType;
  /** What it means, in plain words. */
  meaning: string;
  /** How the viewer sees it. */
  rendering: string;
}

export const SERIES_TYPES: SeriesTypeDef[] = [
  {
    type: "observed",
    meaning:
      "Computed from the record as it stood at date t. Numerator: milestones " +
      "with achieved_at <= t. Denominator: milestones with published_at <= t " +
      "(only promises that existed then — no hindsight).",
    rendering: "Solid line. The default claim of the chart.",
  },
  {
    type: "reconstructed",
    meaning:
      "Today's knowledge applied backward — e.g. today's full milestone set " +
      "used as the historical denominator. Useful, but not the true series.",
    rendering:
      "Visually distinct (dashed/dimmed) and LABELED as reconstructed. Until " +
      "seeds carry published_at, the historical Promise Score line is " +
      "reconstructed — never presented as the true historical series.",
  },
  {
    type: "methodology-change",
    meaning:
      "A vertical marker where the methodology version changed. Scores across " +
      "the line are not comparable — the ruler itself moved.",
    rendering: "Axis marker with version label (already on the chart).",
  },
  {
    type: "missing",
    meaning:
      "No data for the interval — unscored project, unavailable component, " +
      "or a gap in the pipeline. Never zero-filled, never interpolated.",
    rendering: "Gap in the line. Explicit unavailable state, not an empty chart.",
  },
];

/**
 * Which type a historical stretch gets. The pipeline decides per point;
 * the chart renders per the definitions above.
 */
export const SERIES_TYPE_RULES = [
  "If every milestone in the denominator has published_at, the stretch is observed.",
  "If any milestone lacks published_at, the stretch is reconstructed until researched.",
  "A methodology version boundary always renders a methodology-change marker, regardless of type.",
  "Null values always render as missing (gap), never interpolated.",
] as const;
