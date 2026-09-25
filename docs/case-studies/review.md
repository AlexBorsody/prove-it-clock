# Review — decisions needed

**2026-09-25.** The worksheets are scored under the adopted rules. Muse made
four judgment calls (recorded in each case study; Alex can override). What
remains open is below — decide in chat or annotate here.

## Muse's calls (override any)

1. **Granularity:** BAT's ad loop is one lineage (splitting it manufactures
   hearts); XRP's MoneyGram corridor stays its own lineage (the −1 must stay
   visible).
2. **Claim typing:** BAT's earning lineages are ongoing (present-tense
   promises); XRP's ledger is a milestone, its payments product ongoing.
   xRapid → ODL → Ripple Payments is one continuing lineage.
3. **Subsidized fulfillment counts**, disclosed (BAT creator payouts).
4. **ODL volume figures** (2024–2026) accepted provisionally from secondary
   sources citing Ripple; blinded replication must re-verify primaries.

## Still open

| # | Question | Why it matters |
|---|---|---|
| 1 | What evidence clears "fulfilled" — issuer release, customer statement, functional test, observed payout? | Sets the bar for all future projects |
| 2 | What proves a core promise, and can the lineage inventory actually fill capacity? | Neither BAT nor XRP inventory can reach its cap today |
| 3 | Is independent blinded replication required before production? | All passes so far were non-blinded |

Settled 2026-09-25: **no time decay** — scores change because evidence changes,
not because time passes (Alex + ChatGPT; the 2-year/1-per-year rule was
arbitrary). The old "does an upgrade reset S(t)?" question dissolves with it.
Rewards are retrospective (frozen at assessment publication, never backdated);
missing evidence is unavailable, never zero; announcements never change scores;
partial loss narrows a lineage; retirement needs the criterion to fail, lapsing
needs only the evidence to stop.

## Paper tests

Fictional inputs, not ratings. Arithmetic cases also run under `npm run test:hearts`.

| Test | Input | Expected |
|---|---|---|
| Milestone permanence | Reward-2 milestone fulfilled at A | +2 at all t ≥ A unless retired |
| Ongoing lapse | Reward-1 ongoing active, then evidence stops at B | +1 before B, 0 at B; reactivation restores it |
| Core clipping | Capacity 5, earned 4, allowance 1, core open | 4, with clipping explained |
| Retirement | Reward-2 lineage retired at A | +2 before A, 0 at A; both events kept |
| Unknown | Evidence unavailable | review-required; never filled 0 |
