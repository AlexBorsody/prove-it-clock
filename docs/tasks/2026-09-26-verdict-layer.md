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
