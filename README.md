# The Prove-It Clock

A crypto accountability index: it measures the distance between what crypto projects
**promise** and what they have **demonstrably built** — with reproducible, versioned
scores, every number traceable back to its inputs.

> Algorithms calculate. AI explains. Humans define and version methodology.

## Project Charter

*Founding charter · v0.1 · September 2026*

**Purpose.** Answer one question: *is a crypto project actually becoming what it promised to become?* Crypto has attracted extraordinary capital around extraordinary claims. Some projects may become important infrastructure; others may survive on speculation, become collectibles, or collapse. The Clock measures that evolution with transparent evidence — not price action, marketing, or narrative.

**Mission.** Make crypto capital allocation evidence-driven: harder for narrative to masquerade as progress, harder for speculation to masquerade as adoption, easier for genuinely useful technology to stand out, easier to spot promises still unsupported after many years.

**What we're not.** Not a price predictor, trading signal, token promoter, pay-to-rank directory, advocacy org, popularity contest, or investment advice. A high Reality score doesn't mean fairly valued; a low one doesn't mean the price can't rise. Market performance and thesis success are different questions.

**Core principle.** *Price is evidence of demand for an asset — not evidence that its thesis succeeded.* Market cap isn't utility. Volume isn't adoption. Attention, GitHub activity, partnerships, pilots, TVL, wallets, transactions — none are proof of adoption on their own.

**The Prove-It Principle.** Token appreciation can precede proof: belief → token value → treasury → development → new narratives → continued belief. That's a legitimate mechanism — but eventually a transition should appear: development → real adoption → durable economic demand → reduced subsidy dependence → real-world utility. The Clock measures whether that transition is happening.

**The Clock.** Every project gets an elapsed clock from a documented start. Not a deadline — time is evidence. *Time without progress matters.*

**What we measure** — independent dimensions, never one opaque score:

- **Reality** — what is demonstrably real today: utility, economic demand, adoption, retention, thesis fulfillment.
- **World Impact Potential** — how consequential the thesis would be if realized. Magnitude of opportunity, not likelihood.
- **Execution Evidence** — is it moving toward its potential? Trajectory, milestones, retention, competitive position. Not a calibrated probability until backtesting earns it.
- **Reflexivity / Failure Risk** — dependence on speculation, incentives, issuance, belief. Observable characteristics, not fraud allegations.
- **Evidence Confidence** — how much to trust our measurements. Missing data lowers confidence; it is never treated as negative evidence.

**Protocol ≠ token.** A successful protocol does not imply a successful token. We score Protocol Reality, Token Necessity (could the system run without the token?), and Token Value Capture separately.

**Thesis-specific evaluation.** BTC isn't judged as SaaS; LINK isn't judged as BTC; a payments network is judged on settlement adoption. Always: *is this project succeeding at the job it claims to exist to perform?*

**Evidence hierarchy.** Durable economic dependence outranks recurring usage outranks user-paid demand outranks post-incentive retention — down to announcements and marketing claims. *Claims never outrank observable outcomes.*

**Derived gaps.** Hype Gap (Attention − Reality), Build Gap (Development − Reality), Belief Gap (Community − Measured), Promise Gap (Potential − Reality). The gaps may prove more informative than any single score.

**Methodology standard.** We don't claim perfect objectivity — every subjective decision is explicit, documented, and reproducible. Every metric exposes definition, formula, source, weight, normalization, gates, and missing-data behavior. Users should be able to pinpoint exactly where they disagree. That's a feature.

**Reproducibility.** Raw evidence → normalized metrics → components → dimensions → published result. Every number traceable to inputs. *Algorithms calculate. AI explains. Humans define and version methodology.*

**Independence — non-negotiable.** No paid score improvements. No payment for favorable methodology. Sponsorship and advertising never touch scoring. Material conflicts and holdings disclosed. Corrections made openly. Methodology changes apply consistently, never tuned to favor a project.

**Corrections.** We expect to be wrong sometimes. Challenges must cite specific evidence; confirmed errors get corrected openly. Credibility comes from the correction process, not from pretending mistakes never happen.

**Possible outcomes.** Infrastructure · monetary/collectible asset · speculative relic · collapse · extractive failure. Analytical categories, not predetermined conclusions — projects can move between them.

**History.** We preserve what projects promised, how theses evolved, milestones, failures, pivots, and historical scores — so the industry's history can't be rewritten around each cycle's narrative.

**Long-term goal.** As the dataset grows: backtest which observable characteristics actually distinguished durable projects from failures — then, and only then, consider calibrated probabilities.

**Founding principle.** *Time should produce evidence.* If a technology is genuinely changing the world, evidence accumulates. Our job is to measure it.

---

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
