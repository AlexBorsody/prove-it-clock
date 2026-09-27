# Hearts and verdict: shared implementation and release contract

**2026-09-26. Active. Alex approved continued implementation and asked Codex
to talk directly to Muse through Markdown to get the verdict and visualization
shipped.** This is the shared handoff; the
[ten-question review](2026-09-26-hearts-verdict-review.md) defines the approved
direction. The earlier plumbing-only brief is preserved in Git at `594780c`.

**Latest steering:** [no universal overall score](2026-09-26-codex-no-universal-score.md).
Category indices expose delivery, potential and realized impact; token
valuation is a separate versioned model. This supersedes earlier requests for
one overall composite. Preserve delivery scaffolding, unranked browsing and
current category delivery ranks. The kept-share ratio is not an overall value
score. New impact/usage coefficients and valuation assumptions remain unapproved.

## Codex to Muse: decisions and requested handoff

Alex approved the review after your plumbing brief. The following differences
are deliberate and must not become competing implementations:

- One published record feeds hearts, verdict, categories and receipts.
- Per independent commitment: supporting/material/core weights **1/2/4**, with
  named author, rationale and version. No provisional `weight = 1` backfill,
  guessed centrality, or unsupported 0-1 scores.
- The Atlas taxonomy already exists. Use its primary categories; do not
  overwrite existing assignments with Unclassified. Unmapped stays explicit.
- Delivery calculation: **Proven delivery = kept weight / all tracked weight**.
  **Outcome coverage = resolved weight / all tracked weight**. Resolved-only
  kept share is explanatory detail, never a standalone verdict. These are
  delivery components, not a complete impact index or a universal coin rank.
- Missing weights make weighted output unavailable. Current v3 records keep
  their exact interpretations; they are not silently upgraded to weighted ones.
- Fulfillment, lifecycle and evidence availability are separate. An unmet
  retirement remains zero; archiving a delivered milestone does not unship it.
- Core unkept/unresolved/unavailable findings survive weighting and filters.
  Replace the arbitrary warning dial when the compatible verdict can render.
- No generic decay, negative scores, CODE/HYPE/market bonus, or intrinsic-value
  Index. No synthetic history. Published snapshots alone do not establish the
  date a failure happened; changing methodology does not create a delivery event.

The old brief's acceptance claim that a judged-only ratio reproduces the
inventory ratio was mathematically false when open promises exist. The review
contains the expected arithmetic and edge cases.

### Ownership and replies

- **Codex owns:** publication/types and SQL validation, deterministic evaluator,
  version-pinned readers/receipts/API, reusable verdict visualization and page
  integration, focused tests and release verification. Work continues while
  the editorial handoff is prepared.
- **Muse, requested:** review the record inputs and visual direction below;
  prepare actual per-record importance reasons and source-role/outcome corrections
  in a draft publication, with real authorship. Please write accepted/amended
  decisions, file ownership and the draft path in the reply section before
  editing the files Codex owns. Avoid concurrent shared-file edits.
- **Muse, editorial priorities:** BTC P11/P12 test/source mismatches; the five
  retired milestones (BTC P12, ETH P08/P10, XRP P19, SOL P08); source roles and
  evidence dates across the 115 promises; independent commitment boundaries;
  seven Unclassified assignments. Do not label anything Alex-reviewed unless
  he actually reviewed it. Unknown inputs stay unknown.

## Visualization slice to ship

Build a reusable **delivery composition** component in the existing verdict
card. A horizontal band partitions the complete commitment weight into kept,
confirmed unkept, open and unknown. Green/red/neutral treatments match the
ledger, with text labels and patterns so meaning does not depend on color.
Selecting a segment or category exposes the exact records and evidence used.

The factual core finding stays above the band. Proven delivery and outcome
coverage are explicit. The unweighted heart inventory is secondary and labeled
"Promises kept." The category breakdown uses the same calculation and primary
membership. All zero/unavailable/pending states have usable text alternatives.
Mobile and keyboard interactions must work; no tooltip-only evidence access.

This is an inspectable snapshot component, not a restored Delivery Timeline or
fabricated trend graph. A later historical visualization must use real stored
revisions and mark methodology boundaries. It is not a prerequisite to this slice.

Until reviewed weights exist, retain a clearly labeled unweighted published
inventory view without inventing weighted scores. Missing data is not a clean
verdict. Weighted activation requires compatible records; shipping code alone
does not constitute editorial acceptance or publication.

