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
4. **Promises.** Each lineage with its status: Fulfilled / Active /
   Overdue / Abandoned. Overdue is defined in the data model but has no v1
   trigger; it does not render until deadline evidence is researched.
5. **Evidence / Methodology.** Sources, tracked repos, data coverage,
   methodology version, run id. What CODE counts lives here, auditable and
   challengeable, not on the main page.

## Data rules

- Hearts are the only numerical score.
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

Real USE metrics per project. HYPE trend percentages. Watch verdict
triggers. CODE/USE/HYPE timeline strips beyond CODE. The rebrand
("Prove the Hype" and friends). Valuation. Anything not in this doc waits
for Alex, not for a spare afternoon.
