import type { AtlasAssignment } from "../src/lib/atlas/types";

// Initial classification by Codex, 2026-09-26. Not human-reviewed.
// No ledger statements or outcomes are copied here.
export const ASSIGNMENT_VERSION = "atlas-assignments-v1";
export const ASSIGNMENTS: Record<string, AtlasAssignment> = {
  "btc:btc-p01-peer-to-peer-electronic-cash": {
    "primary": "payments",
    "secondary": [],
    "tags": [
      "sovereignty"
    ],
    "rationale": "Wallet-to-wallet transfer without an intermediary is a payment claim.",
    "author": "Codex"
  },
  "btc:btc-p02-double-spending-solved-without-a-trusted-party": {
    "primary": "payments",
    "secondary": [],
    "tags": [
      "sovereignty"
    ],
    "rationale": "Preventing conflicting spends concerns payment settlement integrity.",
    "author": "Codex"
  },
  "btc:btc-p03-immutable-history-via-proof-of-work": {
    "primary": "payments",
    "secondary": [],
    "tags": [],
    "rationale": "Final settlement history is the subject of the immutability criterion.",
    "author": "Codex"
  },
  "btc:btc-p04-security-under-an-honest-majority-cpu-assumption": {
    "primary": "payments",
    "secondary": [],
    "tags": [],
    "rationale": "The criterion tests settlement security against majority attacks.",
    "author": "Codex"
  },
  "btc:btc-p05-nodes-can-leave-and-rejoin-at-will": {
    "primary": "platform",
    "secondary": [],
    "tags": [],
    "rationale": "Node synchronization is infrastructure operation, rather than monetary performance.",
    "author": "Codex"
  },
  "btc:btc-p06-pseudonymous-privacy": {
    "primary": "privacy",
    "secondary": [],
    "tags": [],
    "rationale": "The criterion is resistance to linking transactions to real identities.",
    "author": "Codex"
  },
  "btc:btc-p07-permissionless-participation": {
    "primary": "governance",
    "secondary": [],
    "tags": [
      "inclusion",
      "sovereignty"
    ],
    "rationale": "Permission to validate and participate concerns network participation rules.",
    "author": "Codex"
  },
  "btc:btc-p08-eventually-completely-inflation-free": {
    "primary": "money",
    "secondary": [],
    "tags": [],
    "rationale": "Ending monetary issuance is a monetary-supply claim.",
    "author": "Codex"
  },
  "btc:btc-p09-21-million-hard-cap": {
    "primary": "money",
    "secondary": [],
    "tags": [],
    "rationale": "The hard cap and issuance schedule define the monetary instrument.",
    "author": "Codex"
  },
  "btc:btc-p10-lost-coins-don-t-break-the-money": {
    "primary": "money",
    "secondary": [],
    "tags": [],
    "rationale": "The criterion addresses how lost balances affect monetary supply.",
    "author": "Codex"
  },
  "btc:btc-p11-participants-can-be-anonymous": {
    "primary": "privacy",
    "secondary": [],
    "tags": [],
    "rationale": "Anonymity of participants is explicitly a privacy claim.",
    "author": "Codex"
  },
  "btc:btc-p12-block-size-limit-can-be-raised-later": {
    "primary": "payments",
    "secondary": [],
    "tags": [
      "scale"
    ],
    "rationale": "Increasing transaction capacity supports the payment rail.",
    "author": "Codex"
  },
  "btc:btc-p13-fees-will-replace-the-block-subsidy": {
    "primary": "money",
    "secondary": [
      "payments"
    ],
    "tags": [],
    "rationale": "The criterion concerns the monetary transition from issuance to transaction fees.",
    "author": "Codex"
  },
  "btc:btc-p14-money-without-trusted-third-parties": {
    "primary": "payments",
    "secondary": [
      "money"
    ],
    "tags": [
      "sovereignty"
    ],
    "rationale": "The stored test concerns intermediary-free transaction and verification.",
    "author": "Codex"
  },
  "btc:btc-p15-digital-gold-an-aspirational-store-of-value": {
    "primary": "money",
    "secondary": [],
    "tags": [],
    "rationale": "Purchasing-power retention is a store-of-value claim.",
    "author": "Codex"
  },
  "btc:btc-p16-instant-near-free-payments-via-lightning": {
    "primary": "payments",
    "secondary": [],
    "tags": [
      "scale",
      "inclusion"
    ],
    "rationale": "Fast low-fee Lightning transfers are payment performance.",
    "author": "Codex"
  },
  "eth:eth-p01-general-purpose-smart-contracts": {
    "primary": "platform",
    "secondary": [],
    "tags": [],
    "rationale": "User-deployed programs and dapps are general-purpose computation.",
    "author": "Codex"
  },
  "eth:eth-p02-transition-from-proof-of-work-to-proof-of-stake": {
    "primary": "platform",
    "secondary": [],
    "tags": [],
    "rationale": "Replacing the consensus implementation is platform infrastructure.",
    "author": "Codex"
  },
  "eth:eth-p03-cut-energy-use-by-99-95": {
    "primary": null,
    "secondary": [],
    "tags": [],
    "rationale": "Energy efficiency is not clearly covered by the eight subject definitions; review before assigning.",
    "author": "Codex"
  },
  "eth:eth-p04-eip-1559-fee-market-reform": {
    "primary": "platform",
    "secondary": [],
    "tags": [],
    "rationale": "The execution fee market concerns use of the smart-contract platform.",
    "author": "Codex"
  },
  "eth:eth-p05-rollup-centric-scaling-strategy": {
    "primary": "platform",
    "secondary": [],
    "tags": [
      "scale"
    ],
    "rationale": "Rollups are the platform's application scaling path.",
    "author": "Codex"
  },
  "eth:eth-p06-100-000-tps-via-rollups-plus-sharding": {
    "primary": "platform",
    "secondary": [],
    "tags": [
      "scale"
    ],
    "rationale": "Combined execution throughput is a platform scaling claim.",
    "author": "Codex"
  },
  "eth:eth-p07-proto-danksharding-blobs-to-cut-layer-2-data-costs": {
    "primary": "platform",
    "secondary": [],
    "tags": [
      "scale"
    ],
    "rationale": "Blob data availability lowers application rollup costs.",
    "author": "Codex"
  },
  "eth:eth-p08-full-sharding": {
    "primary": "platform",
    "secondary": [],
    "tags": [
      "scale"
    ],
    "rationale": "Execution sharding is platform computation capacity.",
    "author": "Codex"
  },
  "eth:eth-p09-asic-resistant-decentralized-mining": {
    "primary": "governance",
    "secondary": [],
    "tags": [
      "inclusion",
      "sovereignty"
    ],
    "rationale": "Hardware access and mining participation are the primary subject.",
    "author": "Codex"
  },
  "eth:eth-p10-plasma-general-purpose-scaling": {
    "primary": "platform",
    "secondary": [],
    "tags": [
      "scale"
    ],
    "rationale": "Plasma execution is application scaling infrastructure.",
    "author": "Codex"
  },
  "eth:eth-p11-account-abstraction-erc-4337": {
    "primary": "platform",
    "secondary": [],
    "tags": [
      "inclusion"
    ],
    "rationale": "Account abstraction concerns programmable wallet functionality.",
    "author": "Codex"
  },
  "eth:eth-p12-stateless-validation": {
    "primary": "platform",
    "secondary": [],
    "tags": [
      "scale"
    ],
    "rationale": "Stateless validation is platform infrastructure and resource use.",
    "author": "Codex"
  },
  "xrp:xrp-p01-bridge-liquidity": {
    "primary": "payments",
    "secondary": [
      "real-world"
    ],
    "tags": [],
    "rationale": "Institutional cross-border settlement is a payment use case.",
    "author": "Codex"
  },
  "xrp:xrp-p02-escrow-55b": {
    "primary": "money",
    "secondary": [],
    "tags": [],
    "rationale": "Escrow constrains the monetary instrument's circulating supply.",
    "author": "Codex"
  },
  "xrp:xrp-p03-re-escrow": {
    "primary": "money",
    "secondary": [],
    "tags": [],
    "rationale": "The escrow release schedule manages monetary supply.",
    "author": "Codex"
  },
  "xrp:xrp-p04-xrapid-commercial": {
    "primary": "payments",
    "secondary": [
      "real-world"
    ],
    "tags": [],
    "rationale": "Commercial XRP payment use is the explicit test.",
    "author": "Codex"
  },
  "xrp:xrp-p05-xpring": {
    "primary": null,
    "secondary": [],
    "tags": [],
    "rationale": "Ecosystem funding spans several subjects; the stored criterion does not name a single primary use.",
    "author": "Codex"
  },
  "xrp:xrp-p06-ubri": {
    "primary": null,
    "secondary": [],
    "tags": [],
    "rationale": "University research funding is not itself a defined on-chain integration or application promise.",
    "author": "Codex"
  },
  "xrp:xrp-p07-forte-gaming": {
    "primary": "platform",
    "secondary": [
      "payments"
    ],
    "tags": [],
    "rationale": "The criterion is game adoption with a payment-settlement association.",
    "author": "Codex"
  },
  "xrp:xrp-p08-creator-fund": {
    "primary": "platform",
    "secondary": [],
    "tags": [],
    "rationale": "Creator NFTs and tokenization applications are the defined funded use.",
    "author": "Codex"
  },
  "xrp:xrp-p09-xls20-nfts": {
    "primary": "platform",
    "secondary": [],
    "tags": [],
    "rationale": "Native NFTs provide application functionality and marketplaces.",
    "author": "Codex"
  },
  "xrp:xrp-p10-developer-fund": {
    "primary": null,
    "secondary": [],
    "tags": [],
    "rationale": "General developer grants span subjects; leave unclassified pending a narrower assignment.",
    "author": "Codex"
  },
  "xrp:xrp-p11-xls30-amm": {
    "primary": "defi",
    "secondary": [],
    "tags": [],
    "rationale": "An automated market maker is exchange infrastructure.",
    "author": "Codex"
  },
  "xrp:xrp-p12-carbon-markets": {
    "primary": "real-world",
    "secondary": [
      "defi"
    ],
    "tags": [],
    "rationale": "Carbon credits connect on-chain tools to external environmental assets.",
    "author": "Codex"
  },
  "xrp:xrp-p13-net-zero-2030": {
    "primary": null,
    "secondary": [],
    "tags": [],
    "rationale": "Corporate emissions are outside the current subject definitions; do not stretch integration to cover them.",
    "author": "Codex"
  },
  "xrp:xrp-p14-rlusd-launch": {
    "primary": "money",
    "secondary": [
      "real-world"
    ],
    "tags": [],
    "rationale": "A dollar-backed monetary instrument has a secondary external-reserve association.",
    "author": "Codex"
  },
  "xrp:xrp-p15-rlusd-attestations": {
    "primary": "real-world",
    "secondary": [
      "money"
    ],
    "tags": [],
    "rationale": "Reserve attestations connect the token to externally held backing.",
    "author": "Codex"
  },
  "xrp:xrp-p16-rlusd-expansion": {
    "primary": "interoperability",
    "secondary": [
      "defi",
      "money"
    ],
    "tags": [],
    "rationale": "Expansion across chains is the primary criterion, with financial uses as secondary.",
    "author": "Codex"
  },
  "xrp:xrp-p17-evm-sidechain": {
    "primary": "platform",
    "secondary": [
      "interoperability"
    ],
    "tags": [],
    "rationale": "The criterion requires applications running on an EVM sidechain.",
    "author": "Codex"
  },
  "xrp:xrp-p18-xrpl-lending": {
    "primary": "defi",
    "secondary": [],
    "tags": [],
    "rationale": "Origination of actual loans is a lending-service claim.",
    "author": "Codex"
  },
  "xrp:xrp-p19-codius": {
    "primary": "platform",
    "secondary": [],
    "tags": [],
    "rationale": "A smart-contract hosting platform is computation infrastructure.",
    "author": "Codex"
  },
  "bat:bat-p01-attention-standard": {
    "primary": "real-world",
    "secondary": [
      "money"
    ],
    "tags": [],
    "rationale": "The claim connects attention accounting to web advertising standards.",
    "author": "Codex"
  },
  "bat:bat-p02-user-rewards": {
    "primary": "payments",
    "secondary": [
      "real-world",
      "privacy"
    ],
    "tags": [],
    "rationale": "Users receiving rewards are payments linked to advertising attention.",
    "author": "Codex"
  },
  "bat:bat-p03-creator-payouts": {
    "primary": "payments",
    "secondary": [
      "real-world"
    ],
    "tags": [],
    "rationale": "Publisher and creator payouts are the direct delivery test.",
    "author": "Codex"
  },
  "bat:bat-p04-advertiser-platform": {
    "primary": "real-world",
    "secondary": [
      "privacy"
    ],
    "tags": [],
    "rationale": "An advertising business process connects to private attribution and reporting.",
    "author": "Codex"
  },
  "bat:bat-p05-onchain-ad-confirmations": {
    "primary": "real-world",
    "secondary": [],
    "tags": [
      "sovereignty"
    ],
    "rationale": "On-chain ad confirmations connect advertising events to a verifiable record.",
    "author": "Codex"
  },
  "bat:bat-p06-user-growth-pool": {
    "primary": "money",
    "secondary": [],
    "tags": [
      "inclusion"
    ],
    "rationale": "Distribution of an allocated token supply is the explicit criterion.",
    "author": "Codex"
  },
  "bat:bat-p07-brave-wallet": {
    "primary": "platform",
    "secondary": [
      "payments"
    ],
    "tags": [],
    "rationale": "The test is delivery of integrated wallet software.",
    "author": "Codex"
  },
  "bat:bat-p08-brave-swap": {
    "primary": "defi",
    "secondary": [],
    "tags": [],
    "rationale": "A DEX aggregator provides exchange services.",
    "author": "Codex"
  },
  "bat:bat-p09-crosschain-bat": {
    "primary": "interoperability",
    "secondary": [],
    "tags": [],
    "rationale": "Token use beyond one blockchain is cross-chain transferability.",
    "author": "Codex"
  },
  "bat:bat-p10-bat-spend-utility": {
    "primary": "payments",
    "secondary": [
      "real-world"
    ],
    "tags": [],
    "rationale": "Spending BAT on services concerns payment utility.",
    "author": "Codex"
  },
  "bat:bat-p11-bravepay": {
    "primary": "payments",
    "secondary": [
      "privacy"
    ],
    "tags": [
      "sovereignty"
    ],
    "rationale": "Self-custody private payments are the stated service.",
    "author": "Codex"
  },
  "bat:bat-p12-rewards-card": {
    "primary": "payments",
    "secondary": [
      "real-world"
    ],
    "tags": [],
    "rationale": "A rewards payment card connects transactions to purchases.",
    "author": "Codex"
  },
  "bat:bat-p13-unified-wallet": {
    "primary": "platform",
    "secondary": [
      "payments",
      "interoperability"
    ],
    "tags": [],
    "rationale": "Unified wallet functionality spans payment methods and chains.",
    "author": "Codex"
  },
  "bat:bat-p14-creator-ai-protocol": {
    "primary": "payments",
    "secondary": [
      "real-world"
    ],
    "tags": [],
    "rationale": "Creator micro-royalties link content use to payment.",
    "author": "Codex"
  },
  "bat:bat-p15-agentic-payments": {
    "primary": "payments",
    "secondary": [],
    "tags": [],
    "rationale": "Machine-to-machine protocols are a payment use case.",
    "author": "Codex"
  },
  "bat:bat-p16-bat-buybacks": {
    "primary": "money",
    "secondary": [
      "payments"
    ],
    "tags": [],
    "rationale": "Revenue-funded token buybacks concern monetary flows supporting rewards.",
    "author": "Codex"
  },
  "bat:bat-p17-rewards-evolution": {
    "primary": "real-world",
    "secondary": [
      "payments"
    ],
    "tags": [],
    "rationale": "Loyalty and purchases link token rewards to consumer programs.",
    "author": "Codex"
  },
  "link:link-p01-decentralized-oracle-network": {
    "primary": "real-world",
    "secondary": [
      "platform"
    ],
    "tags": [],
    "rationale": "Oracles connect external data to on-chain applications.",
    "author": "Codex"
  },
  "link:link-p02-price-feeds-defi-standard": {
    "primary": "defi",
    "secondary": [
      "real-world"
    ],
    "tags": [],
    "rationale": "The test specifies price-data adoption by financial protocols.",
    "author": "Codex"
  },
  "link:link-p03-hybrid-smart-contracts": {
    "primary": "platform",
    "secondary": [
      "real-world"
    ],
    "tags": [],
    "rationale": "Hybrid contracts combine on-chain programs with external computation.",
    "author": "Codex"
  },
  "link:link-p04-superlinear-staking": {
    "primary": "platform",
    "secondary": [],
    "tags": [],
    "rationale": "The criterion concerns oracle-network security rather than a lending product.",
    "author": "Codex"
  },
  "link:link-p05-staking-v01": {
    "primary": "platform",
    "secondary": [],
    "tags": [],
    "rationale": "Participation in the oracle staking/security mechanism is infrastructure use.",
    "author": "Codex"
  },
  "link:link-p06-staking-v02": {
    "primary": "platform",
    "secondary": [],
    "tags": [],
    "rationale": "Expanded staking and slashing support oracle infrastructure security.",
    "author": "Codex"
  },
  "link:link-p07-vrf": {
    "primary": "platform",
    "secondary": [],
    "tags": [],
    "rationale": "Application randomness is a computation service.",
    "author": "Codex"
  },
  "link:link-p08-keepers-automation": {
    "primary": "platform",
    "secondary": [],
    "tags": [],
    "rationale": "Automating contract execution is application infrastructure.",
    "author": "Codex"
  },
  "link:link-p09-data-streams": {
    "primary": "defi",
    "secondary": [
      "real-world"
    ],
    "tags": [],
    "rationale": "Low-latency data for derivatives is financial infrastructure.",
    "author": "Codex"
  },
  "link:link-p10-functions": {
    "primary": "real-world",
    "secondary": [
      "platform"
    ],
    "tags": [],
    "rationale": "Web2 APIs connect external services to smart contracts.",
    "author": "Codex"
  },
  "link:link-p11-ccip": {
    "primary": "interoperability",
    "secondary": [],
    "tags": [],
    "rationale": "Moving data and value between blockchains is the explicit subject.",
    "author": "Codex"
  },
  "link:link-p12-swift-bank-connectivity": {
    "primary": "real-world",
    "secondary": [
      "interoperability",
      "payments"
    ],
    "tags": [],
    "rationale": "Existing bank messaging connects institutions to cross-chain settlement.",
    "author": "Codex"
  },
  "link:link-p13-proof-of-reserve": {
    "primary": "real-world",
    "secondary": [
      "defi"
    ],
    "tags": [],
    "rationale": "Reserve verification connects external backing to financial applications.",
    "author": "Codex"
  },
  "link:link-p14-economics-20-build-scale": {
    "primary": null,
    "secondary": [],
    "tags": [],
    "rationale": "Broad ecosystem funding programs span subjects; classification needs review.",
    "author": "Codex"
  },
  "sol:sol-p01-proof-of-history": {
    "primary": "platform",
    "secondary": [],
    "tags": [
      "scale"
    ],
    "rationale": "The network clock and confirmation mechanism are platform infrastructure.",
    "author": "Codex"
  },
  "sol:sol-p02-710k-tps": {
    "primary": "platform",
    "secondary": [],
    "tags": [
      "scale"
    ],
    "rationale": "Network transaction throughput is a platform scaling claim.",
    "author": "Codex"
  },
  "sol:sol-p03-low-fees": {
    "primary": "platform",
    "secondary": [
      "payments"
    ],
    "tags": [
      "inclusion"
    ],
    "rationale": "Network-wide low fees support application use, including payments.",
    "author": "Codex"
  },
  "sol:sol-p04-400ms-blocks": {
    "primary": "platform",
    "secondary": [],
    "tags": [
      "scale"
    ],
    "rationale": "Block production speed is platform performance.",
    "author": "Codex"
  },
  "sol:sol-p05-network-reliability": {
    "primary": "platform",
    "secondary": [],
    "tags": [],
    "rationale": "Availability of the chain is platform reliability.",
    "author": "Codex"
  },
  "sol:sol-p06-firedancer": {
    "primary": "platform",
    "secondary": [
      "governance"
    ],
    "tags": [
      "sovereignty"
    ],
    "rationale": "Independent validator software is infrastructure with a participation association.",
    "author": "Codex"
  },
  "sol:sol-p07-solana-pay": {
    "primary": "payments",
    "secondary": [
      "real-world"
    ],
    "tags": [],
    "rationale": "Merchant transactions are a payment rail use case.",
    "author": "Codex"
  },
  "sol:sol-p08-saga": {
    "primary": "real-world",
    "secondary": [
      "platform"
    ],
    "tags": [],
    "rationale": "A physical phone connects users and on-chain mobile applications.",
    "author": "Codex"
  },
  "sol:sol-p09-seeker": {
    "primary": "real-world",
    "secondary": [
      "platform"
    ],
    "tags": [],
    "rationale": "A mobile device connects the chain to an external consumer product.",
    "author": "Codex"
  },
  "sol:sol-p10-developer-ecosystem": {
    "primary": null,
    "secondary": [],
    "tags": [],
    "rationale": "Developer attraction alone does not identify a specific promised use; retain for review.",
    "author": "Codex"
  },
  "sol:sol-p11-alpenglow": {
    "primary": "platform",
    "secondary": [],
    "tags": [
      "scale"
    ],
    "rationale": "Faster consensus finality is platform performance.",
    "author": "Codex"
  },
  "dash:dash-p01-everyday-digital-cash": {
    "primary": "payments",
    "secondary": [
      "money",
      "privacy"
    ],
    "tags": [
      "inclusion"
    ],
    "rationale": "Everyday purchases are the main subject with monetary and privacy associations.",
    "author": "Codex"
  },
  "dash:dash-p02-masternode-network": {
    "primary": "platform",
    "secondary": [
      "governance",
      "payments"
    ],
    "tags": [],
    "rationale": "The masternode infrastructure supports several named network services.",
    "author": "Codex"
  },
  "dash:dash-p03-privatesend": {
    "primary": "privacy",
    "secondary": [],
    "tags": [],
    "rationale": "Transaction mixing is explicitly a confidentiality service.",
    "author": "Codex"
  },
  "dash:dash-p04-instantsend": {
    "primary": "payments",
    "secondary": [],
    "tags": [],
    "rationale": "Fast transaction settlement is a payment claim.",
    "author": "Codex"
  },
  "dash:dash-p05-treasury-governance": {
    "primary": "governance",
    "secondary": [],
    "tags": [],
    "rationale": "Voting over a funded treasury is decision and participation infrastructure.",
    "author": "Codex"
  },
  "dash:dash-p06-merchant-economy": {
    "primary": "payments",
    "secondary": [
      "real-world"
    ],
    "tags": [],
    "rationale": "Merchant acceptance tests actual everyday payments.",
    "author": "Codex"
  },
  "dash:dash-p07-evolution-platform": {
    "primary": "platform",
    "secondary": [],
    "tags": [],
    "rationale": "A data and identity layer is application infrastructure.",
    "author": "Codex"
  },
  "dash:dash-p08-evolution-ux": {
    "primary": "payments",
    "secondary": [
      "platform"
    ],
    "tags": [
      "inclusion"
    ],
    "rationale": "Consumer payment usability is the criterion for the wallet and names.",
    "author": "Codex"
  },
  "dash:dash-p09-onchain-scaling": {
    "primary": "payments",
    "secondary": [],
    "tags": [
      "scale"
    ],
    "rationale": "Larger blocks support the digital cash transaction rail.",
    "author": "Codex"
  },
  "avax:avax-launch": {
    "primary": "platform",
    "secondary": [],
    "tags": [
      "scale"
    ],
    "rationale": "C-Chain finality and throughput are platform performance.",
    "author": "Codex"
  },
  "avax:avax-evm": {
    "primary": "platform",
    "secondary": [
      "interoperability"
    ],
    "tags": [],
    "rationale": "Running Ethereum apps on the C-Chain is platform compatibility.",
    "author": "Codex"
  },
  "avax:avax-validators": {
    "primary": "governance",
    "secondary": [],
    "tags": [
      "scale",
      "inclusion"
    ],
    "rationale": "Growth of independent validators concerns participation.",
    "author": "Codex"
  },
  "avax:avax-bridge": {
    "primary": "interoperability",
    "secondary": [],
    "tags": [],
    "rationale": "The bridge transfers assets between separate networks.",
    "author": "Codex"
  },
  "avax:avax-rush": {
    "primary": "defi",
    "secondary": [],
    "tags": [],
    "rationale": "Adoption of financial protocols and their liquidity is the criterion.",
    "author": "Codex"
  },
  "avax:avax-subnets": {
    "primary": "platform",
    "secondary": [],
    "tags": [
      "sovereignty",
      "scale"
    ],
    "rationale": "Application-specific chains provide computation infrastructure.",
    "author": "Codex"
  },
  "avax:avax-multiverse": {
    "primary": "platform",
    "secondary": [
      "real-world"
    ],
    "tags": [],
    "rationale": "The program's concrete output is launched application chains.",
    "author": "Codex"
  },
  "avax:avax-dfk": {
    "primary": "platform",
    "secondary": [
      "defi"
    ],
    "tags": [],
    "rationale": "A game runs on an application-specific chain with financial features.",
    "author": "Codex"
  },
  "avax:avax-deloitte": {
    "primary": "real-world",
    "secondary": [],
    "tags": [],
    "rationale": "Disaster claims connect a public-sector process to chain records.",
    "author": "Codex"
  },
  "avax:avax-institutional-pilots": {
    "primary": "real-world",
    "secondary": [],
    "tags": [],
    "rationale": "Institutional processes are the primary subject of the pilots.",
    "author": "Codex"
  },
  "avax:avax-vista": {
    "primary": "real-world",
    "secondary": [
      "defi"
    ],
    "tags": [],
    "rationale": "Tokenized external assets connect real-world ownership and financial use.",
    "author": "Codex"
  },
  "avax:avax-gunz": {
    "primary": "platform",
    "secondary": [],
    "tags": [],
    "rationale": "An on-chain game item economy is an application use case.",
    "author": "Codex"
  },
  "avax:avax-maplestory": {
    "primary": "platform",
    "secondary": [],
    "tags": [],
    "rationale": "A game with on-chain activity is an application use case.",
    "author": "Codex"
  },
  "avax:avax-teleporter": {
    "primary": "interoperability",
    "secondary": [],
    "tags": [],
    "rationale": "Messaging across subnets connects separate chains.",
    "author": "Codex"
  },
  "avax:avax-etna": {
    "primary": "platform",
    "secondary": [
      "governance"
    ],
    "tags": [
      "sovereignty"
    ],
    "rationale": "Independent L1 operation is platform capability with participation changes.",
    "author": "Codex"
  },
  "avax:avax-aws": {
    "primary": "real-world",
    "secondary": [
      "platform"
    ],
    "tags": [],
    "rationale": "Cloud marketplace deployment integrates external hosting infrastructure.",
    "author": "Codex"
  },
  "avax:avax-skybridge": {
    "primary": "real-world",
    "secondary": [
      "defi"
    ],
    "tags": [],
    "rationale": "Tokenizing hedge funds connects external financial assets to the chain.",
    "author": "Codex"
  }
};
