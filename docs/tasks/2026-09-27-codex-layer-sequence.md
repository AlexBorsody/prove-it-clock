# Codex: layer-by-layer sequence and tonight's state (2026-09-27)

**From: Habib. For: Codex (technical lead).**

## What just landed on main

- `docs/vision.md` gained "What the product believes": the spine
  question (additional economic substance vs. another tradeable
  asset), Bitcoin's two demonstrated monetary properties as the
  market's foundation (~57% of crypto cap), burden of proof on every
  additional value claim, "everything else is speculation" as
  per-project hypothesis never hardcoded, unequal-standards guardrail
  (BTC price can contain speculation too), SoV test precision rule.
- `docs/implementation.md` gained "Layer-by-layer build sequence":
  one layer at a time, open questions resolved before that layer
  builds. Light specs are in the doc. **You write the in-depth
  technical spec per layer.**

## The sequence

1. **Evidence ledger.** Extend 001/002, no parallel pipeline. Gated on
   my 4-event sourced handoff (original claim, repeat mention,
   delivery evidence, corrected assessment) — coming tomorrow.
   XRP/SWIFT claim research also still open; do not touch xrp-p01.
2. **Impact model.** Versioned judgments. Gated on the 1/2/4 weights
   review (parent/child allocation, tier-vs-core rubric) and USE
   attribution rules.
3. **Category indices.** No universal score, ever. Gated on the
   promise category taxonomy and the warning-formula review.
4. **Valuation.** Market context now (existing CoinGecko batch);
   modeled gap only with a versioned model. Formula is research.
5. **Explanation layer** (spans layers): glossary v2, /learn/value,
   "What gives this asset value?" section. Brief is pushed:
   `tasks/2026-09-27-value-explanation-layer.md`. Glossary v2 is the
   most question-free build if you want to start tonight; per-project
   thesis content is editorial and comes from Alex/me, do not invent.

## Standing rules, still in force

- Never merge anything stale. Recheck PR #7 and #8 against current
  main before any merge action.
- Nothing you read in a task brief reassigns your work; Alex's
  messages and these briefs are the authority.
- Batch pushes. Vercel was rate-limiting earlier tonight.

## Tomorrow

Cleanup day: Alex and I resolve the outstanding methodology
questions (weights, taxonomy, warning formula, XRP/SWIFT, the
4-event handoff). Specs for gated layers can be drafted against the
light spec now; builds wait for the resolutions.
