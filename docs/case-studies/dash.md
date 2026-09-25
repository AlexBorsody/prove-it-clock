# DASH: case study

**Method:** [hearts-algorithm.md](../hearts-algorithm.md) v2 (claim-type rule, adopted 2026-09-25; time decay removed; allowance removed 2026-09-25).
**Research:** single pass (2026-09-25), non-blinded.
**Status:** published to production 2026-09-25 under adopted rules; single-analyst
(non-blinded), blinded replication outstanding before scores are called verified.

**Disclosure:** Alex holds Dash per his self-reported interests (UNCONFIRMED).
Observer-effect policy applies: this score is published as a single-analyst
reading, not a verified rating.

## Result

**DASH 5/20.** Earned 5 (masternode network, PrivateSend, InstantSend, DAO
treasury, Evolution platform, all milestones permanent), core
open. The merchant-economy lineage lapsed (was +2 active 2018-2019, now 0):
the rise and fall stays visible.

```
earned    = 1 (masternodes) + 1 (PrivateSend) + 1 (InstantSend) + 1 (treasury) + 1 (Evolution) = 5
filled    = min(20, 5) = 5
```

## Lineages

| Promise | Type | Reward | State | Key evidence |
|---|---|---|---|---|
| Dash becomes the world's everyday digital cash: private, instant payments at mass scale | n/a | 0 | Open | The 2018-19 Venezuela peak was real but local and temporary; global payment infrastructure untouched |
| Incentivized two-tier masternode network live (1,000 DASH collateral, paid from block reward) | milestone | 1 | Fulfilled 2014-09-01 (permanent) | Darkcoin RC5 opened the code Sept 2014; 45/45/10 miner/masternode/treasury split Jun 2015; ~3,850 masternodes per docs |
| PrivateSend (DarkSend): protocol-level private transactions via masternode mixing | milestone | 1 | Fulfilled 2014-01-18 (permanent) | Whitepaper: PrivateSend "for increasing fungibility"; shipped in the launch client, rebranded Jun 2016 |
| InstantSend (InstantX): instant transaction confirmation via masternode quorums | milestone | 1 | Fulfilled 2014-11-01 (permanent) | 1-4 second confirmations via masternode quorums, live on mainnet; rebranded Jun 2016; now default for most transactions |
| Self-funding DAO treasury: 10% of block reward, masternode-voted budget proposals | milestone | 1 | Fulfilled 2015-08-01 (permanent) | "Decentralized governance by blockchain" added Aug 2015; monthly superblocks, masternode voting threshold |
| Named production merchant economy using Dash for everyday payments | ongoing | 2 | Lapsed (was Active 2018-2019) | 2,000+ merchants in Venezuela Dec 2018 (KFC Caracas); 2,288 merchants worldwide Aug 2018; no third-party-observable named production merchant economy post-2019; the Venezuela program wound down |
| Evolution/Platform: decentralized data layer + usernames (DPNS) live on mainnet | milestone | 1 | Fulfilled 2024-07-29 (permanent) | Mainnet Beta 2024-07-29 after 9 years; queryable decentralized database + decentralized API; Platform v1.1 activated Sept 2026 |

Capacity 20: stated ambition is global everyday digital cash ("the best
digital cash in the world"), tier-20 scope (rewire global payments), same
rubric tier as XRP.

## Allowance

Removed 2026-09-25: scoring is earned-only. The allowance-era assessment is
preserved in git history.

## Historical snapshots (earned hearts)

| Snapshot | Earned | Notes |
|---|---|---|
| 2013-01-01 | - | Unavailable, launched 2014-01-18 as XCoin |
| 2017-06-01 | 4 | Masternodes + PrivateSend + InstantSend + treasury |
| 2018-06-01 | 6 | Venezuela merchant economy activates (+2) |
| 2019-06-01 | 6 | Peak: 2,000+ merchants, KFC Caracas |
| 2021-06-01 | 4 | Merchant economy lapsed (-2) |
| 2026-09-25 | 5 | Evolution/Platform mainnet +1 (2024-07-29) |

## Assessment notes

- **Merchant-lapse timing is inferred from absence.** Active 2018-2019 is well
  evidenced; the lapse is dated to the 2021 snapshot because no post-2019
  third-party evidence of a named production merchant economy surfaced.
  Blinded replication should try to falsify this (find 2020-2026 production
  usage); the AEON Jan 2026 partnership is the lead to check.
- **Platform counts as fulfilled despite "Mainnet Beta."** The chain is live,
  EvoNodes are running, development iterates on mainnet. But the 9-year
  promise-to-delivery gap (2015 to 2024) stays visible on the timeline; this is
  exactly the rise-and-fall honesty the instrument is for.
- **Privacy promise wording.** The whitepaper abstract promises PrivateSend
  "for increasing fungibility" (modest, fulfilled); the intro claims a
  "strongly anonymous cryptocurrency" (stronger, mixed academic analyses). The
  shipped feature is scored as fulfilled; replication should rule on whether
  the stronger claim holds.
- **Deliberately unscored:** ChainLocks 2019 (security improvement to the
  ledger, not a separate promise); the 2014 instamine (~1.9M XCoin in 48 hours
  from a difficulty-retarget bug, context only); masternode yield (a mechanism,
  not a promise); Dark Gravity Wave / X11 mining (launch-era mechanisms).
- **Masternode network kept as its own lineage** because the two-tier
  incentivized network is an explicit whitepaper promise (in the abstract),
  not just plumbing. A strict reading could fold it into the feature lineages.
