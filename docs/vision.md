# Prove-It: Product Vision

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
- **USE** = is anyone using it for its stated purpose? Per-project metrics.
  Intended use only, never generic chain activity.
- **HYPE** = is anyone talking about it? Observed mention counts. Attention
  is not support and never evidence of delivery.

**Shitcoin Score** = the verdict. A delivery-accountability rating, not a
fraud or investment-risk rating. Rule-based, from promise states:

- **No concern**: no retired or lapsed promise on record.
- **Watch**: reserved for verified overdue promises once deadline evidence
  is researched. No v1 trigger.
- **Delivery concern**: a supporting promise retired or lapsed.
- **Core delivery failure**: the core promise retired or lapsed.

CODE and USE are evidence. HYPE is context. None of them move the verdict
directly in v1.

## The Prove-It Index (provisional name)

Hearts are the simple public accountability mechanic: did they keep their
promises? The Prove-It Index is the broader historical health and
credibility algorithm underneath. One number, 0-100, plotted through time
on the project detail page.

Weights:

- **Promises: 60%** = 60 * (earned hearts / capacity)
- **USE: 25%** = 25 * use_score, where use_score is 0-1 from the
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

Gating rule: the Index does not publish until USE metrics exist, because
25% of the score cannot be fiction. "Missing data means unknown, never
zero" applies to the Index too: a component with no data renders as
unknown, and the Index stays unpublished until all three scoring
components have real inputs. The formula above is locked; the build
waits on the data.

## Homepage = scoreboard (borrow the CoinMarketCap pattern)

A dense, familiar, scannable table in the CoinMarketCap coin-list pattern:
rank, coin, the score columns, sparkline. People already know how to read
it. The difference is what we rank: proof, not price.

Columns:

- # (ranked by hearts filled %)
- Coin: icon + name (links to detail page)
- Hearts: earned / capacity meter (earned-only, green)
- Verdict: Shitcoin Score category badge
- CODE: one-word activity summary (Active/Quiet)
- USE: one-word summary or "coming"
- HYPE: mentions/week (baseline status where relevant)
- Last 90 days: heart-history sparkline

Sortable by column, like CMC. Compact rows, honest with sparse scores
(2/20 renders as 2/20, no padding, no shame). A Compare button above the
table opens the compare view. No price column: we sit next to the market,
we don't price it.

## Compare view = context

Pick 2-4 projects, see them side by side. Metrics as rows, projects as
columns: hearts, verdict + one-liner, promise counts, CODE stats, USE
metric (or "coming"), HYPE mentions + baseline status, Index (once it
exists). Every row header links to the methodology note explaining what
the metric means and what it does not. Numbers never appear without
their context. Entry point: a Compare button on the homepage.

## Detail page = why the scoreboard says what it says

1. **Header.** CoinMarketCap-style coin header: icon, name, rank badge,
   big hearts count, verdict badge, one-line why. Below it a stat strip in
   the CMC pattern: PROMISES (earned/capacity; N fulfilled · N active · N open · N lapsed ·
   N retired) / CODE (commits · releases · contributors, 90d; last
   release) / USE (per-project metric when defined; honest "metrics coming"
   until then) / HYPE (mentions/week; "baseline collecting, week N/8" until
   week 9, no trend percentages before that).
2. **Delivery Timeline.** Hearts step-line on top through time. Activity
   strip below with CODE / HYPE toggle (USE joins when its metrics exist).
   Failed collection never renders as zero.
3. **Prove-It Index.** The 0-100 composite plotted through time, with
   clickable event markers on every meaningful move. Weights disclosed
   beside the graph. Gated on USE data (see above); the section does not
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
- Price columns, price charts, market-cap breakdowns: we sit next to the
  market, we don't price it.
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
- **Verdicts.** A delivery-accountability rating (No concern through Core
  delivery failure) is something an aggregator funded by listings can
  never publish.

One line: CoinMarketCap ranks by price. Prove-It ranks by proof.

The niche is the audience, not a feature. CMC serves people asking "what
should I buy": every feature is a buy signal (price, momentum, sentiment,
RSI). Prove-It serves people asking "should I believe this": verdicts,
proof history, hype next to an empty meter. The burned skeptics, the
journalists, the diligence analysts. Different job, different user, and
CMC cannot follow without attacking its own customers.

## Data rules

- Hearts are the simple public score. The Prove-It Index is the deeper 0-100 composite; it never appears on the homepage.
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

HYPE trend percentages. Watch verdict triggers. CODE/USE/HYPE timeline
strips beyond CODE. The rebrand ("Prove the Hype" and friends); the product
keeps the Prove-It name for now. Valuation. **Beyond crypto:** the
instrument is asset-class agnostic, and tech stocks are the natural next
market (Tesla's robotaxi and Full Self-Driving promises, SpaceX's Mars and
Starship timelines are the reference cases). After crypto is proven, not
before. Anything not in this doc waits for Alex, not for a spare
afternoon.

## Next research (gates the Index)

Real USE metrics per project, and the CODE score definition. The Index
formula is locked; these two inputs are the build's critical path.
