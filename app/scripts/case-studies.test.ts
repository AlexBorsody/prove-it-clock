import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CASE_STUDY_DOCUMENTS, isCaseStudySlug, readCaseStudy, resolveCaseStudyLink,
} from "../src/lib/case-studies";

test("case-study routes reject arbitrary paths and inherited object properties", () => {
  for (const slug of ["../strategy", "constructor", "toString", "__proto__", "BAT"]) {
    assert.equal(isCaseStudySlug(slug), false, slug);
  }
});

test("all intended case-study slugs are allowlisted", () => {
  for (const slug of ["overview", "bat", "xrp", "btc", "link", "eth", "sol", "dash", "avax", "review", "algorithm"]) {
    assert.equal(isCaseStudySlug(slug), true, slug);
  }
});

test("Markdown links resolve from their actual document directories", () => {
  assert.equal(resolveCaseStudyLink("README.md", "bat"), "/case-studies");
  assert.equal(resolveCaseStudyLink("review.md", "xrp"), "/case-studies/review");
  assert.equal(resolveCaseStudyLink("../hearts-algorithm.md", "overview"), "/case-studies/algorithm");
  assert.equal(resolveCaseStudyLink("bat.md#evidence", "overview"), "/case-studies/bat#evidence");
  assert.equal(resolveCaseStudyLink("game_design.md", "algorithm"), "https://github.com/AlexBorsody/prove-it-clock/blob/main/docs/game_design.md");
  assert.equal(resolveCaseStudyLink("https://brave.com/blog/brave-ads-launch/", "bat"), "https://brave.com/blog/brave-ads-launch/");
});

test("every allowlisted document exists and contains an actual Markdown title", async () => {
  for (const slug of Object.keys(CASE_STUDY_DOCUMENTS)) {
    assert.ok(isCaseStudySlug(slug));
    assert.match(await readCaseStudy(slug), /^# .+/);
  }
});
