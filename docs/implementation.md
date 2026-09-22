# Prove-It — Implementation

**September 22, 2026.** This is the active plan. The v0.2.0 app does not yet
implement this hearts model or calculate justified token value.

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
| Lost hearts | Prolonged non-delivery erodes unearned value. Announcements cannot refill it. |
| Full hearts | The core promise is fulfilled. |
| Zero hearts | Unsupported promise is exhausted and no demonstrated token value remains. |

Use consistent rules. Define rewards and evidence requirements beforehand.
Do not double-count overlapping promises, starting utility, or subdivided tasks.
Preserve real continuing utility; age alone does not erase delivered value.
Changes to promises, rewards, and capacity remain visible in history.

## Examples

Alex's illustrative numbers, not verified ratings:

| Project | Promise framing | Hearts |
| --- | --- | --- |
| XRP | Replace major parts of SWIFT/banking infrastructure | 2 / 20 |
| BAT | Reward participation in advertising | 3 / 10 |

A larger meter means greater potential, not greater fulfillment. Deals earn
hearts only when they meet delivery criteria. Check the evidence for both;
use BTC and LINK as additional examples without predetermined rankings.

## The interface

Show the promise, a compact **8-bit heart meter**, and **filled / maximum**.
Below it: a simple line graph of filled hearts over time, with a capacity
reference. Selecting a point explains the delivery or decline behind it.

No elaborate game UI, countdown, category dashboard, or separate Context/AI
score. Supporting factors stay inside the explanation.

## Still to define

1. **Capacity and rewards:** maximum hearts, starting allowance, milestone weights, and fulfillment criteria.
2. **Decline:** when non-delivery costs hearts and when unsupported value reaches zero.
3. **Valuation:** how delivery and potential create token value; per-token price also requires dated supply.

Hearts are not dollars. Actual price is a comparison, not proof of justified
value. Define that economic connection before displaying a dollar estimate.

## Build scope

Apply the rules to XRP/BAT, then adapt the existing card and graph. Keep Next.js,
Supabase, providers/loader, and the shared renderer. Codex owns backend work
alongside Muse. Store dated evidence and versioned assessments; unknown is not
zero, and old snapshots stay intact. Loader integrity fixes support this scope.

Older formulas and queues are superseded. [Archived findings](archive/2026-09-22-previous-implementation.md)
are reference only; daily logs record progress.
