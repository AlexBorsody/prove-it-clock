# Ranking rules: how projects are ordered within a category

**2026-09-28. Task: "Need to think of our ranking algo."**
The verdict brief says "rank the projects that have promises in it by share
kept" but never defines the denominator or the edge cases. This brief sets
the rules. Nothing here is a black box: every rule is explainable in one
sentence, and every number on screen carries its counts.

## The rule

Within one Atlas category, for each project:

- **Decided** = kept + lapsed (crypto) / fulfilled + missed (stocks).
  These are the promises that reached a verdict.
- **Delivery rate** = kept / decided.
- Rank by delivery rate, descending. **Equal rates tie and share the rank.**
- Every row shows the full counts: kept / lapsed / open / withdrawn.
  A 1/1 and a 10/10 both read 100% and tie; the counts beside them make
  the difference obvious. No hidden confidence adjustment.

## Why decided, not total

Counting open promises as misses punishes ambition: a team that makes ten
promises and keeps nine should not rank below a team that made one promise
and kept it, just because one is still open. Open promises are inventory,
not verdict. They stay visible in the counts and on the timeline, where an
open promise aging for years is its own signal.

## Withdrawn / retired / superseded

Excluded from the denominator, always shown in the counts. A withdrawn
promise is not a kept one and not a lapsed one; pretending otherwise is
exactly the kind of invented number this product does not do. The timeline
keeps withdrawals visible as events, so withdrawing a failing promise to
dodge a lapse is on the record.

## Insufficient evidence

A project with fewer than **3 decided promises** in the category is not
ranked there. It shows as "insufficient evidence," never as 0% and never
as a rank. This matches the standing verdict rule: distinguish not
applicable / insufficient evidence / low performance. One kept promise is
a anecdote, not a track record.

## No promise in the category

Unranked. Absent is not zero. (Already the rule; restated so it is in one
place.)

## What the ranking does NOT do

- No cross-category blending, no overall score. Categories are separate
  rankings, full stop.
- No time decay yet. Alex's call: finish promises first, then one-year
  decay. Until then every decided promise counts equally.
- No weights, no Index, no AI. The ranking is arithmetic on the published
  ledger.
- Market cap never enters the ranking. The 1:1 hook (proven value vs
  market cap) is presentation alongside the ranking, never an input to it.

## Rulings needed (Alex)

1. Denominator kept/(kept+lapsed): recommended yes. The alternative is
   kept/total-promises, which punishes open promises.
2. Minimum 3 decided to be ranked: recommended. The alternative is ranking
   everyone with 1+, which lets 1/1 top a category.
3. Withdrawn excluded from denominator but shown: recommended yes.

These are methodology rulings, so they go to the ChatGPT review queue if
Alex wants a second read before implementation.

## Acceptance

- Per-category ranking implements exactly these rules from the published
  ledger; no other inputs.
- Ties share rank; insufficient-evidence and no-promise projects are
  unranked with their reason shown, never 0%.
- Every ranked row links kept/total to the underlying promise evidence.