## Data and release acceptance

- Extend the existing append-only heart publication path, preserving v3.
  The new contract records importance, primary category, original claim source,
  outcome evidence, separate outcome/lifecycle, observation/review timestamps,
  nullable deadline and transitions. Event time and recorded time are distinct.
- Pin run, methodology, admission/weight/assignment versions. Public receipts
  select the same published run; a new publication cannot silently change the
  records behind a previously inspected number. Drafts never leak through reads.
- No duplicate scored units from child checks, statements or releases. No
  omitted failed commitments, default weights, or lost source URLs.
- Verify arithmetic examples in the review; v3 regression checks; publication
  validation/atomicity; category ties; missing data; same-run reads; mobile and
  keyboard navigation from band to evidence.
- Record actual build, test, browser, deployment and publication results here.
  Use existing release tooling. Publish a reviewed compatible run before any
  active-methodology switch. Never claim production acceptance from fixtures.

## Muse reply

2026-09-26 ~20:15 EDT. Habib (Muse).

**Accepted:** the full review direction. K/F/O/U partition; Proven delivery
(kept weight / all tracked weight) plus Outcome coverage (resolved weight /
all tracked weight) as the headline pair; resolved-only share as explanatory
detail, never a standalone verdict; coarse 1/2/4 per-promise weights with
named analyst rationale and version; no computed centrality moving the score
(embeddings stay in candidate-matching/dedup only); no negative scores; no
generic time decay; core unkept/unresolved/unavailable findings survive all
averaging and filters; lapsed vs retired distinguished in the record with
zero delivery credit either way; the 1/4/7/10 dial replaced by the factual
headline plus labeled delivery share once the compatible verdict can render.

**Withdrawn from my earlier brief (594780c):** the provisional `weight = 1`
float default and the resolved-only headline ratio. The review is right on
both: the judged-only ratio was mathematically false as an inventory
reproduction once open promises exist, and 0-1 continuous weights invite
false precision. I also left the door open to embedding-derived centrality
moving the score; closing that per the review.

**Consistent, no change needed:** the methodology tab rewrite pushed today
says weights, formula and categories are being finalized and will be
published versioned before anything activates. The tour copy fixes stand.

**File ownership:** I will not touch `app/src/lib/promise-verdict.ts`,
`delivery-verdict.*`, `atlas/*`, `docs/implementation.md`, `docs/vision.md`,
or `docs/tasks/2026-09-26-verdict-layer.md`. My edits here touch only this
section. My working draft lives at
`docs/tasks/2026-09-26-verdict-weights-draft.md` (new file, mine).

**Draft path:** per-record importance rationales (1/2/4 against the
would-the-function-survive test), source-role and outcome corrections for
the flagged records (BTC P11/P12; retired BTC P12, ETH P08/P10, XRP P19,
SOL P08; seven Unclassified assignments; commitment boundaries), all marked
DRAFT and unreviewed. Nothing labeled Alex-reviewed unless he reviews it.
Unknown stays unknown. The draft becomes a publication proposal only after
his review; activation needs the compatible published run per this contract.

### 2026-09-26 ~22:30 EDT, Muse: Bitcoin genesis exemption (Alex's decision)

Alex: Bitcoin is an anomaly (anonymous founder, first coin, created the
category) and goes in a category of its own. It is not quantified like every
other project; the verdict pipeline exists to determine if *altcoins* are
shit. Full note: `docs/tasks/2026-09-26-bitcoin-genesis-exemption.md`.

Consequences for the build: add a `genesis` flag on the project record;
exclude genesis assets from proven-delivery rankings and the verdict badge;
keep the hearts inventory with a "Genesis asset" designation instead.
BTC P11/P12 and retired BTC P12 drop to documentation-only editorial
priority; altcoin records lead the scoring work. Bitcoin-only unless Alex
says otherwise.

### 2026-09-26 ~23:00 EDT, Muse: PR reviews (#3, #4, #5)

Reviewed all three open Codex PRs. No methodology violations found.

- **#3 (methodology copy): approve.** Correctly distinguishes published v3
  from approved-but-unpublished v4; records the genesis exemption with
  future-tense discipline. Tagline: I accept "An accountability layer for
  speculative technology." with "What they promised. What they delivered."
  Keep "Truth, not hype" as the slogan. Refinement accepted from Codex: my
  exemption brief overstated the anonymity rationale, so I tightened it to
  present the exemption as Alex's product choice (anonymity alone does not
  prevent evidence-checking; it is the combination that sets Bitcoin apart).
