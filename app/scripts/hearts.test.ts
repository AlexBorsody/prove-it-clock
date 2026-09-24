import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateHeartBalance, type HeartBalanceInput } from "../src/lib/hearts";

const base: HeartBalanceInput = {
  capacity: 10, startingAllowance: 2, earned: 0,
  yearsSinceFulfillment: 0, coreFulfilled: false,
};

test("adopted floor rule loses the first heart at S=3, not immediately after S=2", () => {
  for (const [s, expected] of [[0, 2], [2, 2], [2.9, 2], [3, 1], [3.999, 1], [4, 0], [100, 0]]) {
    assert.equal(calculateHeartBalance({ ...base, yearsSinceFulfillment: s }).filled, expected);
  }
});

test("recency reset restores allowance mechanically; earned value does not age away", () => {
  const stale = calculateHeartBalance({ ...base, earned: 3, yearsSinceFulfillment: 10 });
  const reset = calculateHeartBalance({ ...base, earned: 4, yearsSinceFulfillment: 0 });
  assert.equal(stale.filled, 3);
  assert.equal(reset.filled, 6);
});

test("core and capacity clipping reconcile the displayed total without erasing contributions", () => {
  const result = calculateHeartBalance({ ...base, capacity: 5, startingAllowance: 1, earned: 6 });
  assert.deepEqual(result, {
    capacity: 5, earned: 6, allowance: 1, unboundedTotal: 7,
    capacityClipped: 2, coreClipped: 1, filled: 4,
  });
  assert.equal(result.earned + result.allowance - result.capacityClipped - result.coreClipped, result.filled);
  assert.equal(calculateHeartBalance({ ...base, capacity: 5, startingAllowance: 1, earned: 6, coreFulfilled: true }).filled, 5);
  assert.equal(calculateHeartBalance({ ...base, coreFulfilled: true }).filled, 2, "core fulfillment alone does not fill capacity");
});

test("case-study conditional balances reproduce the worksheets without selecting a scenario", () => {
  assert.equal(calculateHeartBalance({ ...base, earned: 4, yearsSinceFulfillment: 1 }).filled, 6);
  assert.equal(calculateHeartBalance({ ...base, earned: 5, yearsSinceFulfillment: 0.25 }).filled, 7);
  assert.equal(calculateHeartBalance({ ...base, earned: 3, yearsSinceFulfillment: 7.4 }).filled, 3);
  for (const a0 of [0, 1, 2, 3]) {
    assert.equal(calculateHeartBalance({ ...base, capacity: 20, startingAllowance: a0, earned: 3, yearsSinceFulfillment: 7.9 }).filled, 3);
    assert.equal(calculateHeartBalance({ ...base, capacity: 20, startingAllowance: a0, earned: 3, yearsSinceFulfillment: 3.05 }).filled, 3 + Math.max(0, a0 - 1));
  }
});

test("unknown, malformed, fractional and impossible inputs cannot become a rating", () => {
  const invalid: Record<string, unknown>[] = [
    { capacity: 15 }, { startingAllowance: 3 }, { capacity: 20, startingAllowance: 4 },
    { earned: -1 }, { earned: 0.5 }, { earned: null }, { earned: Number.MAX_SAFE_INTEGER },
    { yearsSinceFulfillment: -1 }, { yearsSinceFulfillment: Infinity },
    { yearsSinceFulfillment: NaN }, { yearsSinceFulfillment: undefined },
    { coreFulfilled: undefined },
  ];
  for (const overrides of invalid) {
    assert.throws(() => calculateHeartBalance({ ...base, ...overrides } as HeartBalanceInput));
  }
});
