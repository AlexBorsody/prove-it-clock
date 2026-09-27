# USE metrics spec: measurable usage per project (DRAFT)

**Status: DRAFT, unreviewed. Author: Habib (Muse). 2026-09-26 ~23:30 EDT.**
Spec only. No implementation, no scoring formula. USE feeds the future
overall composite, never the verdict.

## Rules

1. **Intended use only.** Each metric must map to the project's stated
   purpose, not generic chain activity. A chain's raw transaction count
   is not usage; payments for goods is.
2. **Measured, not modeled.** Every metric names a canonical source that
   a third party can re-pull. No estimates, no "ecosystem reports" with
   no methodology.
3. **Per-project, not comparable.** USE ranks within a category story;
   cross-project USE comparison is a later methodology question.
4. **Adversarial defaults.** Prefer metrics the project cannot inflate
   cheaply. Prefer third-party indexers over project dashboards where
   both exist.

## Per-project metrics

### ETH: programmable settlement
- U1: Daily successful contract-call transactions (externally owned
  account to contract, excluding simple transfers). Source: Etherscan
  charts / Allium.
- U2: Number of distinct active contracts per month. Source: Etherscan.
- U3: L2 blob/data usage per month (rollup-centric strategy is the
  scaling thesis). Source: L2Beat / Dune.

### XRP: cross-border settlement
- U1: XRPL payment transaction count per month, excluding system and
  exchange-internal traffic. Source: XRPL explorer APIs (Bithomp/XRPScan).
- U2: Ripple-reported On-Demand Liquidity volume per quarter, with the
  report linked as the source. Flag: self-reported; needs the corridor
  breakdown to be checkable.

### BAT: the attention economy
- U1: Brave monthly active users. Source: Brave transparency / company
  reporting (self-reported; note it).
- U2: BAT paid out to users and creators per month (on-chain).
  Source: on-chain transfers from Brave settlement wallets.
- U3: Active advertisers per month. Source: Brave Ads reporting.

### LINK: oracle data delivery
- U1: Total transaction value secured (TVS) by Chainlink feeds.
  Source: Chainlink's public TVS reporting (self-reported; note it).
- U2: VRF requests fulfilled per month (on-chain). Source: Etherscan /
  Chainlink VRF coordinators.
- U3: CCIP cross-chain messages/volume per month. Source: CCIP explorer.

### SOL: fast cheap transactions
- U1: Daily non-vote transactions (vote filtering is mandatory; raw
  TPS is theater). Source: Solana Beach / Solscan APIs.
- U2: Daily fee-paying active addresses. Source: same.
- U3: Solana Pay settled volume per month (the payments rail claim).
  Source: Solana Pay dashboard / on-chain reference program.

### DASH: digital cash payments
- U1: Daily payment transactions (non-masternode, non-governance).
  Source: Dash block explorers.
- U2: Third-party-observable merchant count accepting Dash.
  Source: merchant directories (note: weak source, needs a counting rule).

### AVAX: subnets plus fast EVM
- U1: C-chain daily active addresses. Source: Snowtrace / AvaScan.
- U2: Share of total Avalanche transaction volume occurring on
  subnets/L1s vs. C-chain (the subnet thesis test). Source: AvaScan.
- U3: Aggregate gas used per month across all chains (real load, not
  address counts). Source: AvaScan.

### BTC: genesis, overall composite only
- U1: Share of supply unmoved 1+ years (the store-of-value claim).
  Source: Glassnode / on-chain.
- U2: Daily settlement value in USD. Source: on-chain indexers.
BTC never enters the verdict; these exist for the eventual overall view.

## Open questions for Alex

1. Self-reported sources (Brave MAU, Ripple ODL, Chainlink TVS): accept
   with a "self-reported" badge, or require third-party corroboration
   before display?
2. Cadence: monthly snapshots are the sane unit. Real-time USE is not
   promised.
3. DASH U2's merchant counting rule needs defining before anyone counts.
