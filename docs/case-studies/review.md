# Review — decisions needed

**2026-09-25.** The worksheets are scored under the adopted rules. Muse made
three judgment calls (recorded in each case study; Alex can override). What
remains open is below — decide in chat or annotate here.

## Muse's calls (override any)

1. **Granularity:** BAT's ad loop is one lineage (splitting it manufactures
   hearts); XRP's MoneyGram corridor stays its own lineage (the −1 must stay
   visible).
2. **Recency:** strict event reading — only a new fulfillment resets S(t).
   Continuous operation is not adopted.
3. **Subsidized fulfillment counts**, disclosed (BAT creator payouts).

## Still open

| # | Question | Why it matters |
|---|---|---|
| 1 | Does a same-lineage upgrade (BAT self-custody payouts) or zero-reward expansion (XRP SBI corridors) reset S(t)? | Would restore decayed allowance: BAT 3→up to 5, XRP 2→up to 5 |
| 2 | What evidence clears "fulfilled" — issuer release, customer statement, functional test, observed payout? | Sets the bar for all future projects |
| 3 | What proves a core promise, and can the lineage inventory actually fill capacity? | Neither BAT nor XRP inventory can reach its cap today |
| 4 | Is independent blinded replication required before production? | Both passes so far were non-blinded |

Settled: rewards are retrospective (frozen at assessment publication, never
backdated); missing evidence is unavailable, never zero; announcements never
reset recency; partial loss narrows a lineage, retirement needs the criterion
to fail.

## Paper tests

Fictional inputs, not ratings. Arithmetic cases also run under `npm run test:hearts`.

| Test | Input | Expected |
|---|---|---|
| Grace boundary | `A0=2`, earned 0, `S=2` | 2 |
| First decay step | Same, `S=3` | 1 |
| Exhaustion | Same, `S=4` | 0 |
| Fulfillment reset | Exhausted `A0=2`; new reward 1; `S=0` | 3 (allowance restored) |
| Core clipping | Capacity 5, earned 4, allowance 1, core open | 4, with clipping explained |
| Retirement | Reward-2 lineage retired at A | +2 before A, 0 at A; both events kept |
| Unknown | Evidence unavailable | review-required; never filled 0 |
