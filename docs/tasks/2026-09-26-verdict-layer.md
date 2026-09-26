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
