# LINK: case study

**Method:** [hearts-algorithm.md](../hearts-algorithm.md) v2 (claim-type rule, adopted 2026-09-25; time decay removed; allowance removed 2026-09-25).
**Research:** two independent passes (2026-09-25), non-blinded.
**Status:** published to production 2026-09-25 under adopted rules; single-analyst
(non-blinded), blinded replication outstanding before scores are called verified.

## Result

**LINK 4/20.** Earned 4 (mainnet milestone; Data Feeds production use; CCIP
cross-chain production use), core open.

```
earned    = 1 (mainnet, milestone) + 2 (Data Feeds, ongoing/active) + 1 (CCIP, ongoing/active) = 4
filled    = min(20, 4) = 4
```

## Lineages

| Promise | Type | Reward | State | Key evidence |
|---|---|---|---|---|
| Chainlink becomes the broadly relied-on connectivity layer between smart contracts, blockchains, and external systems | n/a | 0 | Open | DeFi reliance strong; enterprise record is pilots/PoCs only (SWIFT 2023, DTCC 2024, UBS/SBI 2024), no confirmed production bank deployments |
| Decentralized oracle network live on a public mainnet | milestone | 1 | Fulfilled 2019-05-30 (permanent) | Launch announced at Consensus 2019, three security audits, [Decrypt](https://decrypt.co/7042/chainlink-mainnet-live-ethereum-may) |
| Named production applications continuously consume Chainlink Data Feeds | ongoing | 2 | Active (revalidated 2026-09-25) | Aave Oracle Network live 2020-01-09 with 16 feeds, [The Cryptonomist](https://en.cryptonomist.ch/2020/01/09/aave-oracle-network-on-chainlink/); all Synths migrated to Chainlink oracles 2020, [Synthetix blog](https://blog.synthetix.io/all-synths-are-now-powered-by-chainlink-decentralised-oracles/); Aave↔Chainlink expanding via SVR proposal Dec 2024, [CoinTelegraph](https://CoinTelegraph.com/news/aave-mulls-chainlink-integration-return-mev-fees) |
| Named production users move messages/assets across chains via CCIP | ongoing | 1 | Active (revalidated 2026-09-25) | CCIP mainnet Early Access 2023-07-17, Synthetix live, [Crowdfund Insider](https://www.crowdfundinsider.com/2023/07/210203-chainlink-cross-chain-interoperability-protocol-ccip-launches-on-mainnet/) |

Capacity 20: Chainlink 2.0 whitepaper (2021-04-15) ambition, a decentralized
metalayer; CCIP as Web3's TCP/IP, rewiring how value and data move between all
blockchains and the traditional financial system (mechanical per rubric).

## Allowance

Removed 2026-09-25: scoring is earned-only. The allowance-era assessment is
preserved in git history.

## Assessment notes

- **CCIP scored as its own lineage** (not folded into the oracle promise): it
  was introduced as a distinct promise in the 2.0 whitepaper with its own
  mainnet launch and named users, a genuinely distinct shipped product. A
  stricter reading could fold it into L2 (earned would drop to 3/20); blinded
  replication should rule on this.
- **Core framed at the ambitious end** (universal connectivity layer, per WP
  2.0) so it stays open. Framing it at the 2017 end ("a decentralized oracle
  network production apps rely on") would arguably be fulfilled, the ambitious
  framing is chosen because the 2.0 whitepaper supersedes the promise, and the
  weaker reading would hide the pilot-only enterprise record.
- **Deliberately unscored:** LINK staking (a mechanism supporting the oracle
  promise, not a separate promise); VRF, Automation/Keepers, Proof of Reserve,
  Data Streams, Functions, CRE, ACE (one family, scoring each would
  manufacture hearts); the 2017 ICO (context only).
- **L3 present-tense evidence is thin**, rests on launch evidence plus Sept
  2026 editorial claims; needs a named 2025/2026 CCIP production confirmation.
- **On-chain evidence still needed:** CCIP volume, LINK paid to node operators,
  and the staking pool still lack on-chain measurement. The ongoing-active
  status rests on launch evidence plus Sept 2026 editorial claims until a
  named 2025/2026 production confirmation exists.
