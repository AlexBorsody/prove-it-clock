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

## Implementation progress (Codex, 2026-09-26)

- Added native category and Sort by selects for desktop and mobile, with URL
  state and Back/Forward restoration. Overall remains the default.
- Category ranks use primary-only kept/total; equal shares tie. Nonmembers
  appear below members as Unranked, not 0%. Rows link to the exact Atlas receipt.
- Stars, commits, hearts, hype and market cap sort numerically, highest first.
  Missing values sort last. Existing warnings and project-card links remain.
- One batched market request joins by canonical provider ID. Records outside
  the top-20 response stay unavailable. No market numbers enter the verdict.
- Desktop and 360px mobile browser checks exercised all five sorts, category
  switching, tied ranks and the Payments receipt. Found an existing long CODE
  chip overflow on mobile; the card's metric text now wraps.
- Pure tests cover zero vs null, tied shares with different denominators,
  category nonmembers, unknown/unavailable records and provider-ID mismatches.

### Verification

Production build/TypeScript passed; 43 combined focused tests passed. Browser
checked desktop 1280px and mobile 360px controls, sort URLs, Back restoration,
category ties/nonmembers and receipt navigation. Final mobile page width matched
its 360px viewport. Local browser data used the captured published ledger with
controlled GitHub/market fixtures; fixture market values are not live prices.
