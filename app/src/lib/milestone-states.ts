// Promise states for the Prove-It instrument.
//
// Canonical states (decided 2026-09-25): open / active / fulfilled / lapsed / retired.
// - open: the promise is on the books, not yet delivered.
// - active: live pursuit with evidence of progress, not yet delivered.
// - fulfilled: delivered against its success criterion. Earns hearts.
// - lapsed: deadline passed unfulfilled, or an ongoing claim's evidence stopped.
//   Terminal for milestones; an ongoing claim may reactivate on new evidence.
// - retired: the team withdrew it. Terminal. The fall stays visible.
//
// A promise is not binary. Seeds used to know only achieved true/false —
// that can't distinguish "still trying" from "quietly dropped it", and the
// fulfillment ratio needs the distinction.
//
// "overdue" is DERIVED (a live promise + target_date in the past), never stored.
//
// Anti-gaming rule: a dead promise never improves the score by disappearing.
// Only a NEW accountable commitment gets a promise out of the denominator,
// and the old lineage stays on the record as retired with a note pointing at
// the replacement. (The old pipeline called this "superseded"; it is not a
// canonical state, just a retired lineage with a replacement link.)
//
// Design truth lives in docs/implementation.md, Hearts algorithm appendix ("Per-project inputs");
// this file mirrors it for the pipeline. Updated 2026-09-25.

export type MilestoneState = "open" | "active" | "fulfilled" | "lapsed" | "retired";

export interface MilestoneStateDef {
  state: MilestoneState;
  /** What it means, in plain words. */
  meaning: string;
  /** Stored in the seed/DB, or derived at read time. */
  stored: boolean;
  /** Whether it counts in the fulfillment denominator. */
  inDenominator: boolean;
  /** Whether it counts in the fulfillment numerator. */
  inNumerator: boolean;
}

export const MILESTONE_STATES: MilestoneStateDef[] = [
  {
    state: "open",
    meaning: "A live promise. On the books, not yet delivered.",
    stored: true,
    inDenominator: true,
    inNumerator: false,
  },
  {
    state: "active",
    meaning: "Live pursuit with evidence of progress, not yet delivered.",
    stored: true,
    inDenominator: true,
    inNumerator: false,
  },
  {
    state: "fulfilled",
    meaning: "Kept, with evidence. A late delivery still counts — fulfilled is fulfilled; the lateness shows in the record.",
    stored: true,
    inDenominator: true,
    inNumerator: true,
  },
  {
    state: "lapsed",
    meaning: "Deadline passed unfulfilled, or an ongoing claim's evidence stopped. Terminal for milestones; ongoing claims may reactivate.",
    stored: true,
    inDenominator: true,
    inNumerator: false,
  },
  {
    state: "retired",
    meaning: "The project stopped pursuing it (team said so, or evidence shows it's dead). Terminal.",
    stored: true,
    inDenominator: true,
    inNumerator: false,
  },
];

/** overdue = a live promise (open or active) AND target_date < today. Derived at read time, never stored. */
export const OVERDUE_RULE =
  "state in ('open','active') and target_date is not null and target_date < as_of_date";

/**
 * Allowed transitions. Overdue is a view, not a state, so it never appears here.
 * Lapsed (for milestones) and retired are terminal.
 */
export const MILESTONE_TRANSITIONS: Record<MilestoneState, MilestoneState[]> = {
  open: ["active", "fulfilled", "lapsed", "retired"],
  active: ["fulfilled", "lapsed", "retired"],
  fulfilled: [],
  lapsed: [],
  retired: [],
};

/**
 * Fulfillment at any date t:
 *   F(t) = fulfilled(t) / (fulfilled(t) + open(t) + active(t) + overdue(t) + lapsed(t) + retired(t))
 * where a promise counts at t if it existed then, and counts as fulfilled
 * at t if the evidence condition held at t.
 */
export const FULFILLMENT_RULE =
  "F(t) = fulfilled(t) / (fulfilled(t) + open(t) + active(t) + overdue(t) + lapsed(t) + retired(t))";

/** Fields every promise lineage carries (seed JSON + DB). */
export const MILESTONE_SCHEMA_FIELDS = [
  "state", // MilestoneState; backfill: achieved=true -> fulfilled, else open
  "target_date", // nullable; no date means open/active, never overdue — we don't invent dates
  "published_at", // when the promise entered the public record; drives the historical denominator
  "replaced_by", // promise link, set when a retired lineage is replaced by a new commitment
  "state_note", // who called lapsed/retired and why; evidence-linked
] as const;
