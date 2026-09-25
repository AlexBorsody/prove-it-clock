# ETH: case study

**Method:** [hearts-algorithm.md](../hearts-algorithm.md) v2 (claim-type rule, adopted 2026-09-25; time decay removed).
**Research:** single pass (Muse 2026-09-25), non-blinded.
**Status:** published to production 2026-09-25 under adopted rules; single-analyst
(non-blinded), blinded replication outstanding before scores are called verified.

## Result

**ETH 8/20.** Earned 5 (mainnet milestone permanent; production dapps ongoing,
active; proof-of-stake Merge milestone permanent; rollups ongoing, active),
allowance 3, core open.

```
earned    = 1 (mainnet, milestone) + 2 (dapps, ongoing/active) + 1 (Merge, milestone) + 1 (rollups, ongoing/active) = 5
allowance = 3   (3 checks pass, capped at min(3, floor(20/5)=4))
filled    = min(20, 5 + 3) = 8
```

## Lineages

| Promise | Type | Reward | State | Key evidence |
|---|---|---|---|---|
| Ethereum becomes the general-purpose platform for decentralized applications, arbitrary systems anyone can build and run | n/a | 0 | Open | Whitepaper ambition is open-ended ("many others that we have not yet imagined"); a general-purpose platform never finishes |
| Smart-contract platform live on a public mainnet | milestone | 1 | Fulfilled 2015-07-30 (permanent) | Frontier launch 2015-07-30; EVM and smart contracts live from genesis |
| Named production protocols with sustained real usage built on Ethereum | ongoing | 2 | Active (revalidated 2026-09-25) | MakerDAO mainnet Dec 2017; Uniswap V1 Nov 2018; COMP distribution Jun 2020 kicked off DeFi Summer (TVL $1B to $10B in three months); Ethereum remains the biggest chain by TVL and dapp count |
| The long-promised proof-of-stake transition completes | milestone | 1 | Fulfilled 2022-09-15 (permanent) | The Merge completed 2022-09-15, Beacon Chain had run since Dec 2020, energy use down ~99.95% |
| Named production rollups carry real activity settling to Ethereum | ongoing | 1 | Active (revalidated 2026-09-25) | Arbitrum One mainnet 2021-08-31; combined L2 throughput ~5x mainnet by Oct 2023; Base live Aug 2023 |

Capacity 20: whitepaper ambition, a Turing-complete platform for arbitrary
systems "we have not yet imagined" (mechanical per rubric).

## Allowance

Present-tense checklist (last 12 months): working product (mainnet processing,
biggest chain by TVL and active dapps) yes; active team (client teams shipping,
protocol upgrades landing) yes; measurable economic activity tied to the
promise (DeFi volume, L2 activity, gas fees) yes. 3 checks, capped at
min(3, floor(20/5)) = **3**.

## Historical snapshots (earned hearts)

| Snapshot | Earned | Allowance | Filled | Notes |
|---|---|---|---|---|
| 2013-01-01 | - | - | - | Unavailable, whitepaper published Nov 2013 |
| 2017-06-01 | 1 | 2 | 3 | Mainnet live; CryptoKitties/MakerDAO (Dec 2017) after as_of |
| 2018-06-01 | 1 | 2 | 3 | Mainnet only; no sustained multi-protocol wave yet |
| 2019-06-01 | 1 | 2 | 3 | Mainnet only; Uniswap/Compound exist but pre-wave |
| 2021-06-01 | 3 | 3 | 6 | DeFi Summer activates dapp lineage (+2, eff. 2020-06-15) |
| 2026-09-25 | 5 | 3 | 8 | Merge +1 (2022-09-15), rollups +1 (2021-08-31) |

## Judgment calls (Muse's, Alex can override)

- **"Ultrasound money" is not scored.** A 2020 meme (Justin Drake, Sept 2020),
  seven years after the whitepaper; scoring it would let later narrative
  rewrite the promises.
- **"World computer" is not the whitepaper's promise.** Zero hits for the
  phrase in the whitepaper text; the core is framed on the whitepaper's actual
  words instead.
- **L0 stays open on the ambitious reading.** Ethereum dominates by TVL and
  dapp count, but the whitepaper's ambition ("many others that we have not
  yet imagined") never finishes; the weaker reading would hand out the final
  heart for being the biggest chain.
- **Deliberately unscored:** EIP-1559 fee burn (a mechanism, not a promise);
  NFTs/ERC-721 (supporting evidence for the dapp lineage); full sharding /
  danksharding (part of the scaling story, partially delivered via EIP-4844);
  the DAO hack / ETC fork 2016 (context, not a heart event); the 2017 ICO boom
  (speculative token sales, not decentralized applications); staking yield
  (a mechanism, not a promise).
- **PoS promise dating.** The whitepaper discusses proof-of-stake only as an
  alternative approach; it became the stated endgame via the Serenity/Eth2
  roadmap (difficulty bomb design). The lineage is carried from the whitepaper
  date with that caveat recorded.
