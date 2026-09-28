# Stocks discovery and company timeline

Owner: Codex. Directly assigned by Alex on September 28. Based on main 35548e4.

## Product decisions

Use the existing stocks v1 scope and market-data brief. Finish the company experience around current business, the timeline, and the promise record. Keep public discovery separate from private-company research and from crypto. P/E screens are filters, not a new score or ordering algorithm.

The prior page displayed an expectation-gap narrative as a valuation model without a calculation. Remove that presentation from the public page. Preserve the original versioned artifact in the seed; do not rewrite it or publish a replacement model.

Reuse Cards/List, CompareMode/ComparisonGrid, company registry, research seed, and historical fundamentals. Two new display components are necessary: StockMarketContext for sourced observations and StockEvidenceExplorer for the selectable company event chart. The existing TimelineSvg plots crypto score series, and PromiseTimeline relies on crypto publication receipts; neither is an appropriate renderer for these stock events. Domain helpers keep company content, external market context and timeline positioning independent. No visualization dependency added.

## Implemented

- `/stocks`: public/private selection, company/sector search, P/E >30, >50, >100, non-positive earnings and all-company screens. Missing P/E is shown separately, never silently treated as a match. Private companies have no public ratios. Cards/List and the existing compare overlay use the same observations and sources.
- `/stocks/[slug]`: current business and market observations with financial periods/source receipts, historical results under disclosure, timeline and categorized promise record. Unresearched companies have explicit empty records.
- Tesla timeline: 29 existing events across eight lineages. Shared date axis, category/horizon/outcome/text filters, selection, original-target navigation, exact source links, quotations identified as quotations in the linked source, and a keyboard-accessible event list. Partial dates are ranges. Filtering preserves positions. Recorded-date mode shows capture dates separately from occurrence dates. Assessment corrections follow recording order, with stored event order resolving ties. Unknown assessment states stay unknown.
- Read-only market adapters: SEC companyfacts for revenue, net income, cash, operating cash flow and capex; annual plus current YTD minus prior YTD for TTM, amended comparative facts, fiscal-week tolerance for growth, FCF from OCF minus capex. Wrong CIKs, incomplete periods and failed fields cannot turn into zero values.
- Configured quote fallback: FMP, then Finnhub, then Alpha Vantage daily quote. Alpha Vantage OVERVIEW supplies diluted TTM EPS and forward P/E when available. Trailing P/E derives from price/positive EPS; non-positive earnings display N/M. Older EPS is not combined with a newer SEC filing. Price/sales derives from sourced cap/revenue. No quotes are invented from the seed's old valuation narrative.
- Credentials stay server-side. Normalized context is cached for 12 hours; no scheduler, database write, scoring publication or migration is introduced.

## Research audit and limits

The existing Tesla record is a pilot, not a newly verified editorial publication. All eight lineages lack an explicit stored fulfillment test. All eight original statements link to secondary reporting; only two of 29 events link directly to Tesla IR (Model 3 evidence and its assessment). All events have recorded dates; IDs are unique. There are three target-revision events, three historical financial snapshots, and no open, withdrawn or superseded final assessments in this seed. Do not invent examples to satisfy a UI demo.

Specific handoffs to Muse:

- 2023 guidance starts with a production target, while the outcome/assessment uses deliveries. Verify the original and repeated target definitions.
- 2024 “notably lower growth” has no stored threshold/test. Review admission and the assessment, not just the wording.
- Robotaxi's “no fleet by end of 2020” event is dated October 1, 2020. Its evidence refers to a later blog. The June 2025 launch is recorded as a target revision. Verify dates and event semantics.
- Model 3 mentions an adjusted Q2 2018 target in the final assessment, but the reset target is absent from the revision chain.
- Optimus's “could start” wording is conditional. Cybertruck's production-start target is assessed using a first-delivery date. Both require editorial review.
- Add original sources with locators and explicit tests before representing this as a reviewed ledger. UI warnings expose these gaps; this change does not re-grade the research.

`getStockLedger` still reads the versioned repository seed. Migration 008 defines append-only envelopes but provides no publication RPC or approved payload/read contract. This work does not silently treat its rows as published assessments, add privileged writes, or claim hosted ledger integration. A reviewed stock publication contract and source correction batch remain separate work.

## Configuration and operations

Server environment: `SEC_USER_AGENT` (identify the application), `FMP_API_KEY`, `FINNHUB_API_KEY`, `ALPHA_VANTAGE_API_KEY` (also accepts the existing `ALPHAVANTAGE_API_KEY` spelling). Each keyed provider is optional; absent/failed fields remain unavailable. SEC is read without a key. EPS comes from the provider's diluted TTM figure, not a sum of annual/YTD EPS with changing share denominators.

API keys were requested from Alex as a configuration-status question, not in chat. No local quote keys were found; hosted key presence is unverified. Preserve provider display licenses and attribution. The brief's free-tier recommendations do not establish public redistribution rights. Fetches are server-side; normalized results contain no credentials. Failed or partial observations can remain cached until the 12-hour refresh.

Primary implementation references: [SEC APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces), [FMP stable API](https://site.financialmodelingprep.com/developer/docs/quickstart), [Finnhub quote](https://finnhub.io/docs/api/quote), [Alpha Vantage documentation](https://www.alphavantage.co/documentation/).

## Verification checkpoint

Completed checks: TypeScript, production build, whitespace check and all 20 stock tests (seven focused context/timeline checks plus 13 existing stock checks) passed. The production build retains the pre-existing themeColor metadata warning. Local desktop browser has verified real SEC-backed Tesla context, event selection, earlier-target navigation, recording-date mode, empty filters/reset, keyboard selection and focus return, Cards/List, compare overlay, and private-company isolation. No desktop page overflow. Mobile CSS inspection only; no mobile emulation or phone acceptance. Live quote-provider requests and hosted publication are not verified. A temporary local fixture also verified P/E thresholds, loss/N/M display, missing-data separation and empty searches in the actual UI; it was removed before building. Visible copy was re-read. PR: https://github.com/AlexBorsody/prove-it-clock/pull/25. Implementation commit: 1e738dd. No code change followed these checks.
