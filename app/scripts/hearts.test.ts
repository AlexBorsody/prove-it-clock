import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateHeartBalance, type HeartBalanceInput, type HeartPromiseInput } from "../src/lib/hearts";

const core = (state: HeartPromiseInput["state"] = "unfulfilled"): HeartPromiseInput =>
  ({ lineage: "core", claimType: "milestone", state, reward: 0, core: true });
const promise = (overrides: Partial<HeartPromiseInput> = {}): HeartPromiseInput =>
  ({ lineage: "delivery", claimType: "ongoing", state: "active", reward: 2, core: false, ...overrides });
const base = (overrides: Partial<HeartBalanceInput> = {}): HeartBalanceInput =>
  ({ capacity: 10, allowance: 2, promises: [core(), promise()], ...overrides });

test("milestone hearts are permanent: an active milestone counts the same forever", () => {
  const old = base({ promises: [core(), { ...promise(), claimType: "milestone", lineage: "ledger-2012", reward: 1 }] });
  assert.equal(old.promises[1].state, "active");
  assert.equal(calculateHeartBalance(old).earned, 1);
  // No time input exists anywhere in the model to erode it.
  assert.ok(!("yearsSinceFulfillment" in old));
});

test("ongoing lapse drops the heart; reactivation restores it", () => {
  const adLoop = promise({ lineage: "ad-loop" });
  const creators = promise({ lineage: "creators", reward: 1 });
  const active = base({ promises: [core(), adLoop, creators] });
  assert.equal(calculateHeartBalance(active).filled, 5); // 3 earned + 2 allowance, core open
  const lapsed = base({ promises: [core(), { ...adLoop, state: "lapsed" }, creators] });
  assert.equal(calculateHeartBalance(lapsed).filled, 3); // the -2 stays visible as a fall
  const reactivated = base({ promises: [core(), { ...adLoop, state: "active" }, creators] });
  assert.equal(calculateHeartBalance(reactivated).filled, 5); // rise back, same evidence rule
});

test("retirement removes hearts visibly without rewriting history", () => {
  const moneygram = promise({ lineage: "moneygram", reward: 1 });
  const before = base({ promises: [core(), promise({ lineage: "payments" }), moneygram] });
  assert.equal(calculateHeartBalance(before).earned, 3);
  const after = base({ promises: [core(), promise({ lineage: "payments" }), { ...moneygram, state: "retired" }] });
  assert.equal(calculateHeartBalance(after).earned, 2);
});

test("milestones cannot lapse, only ongoing claims can", () => {
  assert.throws(() => calculateHeartBalance(base({
    promises: [core(), { ...promise(), claimType: "milestone", state: "lapsed" }],
  })), /cannot lapse/);
  assert.doesNotThrow(() => calculateHeartBalance(base({
    promises: [core(), { ...promise(), claimType: "ongoing", state: "lapsed" }],
  })));
});

test("allowance is present-tense and capped; nothing decays it", () => {
  assert.equal(calculateHeartBalance(base({ allowance: 2 })).allowance, 2);
  assert.equal(calculateHeartBalance(base({ allowance: 0 })).filled, 2);
  assert.throws(() => calculateHeartBalance(base({ allowance: 3 })), /checklist\/capacity limit 2/);
  assert.equal(calculateHeartBalance(base({ capacity: 20, allowance: 3 })).allowance, 3);
  assert.throws(() => calculateHeartBalance(base({ capacity: 20, allowance: 4 })), /checklist\/capacity limit 3/);
});

test("core and capacity clipping reconcile the displayed total without erasing contributions", () => {
  const result = calculateHeartBalance(base({
    capacity: 5, allowance: 1,
    promises: [core(), promise({ reward: 2 }), promise({ lineage: "b", reward: 2 }), promise({ lineage: "c", reward: 2 })],
  }));
  assert.deepEqual(result, {
    capacity: 5, earned: 6, allowance: 1, unboundedTotal: 7,
    capacityClipped: 2, coreClipped: 1, coreFulfilled: false, filled: 4,
  });
  assert.equal(result.earned + result.allowance - result.capacityClipped - result.coreClipped, result.filled);
  const gated = calculateHeartBalance(base({ promises: [core("active"), promise({ reward: 2 })] }));
  assert.equal(gated.coreFulfilled, true);
  assert.equal(gated.filled, 4);
  const full = calculateHeartBalance(base({ capacity: 5, allowance: 1, promises: [core("active"),
    promise({ reward: 2 }), promise({ lineage: "b", reward: 2 })] }));
  assert.equal(full.filled, 5, "core fulfillment unlocks the final heart");
});

test("unknown, malformed and impossible inputs cannot become a rating", () => {
  const invalid: Array<() => HeartBalanceInput> = [
    () => base({ capacity: 15 as 10 }),
    () => base({ allowance: -1 }),
    () => base({ allowance: 1.5 }),
    () => base({ promises: [] }),
    () => base({ promises: [promise()] }),
    () => base({ promises: [core(), core("active")] }),
    () => base({ promises: [core(), { ...promise(), reward: 3 as 0 }] }),
    () => base({ promises: [core(), { ...promise(), lineage: "core" }] }),
    () => base({ promises: [core(), { ...promise(), state: "decayed" as HeartPromiseInput["state"] }] }),
    () => base({ promises: [core(), { ...promise(), claimType: "vibes" as HeartPromiseInput["claimType"] }] }),
    () => base({ promises: [{ ...core(), reward: 1 as 0 }] }),
    () => base({ promises: [core(), { ...promise(), lineage: " " }] }),
  ];
  for (const make of invalid) assert.throws(() => calculateHeartBalance(make()));
});
