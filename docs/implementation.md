# Prove-It Clock — Implementation

**Status:** 2026-09-21. v0.2.0 live in production. Design phase — no code until the plan is settled. Habib discusses + documents; Codex builds from Part 2 when the plan is done.

**How this doc works:** Part 1 is non-technical — what the product is, how it works, the ranking factors, the strategy. Part 2 is the technical build plan. If you don't code, read Part 1.

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

**Track 2 — Context. This is the qualifier.** Everything else: potential, realism, competition, token distribution, utility, company structure, dev activity. Second line on the chart. It qualifies the rank but never overrides it.

The anti-hype rule: no amount of good context rescues a bad promise record. A project can't hide a 12-year staleness behind "active GitHub" or "real utility."

## Ranking factors

Promise track (the rank) — all live, computed from seed data:
- **Promise duration** — how long have they been promising?
- **Promises kept** — how many milestones did they actually deliver, historically dated?
- **Promise rate** — kept ÷ years. How fast do they deliver? Read next to recency — coarse milestones saturate, so it punishes longevity alone.
- **Promise recency** — when did they last keep a promise? The flagship story in one number (see Realism versus potential).

Context track (the qualifier):
- **Overall potential** — how big could this be if delivered? Subjective, needs more thought. World-impact score used as proxy for now.
- **Realism** — how likely is the remaining promise, given the time gone and who's eating the lane? The fairness lens on staleness (details below). Needs thought before it becomes a number.
- **Competition** — how many credible projects chase the same promise? A discount on potential, not a score. Planned — needs a project-lane taxonomy first.
- **Token distribution** — who holds the coins: founders or the public? Premine, private allocations, insider %. Planned — honest per-project sourcing is the hard part.
- **Utility** — does anyone actually use it for what was promised? Planned — needs a game-proof definition before it touches anything.
- **Company structure** — is there a company behind the coin, and who answers for it? Private company, foundation, DAO, no entity. Planned.
- **Dev activity** — is anyone still building? Commits, releases, contributors. Planned — GitHub API, repo-to-project mapping first.

Across both tracks:
- **AI assessment** — a careful-analyst second opinion. The deterministic output plus the full factor breakdown goes through an OpenAI endpoint (strict JSON schema: score, rationale, risks, confidence, verdict). Displayed separately with its reasoning shown — an unexplained AI number would be theater. Prompt-versioned, append-only. Planned — needs API key, model choice, prompt validation against the three examples.
- **v0.2.0 methodology scores** — Reality, World Impact Potential, Execution Evidence, Reflexivity Risk, Evidence Confidence, Promise Gap, Potential Outlook. The current live scoring layer; placement in the two tracks TBD.

## Realism versus potential

Potential asks how big. Realism asks how likely — and it's what keeps staleness honest. Without it, the Clock punishes patience: some promises genuinely take decades, and "hasn't kept one lately" can mean the time hasn't come yet.

XRP is the unrealistic case and the reason the factor exists. ~12.7 years since the last kept promise, while the lane got eaten around them: stablecoins moving real volume, banks building their own rails, SWIFT upgrading its own messaging. The remaining promise — displacing correspondent banking — isn't just late, it's unlikely. Time ran out *and* the world moved on.

LINK is the counter-case. Shorter history, big ambition (becoming core financial infrastructure), still inside the window where "not yet" is legitimate. A young project with a bold promise reads as unproven, not damned.

Realism's inputs: staleness, lane velocity (are competitors shipping while this project stalls?), remaining promise difficulty, execution trend. Analyst judgment first, AI-assisted later. A qualitative read — never a calibrated probability, never a prediction.

## The formula (v0.3.0 candidate — design only, not implemented)

**Status:** candidate spec. Implementing it ships as methodology v0.3.0 — append-only, new version, diffs public. v0.3.0 stays out of active output until approved. Nothing below changes v0.2.0.

### Promise Score (Track 1 — the rank, the main line)

Four components, each 0–1, from seed milestone data. All four are computable for any past date *t* from milestones with achieved_date ≤ *t* — so the main graph line is a true historical series, not a backfill.

- **Fulfillment F** = kept ÷ total. The core: what fraction of promises did you keep?
- **Throughput T** = min((kept ÷ years) / 0.5, 1). Pace: 0.5 kept promises/year reads as excellent at coarse milestone granularity, capped at 1.
- **Recency C** = e^(−S/5), S = years since the last kept promise. Momentum with a 5-year decay: ~37% credit left at 5 years stale, ~14% at 10.
- **Duration D** = min(years promising / 10, 1). Credibility: a 10-year timeline is hard to fake. Capped on purpose — longevity must not rescue a bad record.

