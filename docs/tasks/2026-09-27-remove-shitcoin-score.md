# Remove the Shitcoin score — 2026-09-27

**Alex's decision.** Remove the Shitcoin score and badge entirely, now.

## Rationale

The evidence-over-ranking pivot (2026-09-27) says: present the data, let people
decide. A SHITCOIN badge is the product deciding. It also smuggles qualitative
judgment inside a mechanical rule: "core promise lapsed" depends on the `core`
flag, which is a researcher's judgment call. The Bitcoin 7 proved the formula
reads as random. The receipts have teeth on their own; the badge is theater.

## What gets removed

- The shitcoin dial/badge from project pages (including the Genesis-adjacent
  layout), scoreboard, compare table, HYPE cards, homepage.
- The `shitcoin_warning` field from the public API and the OpenAPI spec.
- The categorical verdict function (`lib/verdict.ts` and its gauge mapping) as
  a user-facing instrument. Archive, do not repurpose as a hidden score.

## What stays

- The heart meter. One promise, one heart: earned, open, lapsed, retired. It is
  a quantifiable inventory, not a judgment, and it is explicitly preserved.
  Category sorting of promises is organization, not ranking. The Atlas stays as
  the evidence view.
- Promise states as facts. `lapsed` and `retired` remain on promise records;
  the promise list and timeline keep showing them with dates and sources.
- Documented problems as inspectable items, per the direction-v2 viz contract
  ("Warning: inspect documented problems"). A section that lists what failed,
  with evidence links. No badge, no dial, no category label.
- Delivery composition counts (K/F/O/U). Factual, stays.

## Notes

- This supersedes the "warning as a mechanical flag" line in the
  evidence-over-ranking brief. There is no flag anymore, only the documented
  problems themselves.
- The friend's warning-formula question is closed. Do not build a replacement
  score.
- Copy must not reintroduce verdict language ("risk", "watch", "verdict") as a
  badge. "Documented problems" with evidence links is the vocabulary.

## Codex implementation checkpoint — 2026-09-27

Owner: Codex, isolated branch `codex/remove-warning-score`, based on `71faacf`.
The shared checkout and PR #8's in-progress composition work are untouched.

- Removed the warning instrument from project pages, home, Compare, HYPE,
  sorting, the public API and OpenAPI. Archived its evaluator, gauge, old
  one-line summaries and tests under `docs/archive/warning-score-2026-09-27/`.
- Project pages expose a collapsed **Documented problems** index of the
  published lapsed/retired records. Each links to its existing assessment and
  evidence; the date is explicitly the assessment date, not an invented event
  date. Compare's lapsed/retired counts also link to those records.
- Hearts, promise states, Genesis designation, Atlas and existing category
  organization remain. No replacement rating or database/scoring changes.
- API compatibility: `shitcoin_warning` is removed, not set to null, from the
  existing v1 responses. The OpenAPI document is version 1.1.0; consumers must
  stop reading that retired field.
- PR #8 handoff: retain this removal when rebasing; keep only the approved
  unweighted composition and pinned evidence receipts, without weights,
  warning categories or a replacement verdict.

Validation: seven focused promise/composition tests pass, TypeScript passes,
production build passes, and `git diff --check` is clean. No broad regression
suite added. Build retains the existing Next `themeColor` metadata warnings.

Local production preview used the captured 2026-09-26 published ledger through
a read-only Supabase fixture (8 projects / 115 promises), with external context
providers unavailable. Checked BTC at 360px (no horizontal overflow, 9/16 hearts,
Atlas, expanding Documented problems and opening P11 evidence), home at 1280px
(no warning column/sort, aligned column groups), and Compare (no warning row;
XRP's lapsed count opens its filtered promise records). Local API list, BTC detail
and OpenAPI omit the retired field; BTC remains Genesis with 16 promises. This
checks data/UI integrity, not whether every editorial assessment is correct.

The first development preview repeatedly hit a client webpack error at
ProjectAtlas. A clean production build and `next start` preview worked; the
development-only error is unresolved, not claimed fixed. No production
deployment, hosted schema change, or scoring publication was performed.

Review handoff: inspect the collapsed evidence index and intentional public
API field removal; PR #8 should adopt these changes before proceeding.
