// Ranking factors for the Prove-It Clock.
//
// The chart + card answer one question: is this project full of shit?
// These are the factors that feed the ranking, in the order they lead the display.
//
// kind:
//   core    — the main graph factors: promise timeline, promises kept, potential
//   scored  — v0.2.0 methodology categories (live inputs to card + chart)
//   planned — defined, not yet built; never silently scored
//
// status:
//   live         — on the card/chart today, from a real data source
//   proxy        — displayed via a stand-in while the real factor is thought through
//   planned      — defined here, not yet built
//   needs-thought — Alex: subjective, needs more thought before it becomes a number
//
// Hard rule: nothing here changes the v0.2.0 methodology. A new score or a new
// formula needs a methodology version bump, not a config edit.

export type RankingFactorKind = "core" | "scored" | "planned";
export type RankingFactorStatus = "live" | "proxy" | "planned" | "needs-thought";

export interface RankingFactor {
  key: string;
  name: string;
  kind: RankingFactorKind;
  status: RankingFactorStatus;
  /** The question this factor answers, in plain words. */
  question: string;
  /** Where the data comes from today. */
  source: string;
  /** Open questions, XRP/BTC readings, intended role. */
  note?: string;
}

export interface RankingExample {
  slug: string;
  role: string;
  demonstrates: string;
}

/** XRP is the flagship example, BTC is the control, LINK is the third. Judge the prototype against these three. */
export const RANKING_EXAMPLES: {
  flagship: RankingExample;
  control: RankingExample;
  third: RankingExample;
} = {
  flagship: {
    slug: "xrp",
    role: "flagship",
    demonstrates:
      "Long time promising (14.3y), few promises kept (2/6), real potential — " +
      "but a crowded lane. The flagship proves the model can hold potential and " +
      "competition in tension instead of collapsing them into one number.",
  },
  control: {
    slug: "btc",
    role: "control",
    demonstrates:
      "Long time promising (17.7y) with promises kept (4/6) — the baseline the " +
      "flagship is measured against. If BTC doesn't read as the control, the " +
      "factor weights are wrong, not the data.",
  },
  third: {
    slug: "link",
    role: "third",
    demonstrates:
      "Mid duration (9.3y) with promises mostly kept (4/6) in a narrow lane " +
      "(oracle infrastructure). The specialist case: a clear, bounded promise " +
      "against XRP's broad, crowded one. Tests whether the factors distinguish " +
      "a kept narrow promise from an unkept broad one.",
  },
};

