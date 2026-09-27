# Verdict weights draft: per-promise importance (1/2/4)

**Status: DRAFT, unreviewed. Author: Habib (Muse). 2026-09-26 ~23:15 EDT.**
Nothing here is Alex-reviewed. This becomes a publication proposal only
after his review. Weighted activation needs the compatible published run
per the shared contract.

## Rubric

Tiers answer one question: if this promise failed, would the project's
function survive?

- **Core (4):** the promise IS the project's reason to exist, or its
  scope is the project's category-defining ambition (system-scale
  impact: millions of users, the financial system, the web). Failure
  means the central purpose failed. Typically 1-4 per project; no quota.
- **Material (2):** a significant commitment: a major product, major
  capital (roughly $100M+), a flagship partnership, a key protocol
  feature. Failure is a real black mark; the project survives.
- **Supporting (1):** implementation details, operational mechanics,
  minor features, expansions of delivered things, experiments.

Scope is judged by who was affected and how many, not by how many
whitepaper sentences the promise took. A promise to move global
settlement counts more than a promise to ship a settings page, even if
both were stated once.

Cross-checked against the existing `core` flags in the v3 records; the
tiers below are independent judgments and occasionally disagree.

## XRP (19 promises)

| lineage | tier | rationale |
|---|---|---|
| xrp-p01-bridge-liquidity | 4 | The reason XRP exists: bridge currency for cross-border settlement at scale. Without institutional usage the project has no function. |
| xrp-p02-escrow-55b | 2 | Supply discipline at $10B+ scale; the foundational trust commitment to holders. |
| xrp-p03-re-escrow | 1 | Operational mechanics of p02, not an independent commitment. |
| xrp-p04-xrapid-commercial | 2 | The flagship product milestone instantiating p01; the ongoing core test is p01. |
| xrp-p05-xpring | 2 | Flagship ecosystem fund; major capital allocation, not core function. |
| xrp-p06-ubri | 2 | Multi-year university program at real scale; significant but adjacent to function. |
| xrp-p07-forte-gaming | 1 | Failed experiment in gaming; never load-bearing. |
| xrp-p08-creator-fund | 2 | $250M capital commitment; major by size, adjacent to function. |
| xrp-p09-xls20-nfts | 2 | Major mainnet feature; new asset class on the ledger. |
| xrp-p10-developer-fund | 2 | Material ongoing grants program. |
| xrp-p11-xls30-amm | 2 | Native DeFi primitive; significant protocol capability. |
| xrp-p12-carbon-markets | 2 | $100M capital commitment with shipped tooling promised. |
| xrp-p13-net-zero-2030 | 1 | Corporate ESG pledge; does not touch XRP's function. |
| xrp-p14-rlusd-launch | 2 | Major new product: a Ripple stablecoin on two chains. |
| xrp-p15-rlusd-attestations | 1 | Operational hygiene for p14; monthly process, not a product. |
| xrp-p16-rlusd-expansion | 1 | Expansion of a delivered product to more chains. |
| xrp-p17-evm-sidechain | 2 | Major interoperability milestone with real-usage test. |
| xrp-p18-xrpl-lending | 2 | Native lending primitive; significant new ledger capability. |
| xrp-p19-codius | 1 | Withdrawn smart-contract experiment; never central. |

Note: p01 is fulfilled in the record but the "meaningful scale" bar is
the live dispute; tier 4 means this judgment carries the verdict either
way. p19 retired = zero credit regardless of tier.

## BAT (17 promises)

| lineage | tier | rationale |
|---|---|---|
| bat-p01-attention-standard | 4 | The whitepaper ambition: BAT as the web-wide unit of account for attention. The defining end state. |
| bat-p02-user-rewards | 4 | Minimum viable function: ordinary users actually paid for attention. Without this there is no economy. |
| bat-p03-creator-payouts | 4 | The supply side of the attention market; creators actually paid. |
| bat-p04-advertiser-platform | 4 | The demand side that funds the whole loop; advertisers actually buying. |
| bat-p05-onchain-ad-confirmations | 2 | Decentralized audit trail; core to the trust story, not to the loop working. |
| bat-p06-user-growth-pool | 1 | Distribution mechanics for the 300M pool; process, not function. |
| bat-p07-brave-wallet | 2 | Major shipped product; adjacent to the attention loop. |
| bat-p08-brave-swap | 1 | Single wallet feature. |
| bat-p09-crosschain-bat | 1 | Accessibility expansion; the token works the same everywhere. |
| bat-p10-bat-spend-utility | 2 | BAT useful beyond ads; material to the token's value story. |
| bat-p11-bravepay | 2 | Major new product: self-custody private payments protocol. |
| bat-p12-rewards-card | 2 | Major consumer product tying BAT to everyday purchases. |
| bat-p13-unified-wallet | 2 | Major product consolidation; same class as p07. |
| bat-p14-creator-ai-protocol | 1 | Experimental AI royalty concept. |
| bat-p15-agentic-payments | 1 | Experimental protocol support. |
| bat-p16-bat-buybacks | 2 | Material economic commitment: revenue share into buybacks with disclosure. |
| bat-p17-rewards-evolution | 1 | Loyalty program mechanics; engagement layer, not function. |

