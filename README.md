# The Prove-It Clock

One question: *is a crypto project actually becoming what it promised to become?*

The Clock estimates whether a project is full of shit or not — based on
ranking factors, displayed as a historical timeline where each factor can be
inspected for accountability. Not prices. Not predictions. Not buy/sell
recommendations.

## The ranking factors

Independent dimensions, never one opaque score:

- **Reality** — what is demonstrably real today: utility, economic demand, adoption, retention.
- **World Impact Potential** — how consequential the thesis would be if realized. Magnitude, not likelihood.
- **Execution Evidence** — is it moving toward its potential? Trajectory, milestones, competitive position.
- **Reflexivity / Failure Risk** — dependence on speculation, incentives, issuance, belief.
- **Evidence Confidence** — how much to trust our measurements. Missing data lowers confidence; never treated as negative evidence.

Derived gaps: **Hype Gap** (Attention − Reality), **Build Gap** (Development − Reality), **Belief Gap** (Community − Measured), **Promise Gap** (Potential − Reality).

Potential Outlook: `clamp(max(promise_gap, 0) × (execution_evidence / 10), 0, 10)` — of the promise not yet realized, how much does current execution support capturing. Not a probability, not a price prediction, uncalibrated until backtesting earns it.

## The timeline

Every project gets a historical chart: each scored factor plotted over time,
with methodology-version markers on the axis and event annotations (launches,
hacks, pivots, leadership exits). The history is the product — the longer the
tape, the more it can tell you.

## Rules

- **Versioned methodology.** Every scoring change ships as a new version. Diffs are public. Silent rewrites are a defect.
- **Append-only history.** New snapshots add rows. Past snapshots are never rewritten.
- **Missing data is UNAVAILABLE** — never zero-filled, never estimated, never hidden.
- **Market cap controls membership and display rank only.** Never touches scores.
- **No paid placement.** Sponsorship never affects rankings. Ever.
- **Observer effect.** Publishing scores can move markets; influence is a liability, not a goal.
- Algorithms calculate. AI explains. Humans define and version methodology.

## Run it

```bash
cd app
npm install
npm run pipeline   # ingest live data, score, explain (writes data/snapshots/)
npm run dev        # local UI at http://localhost:3000
npm run typecheck  # TypeScript
npm run build      # production build
```

The pipeline caches raw API responses under `data/raw/<date>/` — page loads never hit upstream providers.

## Supabase

Apply `db/migrations/001_initial.sql`, then set (server-side only, never `NEXT_PUBLIC_*`):

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Structure

```
app/
  methodology/v0.2.0.json      # versioned config: scores, components, weights, gates
  data/projects.json           # project seeds: theses, milestones, events
  data/snapshots/              # pipeline outputs: metrics, scores, explanations
  data/raw/<date>/             # cached raw provider responses
  src/providers/               # CoinGecko, DefiLlama, Bitcoin adapters (isolated)
  src/methodology/             # deterministic scoring engine
  src/pipeline/                # ingest.ts, score.ts
  src/lib/data.ts              # DataStore: JSON (local) / Supabase (env)
  src/app/                     # leaderboard, project detail, methodology pages
db/migrations/001_initial.sql # full Postgres schema + RLS
docs/implementation.md         # technical build doc
docs/strategy.md               # distribution + monetization
docs/tasks/                    # daily task docs
```

## Current state

- Live: https://prove-it-clock.vercel.app
- Methodology v0.2.0. 20 projects: 6 scored (BTC, ETH, XRP, SOL, LINK, ADA), 14 explicitly unavailable.
