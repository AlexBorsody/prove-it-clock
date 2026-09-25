# BAT: case study

**Method:** [hearts-algorithm.md](../hearts-algorithm.md) v2 (claim-type rule, adopted 2026-09-25; time decay removed; allowance removed 2026-09-25).
**Research:** two independent passes (2026-09-23, 2026-09-24), non-blinded.
**Status:** published to production 2026-09-25 under adopted rules; single-analyst
(non-blinded), blinded replication outstanding before scores are called verified.

## Result

**BAT 3/10.** Earned 3 (both lineages ongoing, currently active),
core open (cap 9, not binding).

```
earned    = 2 (ad loop, ongoing/active) + 1 (creators, ongoing/active) = 3
filled    = min(10, 3) = 3
```

## Lineages

| Promise | Type | Reward | State | Key evidence |
|---|---|---|---|---|
| Users earn BAT for private opt-in ads | ongoing | 2 | Active (revalidated 2026-09-25) | Brave Ads launch 2019-04-24 ([Brave](https://brave.com/blog/brave-ads-launch/), [CoinDesk](https://www.coindesk.com/markets/2019/04/24/view-ads-get-bat-brave-delivers-on-ico-promise-of-paid-web-browsing)); still funded, BAT buybacks for user rewards per [BAT Roadmap 4.0](https://brave.com/blog/bat-roadmap-4-0/) |
| Creators/publishers earn BAT | ongoing | 1 | Active (revalidated 2026-09-25) | BAT Mercury launch 2017-10-12 ([Brave](https://brave.com/blog/bat-mercury-launch/)); self-custody Solana payouts opened broadly, page updated 2026-07-16 ([Brave](https://brave.com/blog/payouts-on-solana/)) |
| BAT as a web-wide attention standard | n/a | 2 | Open | Stated aim in the [2017 whitepaper](https://basicattentiontoken.org/wp-content/uploads/2017/05/BasicAttentionTokenWhitePaper-4.pdf); not realized |

Capacity 10: advertising-sector ambition (mechanical per rubric).

## Allowance

Removed 2026-09-25: scoring is earned-only. The allowance-era assessment is
preserved in git history.

## Assessment notes

- **Granularity:** one ad-loop lineage, not three (users/publishers/advertisers).
  Splitting the loop's three sides manufactures hearts, the adopted
  anti-subdivision rule forbids it. A second pass carved it as three lineages and scored 4/10 earned;
  rejected for that reason.
- **Claim typing:** both earning lineages are carved as **ongoing**, not
  milestones, the promises are phrased in the present tense ("users earn",
  "creators earn"). The hearts exist while the claim is true; if Brave ever
  kills Rewards, they lapse visibly instead of decaying on a timer.
- **Recency:** the old grace/decay clock is gone (killed 2026-09-25 as
  arbitrary). Revalidation replaces it, see the 2026-09-25 evidence above.
- **Subsidy caveat:** creator payouts were substantially funded by Brave's
  user-growth token pool, not organic ad revenue. Counts as fulfillment
  (users/creators really got BAT); disclosed here, not hidden.
- **Partial loss:** iOS earning/tipping removed 2020-12-10 narrows coverage,
  does not retire the lineage ([Brave](https://brave.com/blog/rewards-ios/)).

## Open

- Whether self-custody Solana payouts (2025-08-14) are a new lineage or a
  BAT-1 upgrade, would add +1 and reset S if accepted.
- External integrations (e.g. Streamiverse 2026-06-22) need partner-side
  volume evidence before any award.

## Source register

| ID | Source | What it establishes |
|---|---|---|
| B01 | 2017-03-23 [platform announcement](https://basicattentiontoken.org/announcing-a-new-blockchain-based-digital-advertising-platform/) | Intent (opt-in ads, attention measurement); not fulfillment |
| B03 | 2019-04-24 [Brave Ads launch](https://brave.com/blog/brave-ads-launch/) | Production ad loop with user revenue share |
| B11 | 2017-10-12 [BAT Mercury launch](https://brave.com/blog/bat-mercury-launch/) | Creator BAT payments via Uphold (earliest direct evidence) |
| B04 | 2020-12-10 [iOS Rewards changes](https://brave.com/blog/rewards-ios/) | Platform-specific loss, not global retirement |
| B08 | 2025-08-14 [Solana payouts](https://brave.com/blog/payouts-on-solana/) | Self-custody payout route (page edited later; corroboration needed) |
| B10 | [Transparency feed](https://brave.com/transparency/) | 2025-10-21 BAT purchase; company-reported, not audited revenue |
| B13 | 2017 [whitepaper](https://basicattentiontoken.org/wp-content/uploads/2017/05/BasicAttentionTokenWhitePaper-4.pdf) | Founding promise set the lineages are carved from |
| B14 | 2019-04-24 [CoinDesk](https://www.coindesk.com/markets/2019/04/24/view-ads-get-bat-brave-delivers-on-ico-promise-of-paid-web-browsing) | Independent corroboration of ad launch + 70% share |
| B15 | 2019-10-17 [AMBCrypto](https://eng.ambcrypto.com/brave-ads-reward-over-290000-online-creators-in-bat/) | Scale claims (~400 campaigns, named advertisers); subsidy caveat |
