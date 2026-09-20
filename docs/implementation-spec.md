# Prove-It Clock — Technical Implementation Spec

**Status:** draft 2026-09-20. Implements the strategy in `docs/strategy.md` and
`docs/top20-expansion.md` §10 (compounding-data moat, timeline graphs,
monetize-access-never-scores).

**Non-goals:** no scoring-logic changes, no methodology version bump, no new
data providers, no Discord bot, no paid ratings (ever — charter line).

## 0. Current architecture (as of main)

- Next.js app in `app/`, deployed on Vercel (`prove-it-clock.vercel.app`).
- `GET /api/projects` (`app/src/app/api/projects/route.ts`): paginated
  envelope + 90s-cached CoinGecko market overlay.
- Data layer `app/src/lib/data.ts`; pipeline `app/src/pipeline/ingest.ts` +
  `score.ts`; methodology versions in `app/methodology/v*.json`.
- Pages: `/` (leaderboard, `components/leaderboard-table.tsx`),
  `/projects/[slug]`, `/methodology`.
- Two history stores exist today: JSON snapshots in `app/data/snapshots/`
  (`scores_<date>.json`, `metrics_<date>.json`, `explanations_<date>.json`,
  `universe_<date>.json`) and Supabase `score_snapshots` (incl. derived rows).
- Seeds carry `events[]` per project (launches, setbacks, pivots) — currently
  underused in UI.

**Decision: Supabase `score_snapshots` becomes the primary time-series store.**
API routes read history server-side from Supabase; JSON snapshots remain as
build artifacts and an audit trail. Rationale: time-series queries (range,
per-metric) don't belong in static JSON, and Supabase already holds the rows.

## Phase 1 — Compounding data foundation

### 1.1 History API

- `GET /api/projects/[slug]/history?metrics=<csv>&from=<date>&to=<date>`
- Returns per-metric time-series: `[{ date, methodology_version, value }]`
  where `value` may be `null` (unavailable).
- **Null handling (hard rule):** nulls render as gaps in the line, never as
  zero. Missing data is missing — the chart must not invent continuity.
- Server-side Supabase read; 5-minute cache; paginated if a series exceeds
  ~1,000 points (it won't for years).

Acceptance: `curl` for `bitcoin` returns its full score tape with methodology
versions attached; a project with null stretches shows gaps, not zeros.

### 1.2 Per-coin timeline graphs (project pages)

- New component `components/timeline-chart.tsx`: hand-rolled SVG (zero new
  dependencies, full control, reusable for OG images in Phase 2).
- One multi-line chart per project page: each scored metric over time.
- **Methodology-version markers:** vertical bands/labels on the axis wherever
  the version changes — the viewer must always know which methodology produced
  which stretch of line.
- **Event annotations:** markers from the seed `events[]` (launch, hack,
  pivot, leadership exit). Click/hover shows the event summary. This turns the
  chart into "here's what they promised, here's what happened."
- Unscored projects: chart area shows the explicit score-unavailable state
  (market metadata still renders).

Acceptance: BTC page shows multi-year lines with v0.1.0→v0.2.0→v0.3.0 markers
and at least 3 annotated events; nulls are visibly gapped.

### 1.3 Event curation pipeline

- `events[]` in seeds is the source; add a lightweight `npm run events:check`
  that validates every event has `date`, `title`, `evidence_summary`.
- Backfill priority: the 6 originally-scored projects first (longest tapes =
  most valuable charts).

Acceptance: `events:check` passes; each of the 6 has ≥5 annotated events.

## Phase 2 — Distribution surfaces

### 2.1 SEO (the slow compounder)

- Per-project `<title>`/`<meta description>` targeting
  "is [coin] legit / safe / a scam" queries; canonical URLs; sitemap including
  all project slugs.
- OG images: server-rendered timeline chart PNG per project
  (`/api/og/[slug]`) — the shareable unit, generated from the same SVG code
  as §1.2.
- `strategy.md` §2 target: project pages rank for "[coin] review / legitimacy"
  queries.

Acceptance: social-share debugger renders the timeline OG image; sitemap lists
20 project URLs.

### 2.2 Embeddable widget

- `/embed/[slug]` — lightweight iframe page rendering one project's timeline
  chart (read-only, Clock branding + link back).
- One `<iframe>` snippet in the project page "Share" section for media sites.
- Free tier carries branding; paid tier (§3.2) removes it.

Acceptance: iframe loads on a third-party test page in <1s, links back to the
Clock.

### 2.3 Alerts → Telegram mirror

- Pipeline emits a machine-readable "post-ready summary" per run
  (score changes > threshold, new snapshots, methodology notes) to
  `app/data/snapshots/post-queue_<date>.json`.
- A Telegram bot posts the queue to the broadcast announcement channel
  (`strategy.md` §2). Publisher approves the channel copy once; bot mirrors
  after that. Drafts only — same standing rule as Twitter: assistant drafts,
  publisher sends (bot token held by publisher).
- Email alerts deferred to Phase 3 (needs user accounts).

Acceptance: a pipeline run with a score change produces a queue file; test
post lands in a private Telegram channel.

## Phase 3 — Monetization (access, never scores)

### 3.1 API tiers

- Free: current public endpoints, rate-limited (e.g. 60 req/min/IP), no history
  beyond 30 days.
- Paid (API key via Stripe): full historical time-series, bulk export,
  higher limits, SLA-less but documented.
- Keys managed in Supabase (`api_keys` table); middleware on API routes.

### 3.2 Paid add-ons

- Historical CSV/JSON export per project.
- Unbranded embeds (§2.2).
- Promise-gap change alerts (webhook + Telegram DM) before public post.

### 3.3 Hard lines (from charter + strategy.md)

- A rating is never for sale. No sponsored scores, no pay-to-rank, no
  pay-to-remove-events.
- Pricing page lists exactly what's sold: access, history, embeds, alerts.

Acceptance: Stripe test-mode checkout issues a key; key unlocks full history;
free tier stays rate-limited and fully functional.

## Build order

1. §1.1 history API (unlocks everything below).
2. §1.2 timeline chart + §1.3 event backfill (the killer surface).
3. §2.1 SEO + OG images (compounds from day one).
4. §2.2 embed (distribution via media sites).
5. §2.3 Telegram mirror (cheap, mirrors pipeline output).
6. §3 paid tiers (only after 1–5 prove traffic).

## Open questions

1. Supabase read path from Vercel: service-role key server-side only — confirm
   key management approach with Alex (vault, not repo).
2. Stripe account: exists? Which entity receives payouts?
3. Telegram channel name/handle — Alex's call.
4. History API rate limits: start conservative (60/min/IP), adjust on abuse.
