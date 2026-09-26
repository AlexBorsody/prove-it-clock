# Prove Value: Product Vision

**Updated 2026-09-26 with Alex's Promise Atlas v1 brief.** The Atlas section
supersedes older Index and embeddings-first instructions. Existing scoring
remains unchanged. Product direction lives here; build details and the ordered
queue live in [implementation.md](implementation.md) and
[tasks/2026-09-26-promise-atlas.md](tasks/2026-09-26-promise-atlas.md).

## The product in one line

Did crypto projects actually deliver what they promised? The core product
is a sourced promise ledger: claim, attribution, fulfillment test, evidence
and outcome. Hearts record delivery, not token prices or economic value.

**Slogan: Truth, not hype.** We cut through the hype.

## The model

Four pillars. One of them is the score; the other three explain it.

- **PROMISES** = the score. Hearts, earned only. One heart per kept promise
  lineage, while its evidence condition holds.
- **CODE** = are they building? Observable GitHub activity on curated repos.
  Activity is not proof of progress.
- **USAGE** = is anyone using it for its stated purpose? Per-project metrics.
  Intended use only, never generic chain activity.
- **HYPE** = is anyone talking about it? Observed mention counts. Attention
  is not support and never evidence of delivery.

**Shitcoin warning** = the verdict, as a 1-10 circular meter. A
delivery-accountability rating, not a fraud or investment-risk rating. The UI
shows the number only, never a category label. Tapping the meter opens the
project page at the verdict section, which lists exactly what feeds it: each
failed promise, its state, and whether it was core. Clean projects read "No
failed promises in the record. The meter sits at 1."

The dial position comes from the rule-based category underneath
(Not a shitcoin / Watch / Shitcoin risk / Shitcoin, from promise
states). The 1-10 positions are fixed per category today, not a computed
formula; the formula itself is an open methodology question (under review
2026-09-26: no proportion, no recency, no redemption path).

CODE and USAGE are evidence. HYPE is context. Market data is context.
None of them move the verdict directly in v1.

## Game framing

