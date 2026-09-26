import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateHeartBalance, normalizePromiseState, type HeartBalanceInput, type HeartPromiseInput } from "../src/lib/hearts";

const core = (state: HeartPromiseInput["state"] = "open"): HeartPromiseInput =>
  ({ lineage: "core", claimType: "milestone", state, core: true });
const promise = (overrides: Partial<HeartPromiseInput> = {}): HeartPromiseInput =>
  ({ lineage: "delivery", claimType: "ongoing", state: "fulfilled", core: false, ...overrides });
const base = (overrides: Partial<HeartBalanceInput> = {}): HeartBalanceInput =>
  ({ promises: [core(), promise()], ...overrides });

test("one promise = one heart: capacity is the promise count", () => {
  const result = calculateHeartBalance(base());
  assert.deepEqual(result, { capacity: 2, earned: 1, filled: 1, coreFulfilled: false });
  const three = base({ promises: [core(), promise(), promise({ lineage: "b", state: "open" })] });
  assert.equal(calculateHeartBalance(three).capacity, 3);
  assert.equal(calculateHeartBalance(three).earned, 1);
});

test("milestone hearts are permanent: a fulfilled milestone counts the same forever", () => {
  const old = base({ promises: [core(), { ...promise(), claimType: "milestone", lineage: "ledger-2012" }] });
  assert.equal(old.promises[1].state, "fulfilled");
  assert.equal(calculateHeartBalance(old).earned, 1);
  // No time input exists anywhere in the model to erode it.
  assert.ok(!("yearsSinceFulfillment" in old));
});

test("ongoing lapse drops the heart; reactivation restores it", () => {
  const adLoop = promise({ lineage: "ad-loop" });
  const creators = promise({ lineage: "creators" });
  const active = base({ promises: [core(), adLoop, creators] });
  assert.equal(calculateHeartBalance(active).filled, 2);
  const lapsed = base({ promises: [core(), { ...adLoop, state: "lapsed" }, creators] });
  assert.equal(calculateHeartBalance(lapsed).filled, 1); // the -1 stays visible as a fall
  const reactivated = base({ promises: [core(), { ...adLoop, state: "fulfilled" }, creators] });
  assert.equal(calculateHeartBalance(reactivated).filled, 2); // rise back, same evidence rule
});

test("retirement removes hearts visibly without rewriting history", () => {
  const moneygram = promise({ lineage: "moneygram" });
  const before = base({ promises: [core(), promise({ lineage: "payments" }), moneygram] });
  assert.equal(calculateHeartBalance(before).earned, 2);
  const after = base({ promises: [core(), promise({ lineage: "payments" }), { ...moneygram, state: "retired" }] });
  assert.equal(calculateHeartBalance(after).earned, 1);
});

test("milestones cannot lapse, only ongoing claims can", () => {
  assert.throws(() => calculateHeartBalance(base({
    promises: [core(), { ...promise(), claimType: "milestone", state: "lapsed" }],
  })), /cannot lapse/);
  assert.doesNotThrow(() => calculateHeartBalance(base({
    promises: [core(), { ...promise(), claimType: "ongoing", state: "lapsed" }],
  })));
});

test("the core promise is a label, not a gate: it earns its heart like any other", () => {
  const coreOpen = calculateHeartBalance(base());
  assert.equal(coreOpen.coreFulfilled, false);
  assert.equal(coreOpen.filled, 1); // no cap-1 gating anymore
  const coreDone = calculateHeartBalance(base({ promises: [core("fulfilled"), promise()] }));
  assert.equal(coreDone.coreFulfilled, true);
  assert.equal(coreDone.earned, 2);
  assert.equal(coreDone.filled, 2);
});

test("unknown, malformed and impossible inputs cannot become a rating", () => {
  const invalid: Array<() => HeartBalanceInput> = [
    () => base({ promises: [] }),
    () => base({ promises: [promise()] }),
    () => base({ promises: [core(), core("fulfilled")] }),
    () => base({ promises: [core(), { ...promise(), lineage: "core" }] }),
    () => base({ promises: [core(), { ...promise(), state: "decayed" as HeartPromiseInput["state"] }] }),
    () => base({ promises: [core(), { ...promise(), claimType: "vibes" as HeartPromiseInput["claimType"] }] }),
    () => base({ promises: [core(), { ...promise(), lineage: " " }] }),
    () => base({ promises: [core(), { ...promise(), core: "yes" as unknown as boolean }] }),
  ];
  for (const make of invalid) assert.throws(() => calculateHeartBalance(make()));
});

test("legacy publication states normalize to the canonical five without changing the math", () => {
  assert.equal(normalizePromiseState("unfulfilled"), "open");
  assert.equal(normalizePromiseState("active"), "fulfilled");
  assert.equal(normalizePromiseState("lapsed"), "lapsed");
  assert.equal(normalizePromiseState("retired"), "retired");
  assert.equal(normalizePromiseState("open"), "open");
  assert.throws(() => normalizePromiseState("decayed"), /invalid promise state/);
  // Old-format input still scores identically: legacy "active" earned, so it must too.
  const legacy = base({ promises: [core(), { ...promise(), state: "unfulfilled" as never }] });
  assert.equal(calculateHeartBalance(legacy).earned, 0);
  const legacyEarning = base({ promises: [core(), { ...promise(), state: "active" as never }] });
  assert.equal(calculateHeartBalance(legacyEarning).earned, 1);
});
