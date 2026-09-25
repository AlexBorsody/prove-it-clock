import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { verdictFor, type VerdictPromise } from "../src/lib/verdict";
import { codeWord, hypeSummary, useWord } from "../src/lib/heart-data";

const p = (overrides: Partial<VerdictPromise> = {}): VerdictPromise => ({
  lineage: "delivery",
  state: "fulfilled",
  core: false,
  ...overrides,
});

test("clean record: no verified failure -> No concern", () => {
  const v = verdictFor([p(), p({ lineage: "core", core: true, state: "open" })]);
  assert.equal(v.category, "No concern");
  assert.deepEqual(v.failedLineages, []);
});

test("supporting promise retired -> Delivery concern", () => {
  const v = verdictFor([p(), p({ lineage: "moneygram", state: "retired" })]);
  assert.equal(v.category, "Delivery concern");
  assert.deepEqual(v.failedLineages, ["moneygram"]);
});

test("supporting promise lapsed -> Delivery concern", () => {
  const v = verdictFor([p(), p({ lineage: "merchants", state: "lapsed" })]);
  assert.equal(v.category, "Delivery concern");
  assert.deepEqual(v.failedLineages, ["merchants"]);
});

test("core promise retired -> Core delivery failure", () => {
  const v = verdictFor([
    p({ lineage: "core", core: true, state: "retired" }),
    p(),
  ]);
  assert.equal(v.category, "Core delivery failure");
  assert.deepEqual(v.failedLineages, ["core"]);
});

test("core promise lapsed -> Core delivery failure", () => {
  const v = verdictFor([p({ lineage: "core", core: true, state: "lapsed" })]);
  assert.equal(v.category, "Core delivery failure");
});

test("core failure outranks supporting failures", () => {
  const v = verdictFor([
    p({ lineage: "side", state: "retired" }),
    p({ lineage: "core", core: true, state: "lapsed" }),
  ]);
  assert.equal(v.category, "Core delivery failure");
  assert.deepEqual(v.failedLineages, ["core"]);
});

test("Watch is never returned: no v1 trigger", () => {
  for (const promises of [[p()], [], [p({ state: "open" })]]) {
    assert.notEqual(verdictFor(promises).category, "Watch");
  }
});

test("empty promise list -> No concern (never unknown-as-zero)", () => {
  assert.equal(verdictFor([]).category, "No concern");
});

/* Mechanical check: the eight published earned-only assessments must
 * produce exactly the expected verdicts. */
test("published earned-only run: XRP and DASH -> Delivery concern, rest -> No concern", () => {
  const doc = JSON.parse(
    readFileSync(
      "../db/seed/heart-runs-earnedonly/hearts-8project-2026-09-25d-earnedonly.json",
      "utf8"
    )
  );
  const expected: Record<string, string> = {
    btc: "No concern",
    eth: "No concern",
    sol: "No concern",
    link: "No concern",
    avax: "No concern",
    bat: "No concern",
    xrp: "Delivery concern",
    dash: "Delivery concern",
  };
  const seen = new Set<string>();
  for (const proj of doc.projects) {
    const slug: string = proj.slug;
    const promises: VerdictPromise[] = (proj.assessment.promises ?? []).map(
      (x: any) => ({ lineage: x.lineage, state: x.state, core: x.core })
    );
    const v = verdictFor(promises);
    assert.equal(v.category, expected[slug], `verdict for ${slug}`);
    seen.add(slug);
  }
  assert.deepEqual([...seen].sort(), Object.keys(expected).sort());
});

test("codeWord: commits in 90d -> Active, none -> Quiet, null -> Unknown", () => {
  assert.equal(codeWord({ commits90d: 12 }), "Active");
  assert.equal(codeWord({ commits90d: 0 }), "Quiet");
  assert.equal(codeWord({ commits90d: null }), "Unknown");
  assert.equal(codeWord(null), "Unknown");
});

test("useWord is always the honest placeholder", () => {
  assert.equal(useWord(), "coming");
});

test("hypeSummary: mentions from latest, week counting, collecting gate", () => {
  const snaps = [
    { as_of: "2026-09-25T06:30:00Z", news_mentions_7d: 97 },
    { as_of: "2026-09-18T06:30:00Z", news_mentions_7d: 80 },
  ];
  const s = hypeSummary(snaps);
  assert.equal(s.mentions7d, 97);
  assert.equal(s.baselineWeeks, 2);
  assert.equal(s.collecting, true);
  const empty = hypeSummary([]);
  assert.equal(empty.mentions7d, null);
  assert.equal(empty.collecting, true);
});
