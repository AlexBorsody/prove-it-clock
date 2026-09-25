import { HEART_RULES, type HeartCapacity } from "./hearts-config";

/**
 * Claim-type arithmetic. A heart stays earned only while the evidence condition
 * under which it was awarded remains true. Scores change because evidence
 * changes, never because time passes.
 *
 * - milestone: permanent once active, unless retired. Time cannot unship it.
 * - ongoing: contributes only while active. May lapse and later reactivate.
 *
 * Callers supply reviewed inputs: the current promise states and the
 * present-tense allowance. This does not select evidence or carve lineages.
 */
export type ClaimType = "milestone" | "ongoing";
export type PromiseState = "unfulfilled" | "active" | "lapsed" | "retired";

export interface HeartPromiseInput {
  lineage: string;
  claimType: ClaimType;
  state: PromiseState;
  reward: 0 | 1 | 2;
  core: boolean;
}

export interface HeartBalanceInput {
  capacity: HeartCapacity;
  /** Present-tense checklist score; never derived from elapsed time. */
  allowance: number;
  promises: HeartPromiseInput[];
}

export interface HeartBalance {
  capacity: HeartCapacity;
  earned: number;
  allowance: number;
  unboundedTotal: number;
  capacityClipped: number;
  coreClipped: number;
  coreFulfilled: boolean;
  filled: number;
}

function nonemptyText(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${name} must be nonempty text`);
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
  nonnegativeInteger(input.allowance, "allowance");
  const allowanceCap = Math.min(HEART_RULES.checklistItems, Math.floor(input.capacity / 5));
  if (input.allowance > allowanceCap) {
    throw new Error(`allowance exceeds checklist/capacity limit ${allowanceCap}`);
  }
  if (!Array.isArray(input.promises) || input.promises.length === 0) {
    throw new Error("promises must be a nonempty array");
  }
  const lineages = new Set<string>();
  let coreSeen = false;
  let coreFulfilled = false;
  let earned = 0;
  for (const p of input.promises) {
    nonemptyText(p.lineage, "lineage");
    if (lineages.has(p.lineage)) throw new Error(`duplicate lineage ${p.lineage}`);
    lineages.add(p.lineage);
    if (p.claimType !== "milestone" && p.claimType !== "ongoing") {
      throw new Error(`claimType must be milestone or ongoing (${p.lineage})`);
    }
    if (!["unfulfilled", "active", "lapsed", "retired"].includes(p.state)) {
      throw new Error(`invalid promise state (${p.lineage})`);
    }
    if (p.claimType === "milestone" && p.state === "lapsed") {
      throw new Error(`milestone promises cannot lapse (${p.lineage})`);
    }
    if (![0, 1, 2].includes(p.reward)) throw new Error(`reward must be 0, 1 or 2 (${p.lineage})`);
    if (typeof p.core !== "boolean") throw new Error(`core must be an explicit boolean (${p.lineage})`);
    if (p.core) {
      if (coreSeen || p.reward !== 0) throw new Error("exactly one zero-reward core promise required");
      coreSeen = true;
      coreFulfilled = p.state === "active";
    } else if (p.state === "active") {
      earned += p.reward;
    }
  }
  if (!coreSeen) throw new Error("missing core promise");
  if (!Number.isSafeInteger(earned)) throw new Error("earned exceeds safe integer range");
  const unboundedTotal = earned + input.allowance;
  if (!Number.isSafeInteger(unboundedTotal)) throw new Error("total exceeds safe integer range");
  const boundedTotal = Math.min(input.capacity, unboundedTotal);
  const filled = Math.min(boundedTotal, coreFulfilled ? input.capacity : input.capacity - 1);
  return {
    capacity: input.capacity,
    earned,
    allowance: input.allowance,
    unboundedTotal,
    capacityClipped: unboundedTotal - boundedTotal,
    coreClipped: boundedTotal - filled,
    coreFulfilled,
    filled,
  };
}
