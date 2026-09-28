# Home overview restructure — brief for Codex

Date: 2026-09-27. Status: implementation authorized by Alex on September 28 ("No it's tasks for you"). Built on `codex/home-overview-restructure`; review checkpoint below.

## Goal
Subtract tabs, not add them. One home overview page per market. Compare and Metrics stop being tabs.

## Target structure

**Top-level nav:** market switcher, Crypto | Stocks, side by side as a segmented control with hard icons (one consistent SVG set, per standing UI rules). Crypto and Stocks stay FULLY separate — separate data paths, separate views. The switcher only chooses which market's existing views render. Never merge the datasets.

**Home overview page (per market), top to bottom:**
1. Market switcher (segmented, Crypto | Stocks, icons).
2. Stat strip: the Metrics tab's headline numbers as one compact row. Metrics tab is deleted. Deeper metric cuts live behind expand (progressive disclosure), not on a second screen.
3. Asset list: cards/list toggle, default view unchanged. Cards stay exactly as they are — heart meter, verdict, tap to expand. Promise categories live in the expanded detail only. List view may carry a one-line category summary since it scrolls.

**Compare becomes a mode, not a tab:**
- Checkboxes on cards / rows to select assets.
- Sticky compare bar slides up at the bottom once 2+ are selected (thumb-friendly on mobile).
- Tapping it opens the side-by-side compare view as a full overlay, REUSING the existing compare table component. The table needs width — it never gets squeezed into the overview scroll.
- Compare tab is deleted.

**Bottom tab bar:** gains a search icon (room freed by deleting Compare/Metrics tabs). Search behavior itself is Codex's build in progress — this brief only approves the icon placement, no interference.

## Anti-slop constraints (hard)
- This is a MOVE, not a rebuild. Reuse existing components in their new positions. No new components unless necessary, and flag each one.
- COPY FREEZE: no wording or microcopy changes ride along with this restructure. Layout move only.
- No em dashes anywhere. No timestamps, no count labels (standing rules).
- Desktop-first verification per standing rule (no mobile viewport emulation here — desktop render + mobile CSS inspection, Alex checks on his phone).

## Build slices (in order, each rendered and reviewed before the next)
1. Market switcher on home (Crypto | Stocks, separate data paths verified).
2. Metrics stat strip on overview + delete Metrics tab.
3. Compare mode (select → bottom bar → overlay reusing compare table) + delete Compare tab.
4. Final pass: full visible-copy re-read of every touched view before any push.

## Out of scope
- Tip + feature-request page (separate brief: docs/tasks/2026-09-27-tip-feature-request-page.md).
- Auth / user management (deferred; nullable user_id columns already reserved).
- Any new metrics, any new copy, any new tabs.


## Codex implementation checkpoint, September 28

Baseline: `origin/main` `aad5c60`. Work is isolated in
`/private/tmp/prove-value-home-overview`; Muse's shared checkout is untouched.

- Crypto and Stocks use separate routes and readers under a shared market
  switcher. Existing Cards/List defaults and saved preferences remain.
- `/metrics` had no headline dataset; it redirected to `/compare`. The strip
  therefore reuses existing **selected-asset** context, never sums projects:
  Crypto shows stars, 90-day commits, saved Hype mentions and market cap;
  Stocks shows the selected company's latest reported revenue, net income and
  free cash flow. Missing data stays unavailable. Stock reporting periods and
  source links remain attached to the figures.
- Expanded context reuses `CodeRow`, `HypeExplorer` and `StockFundamentals`.
  News loads only when expanded; its project follows the strip selection.
- Compare checkboxes share selection across Cards/List, start empty and retain
  the existing four-asset limit. Two selections reveal the bottom bar; the
  modal reuses the comparison table. Stock columns use a separate fundamentals
  contract, including private-company empty states. No crypto fields are
  synthesized for companies.
- Context and Compare navigation tabs are removed. Bottom Search opens the
  existing header search. Legacy `/code`, `/hype` and `/compare` URLs remain;
  `/metrics` goes to the overview context. Atlas entry and brand icon remain.
- Categories appear inside expanded cards and as one line in List. The old
  category selector is removed; category receipt links still open Atlas.
  Existing sort controls remain, with no new ordering or scoring feature.
- Copy pass preserves existing cards and comparison text. No new explanatory
  paragraphs, updated-at stamps or selection-count labels. The old published
  ledger date above the list is removed. Necessary labels reuse existing words.

Necessary new components: `MarketSwitcher` (route selector), `OverviewContext`
and `StockOverviewContext` (compact selected-asset context), `CompareMode`
(shared selection/bar/dialog), and `StockCompareTable` (company-specific cells
in the existing table's extracted `ComparisonGrid`). Existing renderers and
formatters are reused. No new dependencies, API endpoints or database changes.

Desktop interaction checks at the browser's 1280px viewport covered both market
routes, context expansion, a missing private-company record, Cards/List
selection persistence, the four-selection limit, checkbox selection without
navigation, comparison contents, Escape/focus return, expanded-card
categories, and bottom Search focus. Crypto interaction checks used a temporary
route populated from the checked-in September 26 seed; it was removed before
building. The unconfigured real local home correctly showed ledger unavailable.
These are local UI checks, not verification of current hosted data.

Mobile CSS was inspected for wrapping, 44px targets, table scrolling, safe-area
padding, and bottom-navigation clearance. No mobile viewport emulation was used;
Alex's phone check remains. Pending heart PR #18 is not merged or replaced by
this branch; reconcile its wrapper when either PR merges. No production release
or hosted publication is claimed.

Checks: `npm run build` passed, including TypeScript validation and route
generation; `git diff --check` passed. The build reports existing themeColor
metadata warnings. No new test suite or repeated full regression run was added.

Review: [PR #21](https://github.com/AlexBorsody/prove-it-clock/pull/21),
implementation commit `08db796`. Handoff on PR #18 identifies the overlapping
heart wrapper work; neither PR was auto-merged.
