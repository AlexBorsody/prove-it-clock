// Milestone states for the Prove-It Clock.
//
// A promise is not binary. Seeds used to know only achieved true/false —
// that can't distinguish "still trying" from "quietly dropped it", and the
// fulfillment ratio needs the distinction.
//
// Stored states: open | fulfilled | abandoned | superseded.
// "overdue" is DERIVED (open + target_date in the past), never stored.
//
// Anti-gaming rule: abandoning a promise never improves the score. A broken
// promise leaves the denominator only when a NEW accountable commitment
// replaces it (superseded, linked). You can't shrink your way to a better ratio.
//
// Design truth lives in docs/implementation.md Part 1 ("Milestone states");
// this file mirrors it for the pipeline. Decided 2026-09-21.

export type MilestoneState = "open" | "fulfilled" | "abandoned" | "superseded";

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
    meaning: "A live promise. Still on the books until fulfilled, abandoned, or superseded.",
    stored: true,
    inDenominator: true,
    inNumerator: false,
  },
  {
    state: "fulfilled",
    meaning: "Kept, with achieved_at + evidence. A late delivery still counts — fulfilled is fulfilled; the lateness shows in recency and the record.",
    stored: true,
    inDenominator: true,
    inNumerator: true,
  },
  {
    state: "abandoned",
    meaning: "The project stopped pursuing it (team said so, or evidence shows it's dead). Terminal.",
    stored: true,
    inDenominator: true,
    inNumerator: false,
  },
  {
    state: "superseded",
    meaning: "Replaced by a newer promise, linked via superseded_by. Terminal. The only way out of the denominator — and only into a new commitment.",
    stored: true,
    inDenominator: false,
    inNumerator: false,
  },
];

/** overdue = open AND target_date < today. Derived at read time, never stored. */
export const OVERDUE_RULE =
  "state == 'open' and target_date is not null and target_date < as_of_date";

/**
 * Allowed transitions. Overdue is a view, not a state, so it never appears here.
 * Abandoned and superseded are terminal.
 */
export const MILESTONE_TRANSITIONS: Record<MilestoneState, MilestoneState[]> = {
  open: ["fulfilled", "abandoned", "superseded"],
  fulfilled: [],
  abandoned: [],
  superseded: [],
};

/**
 * Fulfillment at any date t:
 *   F(t) = fulfilled(t) / (fulfilled(t) + open(t) + overdue(t) + abandoned(t))
 * where a milestone counts at t if published_at <= t (it existed then),
 * and counts as fulfilled at t if achieved_at <= t.
 */
export const FULFILLMENT_RULE =
  "F(t) = fulfilled(t) / (fulfilled(t) + open(t) + overdue(t) + abandoned(t))";

/** Fields every milestone carries (seed JSON + DB). */
export const MILESTONE_SCHEMA_FIELDS = [
  "state", // MilestoneState; backfill: achieved=true -> fulfilled, else open
  "target_date", // nullable; no date means open, never overdue — we don't invent dates
  "published_at", // when the promise entered the public record; drives the historical denominator
  "superseded_by", // milestone link, set only when state == superseded
  "state_note", // who called abandoned/superseded and why; evidence-linked
] as const;
