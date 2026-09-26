# Prove Value: Implementation Plan

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
custom local port; Vercel production uses `VERCEL_PROJECT_PRODUCTION_URL`
(generated deployment URLs may be protected), previews use `VERCEL_URL`, and
development defaults to localhost:3000.
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

- **Prove Value Index**: hidden until USE metrics and the CODE score
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

## Phase 5: Prove Value Index (gated)

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

## Appendix: Hearts algorithm (promise-heart rule v3)

The scoring rule, precisely. Also rendered on the site at
`/case-studies/algorithm`.

<!-- ALGORITHM-START -->
# Hearts: promise-heart rule v3

**Adopted 2026-09-25 (Alex).** Every tracked promise earns exactly one heart
when fulfilled, zero otherwise. Capacity is the promise count: 16 promises
means a 16-heart meter. Amended 2026-09-25 (Alex): community-promise rule for
founderless protocols ("Where promises come from"). Historical runs were
restated under the new rule and republished; original runs remain as an
immutable audit history. One meter per project: **filled / capacity**.
Live in production: append-only runs in Supabase, published via RPC, served by
the site. Methodology string:
`hearts promise-heart rule v3 (adopted 2026-09-25; one promise = one heart; capacity = promise count)`.

> Methodology update: fixed capacity tiers {5, 10, 20} and reward weights
> {0, 1, 2} removed. One promise = one heart. Historical scores restated.
> This is not a change in project performance.

## The idea

Every promise the project made gets one heart slot. Keep the promise, earn
the heart; fail it, earn nothing. **A heart remains earned only while the
evidence condition under which it was awarded remains true**: milestone
claims ("shipped mainnet") are permanent once achieved; ongoing claims
("advertisers are buying ads") must be revalidated. Scores change because
evidence changes, not because time passes. No weighting, no free hearts,
no decay.

## Constants (versioned, never per-project)

REMOVED 2026-09-25: `CAPACITY_TIERS` {5, 10, 20}; `REWARDS` {0, 1, 2};
`MAX_ALLOWANCE` (was min(3, floor(capacity / 5))). Time-based decay is
deliberately absent: no grace period, no per-year drain. (Adopted 2026-09-25:
generic decay killed as arbitrary; see case-studies/review.md.)

## Per-project inputs (analyst-set, rationale required, versioned)

**Capacity**: the promise count. No tiers, no headroom.

**Promise lineages**: each lineage is typed at carving:
- **milestone**: "shipped X". Fulfillment is permanent; time cannot unship it.
- **ongoing**: "X is true" (activity, volume, participation). The heart exists
  only while the evidence condition is currently satisfied.

States: open / active / fulfilled / lapsed / retired. A milestone
goes open → fulfilled (permanent). An ongoing claim goes open → active →
fulfilled while the evidence condition holds, and lapses when evidence stops
supporting it: lapsing is reversible, so the graph
can fall and rise again on real events. A fulfilled-then-dead lineage
**retires** its hearts as a separate visible event: the graph rises at
fulfillment and falls at retirement; history is never rewritten. A replaced
promise is recorded as retired with a note pointing at the new lineage (no
double count). One lineage is the **core promise**: a label for the main
promise, not a gate; it earns its heart like every other promise.

## Where promises come from

The default source is the issuer: the whitepaper, the launch announcement,
the claims the team put in writing. That is what the instrument holds the
project to. Any attributable public statement qualifies: whitepapers, tweets,
interviews, articles, websites, founder statements.

Founderless protocols have no issuer, so the rule adapts: promises can be the
claims the community actually converged on, Schelling points rather than issuer
commitments. A community narrative counts as a promise only if all three hold:

1. **Dominant and long-standing:** the claim has been the shared story for
   years, not a passing meme.
2. **Measurable with real evidence:** there is data that shows the claim
   holding, not just people repeating it.
3. **Broad consensus:** the wider ecosystem converged on it, not one
   marketing team.

Hype alone never qualifies. The bar is deliberately high: the instrument
scores claims people actually rely on, whether an issuer wrote them down or a
community converged on them.

## The adoption test

Shipping the tech is not enough. A promise counts as fulfilled only if the
thing was delivered **and** real people actually use it. A proof of concept
nobody touches, a mainnet nobody transacts on, a feature with no users:
unfulfilled. Teams routinely declare victory at the demo stage. We score
the usage, not the press release.

## Promise research methodology

The repeatable recipe for onboarding a project. One checklist, one fragment
format, one merge, one publish path. Works for crypto and for stocks
(earnings calls, investor days, 10-K strategy sections, CEO public
statements are promise sources too: "robotaxi next year" is a promise).

