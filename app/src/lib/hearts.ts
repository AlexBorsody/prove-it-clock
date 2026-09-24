import { HEART_RULES, type HeartCapacity } from "./hearts-config";

/**
 * Arithmetic only. Callers must supply reviewed inputs and an explicit S(t).
 * This does not decide which events reset recency, define year boundaries,
 * select evidence, or convert legacy scores into heart ratings.
 */
export interface HeartBalanceInput {
  capacity: HeartCapacity;
  startingAllowance: number;
  earned: number;
  yearsSinceFulfillment: number;
  coreFulfilled: boolean;
}

export interface HeartBalance {
  capacity: HeartCapacity;
  earned: number;
  allowance: number;
  unboundedTotal: number;
  capacityClipped: number;
  coreClipped: number;
  filled: number;
}

function nonnegativeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${name} must be a nonnegative safe integer`);
  }
}

export function calculateHeartBalance(input: HeartBalanceInput): HeartBalance {
  if (!(HEART_RULES.capacityTiers as readonly number[]).includes(input.capacity)) {
    throw new Error("capacity must be 5, 10 or 20");
  }
  nonnegativeInteger(input.startingAllowance, "startingAllowance");
  nonnegativeInteger(input.earned, "earned");
  const allowanceCap = Math.min(HEART_RULES.checklistItems, Math.floor(input.capacity / 5));
  if (input.startingAllowance > allowanceCap) {
    throw new Error(`startingAllowance exceeds checklist/capacity limit ${allowanceCap}`);
  }
  if (!Number.isFinite(input.yearsSinceFulfillment) || input.yearsSinceFulfillment < 0) {
    throw new Error("yearsSinceFulfillment must be finite and nonnegative");
  }
  if (typeof input.coreFulfilled !== "boolean") {
    throw new Error("coreFulfilled must be an explicit boolean");
  }
  const elapsedSteps = Math.floor(Math.max(0, input.yearsSinceFulfillment - HEART_RULES.graceYears));
  const allowance = Math.max(0, input.startingAllowance - elapsedSteps * HEART_RULES.decayPerYear);
  const unboundedTotal = input.earned + allowance;
  if (!Number.isSafeInteger(unboundedTotal)) throw new Error("total exceeds safe integer range");
  const boundedTotal = Math.min(input.capacity, unboundedTotal);
  const filled = Math.min(boundedTotal, input.coreFulfilled ? input.capacity : input.capacity - 1);
  return {
    capacity: input.capacity,
    earned: input.earned,
    allowance,
    unboundedTotal,
    capacityClipped: unboundedTotal - boundedTotal,
    coreClipped: boundedTotal - filled,
    filled,
  };
}
