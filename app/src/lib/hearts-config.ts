/** Adopted September 23 rules. Separate from active legacy v0.2.0 output. */
export const HEART_RULES = Object.freeze({
  capacityTiers: Object.freeze([5, 10, 20] as const),
  checklistItems: 3,
  graceYears: 2,
  decayPerYear: 1,
});

export type HeartCapacity = (typeof HEART_RULES.capacityTiers)[number];
