# Top-20 Universe — Decision Sheet

**Source:** CoinGecko `/coins/markets`, fetched 2026-09-20 (keyless, one batched call — the design doc's recommended path works).
**Universe:** ranks 2–21, Bitcoin excluded. Market caps are a point-in-time snapshot for ranking only — **market cap is never a scoring input** (methodology v0.2.0).

## The list (rank · symbol · name)

| # | Symbol | Name | Flag |
|---|--------|------|------|
| 2 | ETH | Ethereum | — already scored |
| 3 | USDT | Tether | ⚠ STABLECOIN |
| 4 | BNB | BNB | — |
| 5 | XRP | XRP | — already scored |
| 6 | USDC | USDC | ⚠ STABLECOIN |
| 7 | SOL | Solana | — already scored |
| 8 | TRX | TRON | — |
| 9 | ZEC | Zcash | — |
| 10 | FIGR_HELOC | Figure Heloc | ⚠ RWA TOKEN — tokenized HELOC debt on Provenance; thesis categories don't fit cleanly |
| 11 | HYPE | Hyperliquid | — |
| 12 | DOGE | Dogecoin | — |
| 13 | XMR | Monero | — |
| 14 | WBT | WhiteBIT Coin | ⚠ EXCHANGE TOKEN |
| 15 | RAIN | Rain | — decentralized options/prediction markets on Arbitrum |
| 16 | USDS | USDS (Sky, ex-Maker) | ⚠ STABLECOIN |
| 17 | LINK | Chainlink | — already scored |
| 18 | ADA | Cardano | — already scored |
| 19 | LEO | LEO Token (Bitfinex) | ⚠ EXCHANGE TOKEN |
| 20 | XLM | Stellar | — |
| 21 | UNI | Uniswap | — |

**Wrapped/staked assets in 2–21:** none (no WBTC, no stETH today). Q4 is moot for this list.

## Seed math correction

Design doc §4 says "14 new seeds." That's wrong: of the current 6 scored projects, **BTC is rank 1 and excluded** from the universe. Retained: ETH, XRP, SOL, ADA, LINK (5). **New seeds needed: 15**, not 14. The 15: USDT, BNB, USDC, TRX, ZEC, FIGR_HELOC, HYPE, DOGE, XMR, WBT, RAIN, USDS, LEO, XLM, UNI.

## Decisions needed from Alex

**1. Stablecoins (USDT #3, USDC #6, USDS #16): score, exclude, or separate list?**
Their "promise" is a peg, not a protocol — the thesis categories (monetary | execution | payments | oracle) don't fit. Recommendation: **separate list** — scored on peg resilience + backing transparency, not the main board. Excluding them entirely is the simpler alternative; scoring them on the main board will distort it.

**2. Universe source: CoinGecko or CoinMarketCap?**
Recommendation: **CoinGecko** — keyless, already integrated, today's fetch worked in one call. CMC only if you want the canonical CMC leaderboard badly enough to manage a key.

**3. Reconstitution cadence: daily or slower?**
Recommendation: **daily check, append-only membership** (design doc §2.2) — dropouts keep full history, new entrants get seeded before scoring. A slower cadence only delays new entrants; it doesn't simplify anything else.

**4. Wrapped/staked variants: separate rows or fold into the underlying?**
None in today's 2–21, so this is a standing rule. Recommendation: **fold into the underlying asset** (wstETH → Ethereum, WBTC → Bitcoin) — a wrapped token has no independent thesis to score.

## Watch-outs for seeding

- **FIGR_HELOC** is the strangest entrant: tokenized real-world debt, not a crypto protocol. Recommend PROVISIONAL seed at best, or explicit exclusion with rationale.
- **Exchange tokens (WBT, LEO):** their "promise" is fee discounts on a centralized venue — awkward fit for every thesis category. Recommend PROVISIONAL with a narrow payments/execution thesis, or exclusion.
- **DOGE/XMR:** monetary-category theses are writable (survive cycles, settlement demand), but set honest `token_necessity` — the gate will do its job.
