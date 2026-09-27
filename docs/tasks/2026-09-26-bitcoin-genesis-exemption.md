# Bitcoin genesis exemption

**2026-09-26. Alex's decision.** Bitcoin is an anomaly in this methodology and
goes in a category of its own. It is not scored, ranked, or verdict-rendered
like every other project.

## Why

- **Anonymous founder.** This is Alex's explicit product choice, not a claim
  that anonymity prevents checking evidence: an anonymous author can still
  make an attributable claim. But there is no accountable issuer to hold to
  promises the way a known team or founder can be held, and combined with
  being first and category-creating, that sets Bitcoin apart.
- **It was first.** There was no asset class before it. It created the
  category rather than competing inside one, so judging it against category
  benchmarks is a category error. Its delivery is existential: before Bitcoin
  there was no thing, now there is a thing.
- **Its durable promises are community-adopted.** Store of value was not the
  whitepaper's primary promise; it emerged later as a durable
  community-adopted proposition. Community adoption without an issuer is a
  different accountability shape than a team shipping or missing a roadmap.

## What changes

- New project attribute: `genesis: true` on Bitcoin (Bitcoin-only unless Alex
  says otherwise; the exemption does not generalize on its own).
- The verdict pipeline (K/F/O/U, proven delivery, outcome coverage, category
  rankings, the shit determination) applies to altcoins. Genesis assets are
  excluded from comparative verdicts and rankings.
- Bitcoin keeps its promise inventory (hearts as receipts) and its documented
  community-adopted promises. Its page shows the inventory plus a
  "Genesis asset" designation instead of a verdict badge.
- The question the product answers — is this altcoin shit — does not apply to
  Bitcoin. Per Alex: it is not shit, it is its own thing.

## Editorial priority change

BTC P11/P12 and the retired BTC P12 items drop to documentation-only
priority. Altcoin records lead the scoring work; nothing here should slow
the altcoin verdict pipeline.

## What stays open

- How the project page reads with inventory but no verdict (design detail).
- Whether any future asset could ever qualify as genesis-like. Default: no.

Nothing here invents evidence or changes any existing published hearts.

## 2026-09-27 implementation: ship Genesis independently

Alex reported BTC still showing warning 7. Main still rendered v3 warnings;
the Genesis implementation was inside unmerged draft PR #8. This focused
branch, `codex/bitcoin-genesis-display`, extracts the approved policy without
waiting for weighted methodology publication.

- Project, scoreboard (desktop/mobile), Compare and shared HYPE cards show
  **Genesis asset** instead of Bitcoin's warning. Category delivery, hearts
  and warning sorts leave Bitcoin unranked; context sorts still include it.
- The v1 API returns `genesis: true` and `shitcoin_warning: null` for BTC.
  OpenAPI documents the nullable warning. Clients must not render null as 0.
- The 16 published BTC promises and 9 earned hearts remain unchanged. This
  is the approved comparison policy, not a new valuation or regrading.
- Verified: seven focused delivery/ranking checks and TypeScript pass;
  local captured-ledger browser checks at 390px and 1280px show Genesis on
  Bitcoin's page/list and no Bitcoin dial. Payments filtering keeps BTC
  unranked; Compare keeps the designation. Local API checks retain all 16
  BTC promises and leave ETH's existing warning unchanged.
- No hosted database writes, methodology activation or production deployment.
  Muse / PR #8 owner: retain this policy when reconciling the larger branch.
  Weight, usage and impact activation remain separate unfinished work.

### Review follow-up — 2026-09-27

[PR #11](https://github.com/AlexBorsody/prove-it-clock/pull/11) merged as
`25b4397`. Its automated review found that selecting a category also pushed
BTC below altcoins when sorting context metrics. Codex reproduced this and
separated category membership from delivery eligibility on
`codex/genesis-context-sorting`. Market cap, stars, commits, mentions and CODE
now sort BTC by the observed metric; category delivery ranks still exclude it.

The existing regression now covers each context sort with and without a
category. It failed before the fix; all seven focused checks and TypeScript
pass after it. No UI changes, new full build or browser run in this follow-up.
The public BTC API was checked after #11 merged: `genesis: true`, warning
null, 9/16 hearts and all 16 promises. This verifies the deployed API only.
Muse / PR #8 owner: preserve this distinction when reconciling the verdict
branch. No new editorial decision or scoring publication is needed for it.
