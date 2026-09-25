# Prove-It: Game Design

**September 22, 2026; revised 2026-09-25.** This defines the product and game rules.
The product vision lives in [vision.md](vision.md): homepage = scoreboard,
detail page = why. [hearts-algorithm.md](hearts-algorithm.md) defines the rule.

## The idea

**One graph: is the project earning its value by keeping promises and realizing its potential?**

Each project is a game character. Its promise is the goal, its hearts show its
condition, and the graph records its journey. Ultimately, this should explain
what the token should be worth.

## The rules

| Element | Meaning |
| --- | --- |
| Maximum hearts | Credible potential/world impact sets capacity. Bigger ambition needs more delivery, never free filled hearts. |
| Starting hearts | Zero. Removed 2026-09-25: every heart on the meter is earned. |
| Earned hearts | Verified promises kept. Important promises can earn more; one might be worth two hearts. |
| Lost hearts | A heart stays earned only while its evidence condition holds. Milestones are permanent; ongoing claims lapse when evidence stops; dead lineages retire visibly. History is never rewritten. |
| Full hearts | The core promise is fulfilled (it gates the final heart). |
| Zero hearts | No promise currently evidenced. |

Use consistent rules. Define rewards and evidence requirements beforehand.
Do not double-count overlapping promises, starting utility, or subdivided tasks.
Preserve real continuing utility; age alone does not erase delivered value.
Changes to promises, rewards, and capacity remain visible in history.

## Examples

Published 2026-09-25 under the claim-type rule, earned-only (single-analyst; Alex can override):

| Project | Promise framing | Hearts | Meter |
| --- | --- | --- | --- |
| XRP | Replace major parts of SWIFT/banking infrastructure | 2 / 20 | 7 |
| BAT | Reward participation in advertising | 3 / 10 | 1 |

A larger meter means greater potential, not greater fulfillment. Deals earn
hearts only when they meet delivery criteria. Check the evidence for both;
BTC and LINK are now scored as well, current scores in implementation.md.

## The interface

[vision.md](vision.md) defines it: homepage = teaching block + scoreboard
(mobile cards, desktop table: hearts, shitcoin warning dial, CODE/HYPE,
proof-history sparkline on desktop). Every metric is tappable and opens its
data: meter to the verdict breakdown, HYPE to the HYPE ranking, CODE to the
CODE ranking. Detail page = why (verdict meter with its inputs, four stat
cards, Delivery Timeline plus the legacy timeline, promises with status,
Evidence/Methodology).

No elaborate game UI, countdown, category dashboard, or separate Context/AI
score. Supporting factors stay inside the explanation.

## Decided 2026-09-23, revised 2026-09-25

Per [hearts-algorithm.md](hearts-algorithm.md): capacity tiers {5, 10, 20} (provisional, under review: the potential rule is not settled),
lineage rewards {0,1,2} fixed before fulfillment, no time decay of any kind
(scores change because evidence changes: adopted 2026-09-25, replacing the
earlier provisional decay sketch), core-promise gate on the final heart.
Starting allowance removed 2026-09-25: scoring is earned-only; history was
restated and republished, originals kept as audit archive. Dead
lineages retire visibly: the graph rises at fulfillment and falls
at retirement; history is never rewritten. Shitcoin warning is a 1-10 meter,
number only in the UI; fixed dial positions per category for now, a real 1-10
rule is an open methodology question.

Valuation is postponed to v2. The product shows delivery beside market cap -
`BAT: 3/10 delivered: $X market cap`: and never a calculated fair value.
Hearts are not dollars. The market provides the valuation; Prove-It provides the
evidence-based delivery measurement.

## Scope

Eight projects live (BTC, ETH, SOL, XRP, LINK, AVAX, DASH, BAT). The product
is the scoreboard, the detail pages, and the evidence behind them. No new
features until the case studies survive scrutiny: and nothing not in
[vision.md](vision.md) without Alex. Older formulas and feature queues are
superseded. Engineering details live in [implementation.md](implementation.md).
