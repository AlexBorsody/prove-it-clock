# Prove-It Clock — Technical Implementation Spec

**Status:** draft 2026-09-20. Technical build plan only. Strategy, distribution,
and monetization live in `docs/strategy.md` and `docs/top20-expansion.md` §10
— not here.

**Non-goals:** no scoring-logic changes, no methodology version bump, no new
data providers.

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

## 1. History API

- `GET /api/projects/[slug]/history?metrics=<csv>&from=<date>&to=<date>`
- Returns per-metric time-series: `[{ date, methodology_version, value }]`
  where `value` may be `null` (unavailable).
- **Null handling (hard rule):** nulls are returned as null and render as gaps
  in the line, never as zero. Missing data is missing — the API must not invent
  continuity.
- Server-side Supabase read; 5-minute cache; paginate if a series exceeds
  ~1,000 points (it won't for years).

Acceptance: `curl` for `bitcoin` returns its full score tape with methodology
versions attached; a project with null stretches shows gaps, not zeros.

## 2. Timeline chart component (project pages)

- New component `components/timeline-chart.tsx`: hand-rolled SVG, zero new
  dependencies.
- One multi-line chart per project page: each scored metric over time.
- **Methodology-version markers:** vertical bands/labels on the axis wherever
  the version changes — the viewer must always know which methodology produced
  which stretch of line.
- **Event annotations:** markers from the seed `events[]` (launch, hack,
  pivot, leadership exit). Click/hover shows the event summary.
- Unscored projects: chart area shows the explicit score-unavailable state
  (market metadata still renders).

Acceptance: BTC page shows multi-year lines with version markers and annotated
events; nulls are visibly gapped.

## 3. Event curation pipeline

- `events[]` in seeds is the source; add a lightweight `npm run events:check`
  that validates every event has `date`, `title`, `evidence_summary`.
- Backfill priority: the 6 originally-scored projects first (longest tapes =
  most valuable charts).

Acceptance: `events:check` passes; each of the 6 has ≥5 annotated events.

## Build order

1. §1 history API (unlocks the chart).
2. §2 timeline chart + §3 event backfill.

## Open questions

1. Supabase read path from Vercel: service-role key server-side only — confirm
   key management approach with Alex (vault, not repo).
2. History API rate limits: starting at 60/min/IP per spec; adjust on abuse —
   no decision needed now.
