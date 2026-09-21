# Prove-It Clock — Implementation

**Status:** 2026-09-21. v0.2.0 live in production. Technical only — no strategy, no marketing.

**Non-goals:** no scoring-logic changes without a methodology version bump. No speculation. No price prediction. Algorithms calculate; AI explains; humans version methodology.

## What this is

One question: *is a crypto project actually becoming what it promised to become?*

The value: estimate whether a project is full of shit or not, based on ranking
factors, displayed as a historical timeline where each factor can be inspected
for accountability.

## Active model (hard rules)

- Methodology **v0.2.0**. Six scored: BTC, ETH, XRP, SOL, ADA, LINK.
- Other 14 top-20: score `null`, status `unavailable`. Never zero, never an estimate.
- Market cap controls membership and display rank only. Never touches scores.
- Nulls are returned as null and render as gaps — in API responses and charts.
- **Versioned methodology.** Every scoring change ships as a new version. Diffs are public. Silent rewrites are a defect.
- **Append-only history.** New versions add new snapshots. Past snapshots are never rewritten.
- **No tuning.** Nothing is tuned per project. Every number comes from methodology config + observations + versioned seeds.
- **No paid placement.** Sponsorship never affects rankings. Ever.
- **Observer effect.** Publishing scores can move markets. Influence is a liability, not a goal. If projects ever optimize for Clock scores instead of real utility, the methodology changes — publicly, as a new version.
- **Missing data is labeled, never invented.** Gaps become `unavailable` components that reduce confidence — never zero-filled, never hidden.
- **Provisional seeds** ship flagged as PROVISIONAL and score-capped, not padded with guesses.

## Architecture

- Next.js app in `app/`, deployed on Vercel (`prove-it-clock.vercel.app`).
- Data layer `app/src/lib/data.ts` reads Supabase `score_snapshots` (primary time-series store). JSON snapshots in `app/data/snapshots/` remain as build artifacts and audit trail.
- Pipeline `app/src/pipeline/ingest.ts` + `score.ts` writes local append-only JSON (`metrics/scores/explanations/universe_<date>.json`); raw upstream data cached in `app/data/raw/<date>/`.
- Single source of truth for the active version: `app/src/lib/active-methodology.ts`. `score.ts` must read it — never a hardcoded version constant.
- Pages: `/` (leaderboard), `/projects/[slug]`, `/methodology`, `/embed/projects/[slug]/timeline` (chromeless widget).

## History API

- `GET /api/projects/[slug]/history?metrics=<csv>&from=<date>&to=<date>`
- Returns per-metric time-series `[{ date, methodology_version, value }]`; `value` may be `null` (unavailable).
- Server-side Supabase read; 5-minute cache.
- Nulls render as gaps in the line, never as zero.

## Timeline chart

- `components/timeline-chart.tsx`: hand-rolled SVG, zero new dependencies.
- Multi-line chart per project page: each scored metric over time.
- Methodology-version markers on the axis — the viewer always knows which version produced which stretch of line.
- Event annotations from seed `events[]` (launch, hack, pivot, leadership exit).
- Unscored projects: explicit unavailable state, not an empty chart.

## Event pipeline

- `npm run events:check` validates every event has `date`, `title`, `evidence_summary`.
- Backfill the 6 scored projects first, ≥5 events each.

## Build queue

**Done 2026-09-21:** v0.2.0 seed live (84 snapshots, append-only/idempotent), fallback removed, footer fixed, embeddable timeline widget shipped (`/embed/projects/[slug]/timeline`, light/dark, iframe snippet on scored project pages).

**8. SEO structured-data pass — queued**
Per project page: `<title>`, meta description, canonical, Open Graph + Twitter cards. JSON-LD on project pages. `sitemap.xml` for all 20 pages + `/methodology`.

**9. Promise-gap alerts feed — queued**
Daily job diffs latest snapshot against previous; emits rows where `promise_gap` or `potential_outlook` changed beyond epsilon. Append-only `alerts` table + `GET /api/alerts` (paginated, 5-min cache). Needs §11 running to be useful.

**10. Trading-card layout + per-category chart — queued**
Project detail page becomes a trading-card layout: header, stat bars per v0.2.0 score category (Reality, Potential, Execution, Reflexivity, Confidence, Promise Gap, Potential Outlook), evidence links and events one click deeper. Timeline gains per-category lines feeding the overall line, from existing snapshot history. Nulls still gaps. Presentation only — no scoring changes. Open question for Alex: final stat lineup (Utility / Promises Kept / Runway was proposed in the design draft — he rules).

**11. Daily historical-data cadence — the compounding store**
The moat: every snapshot accrues permanently; history can't be backfilled by competitors. Today snapshots are manual. Make them daily and automatic:
1. `scripts/load-snapshot.ts`: reads today's `scores_<date>.json` (+ explanations), inserts into Supabase append-only. Idempotent: `ON CONFLICT DO NOTHING`. Service-role key from `app/.env.local` (gitignored), server-side only, never logged.
2. ~~Done 2026-09-21:~~ `score.ts` reads the active methodology version.
3. Daily cron on this machine: pipeline → loader → verify row counts → fail loudly on error.
4. Never update or delete snapshot rows. A bad run is skipped, not repaired.

## Env

- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` → Vercel env (server-side only, never `NEXT_PUBLIC_*`) and local `app/.env.local` (gitignored).

## Blocked on Alex

- Publisher disclosures (Dash/BAT/AVAX/LINK positions) still unconfirmed.
- §10 stat lineup ruling.
