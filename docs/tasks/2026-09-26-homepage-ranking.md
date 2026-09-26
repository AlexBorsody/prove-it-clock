# Homepage ranking: category switcher + sorting — Codex task brief

**2026-09-26, Alex's direction.** Two related upgrades to the homepage
scoreboard. This is the homepage surface of the verdict layer's per-category
rankings ([verdict-layer brief](2026-09-26-verdict-layer.md), V3); it does not
replace that brief.

## Part 1: rank by promise category

Add a category switcher above the scoreboard using the Atlas taxonomy
(Money, Payments, Platform, DeFi, Privacy, Interop, Governance,
Real-world, plus Unclassified visibility).

- Selecting a category re-ranks the rows by kept share **within that
  category**.
- Membership is **primary assignments only**, matching Atlas region counts
  (per the verdict-layer review notes: the Atlas category filter includes
  secondary matches and cannot be reused unchanged as the receipt for a
  primary-only total).
- Each row shows kept/total in the selected category, e.g.
  "4/5 kept in Payments". Kept/total stays visible alongside any share so
  1/1 and 10/10 keep their context; equal shares tie.
- Projects with **no promises in the selected category are unranked**,
  never 0%.
- Unknown states and Unclassified coverage stay explicit, as on the Atlas.
- "Overall" (today's hearts ranking) remains the default view. Replacing
  the existing scoreboard is not authorized by this task; Alex has not
  decided that yet.

## Part 2: sort by stars, commits, hearts, hype, market cap

The table already sorts by hearts, verdict, code (activity word), and hype.
Extend sorting to:

- **GitHub stars** — numeric descending. Data is already in the row
  (`codeStars`, added 2026-09-26).
- **GitHub commits (90d)** — numeric descending. Data is already in the row
  (`codeCommits`).
- **Hearts** — already exists, keep.
- **Hype** — already exists, keep.
- **Market cap** — numeric descending, nulls last. Data: one batched
  server-side `fetchUniverseMarkets(20)` call
  (`app/src/providers/coingecko/index.ts`), matched to rows by slug/symbol.
  Market data is context only and never feeds any score, per the standing
  rule.

Rules for all sorts: numeric descending, nulls/unknowns last, stable
tiebreak by name. The sort control must work on desktop and the mobile
card layout. URL state for the chosen sort (so it survives back/forward)
follows the existing pattern used by the CODE page sort.

## Data rules

- Category totals derive from the published ledger only. No re-grading, no
  invented numbers.
- A new published run updates category totals with no code changes.

## Acceptance

- Category switcher visible above the scoreboard; switching re-ranks rows
  and each row's kept/total matches the Atlas primary-only counts for that
  category.
- All five sorts (stars, commits, hearts, hype, market cap) work from the
  homepage on desktop and mobile; nulls sort last.
- Existing default view, verdict column, and filters unchanged.
- Build, typecheck, and relevant tests pass.