**Promise Score = 100 × (0.40·F + 0.30·C + 0.20·T + 0.10·D)**

Why these weights: fulfillment is the question ("are they full of shit"), recency is momentum, throughput is pace, duration is a small credibility bonus. Weights are global, never per-project.

Worked, 2026-09-21:

| | F | T | C | D | Score |
|---|---|---|---|---|---|
| BTC | 0.67 | 0.45 | 0.58 | 1.00 | **63** |
| XRP | 0.33 | 0.28 | 0.08 | 1.00 | **31** |
| LINK | 0.67 | 0.86 | 0.48 | 0.93 | **67** |

The honest output: LINK edges BTC on pure delivery (faster pace, more recent), and XRP collapses to 31 — the flagship story in one number.

Sanity check: a brand-new project scores ~30 (all hope, no record: F=0, T=0, C=1, D=0). XRP at 31 is worth little more than a newborn — 14 years of promising bought almost nothing.

**Open question for Alex:** does LINK > BTC read correctly? The design's answer is yes for Track 1 — it measures delivery, not greatness. BTC's moat (adoption, Lindy effect, decentralization) shows up in the context line, not here. If it reads wrong, the weights move — globally, with the reasoning published.

Missing data: the Promise Score needs the milestone set. No milestones → unavailable, never zero.

### Context Score (Track 2 — the qualifier, the second line)

**Context Score = 100 × Σ(wᵢ·xᵢ) / Σwᵢ**, over assessed factors only. Each xᵢ ∈ [0,1], higher = better for the project's case. Unassessed factors are excluded and labeled — never zero-filled. Default equal weights until tuned.

Per-factor normalization (shapes fixed, parameters TBD as each factor leaves design):
- potential: analyst 0–10 → /10 (current proxy: world_impact_potential)
- realism: qualitative → low 0.2 / medium 0.5 / high 0.8 (assessment method TBD)
- competition: x = 1/(1+n), n = credible lane competitors (needs lane taxonomy)
- token_distribution: x = 1 − insider share — founders + team + private allocations + premine (needs honest sourcing)
- utility: usage-against-promise ratio → 0–1 (needs game-proof definition)
- company_structure: rubric TBD — direction: less single-party control scores higher
- dev_activity: activity vs lane median → 0–1 (needs repo mapping)

The context line updates when analysts (or the AI pipeline) reassess — steppy, versioned, never interpolated.

### The graph

- **Main line:** Promise Score(t), recomputed per date from milestone history. Methodology-version markers on the axis.
- **Second line:** Context Score(t), analyst-updated.
- Nulls render as gaps on both. The anti-hype rule is visual: the context line can never pull the promise line up.

### AI assessment (unchanged)

Stays separate and display-only: the deterministic output (both scores + full factor breakdown) feeds the OpenAI brief → score, rationale, risks, confidence, verdict. Shown with its reasoning. Prompt-versioned, append-only.

## Canonical examples

- **XRP — flagship.** The case the product exists to make: broad crowded promise, stalled delivery, private-company structure.
- **BTC — control.** The baseline a fair model must get right.
- **LINK — third.** Tests whether the model distinguishes a mostly-kept bounded promise from XRP's broad crowded one.

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
- Promises-kept series live (chart line + card lead); chart default series set to the primary factors.
- Design registered in `ranking-factors.ts` (two-track architecture, AI assessment, realism, context factors) — design only, nothing built.

## Design phase (not buildable yet — settling in Part 1 first)

- Promise Score formula + weights — specced in Part 1 (v0.3.0 candidate). Open: Alex rules on LINK 67 > BTC 63.
- Context composite formula — aggregation rule + per-factor shapes specced; parameters TBD per factor.
- Placement of the v0.2.0 scores in the two tracks.
- AI assessment pipeline (OpenAI key, model choice, prompt v1, validation).
- Token distribution sourcing research; utility definition; project-lane taxonomy for competition; realism assessment method.

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

Open question for Alex: final stat lineup — the two-track design says the
promise track leads the card; he rules on the exact lineup.

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
- Trading-card stat lineup ruling (two-track says promise track leads).
- "Private Leon" garble — read as premine/private allocations; needs his confirmation.
- Telegram broadcast channel (needs his Telegram account) — strategy-side, not blocking build.
