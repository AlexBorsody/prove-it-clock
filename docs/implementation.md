# Prove-It Clock — Implementation

**Status:** 2026-09-21. v0.2.0 live in production. Design phase — no code until the plan is settled. Habib discusses + documents; Codex builds from Part 2 when the plan is done.

**How this doc works:** Part 1 is non-technical — what the product is, how the game works, the ranking factors, the strategy. Part 2 is the technical build plan. If you don't code, read Part 1.

**Non-goals:** no scoring-logic changes without a methodology version bump. No speculation. No price prediction. Algorithms calculate; AI explains; humans version methodology.

---

# Part 1 — The design (non-technical)

## What this is

One question: *is a crypto project actually becoming what it promised to become?*

The value: estimate whether a project is full of shit or not, based on ranking factors, displayed as a historical timeline where each factor can be inspected for accountability.

What it is not: investment advice, price prediction, or a hype amplifier.

## The game design

The core loop:

1. A project makes promises (thesis, roadmap, milestones).
2. Time passes — the Clock keeps the timeline.
3. The Clock checks: what was kept, how fast, how recently.
4. The verdict renders as a timeline. The longer the timeline, the harder to fake.

Every factor behind the verdict is inspectable — accountability means you can see the work. A project's win condition: keep promises, keep them recently, keep them coming.

## Two-track architecture

**Track 1 — Promise. This is the rank.** Four factors: how long they've been promising, how many promises they kept, how fast they keep them, when they last kept one. One number, pure accountability, the main line on the chart. The homepage sorts by this.

**Track 2 — Context. This is the qualifier.** Everything else: potential, competition, token distribution, utility, company structure, dev activity. Second line on the chart. It qualifies the rank but never overrides it.

The anti-hype rule: no amount of good context rescues a bad promise record. A project can't hide a 12-year staleness behind "active GitHub" or "real utility."

## Ranking factors

Promise track (the rank):
- **Promise duration** — how long have they been promising? Live.
- **Promises kept** — how many milestones did they actually deliver, historically dated? Live.
- **Promise rate** — kept ÷ years. How fast do they deliver? Live. Read next to recency — coarse milestones saturate, so it punishes longevity alone.
- **Promise recency** — when did they last keep a promise? Live. XRP: ~12.7 years stale — the flagship story in one number.

Context track (the qualifier):
- **Overall potential** — how big could this be if delivered? Subjective, needs more thought. World-impact score used as proxy for now.
- **Competition** — how many credible projects chase the same promise? A discount on potential, not a score. Planned — needs a project-lane taxonomy first.
- **Token distribution** — who holds the coins: founders or the public? Premine, private allocations, insider %. Planned — honest per-project sourcing is the hard part.
- **Utility** — does anyone actually use it for what was promised? Planned — needs a game-proof definition before it touches anything.
- **Company structure** — is there a company behind the coin, and who answers for it? Private company, foundation, DAO, no entity. Planned. (XRP: Ripple Labs is a private company — the promise is decentralized money, the structure is a cap table.)
- **Dev activity** — is anyone still building? Commits, releases, contributors. Planned — GitHub API, repo-to-project mapping first.

Across both tracks:
- **AI assessment** — a careful-analyst second opinion. The deterministic output plus the full factor breakdown goes through an OpenAI endpoint (strict JSON schema: score, rationale, risks, confidence, verdict). Displayed separately with its reasoning shown — an unexplained AI number would be theater. Prompt-versioned, append-only. Planned — needs API key, model choice, prompt validation against the three examples.
- **v0.2.0 methodology scores** — Reality, World Impact Potential, Execution Evidence, Reflexivity Risk, Evidence Confidence, Promise Gap, Potential Outlook. The current live scoring layer; placement in the two tracks TBD.

## The formula (sketch — weights TBD)

Promise Score = f(fulfillment, throughput, staleness, duration). Context = composite of the context factors (formula TBD).

Naive read on the three examples:

| | Kept | Rate | Stale |
|---|---|---|---|
| BTC (control) | 4/6 | 0.23/yr | 2.7y |
| XRP (flagship) | 2/6 | 0.14/yr | 12.7y |
| LINK | 4/6 | 0.43/yr | 3.7y |

Weights are the secret sauce, tuned against these examples until they read correctly. The formula ships as a new methodology version — append-only, never a silent tweak. The formula itself is published: transparency is the product; the moat is the accumulated history plus the tuning, which nobody can copy.

## Canonical examples

- **XRP — flagship.** Long promise duration, 2/6 kept, ~12.7 years since the last kept promise, crowded payments lane, private-company structure. The case the product exists to make.
- **BTC — control.** 4/6 kept, most recent 2024, store-of-value lane. The baseline a fair model must get right.
- **LINK — third.** 4/6 kept, best throughput of the three, narrower oracle promise. Tests whether the model distinguishes a mostly-kept bounded promise from XRP's broad crowded one.

## Strategy (positioning)

- The Clock is an accountability instrument, not a tip sheet. It never predicts price.
- Trust model: the formula is public, the history is append-only, the publisher's holdings are disclosed. Influence over markets is a liability, not a goal.
- Growth and marketing plan lives in `docs/strategy.md`, not here.

---

# Part 2 — Technical (Codex builds from here)

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
- `app/src/lib/ranking-factors.ts` is the machine-readable mirror of the Part 1 factor inventory (tracks, status, sources). Design truth lives in Part 1; the config mirrors it.
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
- Promises-kept series live (chart line + card lead); chart default series set to the primary factors; `ai_assessment` + two-track architecture registered in `ranking-factors.ts` (design only, nothing built).

## Design phase (not buildable yet — settling in Part 1 first)

- Promise Score formula + weights (tuned against XRP/BTC/LINK).
- Context composite formula.
- Placement of the v0.2.0 scores in the two tracks.
- AI assessment pipeline (OpenAI key, model choice, prompt v1, validation).
- Token distribution sourcing research; utility definition; project-lane taxonomy for competition.

## Build queue (planned — Codex builds when the plan is settled)

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

Planned additions (design phase): OpenAI API (AI assessment — needs key +
billing), GitHub API (dev activity — free, keyless at this volume),
CryptoCompare news API (free, keyless — annotations only, never scores).

## Node.js modules

None new for this queue. Current deps cover everything:
- `@supabase/supabase-js` (already) — the loader script's DB writes.
- `tsx` + `typescript` (already) — run and typecheck the loader.
- `next` / `react` / `react-dom` (already) — card layout, hand-rolled SVG chart.
- `dotenv` — only if we decide against hand-parsing `.env.local` in the
  loader (a 5-line fallback); not otherwise needed.

Planned: `openai` (AI assessment, when that leaves design phase).

## Env

- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` → Vercel env (server-side only, never `NEXT_PUBLIC_*`) and local `app/.env.local` (gitignored).
- `OPENAI_API_KEY` → same pattern, when the AI assessment leaves design phase.

## Blocked on Alex

- Publisher disclosures (Dash/BAT/AVAX/LINK positions) still unconfirmed.
- Trading-card stat lineup ruling.
- "Private Leon" garble — read as premine/private allocations; needs his confirmation.
- Telegram broadcast channel (needs his Telegram account) — strategy-side, not blocking build.