The 8-bit heart remains the delivery mechanic and brand mark. Under the
published model, each scored promise earns one heart when fulfilled;
capacity is the count of scored promises. Core is a ledger designation,
not an extra weight or a gate on earning. Milestone and ongoing behavior
follow the published methodology, with evidence-backed changes recorded
without rewriting history. The Atlas displays these outcomes; it does not
re-grade them. Precise rules remain in the
[implementation appendix](implementation.md#appendix-hearts-algorithm-promise-heart-rule-v3).

## Promise Atlas v1

**Approved build brief: Alex, 2026-09-26.** This section supersedes the
embeddings-first Atlas brief and the previously proposed Index formula.
It authorizes a view of the existing ledger, not a new ranking model.
The homepage ranking, heart graphic and warning methodology stay unchanged.

> Each point is a promise. Its neighborhood shows its subject. Its color
> shows its recorded outcome. Selecting it reveals the claim and evidence.

The Atlas makes it easy to discover promises, compare their subject matter,
and inspect delivery evidence. A payment network, an application platform,
and an advertising token need not promise the same things. Classification
belongs to individual promises, never automatically to whole projects.

### What ships now

A public `/atlas` route using the currently published scored ledger for the
active methodology. Each distinct promise appears once, with its current
assessment. Historical snapshots and repeated statements do not create
extra nodes. Unscored claims remain on existing project pages.

V1 uses explicit, versioned categories and fixed coordinates. It is not AI
clustering. It needs no embedding API, vector database, live market, social
or GitHub fetches. Missing assignments remain visible in Unclassified.
Missing source fields produce a warning, not an invented link or removal.

### Categories

Each promise has one primary category, optional secondary categories and
optional tags, with an assignment rationale and the actual author's name.
Codex may prepare initial assignments; ambiguous cases stay Unclassified
and are flagged for review. Do not claim Alex reviewed an assignment unless
he did. Region counts use primary assignments only. Category filters may
include secondary matches, labeled as such without duplicating the node.

| Category | Scope |
|---|---|
| Money / Store of Value | Functioning as money, savings or a monetary instrument |
| Payments / Settlement | Transferring value, paying recipients and settling obligations |
| Platform / Compute | Applications, smart contracts and computation |
| Financial Infrastructure / DeFi | Lending, exchanges, collateral and financial services |
| Privacy | Confidentiality of transactions, identity or data |
| Interoperability | Communication or transfer between separate systems |
| Governance | Decisions, upgrades and participation |
| Real-world Integration | Connecting on-chain systems to external assets, institutions or processes |
| Unclassified | No assignment yet, or genuinely ambiguous classification |

Scale, Inclusion and Sovereignty are optional cross-cutting tags, not
primary regions. A throughput promise can be Payments with a Scale tag.
Core status comes only from the published ledger.

### Visual and interaction design

Use a readable two-dimensional landscape with labeled category regions.
Uniform points are green for kept, red for lapsed or retired, and grey for
open, in progress or unknown. A neutral outer ring marks existing core
status; a separate outline marks selection. Exact status text stays visible
in the preview, drawer and accessible list. No edges, drifting physics,
3D, inferred impact sizing or market-based geometry.

Overview shows points and category labels. Closer zoom can reveal short
labels or tickers where they fit. Fixed positions survive filtering and
selection: a project's promises stay across their original neighborhoods.
Reset view restores the overview; Fit results changes only the camera.

Desktop: compact filters above the map, hover preview and a side drawer.
Mobile: a usable map with tap selection, drag pan, pinch zoom and visible
zoom controls; a bottom sheet or full-width detail panel respects bottom
navigation and safe areas. Gestures belong to the map, not the whole page.
Empty-space click clears selection without moving the camera. Respect
reduced motion and restore focus sensibly when details close.

Provide project multi-select, category association, exact status and text
search filters. Show match counts and a reset-filters action. Share filters
and selected promise through validated URL parameters. Direct promise links
reveal their selected node and drawer even if filters would hide it. Provide
an accessible list from the same filtered data; keyboard use must not
require stepping through every small SVG point.

The selected record shows project/category/core identity, the claim or
faithfully labeled published description, exact status, recorded assessment
explanation and date, fulfillment test, original claim sources, outcome
evidence, and links to the existing record. Exact quotations are marked as
quotes; paraphrases are not. An original claim source is distinct from an
assessment reference. No test is invented when a record lacks one, and no
historical outcome is reconstructed from its current state.

### Public explanations

Near the map:

> Explore what projects promised and what happened. Each point is a sourced
> promise, grouped by subject.

In the legend or information panel:

> Curated category layout. Position shows classification, not measured
> similarity or importance.

> Categories are curated. Distance between points does not measure value
> or similarity.

The information panel exposes the ledger methodology, taxonomy, assignment,
layout and data versions, plus the data date. Match counts and assessment/data
dates are required Atlas context, overriding older blanket rules against
counts and timestamps. They describe coverage, not a performance ranking.

### Integration and future boundary

Add a small homepage link, “Explore the Promise Atlas,” and a project link,
“See this project's promises on the Atlas,” with that project selected.
Use secondary navigation rather than squeezing another small bottom tab in.
Project details remain the full evidence record; Atlas is another way in.

V2 may explore embedding-assisted suggestions, semantic coordinates and
semantic search. Content, classification and coordinates stay separate so
positions can change method without replacing the evidence UI. Similarity
alone proves neither delivery nor importance, world impact or token value.

No Index, AI score, weights, decay, warning changes, new research pipeline,
automatic grading, equities, category performance ranking or synthetic
history is authorized here. Any future ranking requires a separate approved
methodology. [Implementation](implementation.md#promise-atlas-v1-implementation)
and the [task queue](tasks/2026-09-26-promise-atlas.md) govern the build.

## Prove Value Index: separate future work

The earlier 60/25/15 proposal is superseded as a build instruction. No Index
formula or implementation is approved by the Atlas brief. New weights,
impact measures, time decay and rankings need their own reviewed spec.

## Homepage = scoreboard (borrow the CoinMarketCap pattern)

The homepage goes straight to the rankings. No hero text, no brand wordmark
in the app chrome (brand lives in the browser tab title only); the slim
sticky header carries a search icon button (upper right) that expands into
a full-width field, and the bottom tab bar carries Scoreboard / Metrics /
Methodology / API / Tour.

The scoreboard, CoinMarketCap coin-list pattern, mobile-first:

- Mobile: one card per project. Coin icon, name, ticker. Compact hearts with
  earned/capacity. Shitcoin warning dial. One stat line: CODE activity plus
  commits, HYPE mentions. Expandable promise list. No rank number, no
  sparkline on the card.
- Desktop: dense table. Columns: # (ranked by hearts filled %), Coin (icon +
  name, links to detail), Hearts (earned / capacity meter), Shitcoin warning
  dial, CODE (activity word + commits), USAGE ("coming"), HYPE (mentions),
  Proof history (heart-history sparkline). Sortable by column.

Every metric is tappable and opens its data: the meter opens the project's
verdict breakdown, HYPE opens the HYPE ranking with its sources, CODE opens
the CODE ranking with the GitHub stats. Ranking first, metrics one tap away.
Market data (price, 7d candles) appears on detail pages as context; it never
feeds the rankings.

## Compare view = context

Pick 2-4 projects, see them side by side. Metrics as rows, projects as
columns: hearts, shitcoin warning + one-liner, promise counts, CODE stats, USAGE
metric (or "coming"), HYPE mentions + baseline status, Index (once it
exists). Every row header links to the methodology note explaining what
the metric means and what it does not. Numbers never appear without
their context. Entry point: a Compare button on the homepage.

## Detail page = the full promise record

Keep promise content together at the top: project identity/hearts, promises,
recorded outcomes and evidence, warning inputs and promise stats. Recently
happened news points to relevant promises without becoming accepted evidence.
Supporting sections follow in order: CODE, HYPE, then Market at the bottom.
Reuse the shared row components from their list views.

Add “See this project's promises on the Atlas” with the project filter applied.
Atlas selections link back to the exact promise when supported. Revealing a
later collapsed promise is part of making that link work.

The removed Delivery Timeline and HYPE activity graph are not restored by
Atlas. History must come from real recorded events or published snapshots;
never reconstruct past fulfillment from today's state. An Index graph remains
separate future work requiring an approved specification.

## Visual language: steal what we like from CoinMarketCap

Dark, dense, familiar. CMC's mobile app is the reference: dark theme,
compact stat cards, gauges, stacked and bump charts, bottom tab bar.

What we steal:

- **Dark theme** across the app.
- **Overview-style stat cards** with a gauge: ours shows delivery health
  (hearts filled %) per project or across the board, never sentiment.
- **Stacked area chart**: HYPE share across tracked projects over time
  (each project's slice of total mentions), on the homepage or a HYPE view.
- **Mindshare bump chart**: HYPE rank over time per project, 30d/90d
  toggle, coin icons on rank lines. Built from our own snapshots.
- **Bottom tab bar**: Scoreboard / Metrics / Methodology / API / Tour.
- **HYPE leaderboard** (inside Metrics, CMC Alpha > Socials pattern): rows of
  coin icon + name, hearts, HYPE mentions + change vs baseline, verdict
  badge. No price column, no sentiment column. Sortable by mentions or by
  hearts, so the hype-vs-substance gap is visible in one glance.
- **News ticker**: top HYPE stories driving mentions, clearly labeled as
  attention drivers, not endorsements.
- **The hype bubble**: an animated bubble per project where the bubble's
  size is HYPE (attention) and the substance filling it is hearts earned.
  A huge bubble with almost nothing inside reads instantly: all sizzle, no
  steak. As promises get kept, the substance fills the bubble. XRP is the
  reference case: an enormous bubble around bank settlement that never
  filled, with a smaller solid core of real payments usage.

What we do not steal:

- Sentiment gauges (Bullish/Bearish, Fear & Greed): HYPE is volume-only.
- Price as signal: the Market panel shows price and 7d candles as reader
  context, but market data never feeds hearts, the verdict, or the Index.
  We sit next to the market; we don't let it score.
- Prediction markets, KOL leaderboards: not our product.

## Positioning: what CoinMarketCap doesn't do

CMC answers "what's the price and who's talking." Nobody answers "did
they do what they said." That is the white space, and it is structural:
CMC's customers are exchanges and token projects, so it can never label
anything a failure. We can.

- **Promise accountability.** CMC ranks XRP near the top by market cap
  with no mention that the MoneyGram corridor was retired and bank
  settlement never shipped. Nobody scores delivery.
- **Proof history.** Price charts exist everywhere. Nobody charts proof
  earned and lost over time as promises were fulfilled, lapsed, or retired.
- **Hype inverted.** CMC treats hype as a positive signal. We put hype
  next to proof and say "all sizzle, no steak" when the meter is empty.
- **Verdicts.** A 1-10 delivery-accountability meter backed by a published
  rule is something an aggregator funded by listings can never publish.

One line: CoinMarketCap ranks by price. Prove Value ranks by proof.

The niche is the audience, not a feature. CMC serves people asking "what
should I buy": every feature is a buy signal (price, momentum, sentiment,
RSI). Prove Value serves people asking "should I believe this": verdicts,
proof history, hype next to an empty meter. The burned skeptics, the
journalists, the diligence analysts. Different job, different user, and
CMC cannot follow without attacking its own customers.

## Data rules

- Hearts remain the published delivery mechanic. Atlas explores the same
  ledger by subject. Any additional ranking or Index needs a separate spec.
- Earned only: no allowance, no free hearts, no time decay.
- A heart stays earned only while its evidence condition holds. Milestones
  are permanent; ongoing claims lapse when evidence stops; dead
  lineages retire visibly. History is never rewritten.
- Methodology changes restate history openly; the old runs stay as an
  immutable audit archive.
- Missing data means unknown, never zero.
- Announcements change nothing. Only evidence moves scores.
- Humans resolve ambiguous evidence. Software picks the category and
  templates the explanation from reviewed records.

## Voice and design rules

- No em dashes in public copy. Ever.
- Green = earned/good. Red = bad. Grey = neutral/unknown.
- The 8-bit heart shape is the brand mark; it does not get redesigned.
- App UI, not web UI. Links bold, never underlined; external links get the
  open-page icon.
- Avoid unnecessary timestamps/count labels. Atlas explicitly shows match
  counts, recorded assessment dates and version/data dates for auditability.
- Verdict one-liners name evidence: what was delivered, or what failed.
  "No failed promises" is not a one-liner; "Delivered Lightning, Taproot,
  spot ETF adoption" is.

## Parked (not in v1)

HYPE trend percentages. Watch verdict triggers. CODE/USAGE/HYPE timeline
strips beyond CODE. Valuation. **Beyond crypto:** the
instrument is asset-class agnostic, and tech stocks are the natural next
market (Tesla's robotaxi and Full Self-Driving promises, SpaceX's Mars and
Starship timelines are the reference cases). After crypto is proven, not
before. Anything not in this doc waits for Alex, not for a spare
afternoon.

## Changelog

- 2026-09-26: adopted Promise Atlas v1: curated categories, stable uniform
  nodes, evidence details, separate versions; embeddings and Index postponed.
  Supersedes older Atlas build orders and locked composite weights.

- 2026-09-26: renamed Prove-It to **Prove Value** (repo and URL unchanged).
- 2026-09-26: Market panel added to detail pages (price, 7d change, market
  cap, 7-day CoinGecko candlesticks, expand modal). Context only.
- 2026-09-26: Delivery Timeline backfilled from promise `effective_at`
  dates (yearly earned vs contemporary capacity).
- 2026-09-26: promise states render as pills; evidence links behind
  `Sources (n)` disclosures.
- 2026-09-26: CODE ranking gains Follows sort (`subscribers_count`).
- 2026-09-26: Shitcoin warning formula under review (no proportion, no
  recency, no redemption path).

## Research direction: AI-assisted promise assessment

Alex wants to explore cosine similarity and Euclidean distance for future
ranking: alignment with a promise, the measurable gap to fulfillment, and
progress over time. An evidence-based AI estimate could then investigate
likelihood, timing and impact. These are different questions; semantic
similarity alone cannot prove delivery or predict value. See
[the game-design research note](archive/ai-promise-research-2026-09-25.md#research-direction-modeling-promise-versus-reality).
This authorizes design exploration; it does not change earned hearts or
authorize any Index formula. Embedding-assisted organization is future v2
work; ranking judgments need a separate reviewed methodology.

## Next research (gates the Index)

Future USAGE metrics, CODE definitions and possible ranking methodology stay
in a separate research workstream. They do not gate curated Atlas v1, which
uses the existing published outcomes and adds no score.

### Metrics are supporting context (2026-09-26)

One bottom navigation item, Metrics, contains CODE, HYPE and Compare as nested
views. Their existing pages and modular components stay intact. Project details
are the main message: what was promised, what happened, and the evidence.