BAT concentrates four 4s because its record is concentrated on the
attention loop itself: ambition (p01) plus the three working legs
(users, creators, advertisers). The tiers reflect the record, not a quota.

## LINK (14 promises)

| lineage | tier | rationale |
|---|---|---|
| link-p01-decentralized-oracle-network | 4 | The reason Chainlink exists: the decentralized way contracts get off-chain data. |
| link-p02-price-feeds-defi-standard | 2 | Market-leadership position in DeFi; the function survives without being #1. |
| link-p03-hybrid-smart-contracts | 2 | The platform vision beyond feeds; major developer capability. |
| link-p04-superlinear-staking | 2 | The big unshipped security promise; the network functions without it. |
| link-p05-staking-v01 | 1 | Incremental milestone toward p04; capped pool, no slashing. |
| link-p06-staking-v02 | 2 | Real cryptoeconomic security: expanded pool with slashing. |
| link-p07-vrf | 2 | Major product line in production use. |
| link-p08-keepers-automation | 2 | Major product line in production use. |
| link-p09-data-streams | 2 | Major product line in production use. |
| link-p10-functions | 2 | Major product line; Web2 API connectivity for contracts. |
| link-p11-ccip | 2 | Chainlink's second act: cross-chain. Major, but the oracle function is the core. |
| link-p12-swift-bank-connectivity | 4 | Category-defining scope: global banking settlement via Swift rails. The "replace SWIFT"-scale ambition; judged on scope, not function centrality. |
| link-p13-proof-of-reserve | 2 | Major product line in production use. |
| link-p14-economics-20-build-scale | 1 | Ecosystem program mechanics; fee-flow plumbing. |

## AVAX (17 promises)

| lineage | tier | rationale |
|---|---|---|
| avax-launch | 4 | The base claim: sub-2s finality, multi-thousand TPS on mainnet. The pitch IS the performance. |
| avax-evm | 2 | Major adoption evidence: Ethereum dapps running with real users. |
| avax-validators | 2 | Material decentralization commitment: validator set at six-figure scale. |
| avax-bridge | 2 | Key infrastructure milestone that enabled the DeFi wave; table stakes after delivery. |
| avax-rush | 2 | The liquidity bootstrap: blue-chip DeFi and material TVL. |
| avax-subnets | 4 | The architecture thesis that makes Avalanche distinct from every fast EVM chain. Without working subnets it is just another L1. |
| avax-multiverse | 2 | $290M capital program backing the subnet thesis. |
| avax-dfk | 1 | One game on one subnet; notable, not load-bearing. |
| avax-deloitte | 2 | Named enterprise deployment: real FEMA claims processing. |
| avax-institutional-pilots | 2 | Named institutional pilots run to completion. |
| avax-vista | 2 | Ongoing tokenized-assets pipeline; the RWA push. |
| avax-gunz | 2 | Flagship-scale gaming deployment: AAA title with a real on-chain item economy. |
| avax-maplestory | 2 | Flagship-scale gaming deployment: major IP on its own L1. |
| avax-teleporter | 2 | Key protocol feature: cross-subnet messaging with real use. |
| avax-etna | 2 | Major upgrade enabling sovereign L1s; load-bearing for the subnet vision. |
| avax-aws | 1 | Distribution partnership; deployment convenience. |
| avax-skybridge | 2 | $300M tokenization commitment; major by capital scale. |

## ETH (12 promises)

