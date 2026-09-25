import assert from "node:assert/strict";
import { test } from "node:test";
import { VITALS_REPOS, isVitalsSlug, summarizeWeeks } from "../src/lib/vitals";

function weeks(totals: number[]) {
  return totals.map((total, i) => ({ week: 1700000000 + i * 604800, total }));
}

test("every scored project has a canonical repo", () => {
  for (const slug of ["btc", "eth", "xrp", "sol", "link", "avax", "dash", "bat"]) {
    assert.equal(isVitalsSlug(slug), true, slug);
    assert.match(VITALS_REPOS[slug].github, /^[^/]+\/[^/]+$/, slug);
  }
});

test("vitals slugs reject junk", () => {
  for (const slug of ["../x", "BTC", "", "ethereum"]) {
    assert.equal(isVitalsSlug(slug), false, slug);
  }
});

test("summarizeWeeks rolls 52 weeks into 30d and 90d", () => {
  const totals = new Array(52).fill(10);
  totals[51] = 5; // most recent week
  const { commits30d, commits90d } = summarizeWeeks(weeks(totals));
  assert.equal(commits30d, 35); // 10+10+10+5
  assert.equal(commits90d, 125); // 12*10+5
});

test("summarizeWeeks handles short histories", () => {
  const { commits30d, commits90d } = summarizeWeeks(weeks([7, 3]));
  assert.equal(commits30d, 10);
  assert.equal(commits90d, 10);
});

test("summarizeWeeks handles empty input", () => {
  const { commits30d, commits90d } = summarizeWeeks([]);
  assert.equal(commits30d, 0);
  assert.equal(commits90d, 0);
});
