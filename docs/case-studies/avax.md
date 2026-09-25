# AVAX: case study

**Method:** [hearts-algorithm.md](../hearts-algorithm.md) v2 (claim-type rule, adopted 2026-09-25; time decay removed).
**Research:** single pass (2026-09-25), non-blinded.
**Status:** published to production 2026-09-25 under adopted rules; single-analyst
(non-blinded), blinded replication outstanding before scores are called verified.

**Disclosure:** Alex holds AVAX per his self-reported interests (UNCONFIRMED).
Observer-effect policy applies: this score is published as a single-analyst
reading, not a verified rating.

## Result

**AVAX 8/20.** Earned 5 (mainnet milestone permanent; C-Chain DeFi ongoing,
active; subnets/L1s ongoing, active), allowance 3, core open.

```
earned    = 1 (mainnet, milestone) + 2 (DeFi, ongoing/active) + 2 (subnets, ongoing/active) = 5
allowance = 3   (3 checks pass, capped at min(3, floor(20/5)=4))
filled    = min(20, 5 + 3) = 8
```

## Lineages

| Promise | Type | Reward | State | Key evidence |
|---|---|---|---|---|
| Avalanche becomes the platform where DeFi and traditional finance run at scale: fast, cheap, application-specific blockchains for finance | n/a | 0 | Open | DeFi leg largely delivered; TradFi leg not: BUIDL on Avalanche and the VanEck spot ETF filing are signals and filings, not production financial infrastructure |
| High-throughput PoS smart-contract platform live on mainnet with fast finality | milestone | 1 | Fulfilled 2020-09-21 (permanent) | Mainnet launch Sept 2020; EVM-compatible C-Chain; subnets architecture from day one |
| Named production DeFi applications with real usage on the C-Chain | ongoing | 2 | Active (revalidated 2026-09-25) | Avalanche Rush $180M brought Aave and Curve (Aug 2021); TVL ATH ~$13.8B Dec 2021; contraction to $1.69B Sept 2022 without the promise lapsing; recovered to ~$2.77B mid-2025; Aave on Avalanche $258M Aug 2026 |
| Named live subnets/L1s with observable real usage (one family, scored once) | ongoing | 2 | Active (revalidated 2026-09-25) | DeFi Kingdoms Crystalvale first subnet (~200k tx/day); Crabada Swimmer Subnet May 2022; Dexalot hybrid subnet; Avalanche9000/Etna Dec 2024 (sovereign L1s); 50+ active L1s by early 2026 |

Capacity 20: stated ambition is the platform for global DeFi and traditional
finance ("long-term sights set on traditional finance", Sirer 2020); rewiring
financial infrastructure = tier-20 scope, whether or not it gets there.

## Allowance

Present-tense checklist (last 12 months): working product (C-Chain DeFi live,
Aave $258M on Avalanche Aug 2026; 100+ L1s live; real daily tx) yes; active
team (Helicon Sept 2026; Granite Nov 2025; Octane Apr 2025; Retro9000 grants)
yes; measurable economic activity tied to the promise (TVL ~$2.77B mid-2025;
DEX volumes $500M+/day; stablecoin supply $1.7B; gaming tx volumes) yes.
3 checks, capped at min(3, floor(20/5)) = **3**.

## Historical snapshots (earned hearts)

| Snapshot | Earned | Notes |
|---|---|---|
| 2013-01-01 | - | Unavailable, whitepaper published May 2018 |
| 2017-06-01 | - | Unavailable, whitepaper May 2018 is after as_of |
| 2018-06-01 | 0 | Available; whitepaper published 16 May 2018, promise only |
| 2019-06-01 | 0 | Available; still pre-mainnet (testnets in 2020) |
| 2021-06-01 | 3 | Mainnet live Sept 2020 (+1); named DeFi apps live, Pangolin Feb 2021 (+2); no subnets yet |
| 2026-09-25 | 5 | Subnets delivered Mar 2022 (+2); DeFi survived the 2022 contraction and recovered |

## Assessment notes

- **Finality precision flagged.** The whitepaper's sub-1-second finality is
  issuer-measured on a 2000-node AWS testnet; third-party docs say C-Chain
  finality "typically takes 2 seconds". The milestone is scored on
  "fast-finality platform live" (fulfilled); the exact sub-second figure lacks
  independent measurement.
- **The DeFi lineage survives the 2022 contraction.** TVL fell ~88% from ATH
  and AVAX ~86%, but the lineage is "named production apps with real usage",
  not "TVL at peak": Aave, Benqi, Trader Joe never left, and TVL recovered to
  ~$2.8B by mid-2025. The boom was heavily incentive-driven (Rush $180M,
  Multiverse $290M); some activity was mercenary, but third-party protocols
  stayed.
- **Subnets scored once as a family.** Gaming L1s, Dexalot, Evergreen /
  institutional subnets all sit under one lineage; per-subnet scoring would
  manufacture hearts.
- **Evergreen / institutional is context, not fulfillment.** BUIDL on
  Avalanche, the VanEck ETF filing, JPMorgan/Mastercard engagements are pilots,
  filings, and signals; they keep the core open, not closed.
- **Core framed at the ambitious end** (DeFi + TradFi at scale, per Sirer's
  2020 statement). A weaker framing ("a fast smart-contract platform people
  use") would arguably be fulfilled; the ambitious framing is chosen because
  the project's own stated end-state explicitly includes traditional finance.
- **Deliberately unscored:** AVAX ICO and incentive programs (context, not
  promises); Warp Messaging / Teleporter (infrastructure supporting the subnet
  lineage); staking economics (a mechanism, not a promise).
- **Transaction-count figures conflict** across editorial sources; no precise
  figure is cited beyond "real, observable usage".