export const RANKING_FACTORS: RankingFactor[] = [  {
    key: "promise_duration",
    name: "Promise duration",
    kind: "core",
    status: "live",
    question: "How long have they been promising?",
    source:
      "launch_date → snapshot date (prove-it age, years). The chart x-axis already " +
      "spans it; the card footer states it.",
    note: "XRP: 14.3y. BTC (control): 17.7y. Duration alone is neutral — it only " +
      "means something against promises kept.",
  },
  {
    key: "promises_kept",
    name: "Promises kept",
    kind: "core",
    status: "live",
    question: "How many promises have they kept?",
    source:
      "Seed milestones: achieved count / total, with achieved_at dates drawn as a " +
      "step series on the chart. Scored projects only — unscored projects stay " +
      "fully unavailable.",
    note: "XRP: 2/6 — the flagship's problem in one number. BTC (control): 4/6. " +
      "This is a presentation series, not a methodology score.",
  },
  {
    key: "potential",
    name: "Overall potential",
    kind: "core",
    status: "needs-thought",
    question: "If they delivered, how much would it matter?",
    source:
      "Current proxy: world_impact_potential (analyst-assessed, v0.2.0). No formula " +
      "invented — this factor is subjective and needs more thought before it " +
      "becomes a number.",
    note:
      "XRP: real potential (bridge asset for cross-border payments) — but the lane " +
      "is crowded, so potential must be read net of competition. No discount " +
      "formula yet; that is the open question.",
  },
  {
    key: "competition",
    name: "Competition",
    kind: "planned",
    status: "planned",
    question: "How many others are doing the same thing?",
    source:
      "Not yet built. Data prerequisite: a lane taxonomy on seeds (e.g. payments, " +
      "store-of-value, smart-contract L1, oracle) so crowdedness is countable. " +
      "Seeds carry no category/tags today.",
    note:
      "XRP flagship case: the payments lane is crowded — potential read net of " +
      "competition. BTC (control): store-of-value lane, thinner competition. " +
      "Intended role: a discount on potential, not a standalone score. Never " +
      "silently activated.",
  },
  {
    key: "ai_assessment",
    name: "AI assessment",
    kind: "planned",
    status: "planned",
    question: "What does a careful analyst conclude from all of the above?",
    source:
      "Planned: nightly pipeline feeds a structured brief (thesis, milestones + " +
      "evidence summaries, events, current scores — the same evidence a human " +
      "analyst sees, nothing hidden) through an OpenAI endpoint using strict " +
      "JSON-schema structured outputs. Precomputed and cached — never per page load.",
    note:
      "Separate track, never blended into the deterministic scores. Output schema: " +
      "score 0–10, rationale bullets, key risks, confidence, one-line verdict. Each " +
      "snapshot stores model id + prompt version + input hash; prompt changes are " +
      "versioned and history is append-only. Display shows the rationale, not just " +
      "the number — an unexplained AI number would be theater. Prerequisites: " +
      "OpenAI API key, model choice (mini-class is plenty at this volume), prompt " +
      "validated against the three examples. Candidate engine for the subjective " +
      "potential factor — undecided. Publisher-holdings disclosure applies (LINK " +
      "is a disclosed interest).",
  },
  {
    key: "reality",
    name: "Reality",
    kind: "scored",
    status: "live",
    question: "What is actually real today?",
    source: "v0.2.0 reality score (0–10), evidence-linked.",
  },
  {
    key: "world_impact_potential",
    name: "World impact potential",
    kind: "scored",
    status: "live",
    question: "If the thesis succeeds, how big is the impact?",
    source:
      "v0.2.0 analyst-assessed score (0–10, final). Current proxy for overall potential.",
  },
  {
    key: "execution_evidence",
    name: "Execution evidence",
    kind: "scored",
    status: "live",
    question: "Is there evidence they are executing?",
    source: "v0.2.0 execution_evidence score (0–10).",
  },
  {
    key: "reflexivity_risk",
    name: "Reflexivity risk",
    kind: "scored",
    status: "live",
    question: "Could attention and price be propping this up?",
    source: "v0.2.0 reflexivity_risk score (0–10). Higher = more reflexive.",
  },
  {
    key: "evidence_confidence",
    name: "Evidence confidence",
    kind: "scored",
    status: "live",
    question: "How much should we trust the numbers above?",
    source: "v0.2.0 reality confidence (0–100%).",
  },
  {
    key: "promise_gap",
    name: "Promise gap",
    kind: "scored",
    status: "live",
    question: "How far is the promise from what's delivered?",
    source: "v0.2.0 promise_gap score (0–10).",
  },
  {
    key: "potential_outlook",
    name: "Potential outlook",
    kind: "scored",
    status: "live",
    question: "Of the promise not yet realized, how much does current execution support capturing?",
    source:
      "v0.2.0 derived: clamp(max(promise_gap,0) × (execution_evidence/10), 0, 10). " +
      "Not a probability or price prediction; uncalibrated until backtesting.",
  },
];

/**
 * Series shown on the chart by default: the main factors.
 * Everything else stays one tap away in the legend — no data is hidden,
 * the main factors just lead. Mirrors the card's stat bars.
 */
export const CHART_DEFAULT_SERIES: readonly string[] = [
  "promises_kept",
  "reality",
  "world_impact_potential",
  "execution_evidence",
  "reflexivity_risk",
  "promise_gap",
  "potential_outlook",
];
