# Time's Up — Design Doc v0.1 (DRAFT)

## What it is

A crypto accountability instrument. Every project makes promises; Time's Up tracks
which promises are kept, over time, with evidence. Not prices. Not predictions.
Not buy/sell recommendations.

The compounding dataset is the product. Each snapshot is append-only, so the
history — and the graphs drawn from it — get more valuable the longer we run.

## Simplicity rule

Three headline factors. Nothing more on the surface. Anyone who wants detail
clicks in. The graph stays clean — if it looks busy, we cut, not add.

## Definitions

- **Promise** — a claim the project made about what it would do or become.
  Their words, with a link to where they said it. Nothing more.
- **Utility** — demonstrated real-world use, right now, measurable whether or
  not it was promised. Active users, real transaction volume, protocol revenue.
- **Potential** — capacity to deliver more utility than today. Execution
  evidence plus team plus resources. A ceiling, not a forecast.

## Promise taxonomy (tags) — FIXED for now

Fixed set, defined by Alex. User-generated categories are a can of worms;
parked as a future idea, not v1. Starting set: AI, DeFi, payments/banking,
interoperability, identity, gaming.

Hard rule: **store of value is not a promise.** It's an outcome the market
grants or doesn't. We never score it as a claim.

## The three factors (proposed, not final)

My recommendation — Utility, Promises Kept, Runway — is recorded but Alex
hasn't ruled. Seed data collection covers all candidates (utility metrics,
promise evidence, runway inputs, team notes), so building seeds doesn't block
on the final lineup. Potential stays as the graph ceiling either way.

1. **Promises Kept** (0–10) — per-promise kept scores rolled up.
2. **Utility** (0–10) — demonstrated use, promise-agnostic.
3. **Runway** (0–10) — how long the project survives at current burn/emissions.
   Countdown framing; "declined to disclose" is itself an answer.

Per-promise detail (which promise, kept vs. potential each, evidence links)
lives one click deeper. Team inputs (track record, hires/departures, retention)
feed Potential and are visible on dig-in, not on the card face.

Example: NEAR's Potential leans on Illia Polosukhin — co-author of the
transformer paper. Citable pedigree, not vibes.

## The card

Marvel-card stat bars, three of them: PROMISES KEPT, UTILITY, POTENTIAL.
Click in for per-promise bars, team notes, evidence links.

## Ranking

Utility first — what's real, today. Potential breaks ties. High-potential /
low-utility reads as "interesting, unproven," which is honest.

## The graph (main view)

Clean by rule. Three elements only:

- **Utility line** over time.
- **Potential ceiling** — shaded band above the line. The gap is the headroom.
- **Event markers** — launches, upgrades, hacks, team changes, governance
  fights. Annotation only in v1.

## Events → scores (designed, not built)

Markers only for now. But the architecture stays open: events are typed, and
each type gets a versioned, public scoring hook for later — e.g. confirmed hack
→ security component drops pending postmortem; founder exit → Potential −2
pending replacement. When hooks turn on, they ship as a methodology version
with diffs, per the no-silent-rewrites rule. No hook ever fires quietly.

## Out of scope

Price prediction. Leaderboard-as-game. Scoring store of value. Per-project
methodology tuning. Paid placement, ever. User-generated taxonomy (parked).

## Standing rules (kept from v0.2.0)

Versioned methodology, append-only history, observer-effect policy (our scores
can move markets; influence is a liability), publisher holdings disclosure,
no silent rewrites.

## Naming

No rename work. Code stays Prove-It Clock, exactly as it is. "Time's Up" is
the product name in conversation and docs; nothing gets renamed anywhere.

## Top-20 universe — CONFIRMED

Top 20 is the focus; it's the easiest thing to implement next. Universe rules
for v1 (all reversible):

- Source: CoinGecko ranks 2–21 (Bitcoin excluded). Keyless, already integrated.
- Stablecoins (USDT, USDC, USDS) off the main board for v1 — their "promise"
  is a peg, the categories don't fit. Separate list later.
- FIGR_HELOC excluded — tokenized debt, not a crypto protocol.
- Exchange tokens (WBT, LEO) ship PROVISIONAL, score-capped.
- Daily reconstitution check; membership is append-only — dropouts keep history,
  entrants get seeded before scoring.

## Open questions for Alex

1. Stat lineup: Utility / Promises Kept / Runway (my recommendation) or other?
2. Rollup: are the three factors weighted or straight?
3. Team inputs: which are measurable (retention, hires) vs. judgment (pedigree)?

## Sequencing

1. Tock: top-20 seeds — promises (their words + links), utility metrics, runway
   inputs, team notes. No scoring rewrite, no rename, pushes allowed.
2. Alex rules on the three questions.
3. Methodology v0.3 (three-stat scoring) + card/graph UI.
