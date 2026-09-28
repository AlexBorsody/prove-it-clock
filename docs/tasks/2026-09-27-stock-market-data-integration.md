# Stock market data integration brief for Codex

Date: 2026-09-27. Author: Habib (for Codex, technical lead).

## Context

Deep research on free/intro market-data APIs is done. Full comparison page: see the
"Free Stock Market Data APIs" artifact. Raw notes:
`~/workspace/research_notes/free-stock-market-data-apis-20260927-2346/report.md`.

Universe: TSLA, NVDA, AVGO, ORCL (public). SpaceX/OpenAI/Anthropic are private:
never invent public-market metrics for them. Cadence: prices daily, fundamentals
quarterly (on filing days).

## Recommended architecture (all $0)

Primary: **SEC EDGAR + Financial Modeling Prep (free) + Finnhub (free)**.

- **SEC EDGAR companyfacts/companyconcept JSON** (no key, 10 req/sec): the
  fundamentals source of truth. Revenue, net income, diluted EPS, cash and
  equivalents, operating cash flow, capex (derive FCF = OCF - capex), shares
  outstanding. No price, no P/E, no forward P/E. No CORS: fetch server-side,
  cache aggressively (payloads 5-20MB per filer). Normalize XBRL concept tags
  (Revenues vs RevenueFromContractWithCustomer...), dedupe amended facts by
  accession date, build TTM from 10-Qs.
- **FMP free** (email key, no card, 250 calls/day, 500MB/mo): delayed quotes,
  income statement / balance sheet / cash flow, key-metrics and ratios
  endpoints. Cheapest paid if needed: $22/mo annual.
- **Finnhub free** (email key, no card, 60/min, personal-use license): real-time
  US quotes + profile v2 (market cap, shares outstanding). Verified 2026-09-27:
  statements, key metrics, estimates are paid-only. Do not build fundamentals
  on Finnhub free.
- **Forward P/E** is the one gap: only free via **Alpha Vantage OVERVIEW**
  (email key, no card, 25 calls/day, 15-min delayed, fragile) or unofficial
  Yahoo quoteSummary (ToS-violating, fallback only). Cheapest keyed paid with
  forward P/E: FMP estimates tier.
- Fallbacks: Stooq daily CSV (keyless, prices only), Yahoo unofficial (fragile).

What the big sites use (for calibration, not replication): Seeking Alpha =
Quodd + S&P Global Market Intelligence; MarketWatch = FactSet; Google Finance =
exchange-direct + S&P Capital IQ; TradingView = exchange-direct + ICE/FactSet.
A free product matches them on daily prices and filing fundamentals. It cannot
match consolidated real-time SIP quotes or analyst estimates (cheapest ~$29/mo
delayed, ~$199/mo real-time). For our cadence the gap is invisible.

## Field mapping (cheapest free path)

- Current price: Finnhub (RT) / FMP (delayed) / Stooq+Yahoo fallback
- Market cap: price x shares outstanding (EDGAR) / Finnhub profile v2
- Trailing P/E: price / TTM diluted EPS (EDGAR); display N/M on non-positive
  earnings per the stocks v1 spec, never fake zero
- Forward P/E: Alpha Vantage OVERVIEW only (free); otherwise leave blank
- Revenue / growth: EDGAR (derive growth across periods)
- Net income / EPS: EDGAR
- Free cash flow: EDGAR (OCF - capex, derived)
- Price/sales: derive from price / (revenue TTM / shares)
- Cash and equivalents: EDGAR

## Integration points

- Feed the existing stocks data layer (`app/src/lib/stock-data.ts`,
  `app/src/lib/stock-companies.ts`) and migration 008 tables.
- Refresh: prices daily, fundamentals on SEC filing days. Server-side fetch +
  cache; respect rate limits; never call from the browser (EDGAR has no CORS).
- Attribution: check each provider's display requirements before rendering
  vendor-sourced values in UI.
- No invented values, ever. Missing field = blank, not estimated.

## API keys needed (request from Alex via Habib when you start)

All free, email signup, no credit card:

1. Financial Modeling Prep (financialmodelingprep.com) - free tier key
2. Finnhub (finnhub.io) - free tier key
3. Alpha Vantage (alphavantage.co) - free key (forward P/E only)

Ask Alex for these as soon as you begin integration. Do not wait until you are
blocked: request all three up front.
