// v0.3.0 CANDIDATE — the algo sauce, as data.
//
// DESIGN ONLY. NOT ACTIVE. Nothing in this file is imported by the pipeline,
// the API, or the chart. v0.2.0 remains the live methodology. Implementing this
// candidate ships as methodology v0.3.0: append-only, versioned, diffs public.
//
// Design truth lives in docs/implementation.md Part 1 ("The formula"). This file
// is the machine-readable mirror: constants, shapes, and test vectors so the
// implementation (Codex, Part 2) can be verified against the design.
//
// Track 1 — Promise Score: THE RANK. Main line on the graph, sorts the homepage.
// Track 2 — Context Score: THE QUALIFIER. Second line; never overrides Track 1.

export const FORMULA_CANDIDATE_VERSION = "0.3.0-candidate";
export const FORMULA_CANDIDATE_STATUS = "design-only" as const;

export interface PromiseComponentSpec {
  key: string;
  /** Symbol used in the formula. */
  symbol: string;
  weight: number;
  /** Exact definition, in words a non-programmer can follow. */
  definition: string;
  /** Why this normalization, and what would force revisiting it. */
  rationale: string;
}

export const PROMISE_SCORE_CANDIDATE = {
  version: FORMULA_CANDIDATE_VERSION,
  status: FORMULA_CANDIDATE_STATUS,
  scale: [0, 100] as const,
  formula: "100 * (0.40*F + 0.30*C + 0.20*T + 0.10*D)",
  components: [
    {
      key: "fulfillment",
      symbol: "F",
      weight: 0.4,
      definition: "kept / total — what fraction of promises did they keep?",
      rationale:
        "The core of the question ('are they full of shit'). Heaviest weight. " +
        "Needs the seed milestone set; without it the score is unavailable, never zero. " +
        "Note: unachieved rungs count in total regardless of target date — a " +
        "future-dated promise (target 2030) counts as unkept today. Whether " +
        "future-dated promises deserve a grace treatment is an open seed-design question.",
    },
    {
      key: "recency",
      symbol: "C",
      weight: 0.3,
      definition: "exp(-S / 5), S = years since the last kept promise.",
      rationale:
        "Momentum with a 5-year decay: ~37% credit at 5y stale, ~14% at 10y, " +
        "~8% at 12.7y (XRP). A promise kept 12 years ago is archaeology. " +
        "If nothing was ever kept, S = years since launch (stale since birth).",
    },
    {
      key: "throughput",
      symbol: "T",
      weight: 0.2,
      definition: "min((kept / years_promising) / 0.5, 1).",
      rationale:
        "Pace. 0.5 kept promises/year reads as excellent at coarse milestone " +
        "granularity, capped at 1. The 0.5 constant is tied to milestone " +
        "granularity — if seeds get finer milestones, revisit it. Never " +
        "interpreted alone: it punishes longevity without recency context.",
    },
    {
      key: "duration",
      symbol: "D",
      weight: 0.1,
      definition: "min(years_promising / 10, 1).",
      rationale:
        "Credibility: a 10-year timeline is hard to fake; time can't be bought. " +
        "Deliberately small — longevity must not rescue a bad record " +
        "(10y, 0 kept still scores ~14). Capped at 10 years.",
    },
  ] as PromiseComponentSpec[],
  /**
   * The main graph line is a true historical series: for any past date t,
   * recompute all four components from milestones with achieved_date <= t.
   * Not a backfill — the line is earned one snapshot at a time.
   * Caveat: if the seed milestone set changes, history recomputes — that is a
   * methodology event and ships versioned, never silently.
   */
  historical: "recomputable per date t from milestones with achieved_date <= t",
  missingData: "No milestone set -> score unavailable. Never zero, never estimated.",
  conventions: [
    "years_promising = (as_of - launch_date) in days / 365.25, from the seed launch_date.",
    "staleness S = (as_of - latest achieved_at) in days / 365.25; if nothing kept, S = years_promising.",
    "Final score rounded to the nearest integer (standard rounding).",
    "Guards: total = 0 -> unavailable. years_promising <= 0 -> unavailable (too early, never zero).",
  ],
  /**
   * Test vectors for the implementation. Inputs -> expected Promise Score
   * (2026-09-21). Codex verifies against these; any deviation is a defect.
   */
  testVectors: [
    {
      slug: "btc",
      label: "control",
      inputs: { kept: 4, total: 6, years: 17.71, staleness: 2.7 },
      expected: 63,
    },
    {
      slug: "xrp",
      label: "flagship",
      inputs: { kept: 2, total: 6, years: 14.31, staleness: 12.72 },
      expected: 31,
    },
    {
      slug: "link",
      label: "third example",
      inputs: { kept: 4, total: 6, years: 9.31, staleness: 3.72 },
      expected: 67,
      note: "Seed launch_date is 2017-06-01 (not the ICO date) — years must come from seeds, never memory.",
    },
    {
      slug: "hypothetical-new",
      label: "small-sample stress: 1yr, 2/2, just kept",
      inputs: { kept: 2, total: 2, years: 1.0, staleness: 0.0 },
      expected: 91,
      note: "Scores 91 — above BTC. This is the small-sample hole; see open questions. The formula is honest, the ranking bar is the fix.",
    },
    {
      slug: "hypothetical-dead",
      label: "failure stress: 10yr, 0/6, never kept",
      inputs: { kept: 0, total: 6, years: 10.0, staleness: 10.0 },
      expected: 14,
      note: "Duration contributes its 10 points and the verdict is still clearly failing. Acceptable.",
    },
  ],
};

