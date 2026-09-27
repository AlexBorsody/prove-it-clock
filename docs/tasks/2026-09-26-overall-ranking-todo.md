# TODO (Muse): overall ranking methodology v2

Alex, 2026-09-26 ~23:00 EDT. Status: methodology design, NOT for
implementation yet. The v4 weighted verdict (Codex's active workstream) is
unchanged; this designs what comes after.

## Alex's diagnosis

The homepage ranking by raw hearts % is upside down: AVAX #1 (14 small
promises kept), BAT last (7/17). Any sane read puts BTC, BAT, ETH on top
and XRP near the bottom. Every promise currently counts the same, so the
ranking rewards promise count over promise size.

## Proposed structure: two separate surfaces

- **Verdict** (shitcoin warning) = weighted promise fulfillment ONLY.
  Importance tiers 1/2/4 with named rationale per promise. No usage, no
  market, no hype, no price. This stays pure.
- **Overall ranking** = composite: verdict + impact + utility + time.
  This is where "world economic impact," real usage, and the timeline
  live. A project can have strong utility and still fail the verdict;
  the overall blends them, the verdict does not.

## Design questions to resolve

1. **Promise scope weight.** "Replace SWIFT" is not "a random technical
   whitepaper detail." The tier rationale must score scope explicitly:
   who was affected, how many, how much. Impact lives inside the weight
   rationale, not as a separate vibes score.
2. **Time as overdue drag, not decay.** No generic decay of earned
   credit (approved). But an open promise ages badly: XRP's 12-year-old
   unkept SWIFT promise should drag more each year it sits open.
   Compatible with "unresolved findings survive averaging," extended
   across time.
3. **Impact operationalization.** A standalone "world economic impact
   score" is the easiest place for vibes to enter. Default: impact =
   promise-scope weight + measured utility. A separate impact metric
   needs a published formula or it is theater.
4. **Utility finally counts, in the overall only.** USE metrics feed the
   overall ranking, never the verdict. BAT's active utility lifts it in
   the overall; it does not erase unkept promises.
5. **Multiple rankings.** Per-category ranks (CODE, USE, HYPE, verdict)
   plus one overall composite. The single ultimate visualization remains
   the north star; ship the separated surfaces first (scope discipline).
6. **Timeline.** Alex's original instinct: time is a first-class axis.
   The promise atlas shows state; a timeline shows delivery (or silence)
   against promise age. Design after the composite is defined.

## Bitcoin

Genesis exemption stands for the VERDICT (excluded from altcoin verdict
rankings). BTC is eligible for the OVERALL ranking, where delivered
impact and real utility carry it. "Store of value" is a community-adopted
proposition, not a whitepaper promise; in the overall it scores through
impact/utility, not through the verdict ledger.

## Boundaries

- Do not implement the composite until the design is reviewed.
- Codex's v4 verdict workstream is unaffected; keep building it.
- Working product first: no product changes from this note until Alex
  approves the design.
