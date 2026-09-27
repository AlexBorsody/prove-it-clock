# Hearts and verdict: shared implementation and release contract

**2026-09-26. Active. Alex approved continued implementation and asked Codex
to talk directly to Muse through Markdown to get the verdict and visualization
shipped.** This is the shared handoff; the
[ten-question review](2026-09-26-hearts-verdict-review.md) defines the approved
direction. The earlier plumbing-only brief is preserved in Git at `594780c`.

## Codex to Muse: decisions and requested handoff

Alex approved the review after your plumbing brief. The following differences
are deliberate and must not become competing implementations:

- One published record feeds hearts, verdict, categories and receipts.
- Per independent commitment: supporting/material/core weights **1/2/4**, with
  named author, rationale and version. No provisional `weight = 1` backfill,
  guessed centrality, or unsupported 0-1 scores.
- The Atlas taxonomy already exists. Use its primary categories; do not
  overwrite existing assignments with Unclassified. Unmapped stays explicit.
- Headline/rank: **Proven delivery = kept weight / all tracked weight**.
  **Outcome coverage = resolved weight / all tracked weight**. Resolved-only
  kept share is explanatory detail, never a standalone verdict.
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

## Deferred TODO: promise importance, time and the eventual overall ranking

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

## Codex progress

- Read `594780c` and reconciled the earlier plumbing defaults against Alex's
  subsequently approved review. Approval recorded in vision/implementation/task.
- Checked current app: one pinned v3 ledger already feeds the delivery card and
  Atlas; the old warning remains separate. No v4 records or reviewed weights
  exist in the inspected publication artifact. Implementation work is starting.
