# Codex check-in: timeline + small-cap intake — 2026-09-27

## Stock market data integration (Habib, via GitHub)

- **The market-data brief is delivered: `docs/tasks/2026-09-27-stock-market-data-integration.md`.** Read it before writing any data code. It has the full free-API comparison, the recommended architecture, the field mapping, and the keys to request.
- Short version: SEC EDGAR (no key, server-side, cached) for fundamentals; FMP free for delayed quotes + statements; Finnhub free for real-time quotes; Alpha Vantage free for forward P/E only. Never invent values for private companies (SpaceX/OpenAI/Anthropic).
- **Keys you need from Alex (all free, email signup, no card): FMP, Finnhub, Alpha Vantage.** Ask Alex via Habib as soon as you start; do not wait until blocked. Alex knows this is coming and says the integration is critical.

## Timeline

- The event taxonomy + worked-examples brief (2026-09-27-timeline-foundation.md) is delivered. Treat it as the four-event handoff the 2026-09-26 ledger brief gated builds on. Confirm if anything else is outstanding before DDL.
- You own schema/DDL, evaluator, and the timeline component per the briefs. Alex is asking how it's going; a status line would help.
- Acceptance unchanged: real events only, unknowns labeled, mobile readable at 360px.

**Update 2026-09-27 ~18:15 EDT (Habib, via GitHub): PR #15 "Add a sourced promise timeline with immutable history revisions" is MERGED** (568 additions, 10 files). The timeline is live on project pages: chronological original statements, repeated promises, evidence, and published assessments; each event opens its source and provenance; corrections show the previous state and reason; event/recorded date toggle; assessment links reuse PR #8's run-pinned receipts. The four-event handoff gate is satisfied. No open PRs or issues on the repo as of this check.

## Small-cap merit set

- Alex wants BAT, TRAC, NEO added, plus FARTCOIN as the meme foil. All four verified 2026-09-27 at ~$140-195M market cap, rank ~140-200: outside the top-100 intake capture.
- Intake call is yours: extend the intake batch or run targeted dossiers. Either way, researcher dossiers carry exact source URLs (promise display rule); intake automation never creates scored promises; the reviewed release path applies.
- Merit order for intake priority: TRAC, BAT, NEO, then FARTCOIN as the null case.
- Disclosure: Alex holds BAT (filed UNCONFIRMED in disclosures.json). The ledger decides ranks; intake order is the only editorial call.
- **Update 2026-09-27 ~18:45 EDT (Habib): implemented, no longer awaiting a call.** Alex said "just implement it, it's straightforward," so I did: new `collectTargetedIntake` in `app/src/pipeline/promise-intake.ts` + `fetchMarketsByIds` in the CoinGecko provider + `app/scripts/collect-targeted-intake.ts` (ids: origintrail, neo, fartcoin). First capture `db/research/intake/intake-targeted-2026-09-27T221550Z.json`: FARTCOIN rank 196 and NEO rank 201 as `needs_identity_review`; TRAC rank 216 already maps to the existing `trac` slug (you added it to market-ids this morning). Same discipline as the universe capture: 24h reuse, digest-validated, never collides with the universe cache, discovery only. 6/6 intake tests pass; tsc clean on touched files.

## Dogfood note

- Alex is using the app himself now. What helps him: verdict, promise detail, timeline. The ranking algorithms were not the useful part. Build priority follows that.
