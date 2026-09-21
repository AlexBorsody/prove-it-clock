# Prove-It Clock — Implementation

**Status:** 2026-09-21. v0.2.0 live in production. Planning only — no code until the plan is settled. Technical only: no strategy, no marketing.

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
- Pipeline `app/src/pipeline/ingest.ts` + `score.ts` writes local append-only JSON (`metrics/scores/explanations/universe_<date>.json`); raw upstream data cached in `app/data/raw/<date>/`. `score.ts` reads the active version from `app/src/lib/active-methodology.ts` — never a hardcoded constant.
- Pages: `/` (leaderboard), `/projects/[slug]`, `/methodology`, `/embed/projects/[slug]/timeline` (chromeless widget).

## History API

- `GET /api/projects/[slug]/history?metrics=<csv>&from=<date>&to=<date>`
- Returns per-metric time-series `[{ date, methodology_version, value }]`; `value` may be `null` (unavailable).
- Server-side Supabase read; 5-minute cache.
- Nulls render as gaps in the line, never as zero.

## Timeline chart

- `components/timeline-chart.tsx` + `timeline-svg.tsx`: hand-rolled SVG, zero new dependencies.
- Multi-line chart per project page: each scored metric over time.
- Methodology-version markers on the axis — the viewer always knows which version produced which stretch of line.
- Event annotations from seed `events[]` (launch, hack, pivot, leadership exit).
- Unscored projects: explicit unavailable state, not an empty chart.

## Done 2026-09-21

- v0.2.0 seed live (84 genuine snapshots, append-only/idempotent); fallback removed; footer fixed.
- Embeddable timeline widget shipped: `/embed/projects/[slug]/timeline`, light/dark, iframe snippet on scored project pages. Verified live.
- Event pipeline: `npm run events:check` passes — all 6 scored projects have ≥5 valid events.
- `score.ts` reads `ACTIVE_METHODOLOGY_VERSION` — the pipeline can no longer generate speculative snapshots.

## Build queue (planned, not started — no code until the plan is settled)

**1. Trading-card layout + per-category chart**

Frontend (`app/src/app/(site)/projects/[slug]/page.tsx`, `app/src/components/`):
- Restructure the detail page as a trading card: header (name, symbol, rank,
  thesis category), stat bars for the seven v0.2.0 categories — Reality, World
  Impact Potential, Execution Evidence, Reflexivity Risk, Evidence Confidence,
  Promise Gap, Potential Outlook. New `StatBar` component (extend
  `components/score.tsx` or new `components/stat-bar.tsx`); existing
  `ScoreCard`/`ScoreCell` stay for the leaderboard.
- `timeline-chart.tsx` / `timeline-svg.tsx`: draw one line per score category
  plus the overall line, from the history API's existing per-`score_code`
  series. Legend toggles already exist — extend to per-category. Existing
  render contract holds: nulls break the line (gaps, never interpolation),
  methodology-version markers stay on the axis, event annotations stay.
- Evidence links, events, explanation feed, raw evidence move one click deeper
  (collapsible sections); the card face stays clean.
- Unscored projects keep the explicit unavailable state — no empty chart.
- The embed widget (`/embed/...`) picks up the upgraded chart for free (shared
  `timeline-svg` renderer).

Backend:
- No new endpoints. `GET /api/projects/[slug]/history` already returns every
  scored metric as a dated per-`score_code` series with methodology versions —
  the per-category lines need no new data. Verify the 6 scored projects have
  multi-day history for each score code before building (84 v0.2.0 snapshots
  exist today).

Open question for Alex: final stat lineup (Utility / Promises Kept / Runway
was proposed — he rules).

**2. Daily historical-data cadence**

Backend (new `app/scripts/load-snapshot.ts`, run via `tsx`):
- Reads `data/snapshots/scores_<date>.json` (+ `explanations_<date>.json`),
  maps each score to a `score_snapshots` row
  (project_id, methodology_version_id, snapshot_date, score_code, value,
  confidence, status). Idempotent: `ON CONFLICT DO NOTHING` on the table's
  unique key. Component-level values stay in the JSON audit trail for now —
  the chart only needs score-level rows.
- Version gating: resolves `methodology_version_id` from
  `methodology_versions` by `ACTIVE_METHODOLOGY_VERSION`; refuses to load any
  other version. Never writes speculative rows.
- Credentials from `app/.env.local` (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`),
  server-side only, never logged, never committed.
- Daily cron on this machine: pipeline → loader → verify row counts → fail
  loudly (log + surface) on any error. Exact cron mechanism (runtime cron vs
  system crontab) to be decided during the week.
- Never update or delete snapshot rows. A bad run is skipped, not repaired.

Frontend: none — the chart reads the same history API; new daily points appear
automatically.

## Third-party APIs

None new for this queue. The daily run reuses the pipeline's existing
providers, all keyless free tiers, ~21 calls/day:
- CoinGecko `/api/v3` — market data, universe ranks (already integrated).
- DefiLlama `api.llama.fi` — TVL / fees per chain (already integrated).
- blockchain.info — BTC on-chain fees only (already integrated).
Rate discipline (spaced calls, same-day disk cache in `data/raw/<date>/`)
already holds at this volume.

## Node.js modules

None new for this queue. Current deps cover everything:
- `@supabase/supabase-js` (already) — the loader script's DB writes.
- `tsx` + `typescript` (already) — run and typecheck the loader.
- `next` / `react` / `react-dom` (already) — card layout, hand-rolled SVG chart.
- `dotenv` — only if we decide against hand-parsing `.env.local` in the
  loader (a 5-line fallback); not otherwise needed.

## Env

- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` → Vercel env (server-side only, never `NEXT_PUBLIC_*`) and local `app/.env.local` (gitignored).

## Blocked on Alex

- Publisher disclosures (Dash/BAT/AVAX/LINK positions) still unconfirmed.
- Trading-card stat lineup ruling.
- Telegram broadcast channel (needs his Telegram account) — strategy-side, not blocking build.
