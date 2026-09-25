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

Docs written, tree clean. Alex said go 2026-09-25 ("get started building
one step at a time"). Build proceeds phase by phase below.

## Phase 1: Data layer

1. `app/src/lib/verdict.ts`: pure function
   `verdictFor(promises) -> { category, failedLineages }`. Rules from
   vision.md. Unit tested (`npm run test:hearts` or a new
   `test:verdict` script). Mechanical check: XRP and DASH ->
   Delivery concern, other six -> No concern.
2. `app/data/verdict-lines.ts`: analyst-written one-liner per project,
   updated only when promise states change. Drafts below ship as-is and
   Alex edits on the verification pass (open question 4):

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

CoinMarketCap-style dense table (vision.md): rank (# by hearts filled %),
coin (icon + name, links to detail), hearts meter (earned-only), verdict
badge (categorical, color-coded), CODE / USE / HYPE compact columns,
heart-history sparkline column. Sortable by column. Compare button above
the table opens Phase 2b.

Below the table: stacked area chart of HYPE share across projects over
time (from `social_snapshots`).

Dark theme ships with this phase: the whole app goes dark, CMC-style.
Slogan "Truth, not hype." under the page title.

Acceptance: 8 rows, correct hearts and verdicts, sparklines render from
published runs, sorting works, dark theme throughout, no em dashes, no
timestamps, no count labels.

## Phase 2a: HYPE leaderboard tab

CMC Alpha > Socials pattern per vision.md: rows of coin, hearts, HYPE
mentions + change vs baseline, verdict badge. Sortable by mentions and by
hearts. Gated like all HYPE trends: absolute mentions only until 8 weeks
of snapshots, then change vs baseline. No sentiment column, ever.

The hype bubble (vision.md): animated bubble per project, bubble size =
HYPE mentions, substance fill = hearts filled %. All sizzle, no steak
reads at a glance.

Acceptance: rows render from `social_snapshots`, sorting works, bubbles
render with honest proportions, baseline gating honest, no em dashes.

## Phase 2b: Compare view

Route `/compare`. Pick 2-4 projects (default 4); metrics as rows,
projects as columns:

- Hearts (compact meter + earned/capacity)
- Verdict badge + one-liner
- Promises: N fulfilled · N active · N open · N lapsed · N retired
- CODE: activity word + commits 90d + contributors + last release
- USE: per-project metric, or honest "coming"
- HYPE: mentions/week + baseline status
- Index: mini sparkline + current score (renders only when the Index
  itself renders)

Every row header links to the methodology anchor that defines the metric
and its limits. Numbers never appear without their context. Horizontally
scrollable on mobile; project names link to detail pages. Entry point: a
Compare button on the homepage.

Acceptance: 2-4 project selection works, all rows correct against the
data layer, methodology links land on the right anchors, mobile scrolls
cleanly.

## Phase 3: Detail page

1. Header: CoinMarketCap-style coin header (icon, name, rank badge, big
   hearts, verdict badge, one-line why from `verdict-lines.ts`), then the
   stat strip: PROMISES / CODE / USE / HYPE per vision.md. USE stat shows
   the honest "metrics coming" state. HYPE stat shows absolute mentions +
   baseline week.
2. Delivery Timeline: hearts step-line on top; CODE/HYPE activity strip
   below with toggle. USE toggle hidden until its metrics exist. Failed
   collection never renders as zero.
3. HYPE mindshare bump chart: per-project rank by mentions over time,
   30d/90d toggle, coin icons on rank lines. Gated on 8 weeks of snapshots
   like all HYPE trends; before that, the section does not render.
4. Delivery-health gauge in the header stat strip: hearts filled %,
   green/amber/red. Never sentiment.
5. Promises list with status icons. Canonical promise states: open /
   active / fulfilled / lapsed / retired. Legacy DB values normalize at the
   boundary (unfulfilled -> open, old active -> fulfilled); display labels
   match the states. Note: every stored "active" today means the legacy
   earning sense (= fulfilled). The in-progress sense of "active" has no
   stored instances and must not be written to storage until a backfill
   relabels stored rows; readers cannot distinguish the two senses. Overdue
   is defined in the model but has no v1 trigger and does not render.
6. Evidence / Methodology bottom section: sources, tracked repos, data
   coverage, methodology version, run id. Replaces the "under the hood"
   drawer (same content, visible by default).
7. Legacy v0.2.0 timeline section: the Phase 3 build removed it; the
   Delivery Timeline is the single timeline on the page. Pending Alex's
   confirmation (open question 3 below).

Acceptance: all eight detail pages render with correct data, toggle
works, empty states honest, `next build` clean.

## Phase 4: Verify and ship

1. Methodology page: DONE 2026-09-25 (rewritten, collapsible sections,
   bigger type, live on Vercel).
2. Full verification: `npm run test:hearts`, `tsc --noEmit`,
   `next build`, mechanical verdict check, screenshot review of home +
   two detail pages (one No concern, one Delivery concern).
3. Commit, push via `~/workspace/bin/gh-push.py`, verify Vercel deploy
   and the live pages.

## Gating rule: nothing unfinished ships

A section, metric, or verdict that lacks real data or a reviewed definition
does not render publicly. No "coming soon" panels, no provisional scores,
no zeros standing in for unknowns. The UI shows only what is real; the
rest waits in the plan.

Currently gated:

- **Prove-It Index**: hidden until USE metrics and the CODE score
  definition both exist and are reviewed.
- **USE stat card / home row**: renders "metrics coming" until per-project
  USE metrics are defined. Never a number before that.
- **HYPE trend percentages**: gated on 8 complete weeks of snapshots.
  Until then, absolute mentions + "baseline collecting, week N/8".
- **Watch verdict**: no v1 trigger. Renders nothing until deadline
  evidence is researched and reviewed.
- **Overdue promise state**: defined in the data model, never rendered
  until deadline evidence exists.
- **USE timeline toggle**: hidden until USE metrics exist.
- **Valuation, rebrand, timeline strips beyond CODE**: parked, not gated.
  Parked means no spec and no build; gated means spec'd and waiting on
  data.

## Phase 5: Prove-It Index (gated)

Builds only after the USE metrics and the CODE score definition exist.
The formula is locked in vision.md; this phase is data plumbing and UI.

1. **Research first.** Per-project USE metrics (intended use only) and the
   CODE score 0-1 definition (sustained activity on curated repos: what
   counts, what "stalled/resumed" means, anti-gaming notes). Both written
   up, reviewed, and versioned before any Index code.
2. **Event log.** New append-only table `index_events`: project_slug,
   occurred_at, event_type (promise_fulfilled, promise_lapsed, promise_retired,
   deadline_missed, major_release, usage_milestone, dev_resumed,
   dev_stalled, hype_spike), title, note, evidence_url. Promise events
   backfill from published heart runs; releases from the GitHub releases
   API; dev resumed/stalled from commit activity; hype spikes from
   social_snapshots once the baseline exists. Deadline_missed and
   usage_milestone have no v1 triggers and stay empty until their data
   exists.
3. **Computation.** Pure function `indexFor(project, asOf) -> { score,
   components: { promises, use, code }, events }`. Promises = 60 *
   earned/capacity from the active-methodology runs. Integer 0-100.
   Tested like the verdict function.
4. **UI.** Detail-page section per vision.md: 0-100 line through time,
   weights disclosed beside it, clickable markers showing the event note
   and evidence link. Hype-spike markers render as context-only. The
   section does not render until all three scoring components have real
   inputs.

Acceptance: formula matches vision.md exactly; every plotted move has a
marker; every marker has an evidence link or a stated reason; `next build`
clean.

## Invariants (unchanged)

- Snapshots immutable; runs append-only; history never rewritten.
- One run_key per run; the RPC raises on conflict, nothing partial writes.
- Reads go through `heart_rankings` (published runs only).
- Secrets in ignored env / deployment config, never in the repo.
- Direct Postgres on 5432 is blocked from this VM; use REST or the
  dashboard SQL editor, never raw psql.

## Open questions for Alex

1. **USE on the home row:** DECIDED 2026-09-25: show "coming" as the
   honest placeholder per the gating rule (never hide the slot, never
   show a number).
2. **HYPE word:** once the 8-week baseline exists the word is vs
   baseline; until then, show just "collecting" or rank vs the
   cross-project median that week?
3. **Legacy v0.2.0 timeline** on the detail page: the Phase 3 build removed
   it, leaving the Delivery Timeline as the single timeline. Confirm this is
   the final call, or say restore.
4. **Verdict one-liners:** approve the eight drafts in Phase 1, or edit?
5. **Index gating:** DECIDED 2026-09-25 (Alex): gate it. The public Index
   waits for real USE data. No provisional scores, per the gating rule.
