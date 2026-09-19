# The Prove-It Clock

A crypto accountability index: it measures the distance between what crypto projects
**promise** and what they have **demonstrably built** — with reproducible, versioned
scores, every number traceable back to its inputs.

> Algorithms calculate. AI explains. Humans define and version methodology.

## How it works

```
External API → raw observation (cached) → normalized metric
  → component score → dimension score → snapshot → explanation
```

- **Raw observations are stored before any scoring.** Any snapshot reproduces from
  (observations + methodology config).
- **History is append-only.** The pipeline only inserts. Methodology changes arrive as
  new versions, never silent rewrites.
- **Missing data is UNAVAILABLE** — never zero-filled, never estimated, never hidden.
  Missing inputs redistribute component weights and reduce confidence.
- **Protocol Reality stays separate from Token Necessity / Token Value Capture.**
- **MEASURED FACT vs MODELING DECISION** labels are shown throughout the UI.

## Run it

```bash
cd app
npm install
npm run pipeline   # ingest live data, score, explain (writes data/snapshots/)
npm run dev        # local UI at http://localhost:3000
npm run typecheck  # TypeScript
npm run build      # production build
```

The pipeline caches raw API responses under `data/raw/<date>/` — page loads never
hit upstream providers.

## Supabase (when ready)

Apply `db/migrations/001_initial.sql` to the Supabase project, then seed the
reference data, theses, milestone ladders, and assessments. Set:

```bash
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

The data layer (`src/lib/data.ts`) uses `SupabaseStore` automatically when these
are set; otherwise it falls back to the JSON snapshot store.

## Structure

```
app/
  methodology/v0.1.0.json      # versioned config: scores, components, weights, gates
  data/projects.json           # 6 project seeds: theses, assessments, milestones, events
  data/snapshots/              # pipeline outputs: metrics, scores, explanations
  data/raw/<date>/             # cached raw provider responses
  src/providers/               # CoinGecko, DefiLlama, Bitcoin adapters (isolated)
  src/methodology/             # deterministic scoring engine
  src/pipeline/                # ingest.ts, score.ts
  src/lib/data.ts              # DataStore: JSON (local) / Supabase (env)
  src/app/                     # leaderboard, project detail, methodology pages
db/migrations/001_initial.sql # full Postgres schema + RLS
```

## Daily scheduling (deployment outline)

1. Cron / scheduled job runs `npm run pipeline` once per day.
2. Pipeline appends a new dated snapshot (metrics, scores, explanations).
3. The leaderboard "Reality trend" column and the per-project history chart
   build automatically from the appended snapshots.
4. Methodology edits = new `methodology/vX.json` version; the pipeline tags
   every snapshot with the version that produced it.

## Current state (v0.2.0, 2026-09-19)

- 6 projects: BTC, ETH, SOL, XRP, LINK, ADA.
- v0.2.0 adds: Potential Outlook (forward-looking, uncalibrated — not a probability),
  observer-effect policy, publisher disclosures.
- Unavailable in v0.2: Attention, Subsidy Dependence, Hype Gap, Belief Gap,
  Development (CoinGecko returned no developer data; dedicated GitHub adapter
  is Phase 2 work).
---

# The Trust Commons Charter

*The Prove-It Clock is built under this charter — it governs the Clock, TrustNode, and SourceSelect as one commons.*

*Prove-It Clock · TrustNode · SourceSelect — a GhostOp Labs commons*

## Preamble

Search engines rank without showing why. AI systems answer without showing their sources. Token promoters narrate without showing evidence. Three different black boxes, one problem: **you cannot check the work.**

These three projects exist for one reason: to make hidden reasoning visible. The Clock checks crypto's promises against reality. TrustNode checks AI's claims against sources. SourceSelect opens the machine so you can see — and adjust — how answers get made. Different fronts, same war: black-box authority.

This charter is what keeps them honest. Not a vibe — a commitment, in writing, versioned like everything else here.

## Article I — Show your work

Every claim the commons publishes must be traceable: **answer → claim → source → evidence → confidence.** A number without its derivation is a rumor. If you can't inspect it, it doesn't count.

## Article II — The commons belongs to everyone

Methodology, data, and code are public, versioned, and forkable. Anyone can reproduce every score, audit every weight, and build on top. There are no black boxes in the measurement layer — that would defeat the entire purpose.

## Article III — Trust is never for sale

Rankings, scores, and trust assessments cannot be bought, sponsored, or boosted. Paid placement never affects any output of the commons. The day trust goes up for sale is the day the project ends — see Article VIII.

## Article IV — Influence is a liability, not a goal

Measuring something can change it. These tools measure; they do not move markets, manufacture narratives, or pick winners. If a tool's influence ever starts shaping what it measures, the methodology must change — publicly, as a new version. Goodhart's law is not a footnote here; it's a design constraint.

## Article V — The community contributes; it does not rule

Community evidence, votes, and perspectives are welcome — as labeled inputs. They are never silently merged into scores. **Votes are signals, not verdicts.** The algorithm's independence from the crowd is what makes the crowd's disagreement interesting.

## Article VI — AI explains; it does not decide

Algorithms calculate from evidence. AI may summarize, explain, and narrate — it never touches the numbers. The moment a model grades its own homework, the chain of trust breaks.

## Article VII — The business serves the commons

The commons is free and open. Revenue comes from services around it: implementation, custom deployments, enterprise instances, advisory. The network belongs to everyone; the interface and the labor are the product. Neither may ever be used to corrupt the other.

## Article VIII — No single point of failure

If the founder walks away, gets hit by a bus, or sells out: the data stays public, the methodology stays versioned, the code stays forkable. Anyone can continue the work. A trust commons that depends on one person's virtue is not a commons — it's a promise. This charter exists so it doesn't have to be.

## Article IX — Trust is computed in the open

Trust is a property of the graph, not a label anyone assigns. A source is trusted when trusted sources corroborate it, its claims verify against evidence, and the community relies on it — the same theory behind PageRank and TrustRank, applied to sources instead of web pages. Authority is computed from the graph; it is never asserted.

Google proved the theory and hid the machine: secret seeds, secret weights, a black box no one can audit. The commons runs the same playbook in the open. The seed set — the foundational sources from which trust flows — is published, versioned, and disputable. The algorithm is public. Every weight is inspectable, every ranking reproducible.

Seeds are starting points, not thrones. Any seed can be challenged, and trust that stops being earned stops flowing. What Google's black box made unaccountable, the commons makes checkable.

---

*Ratified by Alex Borsody, 2026-09-19. Version 1.1 (amended 2026-09-19: Article IX — the PageRank thesis). Amendments require a new version, never a silent edit.*