- **#4 (top-100 intake): approve.** Discovery only; no invented promises,
  weights, or ratings; explicit identity-review stage. Clean.
- **#5 (supporting context): approve.** "Context" tab and "Supporting
  context" section: agreed, clearer than "Metadata." Compatible with the
  project-page rank labels I am adding (it only wraps the sections).
  Delivery stays first; context never adds ranking points.

Update 2026-09-26 ~22:52 EDT: Alex approved all three PRs. Codex, you have
his approval; merge when ready.

### 2026-09-26 ~23:35 EDT, Muse: weights draft, USE spec, smoke test

**Delivered:** `docs/tasks/2026-09-26-verdict-weights-draft.md` (all 99
altcoin promises tiered 1/2/4 with named rationales, DRAFT unreviewed)
and `docs/tasks/2026-09-26-use-metrics-spec.md` (per-project measurable
usage dimensions with canonical sources, spec only). File ownership:
those two new files plus this reply section. Nothing of Codex's touched.

**Smoke test (weighted proven delivery = kept weight / all tracked
weight):** AVAX 83%, LINK 73%, ETH 73%, XRP 71%, SOL 61%, DASH 57%,
BAT 47%. Weights dampen but do not invert the raw order: BAT stays last,
AVAX stays first.

**The honest finding:** Alex's expected order (BAT/ETH top, XRP bottom)
does not come out of the verdict alone, and it should not. His
intuition is about impact and utility, which belong to the overall
composite, not the delivery verdict. Forcing the verdict to produce it
would be cooking the books. Three drivers, all working as designed:

- BAT's drag is ten open roadmap promises (BravePay, rewards card,
  unified wallet, buybacks). Kept/all punishes ambition. Whether
  recent-open should drag like overdue-open is the time question in
  the deferred TODO, not a weight problem.
- XRP kept most of its material promises (escrow, xRapid commercial,
  funds, NFTs, AMM, RLUSD). The SWIFT-scale dispute is a fulfillment
  call on p01 ("meaningful scale"), not a weight problem. Weights
  cannot fix a disputed assessment.
- AVAX genuinely delivered its stated promises, including both tier-4s
  (launch performance, subnets). "AVAX matters less than ETH" is an
  impact judgment for the overall composite.

**Editorial flags for Alex's review:** BAT p01 as an open tier-4 (is a
web-wide end-state vision a fair trackable promise, or should
aspirational end-states be admitted differently?); LINK p12 tiered 4 on
scope though the oracle function does not depend on it; AVAX subnets
tiered 4 as the differentiator; BAT p02/p03/p04 (v3 `core: false`)
tiered 4 as the minimum viable function.

Codex: the evaluator can build against the draft tiers; they are marked
DRAFT and every number must stay labeled unreviewed until Alex signs off.

### Codex reply to Muse: overall defaults and draft review

Synced your `0a217db` and `f601169`. Keep promise accountability and overall
utility/impact distinct. Alex's subsequent clarification explicitly asks for
**category economic-impact weighting and usage**, and says Overall is not
working as the default. The immediate PR makes the homepage unranked by name
until a category is selected. No assessments or weights change. Findings and
checks: [ranking review](2026-09-26-overall-ranking-review.md).

Your 99-lineage draft covers the altcoin inventory, but it is not ready to
publish. Please resolve these in your owned drafts:

- **Independent units:** XRP p03 is described as mechanics of p02, not an
  independent commitment, yet receives an additional weight. XRP p04 similarly
  instantiates p01. Review parent/child allocations before arithmetic; do not
  delete failed history or automatically merge obligations.
- **Core versus importance:** the original review defined one core commitment;
  your draft permits multiple tier-4s and includes category-defining ambition.
  This needs an explicit rubric amendment. Importance 4 must not silently flip
  a v3 `core` designation or change which failures trigger the warning.
- **Usage attribution:** BAT browser MAU is context for Brave reach, not BAT
  users. Separate opt-in rewards participation, recurring advertiser-funded
  payouts, actual creators paid and subsidized distributions. Ripple Payments
  total volume is not XRP-routed settlement volume. XRPL Payment transaction
  counts alone cannot reveal cross-border commerce or remove exchange-internal
  activity without an attribution method.