export interface ContextFactorSpec {
  key: string;
  /** Normalization shape. Parameters marked TBD until the factor leaves design. */
  normalization: string;
  weight: number;
  status: "proxy" | "needs-thought" | "planned";
}

export const CONTEXT_SCORE_CANDIDATE = {
  version: FORMULA_CANDIDATE_VERSION,
  status: FORMULA_CANDIDATE_STATUS,
  scale: [0, 100] as const,
  formula: "100 * sum(w_i * x_i) / sum(w_i), over assessed factors only",
  rules: [
    "Each x_i in [0,1]; higher = better for the project's case.",
    "Unassessed factors are EXCLUDED and labeled — never zero-filled, never interpolated.",
    "Default equal weights until tuned; weights are global, never per-project.",
    "The context line updates when analysts (or the AI pipeline) reassess — steppy, versioned, never interpolated.",
    "The context line can never pull the promise line up (anti-hype rule, visual).",
  ],
  factors: [
    {
      key: "potential",
      normalization: "analyst 0-10 -> /10 (current proxy: world_impact_potential)",
      weight: 1,
      status: "needs-thought",
    },
    {
      key: "realism",
      normalization: "qualitative -> low 0.2 / medium 0.5 / high 0.8 (assessment method TBD)",
      weight: 1,
      status: "needs-thought",
    },
    {
      key: "competition",
      normalization: "x = 1/(1+n), n = credible lane competitors (needs lane taxonomy)",
      weight: 1,
      status: "planned",
    },
    {
      key: "token_distribution",
      normalization: "x = 1 - insider_share (founders + team + private + premine; needs honest sourcing)",
      weight: 1,
      status: "planned",
    },
    {
      key: "utility",
      normalization: "usage-against-promise ratio -> 0-1 (needs game-proof definition)",
      weight: 1,
      status: "planned",
    },
    {
      key: "company_structure",
      normalization: "rubric TBD — direction: less single-party control scores higher",
      weight: 1,
      status: "planned",
    },
    {
      key: "dev_activity",
      normalization: "activity vs lane median -> 0-1 (needs repo mapping)",
      weight: 1,
      status: "planned",
    },
  ] as ContextFactorSpec[],
};

/**
 * Decisions made 2026-09-21 (full review pass). Alex delegated these; he can
 * override any of them. Each records the reasoning so the override is informed.
 */
export const FORMULA_DECISIONS = [
  {
    key: "link-beats-btc",
    decision: "LINK 67 > BTC 63 stands on the promise rank.",
    reasoning:
      "Track 1 measures delivery, not greatness. The gap is structural, not a " +
      "tuning artifact: LINK delivers ~2x faster (T 0.86 vs 0.45) and the " +
      "ordering survives reasonable constant changes (3y/7y decay, 0.4 " +
      "throughput anchor all keep LINK ahead). BTC's moat — adoption, Lindy " +
      "effect, decentralization — belongs to the context line, which is " +
      "exactly what the two-track design is for.",
    date: "2026-09-21",
  },
  {
    key: "small-sample-bar",
    decision: "The rank requires >= 3 years promising. Below that: 'too early to rank' (unavailable, never zero).",
    reasoning:
      "A 1-year 2/2 project scores 91 — above BTC. The formula is honest; the " +
      "ranking would be naive without a bar. Single criterion (years, not " +
      "milestone count) because milestone granularity varies by seed. " +
      "On-thesis: the Clock needs time to work.",
    date: "2026-09-21",
  },
  {
    key: "throughput-constant",
    decision: "Keep the 0.5 kept/year = excellent anchor.",
    reasoning:
      "Tied to coarse milestone granularity, documented in the component " +
      "rationale. Revisit only if seeds get finer milestones.",
    date: "2026-09-21",
  },
  {
    key: "recency-scale",
    decision: "Keep the 5-year decay scale.",
    reasoning:
      "Drives the flagship story correctly (XRP 12.7y -> 0.08). 3y would be " +
      "harsher, 7y more patient — 5y is the middle path.",
    date: "2026-09-21",
  },
];

/**
 * Still genuinely open — decided in docs/implementation.md Part 1 before Codex
 * builds. Not decidable yet: nothing here can be tuned before the factors exist.
 */
export const FORMULA_OPEN_QUESTIONS = [
  {
    key: "context-weights",
    question: "Equal weights for context factors, or should realism/potential lead?",
    context:
      "Default equal until tuned. Realism is the fairness lens — a case for weighting it above the rest.",
  },
];
