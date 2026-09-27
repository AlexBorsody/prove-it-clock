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

## Codex reply: repository review and scope

**2026-09-27. Reviewed main through `429d703` and PR #8 head `1417625`.**
Your four sourced examples are the next input. I also read the new
claims-and-evidence brief in `429d703` and included its domain boundary below.
I merged current main into the isolated PR #7 branch and left the shared PR #8
checkout untouched. [PR #7](https://github.com/AlexBorsody/prove-it-clock/pull/7)
contains this scope; [PR #8](https://github.com/AlexBorsody/prove-it-clock/pull/8)
remains the delivery implementation owner's slice.

### What the code can support today

| Area inspected | Finding and implication |
|---|---|
| Checked-in published v3 artifact | Eight projects, 115 distinct promise identities: 72 fulfilled, 33 open, five lapsed, five retired. All have reference links; none separately stores `claim_sources`, `outcome_evidence`, `assessed_at` or `transitions`. Classify provenance before timeline backfill. This is not a hosted data audit. |
| Dates | BTC P1's `effective_at` is 2009-01-03; its reference names the 2008-10-31 whitepaper. A bulk conversion to original-claim events would be wrong. The earlier timeline brief is corrected, without changing the records. |
| Published reader and PR #8 | Reuse the request-cached ledger, separately recorded claim/outcome sources, reviewed transition contract and run-pinned receipts. PR #8's transitions lack event IDs/predecessor references; they are a useful foundation, not a complete event history. v4 remains inactive. |
| Existing history | `project_events` already has `event_date`/`created_at`, but no promise lineage or immutable corrections. `history.ts` also derives a legacy series from milestone seed dates; neither is the new promise timeline. |
| USE | `heart-data.ts` still returns `coming`. `metric_observations` can retain dated provider observations, but the intended-use and attribution contract is not implemented. Raw activity must not be labeled realized impact. |
| Categories | Atlas already has a versioned taxonomy and 115 assignments, including seven Unclassified. The gate is review of those boundaries for category comparison, not creation of a second taxonomy. |
| Explanation UI | No active `/glossary` or `/learn/value` route found. `InfoTip` exists but takes free text. The parked glossary path in your brief is absent on this host; send its tracked term data before relying on that implementation. |

### Scope against the new value thesis

The five questions remain separate in the product and the data. A working
feature establishes functionality; it does not automatically establish demand,
realized benefit, token benefit or a justified market capitalization. No formula
will be tuned to place a preferred coin first.

The latest claims-and-evidence brief adds a reusable identity boundary, not
another product build: domain, subject, claim kind and stable claim ID. Preserve
the crypto promise lineage and existing milestone/ongoing `claim_type`;
"promise" is a separate claim kind. No recorded promises means not applicable
with coverage disclosed, never perfect delivery. Keep warning/meter rules
domain-scoped. Crypto is the only populated domain in this slice; the later
single collectible study remains deferred.

| Next slice | Reuse and deliverable | Gate / owner |
|---|---|---|
| Evidence history | Extend publication storage/readers; stable event identities, correction links, unknown dates and a pinned history revision. Detailed draft is in [implementation](../implementation.md#promise-history-and-timeline). Then render a project timeline from those events. | Muse's four examples, then Codex contract review before DDL. No bulk inferred backfill. |
| Usage and realized impact | Start with one reviewed category/use case. Retain unit, observation window, counting/exclusion method, source and attribution before computing anything. Distinguish intended use, incentives, product benefit and benefit to the token. | Muse/Alex review the existing USE draft and importance/parent-child rubric. Codex implements only the agreed observation contract. |
| Category comparison | Reuse Atlas assignments and inspectable delivery components. Keep missing evidence, not applicable and measured low performance distinct. | Reviewed taxonomy boundaries, impact model and warning contract. No universal aggregate. |
| Valuation explanation | Separate delivery, demand, realized impact, token benefit and assumptions; market data stays dated context. | Muse/Alex supply sourced thesis content. A valuation formula requires its own reviewed model. |
| Glossary | Shared versioned definitions for one searchable page and inline help; reuse existing UI/search dependencies. No schema migration required. | Muse commits the parked terms. This can be an independent focused PR while event examples are pending. |

### Requested Muse handoff

1. For your four examples, supply lineage, source role, URL/locator, exact
   quotation when available, date and its precision, and author. Mark gaps
   explicitly. The correction example needs both the predecessor and the
   corrected assessment with a reason. Include the event names you intend:
   the briefs currently differ between `fulfilled`/`delivered` and
   `assessment`/`assessed`. Codex will map these against PR #8 without silently
   inferring new outcomes. XRP p01 stays untouched pending attribution research.
2. Update your owned USE draft's remaining "overall composite" framing to
   the category decision. Choose the first measurable use case and specify
   the population, unit, window and exclusions. BAT MAU alone does not count
   token use; payment-provider volume does not establish XRP settlement.
   Identify what benefit, if any, accrues to token holders separately.
3. Commit the parked glossary data or point to its Git revision. Existing
   tooltips should consume the reviewed definitions instead of growing a
   parallel copy list. Project value-thesis copy and the Bitcoin monetary
   tests remain your editorial work; this review adds no grades.

### Ownership, checks and next checkpoint

This slice changes implementation and coordination docs only. PR #8's owner
retains the v4 writer/reader/evaluator, API and verdict UI. No new runtime code,
DDL, hosted writes, scoring publication or deployment was performed here.
The next ledger build waits for the handoff; draft spec work is now complete
enough to review field-by-field against those examples.

**Checks actually run:** 25 focused tests passed: 16 Atlas/verdict tests on
main's runtime and nine reviewed-calculation/API tests at PR #8's `1417625`.
Commands: `node --import tsx --test scripts/atlas.test.ts
scripts/promise-verdict.test.ts` and `node --import tsx --test
scripts/reviewed-verdict.test.ts scripts/verdict-api.test.ts`, from `app/` in
the respective checkouts. These include local fixtures, an in-memory database
and mocked API requests; they do not certify research, hosted enforcement or
production behavior. No new full build or browser check in this docs review.
`git diff --check` and all 16 added/changed relative Markdown links passed.

Review checkpoint: PR #7, based on main `429d703`. Push this documentation as
one batch; await Muse's reply and preserve the unmerged PR #8 ownership boundary.
