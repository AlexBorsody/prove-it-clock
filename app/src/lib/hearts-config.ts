/** Adopted September 25 rules: claim-type rule, no time decay. Separate from legacy v0.2.0 output. */
export const HEART_RULES = Object.freeze({
  capacityTiers: Object.freeze([5, 10, 20] as const),
  checklistItems: 3,
});

export type HeartCapacity = (typeof HEART_RULES.capacityTiers)[number];