**1. Identify promise sources.** Crypto: whitepaper, official docs, official
blog, founder/team public statements (tweets, interviews, talks), roadmap
and launch announcements. Stocks: earnings calls, investor-day decks, 10-K
strategy sections, CEO public statements, product launches. Primary sources
first; secondary only to verify usage.

**2. Extract discrete promises.** One attributable statement = one candidate
promise. Deduplicate restatements. Assign lineage `<slug>-pNN-short-slug`
(unique, stable). Aim for the real number of distinct public promises:
comprehensive, not padded.

**3. Classify.** `claim_type`: `milestone` (a shipped thing) or `ongoing`
(a standing claim). `core`: exactly one `true` per project, the main
promise (a label, not a gate). `effective_at`: ISO date the promise was
stated, never in the future.

**4. Score on the adoption test.** `fulfilled`: real usage exists now.
`open`: still pending. `lapsed`: ongoing promise with no meaningful progress
for a long stretch. `retired`: explicitly dropped by the project. Never
`active` (rejected at the publish boundary). `milestone` can never be
`lapsed`.

**5. Write criteria, rationale, evidence.** `criteria`: what would count as
fulfilled, in plain words. `rationale`: one line explaining the state.
`evidence`: at least one entry per promise with the EXACT source URL and a
summary of what the source is. No guessed URLs.

**6. Write the fragment** to `db/seed/heart-runs/fragments/<slug>-promises.json`:

```json
{
  "slug": "<slug>",
  "rationale": "one or two sentences on what sources were researched",
  "allowance_rationale": "No allowance under the promise-heart rule: one promise earns one heart.",
  "promises": [
    { "lineage": "<slug>-pNN-short-slug",
      "claim_type": "milestone|ongoing",
      "criteria": "what would count as fulfilled, in plain words",
      "core": true,
      "state": "open|fulfilled|lapsed|retired",
      "effective_at": "2020-03-12T00:00:00Z",
      "rationale": "one line explaining the state",
      "evidence": [{"url": "https://exact-source-url", "summary": "what this source is"}] }
  ]
}
```

**7. Merge and publish.** Fragments merge into a run artifact (capacity =
promise count, earned = fulfilled count per project); dry-run validate;
publish via `publish_heart_run`; never point `HEARTS_METHODOLOGY` at a
string with no published run. Published runs need non-null `reviewed_by` +
`policy_ref` (DB CHECK); drafts don't. Researcher agents write fragments
only, never app code or the artifact directly.

## Computation at time t

```
capacity(t) = promise count
earned(t)   = Σ fulfilled lineages at t (one heart each)
filled(t)   = earned(t)
```

No clocks, no timers. Display `filled / capacity`, earned hearts only.
Every point carries provenance (observed / reconstructed / missing).

## Shitcoin warning: the verdict

The section keeps the name **Shitcoin warning**. It renders as a 1-10 circular
meter showing the number only, never a category label. It is a
delivery-accountability rating, not a fraud or investment-risk rating.

Underneath, the rule is categorical, from promise states:

- **No concern** (meter 1): no retired or lapsed promise on record.
- **Watch** (meter 4): reserved for verified overdue promises once deadline
  evidence has been researched. No v1 trigger.
- **Delivery concern** (meter 7): a supporting promise retired or lapsed.
- **Core delivery failure** (meter 10): the core promise retired or lapsed.

The 1-10 positions are fixed per category, not computed from a scoring
formula. A real 1-10 rule is an open methodology question.

Tapping the meter opens the project's verdict section, which lists exactly
what feeds it: each failed promise, its state, and whether it was core.
Humans resolve ambiguous evidence. Software picks the category and
templates the explanation from reviewed promise records. CODE and HYPE
never move the verdict directly; USE may support a promise state only
when it measures a predefined promise-specific condition.

## Gaming defenses

Open promises pay zero: only fulfillment pays. Abandoning a fulfilled lineage
retires its hearts visibly and can never improve the meter. Announcements
change nothing: only evidence does. POC-stage delivery is not fulfillment
(the adoption test). Nothing can exceed capacity.

## Valuation: postponed to v2

v1 shows the meter **beside** market cap and lets the market provide the
valuation. No fair-value calculation until the case studies survive scrutiny.

## Case studies

Scored assessments live in [case-studies/](case-studies/) ([BAT](case-studies/bat.md),
[XRP](case-studies/xrp.md)); the methodology decisions behind them are recorded in
[case-studies/review.md](case-studies/review.md). The illustrative sketches that
used to sit in this doc are retired: the case studies are the examples now.
<!-- ALGORITHM-END -->

