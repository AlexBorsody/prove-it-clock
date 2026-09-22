# Prove-It — Implementation

**Direction: September 22, 2026.** The graph is the product. This replaces the
clock interface and multi-factor dashboard. The existing v0.2.0 app does not
yet calculate this model; the project name can be settled later.

## The point

**Show what the token should be worth as promises are kept and potential is realized.**

The model has a simple progression:

- **Starting value:** the promise and overall vision establish potential.
  Team, utility, and world impact provide a modest starting boost—like a game
  character starting with more health points. They do not prove delivery.
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

Team, utility, and World Impact assessments support the starting allowance.
They are supporting inputs, not separate headline scores or chart tracks.
The current World Impact score is a possible impact proxy, not a dollar value.

**XRP is Alex's non-delivery test case:** if the evidence shows its core promise
has remained unkept after all this time, with no demonstrated token value to
support the estimate, the graph should decline and eventually reach zero.
BTC and LINK provide contrasting delivery examples to assess using the same
rules. Results must follow evidence rather than preset rankings.

## The character card and hearts

Each project is a character, presented as a game/Pokémon-style card. Its
timeline is its journey; the line tracks a Zelda-style heart meter.

- **Starting hearts:** a modest, bounded boost from team, utility, and potential.
- **Earned hearts:** meaningful promises fulfilled with evidence.
- **Lost hearts:** prolonged non-delivery erodes unearned potential.
- **Full hearts:** the core promise is fulfilled. Starting bonuses or announcements
  alone cannot fill the meter.
- **Zero hearts:** the promise has failed with no demonstrated value supporting it.

Hearts express progress toward realizing potential, including the limited
starting allowance. The size of that potential determines what full hearts
could be worth. Two projects with full hearts need not deserve the same market
cap. Hearts are the visible unit; the economic mapping remains to be defined.

## The graph

One main line: **hearts over time**, intended to explain justified token value.
The card shows current hearts; the graph shows how they changed. A person should
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

1. For BTC, XRP, and LINK, record promises, fulfillment evidence, and starting
   potential, including the modest contribution from supporting factors.
2. Define the heart scale, starting allowance, hearts earned through delivery,
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
