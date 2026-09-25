# Prove-It: Implementation Plan

**2026-09-25.** [vision.md](vision.md) is the authority; this doc is the
build order. No code gets written that is not in this plan. When the plan
and the vision disagree, the vision wins and the plan gets fixed.

## Where the system stands

- 8 projects published, earned-only, claim-type rule v2
  (`hearts claim-type rule v2 (adopted 2026-09-25; time decay removed;
  allowance removed 2026-09-25)`). Current run: `hearts-8project-2026-09-25d`
  plus 21 restated historical runs, all in Supabase via `publish_heart_run`.
  Original allowance-era runs remain as the immutable audit archive.
- Live site serves the latest run from `heart_runs` / `heart_rankings`.
- CODE data: GitHub fetcher exists (`/api/vitals/[slug]`, 8 curated repos,
  6h revalidation). HYPE data: `social_snapshots` table + daily collector,
  1 week collected. USE data: none yet.
- Working tree is clean at this plan's writing; the one partial UI pass
  from the superseded brief was reverted.

Current earned scores (2026-09-25, earned-only):

| Project | Hearts | Promise states | Expected verdict |
|---|---|---|---|
| BTC | 5/20 | 3 fulfilled, 1 active | No concern |
| ETH | 5/20 | 4 fulfilled, 1 active | No concern |
| SOL | 5/20 | 4 fulfilled, 2 active | No concern |
| LINK | 4/20 | 3 fulfilled, 1 active | No concern |
| AVAX | 5/20 | 3 fulfilled, 1 active | No concern |
| BAT | 3/10 | 2 fulfilled, 1 active | No concern |
| XRP | 2/20 | 2 fulfilled, 1 active, 1 retired | Delivery concern |
| DASH | 5/20 | 5 fulfilled, 1 active, 1 lapsed | Delivery concern |

## Phase 0: Vision and plan (this session)

Docs written, tree clean, Alex reviews vision + plan before any code.
Done when Alex says go.

## Phase 1: Data layer

1. `app/src/lib/verdict.ts`: pure function
   `verdictFor(promises) -> { category, failedLineages }`. Rules from
   vision.md. Unit tested (`npm run test:hearts` or a new
   `test:verdict` script). Mechanical check: XRP and DASH ->
   Delivery concern, other six -> No concern.
2. `app/data/verdict-lines.ts`: analyst-written one-liner per project,
   reviewed, updated only when promise states change. Drafts for review:

   - BTC: "Delivered payments at scale and the store-of-value case."
   - ETH: "Delivered the Merge, rollups, and a live dapp ecosystem."
   - SOL: "Delivered high-throughput mainnet and a live ecosystem."
   - LINK: "Delivered oracle feeds and CCIP."
   - AVAX: "Delivered subnets and a live DeFi ecosystem."
   - BAT: "Delivered the Brave Ads loop and creator payouts."
   - XRP: "MoneyGram corridor retired; bank settlement never delivered."
   - DASH: "Merchant economy lapsed; core privacy features holding."

3. Summary helpers in `heart-data.ts`: CODE word (Active = commits in
   last 90d across tracked repos; Quiet = none; Unknown = fetch failed),
   HYPE word (absolute mentions/week; "collecting" until 8-week baseline,
   no trend percentages before week 9), USE word ("coming" until metrics
   are defined).
4. Sparkline data: expose each project's published earned hearts for the
   active methodology via the existing `/api/hearts` routes. No new
   endpoint unless the existing shape cannot carry it.

Acceptance: `tsc --noEmit` clean, verdict tests pass, the eight verdicts
match the table above exactly.

## Phase 2: Homepage scoreboard

One clean card per project: coin icon + name, heart meter (earned-only),
verdict badge (categorical, color-coded), CODE/USE/HYPE one-word row,
heart-history sparkline. Built for scanning and comparing; nothing else
on the card.

Acceptance: 8 cards, correct hearts and verdicts, sparklines render from
published runs, no em dashes, no timestamps, no count labels.

## Phase 3: Detail page

1. Header: name, hearts, verdict badge, one-line why (from
   `verdict-lines.ts`).
2. Four stat cards: PROMISES / CODE / USE / HYPE per vision.md. USE card
   shows the honest "metrics coming" state. HYPE card shows absolute
   mentions + baseline week.
3. Delivery Timeline: hearts step-line on top; CODE/HYPE activity strip
   below with toggle. USE toggle hidden until its metrics exist. Failed
   collection never renders as zero.
4. Promises list with status icons. State mapping: active -> Fulfilled,
   unfulfilled -> Active, lapsed/retired -> Abandoned. Overdue is defined
   in the model but has no v1 trigger and does not render.
5. Evidence / Methodology bottom section: sources, tracked repos, data
   coverage, methodology version, run id. Replaces the "under the hood"
   drawer (same content, visible by default).
6. Legacy v0.2.0 timeline section: remove or keep per Alex's call (open
   question 3 below). Default recommendation: remove; the Delivery
   Timeline supersedes it and two timelines on one page is clutter.

Acceptance: all eight detail pages render with correct data, toggle
works, empty states honest, `next build` clean.

## Phase 4: Methodology page and ship

1. Methodology page: categorical verdict rules, earned-only hearts copy,
   the methodology-update marker ("free hearts removed; historical
   scores recalculated; not a change in project performance"), Prove-It
   Data section (source, definition, coverage, calculation, timestamp,
   methodology version per metric family).
2. Full verification: `npm run test:hearts`, `tsc --noEmit`,
   `next build`, mechanical verdict check, screenshot review of home +
   two detail pages (one No concern, one Delivery concern).
3. Commit, push via `~/workspace/bin/gh-push.py`, verify Vercel deploy
   and the live pages.

## Invariants (unchanged)

- Snapshots immutable; runs append-only; history never rewritten.
- One run_key per run; the RPC raises on conflict, nothing partial writes.
- Reads go through `heart_rankings` (published runs only).
- Secrets in ignored env / deployment config, never in the repo.
- Direct Postgres on 5432 is blocked from this VM; use REST or the
  dashboard SQL editor, never raw psql.

## Open questions for Alex

1. **USE on the home card:** show "USE -" as an honest placeholder, or
   hide the USE slot until real metrics land?
2. **HYPE word:** once the 8-week baseline exists the word is vs
   baseline; until then, show just "collecting" or rank vs the
   cross-project median that week?
3. **Legacy v0.2.0 timeline** on the detail page: remove now, or keep
   per the earlier standing rule?
4. **Verdict one-liners:** approve the eight drafts in Phase 1, or edit?
