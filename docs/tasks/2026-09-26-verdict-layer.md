# Verdict layer: build tasks

**2026-09-26, Alex's approved direction (product iteration).** The Atlas v1
is the evidence view, not the product. The product is the living verdict
per project. This task builds that layer. It changes no scoring rules and
invents no methodology. Vision: [vision.md](../vision.md#verdict-layer).

## Goal

A visitor asking "is this team full of shit?" gets an answer in five
seconds, with receipts one click away.

## V1: verdict card

Per-project verdict card, derived entirely from the published promise
ledger:

- Kept / total promises, e.g. "11 of 14 kept".
- Recently lapsed count, e.g. "2 lapsed this year" (from assessment dates
  in the ledger).
- Per-category split using the Atlas taxonomy (payments: 4/5 kept,
  platform: 3/6 kept, ...).
- Every number links to the underlying promises (project page evidence
  section or Atlas filtered view).

## V2: placement

- The card lives near the top of each project detail page, above the
  promise list. It is the first thing a holder sees.

## V3: per-category rankings

- A per-category ranking view: for each Atlas category, rank the projects
  that have promises in it by share kept.
- Reachable from the homepage. No single overall leaderboard.
- This is the "who actually delivered on payments, ranked" view.

## V4: the verdict moves

- When a new published run lands, verdicts and rankings update from the new
  ledger. No manual steps.
- Surface the data revision ("as of <date>") next to the verdict.

## Data rules

- The verdict reads the published ledger only. It never writes, re-grades,
  or reinterprets.
- State mapping reuses the Atlas adapter's methodology-pinned
  interpretation (`app/src/lib/atlas/adapter.ts`). Unknown stays unknown,
  never silently promoted.
- If the ledger lacks assessment dates or a category assignment, the card
  shows what exists and says what is missing. No invented numbers.

## Copy rules

- Plain words: "kept," "lapsed," "open." No em dashes.
- Green kept, red lapsed, grey open. Same as the Atlas.
- The verdict never implies investment advice. It reports delivery against
  promises, nothing more.

## Explicitly out of scope

- No new scoring formula, no weights, no Index.
- No methodology v4 work (frozen until the verdict needs a ruling).
- No AI, no embeddings, no automatic classification.
- No changes to hearts, the Atlas, or the existing warning.

## Acceptance

- Every project page shows a verdict card computed from the published
  ledger.
- Per-category rankings exist and are reachable from the homepage.
- All 8 published projects appear; numbers match the ledger exactly.
- Clicking any number reaches the underlying promise evidence.
- A new published run updates verdicts with no code changes.
- Build, typecheck, and relevant tests pass.

## Codex review — 2026-09-26

Reviewed Muse's `f05e868` update against the published-ledger adapter and
current project-page components. The direction is implementable without a
new scoring formula or database schema. The category-ranking permission in
this brief supersedes the old Atlas-only restriction; hearts and the warning
remain unchanged.

- **Ready:** kept/total and exact state counts, category splits, evidence
  links, snapshot date/revision, and automatic reads of each new published
  run. Reuse one pinned Atlas dataset for the verdict and its evidence view
  so a publication during page loading cannot mix their numbers.
- **Recent lapses are currently unavailable:** the audited 115-promise run
  has no separate assessment dates. `effective_at` is the original promise
  date and `as_of` is the snapshot date; neither proves when a lapse happened.
  Even a future assessment date alone would not prove a *new* lapse. Until
  there is a dated status transition or comparable published history, show
  “Recent lapse timing unavailable” alongside the total lapsed count. Do not
  present it as zero or reuse the illustrative “2 lapsed this year” copy.
- **Category implementation:** use primary assignments for totals and share
  kept, matching Atlas region counts. Secondary associations remain discovery
  filters. Ranking receipts must select the same primary-only membership;
  the current Atlas category filter includes secondary matches and cannot
  be used unchanged as the receipt for a primary-only total.
- Show kept/total alongside any percentage so 1/1 and 10/10 retain context;
  equal shares tie. Show unknown states and Unclassified coverage explicitly.
  Projects with no promise in a category are not 0% performers there.
- New unmapped promises must remain visible as Unclassified. Automatic
  publication refresh does not authorize automatic category assignments.
- The current page already has kept/active/failed chips, a warning and promise
  stats. Reuse the summary facts in the new card rather than adding another
  competing stack of counters. Keep the approved warning unchanged.
- “No single overall leaderboard” is scoped here to the new category-ranking
  view. Replacing the existing homepage scoreboard is not specified by this
  task; do not silently remove it during this work.

Current parallel work: Alex separately requested an embedded Atlas for every
project page. That reuses the shared map/evidence components below the promise
content; the future verdict card has the reserved position above the list.
Review notes are not a claim that the verdict layer has been implemented.

## Implementation progress (Codex, 2026-09-26)

- Added a shared, pure delivery summary over the Atlas's methodology-pinned
  adapter. The card, category rankings and primary-only evidence filters agree.
- Project header, promise list, card and embedded Atlas now read the same
  request-cached published run. Removed the duplicate PromiseStats block.
- Counts and category rows link to evidence; snapshot date/revision are visible.
  Unknown, unavailable and Unclassified remain distinct from failure or zero.
- New run data is read automatically on the next server request. No new DB
  schema or live publication was needed or performed.
- Focused fixture checks verify all 115 promises, 72 kept across 8 projects,
  each state/category receipt, source roles, duplicate IDs, unknown states,
  unmapped records, category ties and a changed published run. Browser checks
  followed BTC's 5/7 Payments receipt to exactly 7 records and its 1 lapsed
  receipt to exactly 1 record with assessment references.

### Research sign-off still required

These are review questions from the stored record, not new ratings or a fresh
independent source investigation. Keep published assessments unchanged pending
Muse/Alex's editorial decision.

1. **BTC P11 (`btc-p11-participants-can-be-anonymous`)**: the test requires
   identity not to be discoverable from chain data. Its lapsed rationale says
   the whitepaper only promised pseudonymity. Confirm the test is no broader
   than the original attributable promise; add the exact quotation/locator and
   separate outcome evidence. The implementation cannot resolve that mismatch.
2. **BTC P12 (`btc-p12-block-size-limit-can-be-raised-later`)**: the test says
   block capacity is raised; the retirement rationale relies on no hard fork
   while acknowledging SegWit. Confirm whether a specific mechanism was part
   of the original commitment or was added by the assessment.
3. **Source roles across the run**: all 115 records lack separately identified
   original claim sources and assessment dates. BTC P11/P12 and ETH P08/P09/P10
   cite origin documents for later outcome assertions; the ledger needs distinct
   delivery references. Do not present origin citations as independently
   verified outcome proof.
4. Seven primary classifications remain Unclassified, and initial assignments
   remain Codex-authored, not human-reviewed. They stay visible and counted.
5. Recent lapses require dated state transitions or comparable recorded
   snapshots. This implementation explicitly reports timing unavailable.

Engineering sign-off can establish faithful, repeatable calculations. Editorial
sign-off must establish that admitted promises, tests and outcome evidence are
fair. A cleaner graph cannot fix an overstated promise or unsupported failure.

### Latest-main integration

Pulled Muse's `dbb5a9a` during the build. Kept the new tour copy and future
Index direction, but corrected present-tense methodology claims to match
actual v1: curated positions, uniform nodes, primary category kept share,
Overall still available. No semantic/impact sizing or Index was implemented.
Restored the Atlas first-visit tour guard so linked evidence remains in place;
explicit Tour replay still works.

### Engineering acceptance

Production build/TypeScript and 43 focused regression tests passed. Verified
BTC mobile card at 360px: 9/16 kept, 5 open, 1 lapsed, 1 retired; Payments 5/7.
Followed the lapsed receipt into the Atlas drawer and confirmed exact status,
stored rationale, source-role warning and full-record link. Seven Unclassified
records remain visible. All counts are from the 115-record published-run
fixture; no hosted schema change or scoring publication was performed.
Editorial acceptance remains open for the research findings above.
