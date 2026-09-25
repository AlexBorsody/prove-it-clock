# Prove-It: Product Vision

**2026-09-25. Alex-approved.** This is the clean vision. Everything we build
conforms to it; anything that does not fit waits for a vision revision, not
a quiet exception.

## The product in one line

Did the project do what it said it would? One instrument per crypto project:
hearts earned by keeping promises, shown as a meter plus its history.

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

- Promise fulfilled / Promise abandoned
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

## Homepage = scoreboard

One clean card per project. Built for scanning and comparing fast. Nothing
else.

- Coin icon + name
- Heart meter: earned / capacity (earned-only, green)
- Shitcoin Score: category badge
- CODE Active/Quiet · USE: n/a · HYPE mentions (one-word summaries, honest
  placeholders where data does not exist yet)
- Heart-history sparkline underneath (all published points for the active
  methodology; it fills in as runs publish)

## Compare view = context

Pick 2-4 projects, see them side by side. Metrics as rows, projects as
columns: hearts, verdict + one-liner, promise counts, CODE stats, USE
metric (or "coming"), HYPE mentions + baseline status, Index (once it
exists). Every row header links to the methodology note explaining what
the metric means and what it does not. Numbers never appear without
their context. Entry point: a Compare button on the homepage.

## Detail page = why the scoreboard says what it says

1. **Header.** Name, hearts, verdict badge, one-line why.
2. **Four stat cards.** PROMISES (earned/capacity; N fulfilled · N active ·
   N abandoned) / CODE (commits · releases · contributors, 90d; last release)
   / USE (per-project metric when defined; honest "metrics coming" until then)
   / HYPE (mentions/week; "baseline collecting, week N/8" until week 9, no
   trend percentages before that).
3. **Delivery Timeline.** Hearts step-line on top through time. Activity
   strip below with CODE / HYPE toggle (USE joins when its metrics exist).
   Failed collection never renders as zero.
4. **Prove-It Index.** The 0-100 composite plotted through time, with
   clickable event markers on every meaningful move. Weights disclosed
   beside the graph. Gated on USE data (see above); the section does not
   render until the Index can be computed honestly.
5. **Promises.** Each lineage with its status: Fulfilled / Active /
   Overdue / Abandoned. Overdue is defined in the data model but has no v1
   trigger; it does not render until deadline evidence is researched.
6. **Evidence / Methodology.** Sources, tracked repos, data coverage,
   methodology version, run id. What CODE counts lives here, auditable and
   challengeable, not on the main page.

## Data rules

- Hearts are the simple public score. The Prove-It Index is the deeper 0-100 composite; it never appears on the homepage.
- Earned only: no allowance, no free hearts, no time decay.
- A heart stays earned only while its evidence condition holds. Milestones
  are permanent; ongoing claims lapse when evidence stops; fulfilled-then-
  abandoned lineages retire visibly. History is never rewritten.
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
  "No abandoned promises" is not a one-liner; "Delivered Lightning, Taproot,
  spot ETF adoption" is.

## Parked (not in v1)

HYPE trend percentages. Watch verdict triggers. CODE/USE/HYPE timeline
strips beyond CODE. The rebrand ("Prove the Hype" and friends); the product
keeps the Prove-It name for now. Valuation. Anything not in this doc waits
for Alex, not for a spare afternoon.

## Next research (gates the Index)

Real USE metrics per project, and the CODE score definition. The Index
formula is locked; these two inputs are the build's critical path.
