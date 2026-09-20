# Prove-It Clock — Top-20 Expansion Design

**Status:** design (not implemented). Methodology v0.2.0. Repo `AlexBorsody/prove-it-clock`.

## 1. Objective & scope

Expand the Clock from **6 → 20 tracked projects**.

- **Universe:** ranks 2–21 by market cap ("top 20 altcoins"), **BTC excluded**.
- Non-goal: no methodology version bump unless gates change (scoring logic is untouched); no UI redesign; no new data providers in Phase A.

## 2. Universe selection

### 2.1 Source options

| Source | Mechanism | Pros | Cons |
|---|---|---|---|
| **CoinGecko `/coins/markets` (RECOMMENDED)** | One batched call, keyless, already integrated in `providers/coingecko` | No key, no new dependency; `market_cap_rank` returned per coin | Free-tier rate discipline (~5–15 calls/min per repo adapter; documented 10–30) |
| CoinMarketCap `/v1/cryptocurrency/listings/latest` | 10K free calls/month | Canonical "CMC leaderboard" Alex asked for | Requires free API key; adds a credential to manage |

Recommendation: use CoinGecko for the universe list (it's already the price/mcap provider, and rank data comes free in the same batched markets call). CMC as fallback only if rank coverage proves unreliable.

### 2.2 Refresh cadence (proposal)

- **Daily ingest already exists.** Universe check rides along: one markets call per day, cached in `data/raw/<date>/`.
- **Composition changes are append-only.** A coin dropping out of the top 20 keeps its full snapshot history (it stays scored until explicitly retired). A new entrant gets seeded (see §4) and enters scoring on the next run. No silent removal of history — the append-only promise extends to universe membership.

## 3. API inventory

| API | Used for | Free-tier limits | Status |
|---|---|---|---|
| CoinGecko | markets + `/coins/{id}` (genesis, developer_data); **universe ranks** | keyless, ~5–15 calls/min; current cost ~7 calls/day for 6 projects → ~21 calls/day for 20 (1 batched markets + 20 detail) with same-day cache reuse | LIVE |
| DefiLlama (`api.llama.fi`) | TVL / fees per chain | free, no key, generous | LIVE — needs `defillama_chain` mapping for each new L1/L2 (see §4) |
| blockchain.info | BTC on-chain fees only | free | LIVE — BTC is rank 1 and excluded from the universe; adapter becomes dead code on the day BTC leaves `projects.json` (cleanup, not blocker) |
| CoinMarketCap | universe list fallback | free 10K calls/month | PROPOSED, only if CoinGecko ranks prove unreliable |
| GitHub REST | **Phase-2** developer-activity adapter (commit/PR cadence per project repo) | 60 req/hr unauth, 5,000/hr with token | PROPOSED for later — would fix "developer_data spotty upstream" note in the CG adapter |
| X API | attention/social signal | paid tiers | SKIP — attention stays an `unavailable` component per observer-effect policy |
| Reddit API | sentiment/community signal | restricted access (requires app approval) | SKIP — same reason as X |

### 3.1 What needs Alex

- **Nothing, under the recommended path.** CoinGecko keyless + DefiLlama keyless cover it.
- Only if the CMC fallback is chosen: a free CMC API key, stored by Alex via his vault flow (not chat, not the repo).

## 4. Per-project seed work — the bulk of the job

Adding a coin is not an API problem; it's an **analyst problem**. Each of the 14 new projects needs a full entry in `app/data/projects.json`:

```
slug, name, symbol, coingecko_id, defillama_chain,
thesis, thesis_category (monetary | execution | payments | oracle),
launch_date, launch_notes, measurable_success,
milestones[] (each with evidence_summary + source links),
events[], assessments{ token_necessity{rationale}, … }
```

### 4.1 Seed template (per new coin)

1. `coingecko_id` — resolve against CoinGecko (watch forks/dupes: e.g. verify exact id, not a similarly-named token).
2. `defillama_chain` — chain slug in DefiLlama (`ethereum`, `solana`, `avalanche`, …) or `None` for non-chain tokens (exchange tokens, oracles); an incorrect mapping silently yields wrong TVL.
3. `thesis` — 1–2 sentences, falsifiable.
4. `thesis_category` — one of the four; stablecoins don't fit cleanly (see open questions).
5. `milestones[]` — dated, with `evidence_summary` citing a primary source (announcement post, block explorer, protocol docs).
6. `events[]` — setbacks and pivots, not just wins (setback_drag needs honest inputs).
7. `assessments.token_necessity.rationale` — would the protocol work essentially unchanged without the token? This feeds the `token_necessity_gate` (caps token_value_capture at 4.0 when necessity < 3).

### 4.2 Review bar

Every claim in `milestones` needs an `evidence_summary`; every seed gets a second-reader pass before scoring. A seed that can't cite primary evidence ships as **PROVISIONAL** (flagged, confidence-capped per the `provisional_flag` gate) rather than padded with guesses. Missing data becomes an `unavailable` component — never a zero.

## 5. Pipeline changes

- **`score.ts`: unchanged.** It loads seeds via `loadSeeds()` and scores whatever exists — 6 or 20, no code change.
- **`ingest.ts`: one addition** — a universe step before the per-seed adapters:
  - fetch ranked list (CoinGecko `/coins/markets`, ranks 2–21);
  - diff against `projects.json` slugs;
  - log new entrants as "needs seed" and **skip scoring them** until seeded (no phantom rows);
  - log dropouts as "retired from universe, history retained".
- **Raw caching already handles the volume**: same-day disk cache (`data/raw/<date>/`) means a daily run stays at ~21 upstream calls. The existing throttle discipline (spaced calls, cache reuse) scales without change; verify with a dry run before going daily.

## 6. UI changes

- Leaderboard: 6 → 20 rows. Sorting stays; consider default-sort by a stable column and note the row count change in copy.
- Project pages: already generic (data-driven from seeds/snapshots) — no changes expected; verify one new project page renders after seeding.
- Nothing else. No new visualizations for the expansion itself.

## 7. Costs

**$0.** All providers used are free tiers with no card required. Only the optional CMC fallback needs a (free) key signup.

## 8. Rollout (in order)

1. Alex answers the open questions (§9).
2. Add universe step to `ingest.ts` (+ mapping table `slug → coingecko_id / defillama_chain`).
3. Research + write the 14 seed entries against the review bar (§4.2).
4. Dry-run `npm run pipeline` — verify ~21 upstream calls, snapshot shape, no new `unavailable` surprises.
5. First full snapshot; sanity-check scores/explanations vs the v0.2.0 baseline.
6. Deploy; verify 20-row leaderboard and methodology page copy.
7. Cleanup: remove `ingestBitcoinFees` call once BTC is formally out of seeds.

## 9. Open questions for Alex

1. **Stablecoins (USDT, USDC sit in the top 20 by market cap): score them, exclude them, or track them on a separate list?** They don't fit the thesis categories cleanly (their "promise" is a peg, not a protocol).
2. **Universe source:** CoinGecko ranks (recommended, no key) or CoinMarketCap API (needs a free key from you)?
3. **Universe refresh cadence:** daily check with append-only membership (recommended), or a slower cadence (weekly/monthly reconstitution)?
4. **Wrapped/staked variants** (e.g. stETH, WBTC if they appear in 2–21): treat as separate rows or fold into the underlying asset?
