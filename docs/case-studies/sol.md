# SOL: case study

**Method:** [hearts-algorithm.md](../hearts-algorithm.md) v2 (claim-type rule, adopted 2026-09-25; time decay removed; allowance removed 2026-09-25).
**Research:** single pass (2026-09-25), non-blinded.
**Status:** published to production 2026-09-25 under adopted rules; single-analyst
(non-blinded), blinded replication outstanding before scores are called verified.

## Result

**SOL 5/20.** Earned 5 (mainnet milestone permanent; high-throughput processing
ongoing, active; app ecosystem ongoing, active; mobile hardware milestone
permanent), core open. Solana Pay merchant payments open
(unfulfilled).

```
earned    = 1 (mainnet, milestone) + 2 (throughput, ongoing/active) + 1 (ecosystem, ongoing/active) + 1 (mobile, milestone) = 5
filled    = min(20, 5) = 5
```

## Lineages

| Promise | Type | Reward | State | Key evidence |
|---|---|---|---|---|
| Solana becomes the web-scale blockchain: high-throughput, low-cost, reliable infrastructure at global scale | n/a | 0 | Open | Network never left "mainnet-beta"; real throughput (~3-5k TPS, mostly consensus votes) far below the 65k marketing number; outage record incompatible with "reliable" as a current claim |
| High-performance blockchain live on a public mainnet | milestone | 1 | Fulfilled 2020-03-16 (permanent) | Mainnet Beta launched March 2020 |
| Sustained high-throughput, low-cost transaction processing in live production | ongoing | 2 | Active (revalidated 2026-09-25; lapsed during each full halt, reactivated on restart) | ~3,000-5,000 TPS at ~$0.00025 average fee in production; full halts Sept 2021, Jan 2022, Apr-Jun 2022, Feb 2023, Feb 2024; no full halt since Feb 2024 |
| Thriving application ecosystem: named production apps with real users and volume | ongoing | 1 | Active (revalidated 2026-09-25) | Led all chains in DEX volume six straight months in 2025 ($100B+/month); 2025 app revenues $1.3-1.5B, a record |
| Real-world merchant payments via Solana Pay at meaningful scale | ongoing | 1 | Open (unfulfilled) | Launched Feb 2022, Shopify plugin Aug 2023; distribution, not adoption: no third-party-observable merchant payment volume at scale |
| Solana mobile hardware shipped into customers' hands | milestone | 1 | Fulfilled 2023-05-01 (permanent) | Saga launched May 2023; Seeker shipped Aug 2025 (150,000+ preorders, 50+ countries) |

Capacity 20: stated ambition is a "web-scale blockchain" at centralized-payment
infrastructure scale (Visa-scale TPS as the explicit reference), tier-20 scope
whether or not it gets there.

## Allowance

Removed 2026-09-25: scoring is earned-only. The allowance-era assessment is
preserved in git history.

## Historical snapshots (earned hearts)

| Snapshot | Earned | Notes |
|---|---|---|
| 2013-01-01 | - | Unavailable, whitepaper published Nov 2017 |
| 2017-06-01 | - | Unavailable, whitepaper Nov 2017 is after as_of |
| 2018-06-01 | 0 | Available; whitepaper + testnets only, mainnet not launched |
| 2019-06-01 | 0 | Available; same |
| 2021-06-01 | 4 | Mainnet fulfilled (+1); throughput active (+2); ecosystem active, Serum live Sept 2020 (+1); Pay/mobile promises did not exist yet |
| 2026-09-25 | 5 | Mobile hardware +1 (2023-05-01); Pay still open |

## Assessment notes

- **Outages LAPSE the throughput lineage, they do not retire it.** Solana never
  abandoned the performance promise; it shipped QUIC networking, priority fees,
  stake-weighted QoS, Firedancer/Frankendancer, and Alpenglow to fix the failure
  modes. Mechanically: 2 to 0 during each full halt, 0 to 2 on restart. The
  fixed 5-date snapshot grid undersamples this volatility; a future revision
  could add halt-dated snapshots to show the true rise-and-fall.
- **The throughput lineage is carved on substance, not the headline number.**
  Real production throughput is ~3-5k TPS (about 75% consensus votes), nowhere
  near 65k or the 710k whitepaper theoretical. The gap is parked in the core
  (open) instead. If blinded replication demands the headline number, the
  throughput lineage is unfulfilled, earned drops to 3, total becomes 6/20.
  This is the assessment's biggest open question.
- **Solana Pay stays open on the distribution-vs-adoption distinction.** The
  Shopify plugin is merchant access, not merchant volume. Mirrors the LINK
  core treatment (pilots are not production).
- **Mobile hardware is scored for shipped hardware, not commercial success.**
  Saga was a commercial flop (about 20k units, support ended after 2 years);
  the heart is for putting crypto-native hardware in customers' hands, which
  happened, with Seeker as the honest second attempt.
- **Decentralization is the core's main threat and is not separately scored**
  (the whitepaper promised no number): validator count fell from ~2,500 (Mar
  2023) to ~800-1,300 across 2025 reports; top validators concentrate stake.
- **Deliberately unscored:** Alpenglow replacing Proof of History (evolution,
  not abandonment); Firedancer as repair evidence (supports the throughput
  lineage, already counted); Serum's death with FTX (the lineage is the
  platform's app economy, not Serum).
