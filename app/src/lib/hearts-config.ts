/** Promise-heart rule (adopted 2026-09-25): one promise = one heart.
 *  Capacity is the promise count; every fulfilled promise earns exactly
 *  one heart. No tiers, no weighting, no allowance. */
export const HEART_RULES = Object.freeze({
  maxPromises: 1000,
});
