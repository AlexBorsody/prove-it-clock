import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseCount,
  median,
  trendOf,
  hypeVerdict,
  fmtSocial,
  isSocialSlug,
} from "../src/lib/social";

test("parseCount handles K/M/B, commas, and plain numbers", () => {
  assert.equal(parseCount("185K subscribers"), 185000);
  assert.equal(parseCount("1.2M"), 1200000);
  assert.equal(parseCount("42,300"), 42300);
  assert.equal(parseCount("7"), 7);
  assert.equal(parseCount("no number here"), null);
});

test("median of odd/even/empty lists", () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 3, 2]), 3); // (2+3)/2 rounded
  assert.equal(median([]), null);
});

test("trendOf needs >2% move and comparable values", () => {
  assert.equal(trendOf(110, 100), "up");
  assert.equal(trendOf(90, 100), "down");
  assert.equal(trendOf(101, 100), "flat");
  assert.equal(trendOf(null, 100), null);
  assert.equal(trendOf(100, null), null);
  assert.equal(trendOf(50, 0), null);
});

test("hypeVerdict: high buzz plus few hearts is all sizzle, no steak", () => {
  const v = hypeVerdict(100, 40, 8, 2, 20);
  assert.equal(v.buzz, "high");
  assert.equal(v.tone, "sizzle");
  assert.match(v.read, /All sizzle, no steak/);
});

test("hypeVerdict: low buzz plus many hearts is quietly proven", () => {
  const v = hypeVerdict(10, 40, 8, 14, 20);
  assert.equal(v.buzz, "low");
  assert.equal(v.tone, "proven");
  assert.match(v.read, /Quietly proven/);
});

test("hypeVerdict: middle of the pack stays neutral", () => {
  const v = hypeVerdict(40, 40, 8, 10, 20);
  assert.equal(v.buzz, "moderate");
  assert.equal(v.tone, "neutral");
});

test("hypeVerdict: too small a batch means no buzz judgment", () => {
  const v = hypeVerdict(100, 40, 2, 2, 20);
  assert.equal(v.buzz, null);
  assert.equal(v.tone, "neutral");
});

test("hypeVerdict: missing mentions degrades gracefully", () => {
  const v = hypeVerdict(null, 40, 8, 5, 20);
  assert.equal(v.tone, "neutral");
  assert.match(v.read, /not reporting yet/);
});

test("fmtSocial compacts large numbers", () => {
  assert.equal(fmtSocial(185000), "185.0K");
  assert.equal(fmtSocial(2500000), "2.5M");
  assert.equal(fmtSocial(42), "42");
  assert.equal(fmtSocial(null), "n/a");
});

test("isSocialSlug covers the eight tracked projects", () => {
  for (const s of ["btc", "eth", "xrp", "sol", "link", "avax", "dash", "bat"]) {
    assert.equal(isSocialSlug(s), true);
  }
  assert.equal(isSocialSlug("doge"), false);
});
