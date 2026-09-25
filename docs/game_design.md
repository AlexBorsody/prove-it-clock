# Prove-It — Game Design

**September 22, 2026; revised 2026-09-25.** This defines the product and game rules.
The product is the hearts instrument: one meter per project, plus its history graph.

## The idea

**One graph: is the project earning its value by keeping promises and realizing its potential?**

Each project is a game character. Its promise is the goal, its hearts show its
condition, and the graph records its journey. Ultimately, this should explain
what the token should be worth.

## The rules

| Element | Meaning |
| --- | --- |
| Maximum hearts | Credible potential/world impact sets capacity. Bigger ambition needs more delivery—not free filled hearts. |
| Starting hearts | A modest, bounded allowance supported by team and existing utility. Label it separately from earned delivery. |
| Earned hearts | Verified promises kept. Important promises can earn more; one might be worth two hearts. |
| Lost hearts | A heart stays earned only while its evidence condition holds. Milestones are permanent; ongoing claims lapse when evidence stops; fulfilled-then-abandoned lineages retire visibly. History is never rewritten. |
| Full hearts | The core promise is fulfilled (it gates the final heart). |
| Zero hearts | No promise currently evidenced and no present-tense allowance. |

Use consistent rules. Define rewards and evidence requirements beforehand.
Do not double-count overlapping promises, starting utility, or subdivided tasks.
Preserve real continuing utility; age alone does not erase delivered value.
Changes to promises, rewards, and capacity remain visible in history.

## Examples

Published 2026-09-25 under the claim-type rule (single-analyst; Alex can override):

| Project | Promise framing | Hearts |
| --- | --- | --- |
| XRP | Replace major parts of SWIFT/banking infrastructure | 5 / 20 |
| BAT | Reward participation in advertising | 5 / 10 |

A larger meter means greater potential, not greater fulfillment. Deals earn
hearts only when they meet delivery criteria. Check the evidence for both;
use BTC and LINK as additional examples without predetermined rankings.

## The interface

Show the promise, a compact **8-bit heart meter**, and **filled / maximum**.
Below it: a simple line graph of filled hearts over time, with a capacity
reference. Selecting a point explains the delivery or decline behind it.

No elaborate game UI, countdown, category dashboard, or separate Context/AI
score. Supporting factors stay inside the explanation.

## Decided 2026-09-23, revised 2026-09-25

Per [hearts-algorithm.md](hearts-algorithm.md): capacity tiers {5, 10, 20} (locked),
starting allowance from a 3-item present-tense checklist capped at min(3,
floor(capacity/5)), lineage rewards {0,1,2} fixed before fulfillment, no time
decay of any kind (scores change because evidence changes — adopted 2026-09-25,
replacing the earlier provisional decay sketch), core-promise gate on the final
heart. Fulfilled-then-abandoned lineages retire visibly: the graph rises at
fulfillment and falls at retirement; history is never rewritten.

Valuation is postponed to v2. The product shows delivery beside market cap —
`BAT — 3/10 delivered — $X market cap` — and never a calculated fair value.
Hearts are not dollars. The market provides the valuation; Prove-It provides the
evidence-based delivery measurement.

## Scope

Start with XRP/BAT, then check BTC/LINK. Keep the product to the heart meter,
timeline, and evidence behind changes. No new features until the BAT and XRP case
studies survive scrutiny. Older formulas and feature queues are superseded.
Engineering details live in [implementation.md](implementation.md).
