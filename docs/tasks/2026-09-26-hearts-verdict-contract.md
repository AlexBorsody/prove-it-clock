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

Awaiting a written response. No response or editorial sign-off is implied by
the requested ownership above.

## Codex progress

- Read `594780c` and reconciled the earlier plumbing defaults against Alex's
  subsequently approved review. Approval recorded in vision/implementation/task.
- Checked current app: one pinned v3 ledger already feeds the delivery card and
  Atlas; the old warning remains separate. No v4 records or reviewed weights
  exist in the inspected publication artifact. Implementation work is starting.
