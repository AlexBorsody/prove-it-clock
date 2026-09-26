# Prove Value: Product Vision

**2026-09-25. Alex-approved.** This is the clean vision. Everything we build
conforms to it; anything that does not fit waits for a vision revision, not
a quiet exception.

## The product in one line

Did the project do what it said it would? One instrument per crypto project:
hearts earned by keeping promises, shown as a meter plus its history.

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

Each project is a game character. Its promise is the goal, its hearts show
its condition, and the graph records its journey. The meter starts at zero:
every heart is earned by keeping a promise, one or two at a time, each
defined and evidenced beforehand. A heart stays earned only while its
evidence condition holds: milestones are permanent, ongoing claims lapse
when evidence stops, dead lineages retire visibly, and history is never
rewritten. The meter reads full only when the core promise itself is kept.
No free hearts, no double-counting, no subdivided busywork. (Precise rules:
[implementation.md](implementation.md), Hearts algorithm appendix.)

## The Prove Value Index (provisional name)

Hearts are the simple public accountability mechanic: did they keep their
promises? The Prove Value Index is the broader historical health and
credibility algorithm underneath. One number, 0-100, plotted through time
on the project detail page.

Weights:

- **Promises: 60%** = 60 * (earned hearts / capacity)
- **USAGE: 25%** = 25 * use_score, where use_score is 0-1 from the
  per-project intended-use metrics
- **CODE: 15%** = 15 * code_score, where code_score is 0-1 from
  sustained activity on curated repos (definition required before build)
- **HYPE: 0%**. Context only. It never improves the score.

Every meaningful move gets a clickable event marker explaining exactly
why the score moved:

- Promise fulfilled / Promise lapsed / Promise retired
- Deadline missed (defined; no v1 trigger until deadline evidence is
  researched)
- Major release
- Usage milestone
- Development resumed / stalled
- Major hype spike (context only, never moves the score)

Gating rule: the Index does not publish until USAGE metrics exist, because
25% of the score cannot be fiction. "Missing data means unknown, never
zero" applies to the Index too: a component with no data renders as
unknown, and the Index stays unpublished until all three scoring
components have real inputs. The formula above is locked; the build
waits on the data.

## Homepage = scoreboard (borrow the CoinMarketCap pattern)

The homepage goes straight to the rankings. No hero text, no brand wordmark
in the app chrome (brand lives in the browser tab title only); the slim
sticky header carries a search icon button (upper right) that expands into
a full-width field, and the bottom tab bar carries Scoreboard / HYPE /
Compare / Methodology / API / Tour.

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

## Detail page = why the scoreboard says what it says

1. **Header.** CoinMarketCap-style coin header: icon, name, rank badge,
   big hearts count, Shitcoin warning dial, one-line why. The meter section
   lists "What feeds this meter": each failed promise with its state and
   core flag, or the clean/overdue note. Below it a stat strip in
   the CMC pattern: PROMISES (earned/capacity; N fulfilled · N active · N open · N lapsed ·
   N retired) / CODE (commits · releases · contributors, 90d; last
   release) / USAGE (per-project metric when defined; honest "metrics coming"
   until then) / HYPE (mentions/week; "baseline collecting, week N/8" until
   week 9, no trend percentages before that).
2. **Market.** Live price, 7d change, market cap, and a 7-day candlestick
   chart (CoinGecko OHLC, 4h candles) with date labels on the x axis;
   click/tap expands it in a modal. Market data is context for the reader,
   never an input to hearts, the verdict, or the Index.
3. **Delivery Timeline.** Hearts line on top through time. With only one
   published run per methodology the line is a single dot, so the page
   backfills yearly history from promise `effective_at` dates: for each
   year-end, hearts earned vs promises that existed by then. Activity
   strip below with CODE / HYPE toggle (USAGE joins when its metrics exist).
   Failed collection never renders as zero. The legacy v0.2.0 timeline
   stays on the page below it (Alex's call): both timelines, no merge.
3. **Prove Value Index.** The 0-100 composite plotted through time, with
   clickable event markers on every meaningful move. Weights disclosed
   beside the graph. Gated on USAGE data (see above); the section does not
   render until the Index can be computed honestly.
4. **Promises.** Each lineage with its status: Open / Active / Fulfilled /
   Lapsed / Retired. Overdue is defined in the data model but has no v1
   trigger; it does not render until deadline evidence is researched.
5. **Evidence / Methodology.** Sources, tracked repos, data coverage,
   methodology version, run id. What CODE counts lives here, auditable and
   challengeable, not on the main page.

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
- **Bottom tab bar**: Scoreboard / HYPE / Compare / Methodology.
- **HYPE leaderboard** (the HYPE tab, CMC Alpha > Socials pattern): rows of
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

- Hearts are the simple public score. The Prove Value Index is the deeper 0-100 composite; it never appears on the homepage.
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
- No timestamps and no project-count labels in the public UI.
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
This authorizes design exploration; it does not change earned hearts or the
current Index formula. Implementation follows after the measures are defined
and tested against real outcomes.

## Next research (gates the Index)

Real USAGE metrics per project, and the CODE score definition. The Index
formula is locked; these two inputs are the build's critical path.
