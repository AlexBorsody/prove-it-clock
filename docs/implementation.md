# Prove-It — Implementation

**Direction: September 22, 2026.** The graph is the product. This replaces the
clock interface and multi-factor dashboard. The existing v0.2.0 app does not
yet calculate this model; the project name can be settled later.

## The point

**Show what the token should be worth as promises are kept and potential is realized.**

The model has a simple progression:

- **Capacity:** the credible world impact of the promise and overall vision
  sets the maximum hearts. Bigger potential means a bigger meter to fill.
- **Starting hearts:** team and existing utility can provide a modest, bounded
  allowance. This is labeled separately from earned delivery; ambition alone
  creates empty containers, not filled hearts.
- **Delivery:** meaningful promises kept turn potential into demonstrated value
  and can support or raise the line. Trivial tasks do not earn automatic increases.
- **Non-delivery:** as time passes without meaningful progress, unearned value
  wears down. With prolonged non-delivery and no demonstrated token value,
  the line must eventually reach zero.

Starting advantages are bounded and counted once. Reputation, repeated claims,
or new announcements cannot continually refill the starting allowance. Utility
already counted at the start cannot be counted again as new progress. Later
verified utility belongs to delivery evidence.

## Promises and potential

Define each project's core promise and the evidence that would count as keeping
it. Assess the impact of individual promises and the overall vision separately,
without adding overlapping value twice. Delivering something consequential
matters more than completing many small milestones.

World Impact informs capacity; team and utility support the starting assessment.
Do not reward the same potential both as a larger meter and as filled hearts.
These are supporting inputs, not separate headline scores or chart tracks.
The current World Impact score is a possible capacity input, not a dollar value.

**XRP is Alex's non-delivery test case:** if the evidence shows its core promise
has remained unkept after all this time, with no demonstrated token value to
support the estimate, the graph should decline and eventually reach zero.
BTC and LINK provide contrasting delivery examples to assess using the same
rules. Results must follow evidence rather than preset rankings.

## The character card and hearts

Think of each project as a game/Pokémon-style character and its timeline as its
journey. Visually, keep the project summary simple: a compact **8-bit heart
meter**, with filled and empty hearts and a numeric count such as **2 / 20**.
The character analogy guides the model, not an elaborate game interface.

- **Maximum hearts:** project-specific capacity based on credible potential.
- **Starting hearts:** a modest, labeled allowance, not proof of promises kept.
- **Earned hearts:** promises have different rewards based on their contribution
  to the core goal. A major promise might earn two hearts; a smaller one earns
  less. Set the rewards and evidence requirements before judging fulfillment.
- **Lost hearts:** prolonged non-delivery erodes unearned potential.
- **Full hearts:** the core promise is fulfilled. Starting bonuses or announcements
  alone cannot fill the meter.
- **Zero hearts:** the promise has failed with no demonstrated value supporting it.

Always show **filled / maximum hearts**. A small project can complete its smaller
meter; a larger ambition has more to deliver. Full hearts means the defined
core promise is fulfilled, not that every project reaches the same impact.

Illustrative game-design examples from Alex—not verified scores or verdicts:

| Character | Promise framing | Heart meter | Reading |
| --- | --- | --- | --- |
| XRP | Replace major parts of SWIFT/banking infrastructure | 2 / 20 | Large ambition, little delivered relative to the goal. A substantial verified milestone could be worth two hearts. |
| BAT | Reward participation in advertising | 3 / 10 | Smaller ambition and a smaller meter, still far from fulfilled. |

Bank deals or announcements earn hearts only if they meet the defined delivery
criteria; they are not automatically proof of adoption. BAT's actual delivery
record must likewise be assessed, not inferred from this example.

Use one rubric for capacity and milestone rewards across projects. Splitting a
promise into smaller tasks must not create extra hearts. A larger claim alone
does not earn a larger capacity: its impact needs a credible case. Capacity and
reward changes are versioned; never shrink the meter to manufacture completion.
Hearts remain model units; their economic mapping is still to be defined.

## The graph

One main line: **hearts over time**, intended to explain justified token value.
Use ordinary plotted lines and points: dates on the horizontal axis, hearts on
the vertical axis, and a simple reference for maximum capacity. Pixel hearts
belong in the compact current-value meter, not at every graph point. No character
art, animations, ornate card frames, or game-engine UI is needed.

Capacity changes remain visible. Selecting a gain or loss explains the milestone
reward or decay behind it. A person should
be able to say, “It went up because they kept a meaningful promise,” or “It is
falling because the initial promise still has not materialized.” Select a point
to see the evidence or assumption behind the change.

Actual traded price may be a clearly labeled comparison once the valuation
mapping exists; hearts and dollars must not be treated as the same unit.
Traded price does not set the justified value.
There is no separate countdown or extra score dashboard. Time affects the
valuation through non-delivery, not through another interface.

Demonstrated continuing value does not disappear merely because it is old.
The unearned starting allowance decays; loss of delivered utility is assessed
from evidence. Fulfilled promises do not require an endless stream of new promises.

## Define before building

1. Use XRP and BAT to work through different meter sizes, with BTC and LINK as
   additional checks. Record promises, potential, and fulfillment evidence.
2. Define the capacity rubric, bounded starting allowance, milestone heart rewards,
   full-heart criteria, and the rate and finite endpoint of decline under non-delivery. Use consistent rules;
   no coin-specific tuning or resets through marketing.
3. Define how that value accrues to the token and becomes a justified market-cap
   estimate. Per-token price requires a stated supply basis for each date.

The hearts model defines the presentation and behavior; it is not yet a valuation
formula. Until the economic mapping exists, do not label points or an impact
score as dollars. Then adapt the existing graph to this model.

## Implementation boundaries

Keep Next.js, Supabase, existing providers/loader, and the shared chart.
Codex owns schemas, ingestion, and API contracts alongside Muse's existing work.
Store dated evidence, starting assumptions, delivery, and versioned assessments.
Missing evidence stays unknown, not zero. Preserve past snapshots; publish new
calculations under a new approved methodology rather than relabeling old scores.

No independent Context Score, AI rating, extra provider integration, or new
service is in scope. The loader's integrity fixes support this graph. Older
formulas and queues are superseded; [archived findings](archive/2026-09-22-previous-implementation.md)
remain reference material, not a second plan.
