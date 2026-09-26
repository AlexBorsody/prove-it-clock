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
- UI 2026-09-25: teaching homepage (the question + four factors), mobile
  project cards, Shitcoin warning as a 1-10 meter (number only, no category
  labels). Every metric taps to its data: meter -> project verdict breakdown
  ("What feeds this meter" lists each failed promise), HYPE -> /hype,
  CODE -> /code.

Current earned scores (2026-09-25, earned-only):

| Project | Hearts | Promise states | Meter |
|---|---|---|---|
| BTC | 5/20 | 3 fulfilled, 1 active | 1 |
| ETH | 5/20 | 4 fulfilled, 1 active | 1 |
| SOL | 5/20 | 4 fulfilled, 2 active | 1 |
| LINK | 4/20 | 3 fulfilled, 1 active | 1 |
| AVAX | 5/20 | 3 fulfilled, 1 active | 1 |
| BAT | 3/10 | 2 fulfilled, 1 active | 1 |
| XRP | 2/20 | 2 fulfilled, 1 active, 1 retired | 7 |
| DASH | 5/20 | 5 fulfilled, 1 active, 1 lapsed | 7 |

## API

**Codex review strategy, 2026-09-25. Plan first; API code unchanged.**
Build on Muse's public API in `8af2b9f`: `GET /api/v1/scores`,
`GET /api/v1/scores/{slug}`, and Swagger at `/developers`.
`app/src/lib/openapi-spec.ts`, served at `/api/v1/openapi.json`, stays the
single [OpenAPI 3.0.3](https://spec.openapis.org/oas/v3.0.3) contract.
Keep Next.js route handlers and the existing Supabase readers.

Improve in this order:

1. **Match responses to the spec.** `public-api.ts` currently returns raw legacy
   promise states and full timestamps where the spec describes canonical states
   and date-only values. Normalize states at the boundary, declare timestamps
   as `date-time`, specify required/nullable fields and 400/404/503 error bodies.
   Validate pagination instead of accepting inputs such as `page=2junk`.
   Correct the HYPE description: absolute mentions can exist before its baseline.
2. **Make rank agree with the scoreboard.** The API currently uses market-cap
   order; the homepage ranks by earned/capacity, then earned hearts, then name.
   Use that same ordering before pagination and the same rank in list/detail.
   Update the spec with the behavior change. Unavailable assessments must not
   become a clean warning level or a zero score; represent them explicitly.
3. **Read only what is needed, once.** Fetch HYPE once per list request, not
   once per project. Use latest-per-project observations; the current ascending
   1,000-row query eventually omits the newest data. Detail/history must not
   silently stop at 100 projects/points: use direct lookup and bounded history
   pagination with truncation/continuation documented. Preserve null for missing
   CODE/HYPE; distinguish failed history reads from a successful empty history.
4. **Verify the contract.** Add focused route tests for list/detail agreement,
   legacy states, null data, invalid pagination, unknown slug, database failure
   and multi-page history. Validate response fixtures against the OpenAPI
   schemas, run typecheck/build, and check Swagger on the current deployment
   (use a relative API server URL so local docs do not call production).

Keep this pass on the public v1 contract. Legacy `/api/projects` routes stay
separate. Deliver small fixes with their spec and tests in the same commit.
Muse owns the concurrent strategy/vision/hearts documentation reorganization.

## Site search

Search indexes the actual text of tagged HTML containers. Each has a stable,
namespaced `id` plus `data-search-title`, `data-search-kind`, optional project
and keywords. Shared `search-section` classes handle presentation; IDs identify
individual targets. `searchMeta()` supplies the contract. Preserve IDs when copy
changes and add the same tags to new content sections.

The dropdown searches titles, metadata and body text with the existing Fuse.js,
shows snippets and all matches in a scrolling list, and links to `page#section`.
Deep links open enclosing details panels and focus/highlight the target.
The server uses LinkeDOM to read rendered HTML; no page scripts run in the crawler.
Static docs and live project sections use the same path. New page types go in
`siteSearchPaths()`; published project routes are discovered from the database.

`GET /api/search-index` stores a shared index in Next's Data Cache. Crawl attempts
are cached for a rolling 24 hours, including failures. A search or every fifth
page visit in the browser session checks the index; after 24 hours, Next serves
the cached attempt while refreshing in the background. Each newer complete
index becomes the saved fallback. Failed or partial refreshes keep that last
complete index; on the first build, partial coverage is explicitly shown.
Cache scope is the deployment origin. Requests in one process share an active
crawl; simultaneous cold starts across instances can still duplicate it. Fresh
deployments/cache resets can warm again. This is request-triggered refresh,
not an unattended daily scheduler.

Set `SEARCH_SITE_URL` to this deployment's origin for non-Vercel hosting or a
custom local port; Vercel defaults to `VERCEL_URL`, development to localhost:3000.
Only allowlisted same-origin pages are read, with bounded concurrency/time and
no redirects. A protected preview must make its public pages reachable to its
own indexer. No external search service or database migration is needed.

Library review: [Fuse.js](https://www.fusejs.io/) fits this small dynamic site;
[Pagefind](https://pagefind.app/docs/running-pagefind/) primarily indexes generated
static HTML. [Next Data Cache](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)
provides shared daily caching. Verify with `npm run test:search`, typecheck/build,
then search body text, follow a cross-page result, and open a closed methodology
section from its result. Repeated index requests should retain `generated_at`.

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
coin (icon + name, links to detail), hearts meter (earned-only), Shitcoin
warning dial (1-10, number only), CODE / USE / HYPE compact columns,
Proof history sparkline column on desktop. Sortable by column. Mobile
renders one card per project instead of the table. Compare button above
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
mentions + change vs baseline, Shitcoin warning dial. Sortable by mentions
and by hearts. Gated like all HYPE trends: absolute mentions only until 8 weeks
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
- Shitcoin warning dial (1-10, number only) + one-liner
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
   hearts, Shitcoin warning dial, one-line why from `verdict-lines.ts`),
   then the verdict inputs ("What feeds this meter": each failed promise
   with state and core flag, or the clean/overdue note), then the
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
7. Legacy v0.2.0 timeline section: DECIDED 2026-09-25 (Alex): keep it.
   The detail page carries both the Delivery Timeline and the legacy
   timeline; no merge.

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
3. **Legacy v0.2.0 timeline:** DECIDED 2026-09-25 (Alex): keep both
   timelines on the detail page.
4. **Verdict one-liners:** approve the eight drafts in Phase 1, or edit?
5. **Index gating:** DECIDED 2026-09-25 (Alex): gate it. The public Index
   waits for real USE data. No provisional scores, per the gating rule.