## Appendix: Social pipeline

Our proprietary attention-metrics layer. Not a CoinGecko clone: we juxtapose
**hype** (observed attention) against **substance** (hearts earned). A project
with massive hype and few hearts reads as all sizzle, no steak. That
contrast is the differentiator; raw community numbers are not.

**Display only.** Hype metrics never feed the hearts scoring algorithm and
carry 0% weight in the Prove Value Index. Hype is context: observed attention,
never proof of support or adoption. Per [vision.md](vision.md), no trend
percentages publish until 8 complete weeks of snapshots exist; until then,
absolute mentions plus "baseline collecting, week N/8".

## What is shown

Per project, in the HYPE stat card:

- News mentions in the last 7 days (trend vs baseline once the baseline exists)
- Reddit subscribers (once credentials exist; the tile hides until then)
- Telegram members (best-effort; the tile hides when unavailable)
- A **hype-vs-substance read**: one plain-language line contrasting hype
  against hearts earned.

### The read rules

Hype is measured against the median 7-day news mentions across all tracked
projects in the latest collector batch (our own dataset, our own baseline):

- **high**: mentions at least 2x the cross-project median
- **low**: mentions at most half the median
- **moderate**: everything between

Then:

- high hype + under 40% of hearts filled: **"All sizzle, no steak."**
- low hype + at least 60% of hearts filled: **"Quietly proven."**
- anything else: neutral juxtaposition, no judgment.

No composite score is computed from hype. The two numbers sit side by side.
Hype needs at least 4 projects with news data in the batch; otherwise no
hype judgment is made.

## Architecture

```
GitHub Action (daily 06:30 UTC, manual via workflow_dispatch)
  -> app/scripts/collect-social.ts
    -> app/src/lib/social-collect.ts (Reddit OAuth, Telegram preview, News RSS)
    -> INSERT into public.social_snapshots (service role)
  -> app/src/app/api/social/[slug]/route.ts (anon key, RLS public read)
    -> latest 2 snapshots + cross-project median
  -> HYPE stat card + hype-vs-substance read
```

Scheduler choice: GitHub Actions over Vercel Cron. The collector fans out
to three free APIs per project with politeness delays and can run past
serverless duration limits. Runs are idempotent: one snapshot row per
project per run. A failed collection never renders as zero; the tile shows
the last good value marked stale, or hides.

## Data sources

| Source | Metric | Access | Notes |
|---|---|---|---|
| Reddit OAuth API | subreddit subscribers | Free app registration | Needs `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET`; without them the metric is skipped, not faked |
| Telegram `t.me/s/` preview | channel members | None | Best-effort: only channels with public previews enabled expose a count; anything else yields null and the tile hides |
| Google News RSS | mentions, last 7d | None | Counts items with pubDate in the window |
| X/Twitter | followers, mentions | **Paywalled** | See upgrade path below. No scraper: unreliable and against ToS |

Per-project source handles live in `SOCIAL_SOURCES` in
`app/src/lib/social.ts`.

## Credentials and env vars (names only)

Collector / GitHub Action secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (writes only; reads go through RLS + anon key)
- `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` (optional; free at
  reddit.com/prefs/apps, type "script")

App runtime (already configured):

- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (or `SUPABASE_ANON_KEY`)

## Database

Migration `db/migrations/004_social_snapshots.sql` creates
`public.social_snapshots` (one row per project per run) with RLS: public
SELECT, writes via service role only. Apply via the Supabase dashboard SQL
editor; raw Postgres on 5432 is blocked from the build workspace.

## X/Twitter upgrade path (future, paid)

When hype becomes a paid-tier feature, X is the missing venue that
matters most (crypto conversation lives there). The path:

1. X API Basic tier (~$100+/mo at time of writing): `GET /2/users/by/username/:u`
   for follower counts; filtered stream or recent search for mention volume
   per project handle.
2. Add an `x_followers` / `x_mentions_7d` column pair to
   `social_snapshots` (new migration), a fetcher in `social-collect.ts`,
   and a tile in the HYPE card. The read rules stay unchanged;
   X mentions fold into the hype median.
3. Alternative: LunarCrush API (crypto-native social metrics, has a free
   tier but requires API-key signup) as a second paid/free source.

Until then, X is documented as absent, not approximated.

## Local verification

```bash
cd app
npm run social:collect -- --dry-run   # real sources, no DB write
npm run test:social
```