| lineage | tier | rationale |
|---|---|---|
| eth-p01-general-purpose-smart-contracts | 4 | The reason Ethereum exists. |
| eth-p02-transition-from-proof-of-work-to-proof-of-stake | 4 | The Merge: changing consensus under a $200B network without breaking it. Existential-scale engineering commitment. |
| eth-p03-cut-energy-use-by-99-95 | 1 | Measured corollary of p02, not an independent function. |
| eth-p04-eip-1559-fee-market-reform | 2 | Major fee-market and monetary-policy change on mainnet. |
| eth-p05-rollup-centric-scaling-strategy | 4 | The defining scaling strategy decision; if rollups fail, Ethereum's scaling fails. |
| eth-p06-100-000-tps-via-rollups-plus-sharding | 2 | Material throughput target; aspirational number, unmet. |
| eth-p07-proto-danksharding-blobs-to-cut-layer-2-data-costs | 2 | Major upgrade: L2 data costs cut on mainnet. |
| eth-p08-full-sharding | 2 | Was a flagship scaling promise before the rollup pivot; retired, zero credit. |
| eth-p09-asic-resistant-decentralized-mining | 1 | Moot after PoS; a mining-era approach, not the function. |
| eth-p10-plasma-general-purpose-scaling | 1 | Superseded scaling approach; an experiment that lost. |
| eth-p11-account-abstraction-erc-4337 | 2 | Major UX primitive: smart-contract wallets in production. |
| eth-p12-stateless-validation | 1 | Open research goal; no delivery commitment with users waiting. |

## SOL (11 promises)

| lineage | tier | rationale |
|---|---|---|
| sol-p01-proof-of-history | 4 | The defining innovation: the cryptographic clock the whole design rests on. |
| sol-p02-710k-tps | 4 | The category-defining performance ambition sold to the world; judged on scope. Unmet at this bar. |
| sol-p03-low-fees | 4 | The user-facing promise: fractions of a penny. Without it Solana is just another chain. |
| sol-p04-400ms-blocks | 2 | Performance spec detail; supports the speed story. |
| sol-p05-network-reliability | 4 | Production-grade uptime; the credibility crisis was outages. A chain that halts has no function. |
| sol-p06-firedancer | 2 | Major robustness milestone: real client diversity on mainnet. |
| sol-p07-solana-pay | 2 | Major product: a working payment rail with real merchants. |
| sol-p08-saga | 1 | Withdrawn phone experiment; never central. Zero credit. |
| sol-p09-seeker | 1 | Second phone; mobile chapter two, adjacent to chain function. |
| sol-p10-developer-ecosystem | 2 | Network-effect commitment: attracting and retaining builders. |
| sol-p11-alpenglow | 2 | Major consensus upgrade: finality from ~12.8s to ~150ms. |

## DASH (9 promises)

| lineage | tier | rationale |
|---|---|---|
| dash-p01-everyday-digital-cash | 4 | The reason Dash exists: ordinary people paying for things. |
| dash-p02-masternode-network | 4 | The defining architecture: two-tier incentivized network. InstantSend, PrivateSend, and the treasury all rest on it. |
| dash-p03-privatesend | 2 | Headline privacy feature; key attribute of the cash proposition. |
| dash-p04-instantsend | 2 | The speed that makes the cash UX work; a service on p02. |
| dash-p05-treasury-governance | 2 | Defining innovation: the first self-funding DAO treasury. |
| dash-p06-merchant-economy | 2 | The measurable adoption side of p01; lapsed, material miss. |
| dash-p07-evolution-platform | 2 | The big platform bet: decentralized data and identity on mainnet. |
| dash-p08-evolution-ux | 2 | The consumer promise: as easy as PayPal. Open, load-bearing for adoption. |
| dash-p09-onchain-scaling | 1 | A scaling approach (400MB blocks); technical path, not the function. Lapsed. |

## Disagreements with existing `core` flags

- BAT p02/p03/p04 are `core: false` in v3 but tiered 4 here: the
  three working legs of the attention loop are the minimum viable
  function. Recommend promoting the flags or documenting the split.
- LINK p12 (`core: false`) tiered 4 on scope: the Swift-connectivity
  ambition is category-defining even though the oracle function does
  not depend on it. This is the scope-over-function case; flag for
  Alex's review.
- AVAX subnets (`core: false`) tiered 4: the architecture thesis is
  the differentiator. Same flag.

## Editorial sign-off items (from the contract, still open)

1. Seven Unclassified primary-category assignments: need human review
   before the weighted run (list to be pulled from the ledger).
2. Source roles: every promise needs its original-claim source
   distinguished from outcome evidence; currently commingled in
   `evidence[]`.
3. Retired milestones (ETH P08/P10, XRP P19, SOL P08): confirm the
   retirement rationales point at the withdrawal evidence, not just
   the absence of delivery.
4. Commitment boundaries: promises attributable to the project vs.
   community claims need a final pass (the inheritance rule).
5. BTC P11/P12: documentation-only per the genesis exemption; no
   longer gating the altcoin run.
