# BAT — case study

**Method:** [hearts-algorithm.md](../hearts-algorithm.md) v1 (adopted 2026-09-23).
**Research:** two passes (Muse 2026-09-23, Codex 2026-09-24), non-blinded.
**Status:** scored under adopted rules; Alex review required before any production use.

## Result

**BAT 3/10.** Earned 3, allowance decayed to 0, core open (cap 9, not binding).

```
earned    = 2 (ad loop) + 1 (creators) = 3
allowance = max(0, 2 − 5) = 0   (A0=2; last fulfillment 2019-04-24; S≈7.4y)
filled    = min(10, 3 + 0) = 3
```

## Lineages

| Promise | Reward | State | Key evidence |
|---|---|---|---|
| Users earn BAT for private opt-in ads | 2 | Fulfilled 2019-04-24 | Brave Ads launch, 70% user revenue share — [Brave](https://brave.com/blog/brave-ads-launch/), [CoinDesk](https://www.coindesk.com/markets/2019/04/24/view-ads-get-bat-brave-delivers-on-ico-promise-of-paid-web-browsing) |
| Creators/publishers earn BAT | 1 | Fulfilled 2017-10-12 | BAT Mercury launch via Uphold — [Brave](https://brave.com/blog/bat-mercury-launch/); 290k verified publishers by 2019 — [AMBCrypto](https://eng.ambcrypto.com/brave-ads-reward-over-290000-online-creators-in-bat/) |
| BAT as a web-wide attention standard | 2 | Open | Stated aim in the [2017 whitepaper](https://basicattentiontoken.org/wp-content/uploads/2017/05/BasicAttentionTokenWhitePaper-4.pdf); not realized |

Capacity 10: advertising-sector ambition (mechanical per rubric).

## Allowance

Present-tense checklist (last 12 months): working product, active team (Brave Software),
economic activity (BAT ad buys, 2025-10-21 BAT purchase per [transparency feed](https://brave.com/transparency/)).
Raw 3, capped at floor(10/5) = **A0 = 2** → decayed to 0 (see computation).

## Judgment calls (Muse's, Alex can override)

- **Granularity:** one ad-loop lineage, not three (users/publishers/advertisers).
  Splitting the loop's three sides manufactures hearts — the adopted
  anti-subdivision rule forbids it. A second pass scored 4/10 on the split
  carving; rejected for that reason.
- **Recency:** strict event reading = the adopted rule as written (only a new
  fulfillment resets S). Continuous operation would give 6/10; not adopted.
- **Subsidy caveat:** creator payouts were substantially funded by Brave's
  user-growth token pool, not organic ad revenue. Counts as fulfillment
  (users/creators really got BAT); disclosed here, not hidden.
- **Partial loss:** iOS earning/tipping removed 2020-12-10 narrows coverage,
  does not retire the lineage ([Brave](https://brave.com/blog/rewards-ios/)).

## Open

- Whether self-custody Solana payouts (2025-08-14) are a new lineage or a
  BAT-1 upgrade — would add +1 and reset S if accepted.
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