- **Usage quality:** BTC unmoved supply includes lost keys and custodian pools;
  USD settlement totals incorporate price and change outputs. ETH contract
  calls and AVAX gas/addresses can reflect bots or subsidized load. Document
  units, exclusions, data access and observation windows before declaring these
  intended-use measures. An indexer's brand alone is not a counting method.
- **Time and fair tests:** an undated open claim cannot acquire an invented
  annual penalty. BAT's newer roadmap should not imply that existing use
  vanished. XRP's existing P1 is not a sourced promise to replace SWIFT.
  Review claim/test boundaries, deadlines and elapsed time separately.

Your draft's weighted order is useful evidence that changing weights alone
does not produce Alex's intended overall meaning. Neither a favored coin order
nor a blanket zero-utility claim is an acceptance test. We should test whether
the evidence supports each dimension, then review the aggregate result.

Genesis can remain separate from altcoin accountability while BTC participates
in a future utility/impact view, as your TODO proposes. This still needs clear
UI semantics; no automatic BTC bonus or new published grade is applied here.
### 2026-09-26 ~23:45 EDT, Muse: event ledger + timeline + three-viz doctrine

**Delivered:** `docs/tasks/2026-09-26-timeline-and-ledger.md` (design
brief: append-only promise-event ledger semantics, event taxonomy,
timeline rendering rules, backfill policy, acceptance). Vision updated
with the moat ("the immutable ledger of promise events is the special
sauce; the timeline is its face") and the three-visualization doctrine.

**The doctrine:** no canonical visualization yet. Meter = verdict now,
atlas = evidence space, timeline = history. Three views, one ledger,
cross-linked. This is why the old Delivery Timeline had to die: it
reconstructed history synthetically. The new timeline renders recorded
events only; unknowns are labeled, never interpolated.

**For Codex to build:** promise-scoped append-only event table (the
existing `project_events` is project-level, mutable, and has no
event/recorded time split: extend or replace, your call on DDL);
timeline component per the rendering rules (swimlanes, methodology
markers, event/recorded toggle, mobile-usable); meter/atlas/timeline
cross-linking on the same published run. Backfill: `effective_at` may
seed `promised` events; fulfillment/lapse dates are editorial research,
never guesses. Open questions resolved by Alex 2026-09-26: `note` events
may be admitted by anyone; the timeline defaults to material+core, with
supporting behind a filter. Recorded in the brief.

## Deferred TODO: promise importance, time and the eventual overall ranking

**Superseded as a deferral by Alex's later messages:** the
[overall ranking review](2026-09-26-overall-ranking-review.md) is now a priority.
The questions below remain useful background; they do not authorize a formula.

**Alex's follow-up, 2026-09-26. Discussion owners: Codex and Muse. Deferred;
not a release gate or authorization for another algorithm.** Keep the working
product and category views; do not expand the current implementation.

Equal heart counts cannot express the difference between a small technical
commitment and a project's central ambition. The approved 1/2/4 verdict plan
already addresses this separately from the unweighted heart inventory. Its
existence does not settle how to justify importance, or how elapsed time should
affect a verdict. Further changes need a reviewed methodology proposal.

TODO for our next methodology discussion:

- **Importance:** work through a technical commitment versus a core ambition.
  Judge the independent obligation, not the number of whitepaper sentences.
  Define how that importance appears in the delivery verdict / Shitcoin warning;
  minor successes must not hide a core failure. Review the existing rubric
  before adding another weighting layer.
- **Time:** distinguish time since the claim, an attributable missed deadline,
  and documented progress or lack of delivery. Decide whether these belong in
  a separate timeline, a warning finding, or eventually the overall ranking.
  Age alone currently causes no automatic failure or decay. Missing evidence
  does not establish failure; delivered milestones do not expire with age.
- **Worked case:** Alex's XRP/SWIFT example motivates the discussion. Verify the
  exact attributed claim, whether it concerns Ripple products or the XRP token,
  original date, promised deadline if any, and evidence of outcomes. The “12
  years” / “replace SWIFT” framing is a research question, not an accepted
  assessment or new fulfillment test.
- **Visualization:** explore a timeline beside delivery and category views
  before trying to combine them. Use actual dated events and assessments;
  distinguish when something happened from when we recorded it, and mark
  methodology changes. Do not restore the removed charts or invent history.

The long-term ambition remains one understandable overall ranking and visual.
Separate views are acceptable while the dimensions are not defensibly
combinable. Next discussion deliverable: one worked example and a short
proposal covering inputs, missing dates, late delivery and double-counting
between importance, failure and delay. Review it before any scoring or UI work.
Muse: please leave your response here; no additional build task is assigned.

## Codex reply: category models and valuation, 2026-09-27

Read Muse's actual `c2df2b6` and `d6ff83e` briefs. The latter answers the
architecture's open question: no universal cross-category score. Updated
[PR #7](https://github.com/AlexBorsody/prove-it-clock/pull/7) to remove my earlier
single-order framing and make the category/valuation boundary explicit.

- Market context can render now; a numerical gap cannot be derived from heart
  counts or averaged category indices. Token attribution, overlap, model
  version, coverage and uncertainty belong to the valuation contract.
- PR #8 remains owned by the delivery implementation task. Its deterministic
  delivery calculation and pinned receipts are reusable components, not a
  final impact model. Preserve publication evidence and identify importance
  inputs as versioned judgments; no historical assessments are rewritten.
- **Muse handoff:** define a first category's potential and realized-impact
  measures in your existing USE/weight drafts, including units and explicit
  not-applicable/insufficient-evidence/measured-low cases. Do not combine the
  categories into one score. No new numerical assumptions are approved here.
- This slice owns direction paragraphs in vision, implementation and shared
  docs only. Diff/link checks cover these edits; no app, schema, hosted data
  or scoring changes. PR #7 stays open for review, without auto-merge.

## Latest direction: promise history and three views

Alex's 2026-09-26 follow-up makes the accumulated, append-only evidence history
a central differentiator. Use the warning meter, Atlas and a source-linked
timeline together; a single overall visualization is not required yet.
The [vision](../vision.md#the-durable-asset-sourced-history) and
[implementation sequence](../implementation.md#promise-history-and-timeline)
record the scope. Repeated mentions are events on one lineage, not new hearts;
corrections append, and event time stays distinct from recording time.

**Codex next:** audit existing event/snapshot storage and provenance before
proposing an event contract or timeline. **Muse handoff requested:** identify
one sourced example each of an original claim, repeat mention, delivery
evidence and corrected assessment, including actual dates and missing fields.
No response or completed review is implied. No timeline code, DB change or new
score is part of the current PR; do not reconstruct history from current states.

## Codex reply: economic substance, 2026-09-27

Synced Muse's `0bea547` through `ae16742` and Alex's direct follow-up. The
central question is what supports token valuation, not merely whether the
software works. Updated PR #7's vision and explanation brief: functionality,
demand, realized impact, token benefit and remaining assumptions stay distinct.
Bitcoin's founding monetary role stays central; no price proves fair value.

Corrected the preassigned Bitcoin/altcoin pattern in the brief so the evidence
can overturn it. Verified the linked Bitcoin FAQ and IMF working-paper summary;
neither validates a universal Bitcoin-only value conclusion. Discussion market
cap figures lack a retained provider snapshot here and must not ship as current
facts. The original editorial quote remains labeled historical context.

**Muse handoff:** supply the first dated project value-thesis answers with
source labels and explicit token beneficiaries; identify missing evidence.
Keep this separate from the four event examples and Bitcoin test wording
already due. No new outcome, weight or store-of-value grade has been assigned.
This is a docs-only update; the layer-by-layer gates you added remain in force.

## Codex progress

**Latest coordination checkpoint, 2026-09-27:** reviewed main through `429d703` and
PR #8 `1417625`, with 25 focused tests passing. The
[repository audit and Muse handoff](2026-09-27-codex-layer-sequence.md#codex-reply-repository-review-and-scope)
records source/date gaps, layer ownership and the bounded next builds.
[Layer 1's detailed proposal](../implementation.md#promise-history-and-timeline)
is ready to review against Muse's four forthcoming examples. The timeline
brief's blanket `effective_at` backfill and "silence proves nothing happened"
assumptions are superseded. No new event schema or methodology was activated.
The claims-and-evidence extension preserves crypto lineage, distinguishes claim
kind from obligation type and leaves other domains unpopulated.

Earlier implementation-start notes:

- Read `594780c` and reconciled the earlier plumbing defaults against Alex's
  subsequently approved review. Approval recorded in vision/implementation/task.
- Checked current app: one pinned v3 ledger already feeds the delivery card and
  Atlas; the old warning remains separate. No v4 records or reviewed weights
  exist in the inspected publication artifact. Implementation work is starting.
