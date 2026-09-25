# Review, decisions needed

**2026-09-25.** The worksheets are scored under the adopted rules. Muse made
four judgment calls (recorded in each case study; Alex can override). What
remains open is below, decide in chat or annotate here.

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

## Decided 2026-09-25 (Muse's calls, Alex can override)

**1. Evidence bar for "fulfilled".** The promise's own success criterion must be
observable by a third party. Clears: a working product anyone can use, an
onchain or otherwise verifiable payout, a named customer confirming on the
record. Does not clear: the issuer's own announcement or roadmap alone
(announcements never change scores). Borderline cases stay unfulfilled, the
analyst doesn't get to be generous.

**2. Core promise proof; capacity need not fill.** The core promise is proven
under the same bar as (1); its only mechanical role is gating the final heart
(cap vs cap−1). Capacity is headroom, not a target, the lineage inventory is
not required to fill it. Unfilled headroom is honest: even the full story told
so far doesn't max the meter.

**3. Blinded replication is an upgrade, not a gate.** Scores publish attributed
to their analyst (single-analyst is fine); blinded replication, when it
happens, upgrades a score to verified. Mandating it before any publish would
freeze the product; attribution is the honest lightweight version.

Settled 2026-09-25: **no time decay**, scores change because evidence changes,
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
