# Codex check-in: timeline + small-cap intake — 2026-09-27

## Codex next task (after heart expandable): verify Notify-me buttons

- The push subscribe buttons ("Notify me" on project pages + per-promise in the promise list) are already built and wired: `PushSubscribeToggle`, service worker registered in the root layout, `/api/push/*` routes live. They render nothing until `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set, so there is no code task to ungate them.
- After the heart expandable ships and the VAPID env vars are deployed to Vercel: confirm the buttons appear on `/projects/[slug]` and in promise lists, and run one end-to-end subscribe/unsubscribe cycle against production. Report any breakage; do not change the quiet styling.

## Stock market data integration (Habib, via GitHub)

- **The market-data brief is delivered: `docs/tasks/2026-09-27-stock-market-data-integration.md`.** Read it before writing any data code. It has the full free-API comparison, the recommended architecture, the field mapping, and the keys to request.
- Short version: SEC EDGAR (no key, server-side, cached) for fundamentals; FMP free for delayed quotes + statements; Finnhub free for real-time quotes; Alpha Vantage free for forward P/E only. Never invent values for private companies (SpaceX/OpenAI/Anthropic).
- **Keys you need from Alex (all free, email signup, no card): FMP, Finnhub, Alpha Vantage.** Ask Alex via Habib as soon as you start; do not wait until blocked. Alex knows this is coming and says the integration is critical.
- **Update 2026-09-27 ~20:12 EDT (Habib, via GitHub): the API keys are in this Google Doc: https://docs.google.com/document/d/1xp5LwFCRh4fRgsH6GzyZrIGAbESZYhKfJ4pneb31eTY/edit?usp=drivesdk** — pull the FMP, Finnhub, and Alpha Vantage keys from there and add them to your secure stores / env yourself. Do not commit keys to the repo.
- **Update 2026-09-27 ~20:16 EDT (Habib, via GitHub): all three keys (FMP, Finnhub, Alpha Vantage) are now in the doc.** You are unblocked on credentials; pull them and proceed with the integration per the brief.

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

## Overnight handoff — 2026-09-27 (Alex asleep, do not ping him)

Go-live status for the push/scanner pipeline:
- DB: migrations 008 (stock ledger) + 009 (push/scanner) applied to production Supabase; all 9 tables verified. Done.
- Vercel env vars STILL NEEDED (values are in Alex's chat history; he may not have entered them before sleep): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY, PUSH_FANOUT_SECRET. Until these deploy, the Notify-me buttons stay hidden and no push can send.
- SCANNER_AI_URL + SCANNER_AI_API_KEY: still need Alex's OpenAI-compatible key. Until then the AI judge stays off and the scanner runs keyword matching only.
- Market-data keys (Google Doc "K"): Alpha Vantage present; FMP section is blank; Finnhub missing. Alex to fill on his own device. Wire env vars per your integration design once he confirms.

Codex tasks:
1. Hourly scan:news schedule (Vercel Cron hitting the scan route).
2. pg_net fan-out trigger on publication (sketch is commented at the bottom of 009).
3. After heart expandable ships AND the VAPID env vars deploy: verify Notify-me buttons render on project pages + promise lists, run one end-to-end subscribe/unsubscribe cycle. (No code needed to ungate; the button hides itself until NEXT_PUBLIC_VAPID_PUBLIC_KEY is set.)

### Codex handoff — protected scan preparation (revised 2026-09-28)

Owner: `codex/hourly-news-scan`. Current main `00377ef` has been merged into
this branch. PR #19 prepares the intake code; scheduling and activation remain
a separate handoff.

- The requested scan route did not exist. The existing CLI depends on local JSON
  for proposal dedupe and writes files, so it cannot be scheduled unchanged on
  Vercel. This slice adds a protected, filesystem-free GET runner using the
  existing matcher/draft functions and migration 009 tables. The automatic hourly
  cron registration has been removed from `app/vercel.json`, so deployment does
  not depend on an unconfirmed hourly-capable plan or start scheduled intake.
- The route stays disabled unless `NEWS_SCAN_ENABLED=true`, the bearer secret
  matches, and server-side Supabase write credentials are configured. None of
  those environment settings is activated by this change.
- Invoked scans write review drafts and match/run logs only. No AI calls,
  notifications, ledger publication or grading changes. Duplicate hour invocations
  and repeated proposals are deduplicated in the database; existing reviewed drafts
  are not reopened. Feed failures remain visible as partial runs.
  A failed/partial attempt consumes its UTC hour; an invocation in a later hour can
  retry. Match audit logs repeat per run, while proposal records are deduplicated.
- Added read-only `scan:review -- --database list|show` access so the hosted queue
  is inspectable. File-based approve/reject commands do not update database drafts.
  Database review decisions and the normal publication handoff remain separate work.
- Future activation handoff: confirm the scheduler and compatible Vercel plan,
  assign an owner for database-queue review, configure `CRON_SECRET`, server-side
  Supabase service credentials and `NEWS_SCAN_ENABLED=true`, then inspect an
  authorized run and its real draft queue. Add any cron registration in that
  separate change after confirming the plan and cadence. These are activation
  prerequisites, not a blocker to merging the disabled intake code. No upgrade,
  environment change or scheduler activation has been performed.
- This runner does not service the "Any news mention" or "Decisive news only"
  subscriptions. Notification delivery and its migration/receipt requirements
  remain a separate integration; the PR #19 discussion records that boundary.
- Do not run the legacy manual scanner concurrently with an enabled intake run.
  Its pending-only
  file dedupe can recreate reviewed drafts; `--dry-run` currently still writes
  scanner tables, and its send-before-record push path can duplicate notifications
  under concurrency. Those paths were not activated or extended in this slice.
- The 008/009 hosted-apply statement above is Muse's report, not independently
  verified here. The pg_net trigger and VAPID rollout remain separate handoffs.

Initial preparation checks: seven focused runner/auth tests, TypeScript, production build and
`git diff --check` passed. A mocked database CLI read returned its fixture;
`--database approve` was rejected before database access. The build retains the
existing `themeColor` metadata warnings. No UI changed; no browser check was run.

Rewrite verification (2026-09-28): all seven existing runner/auth tests and
TypeScript passed after integrating main. `git diff --check` passed; the Vercel
config contains no cron registration. No scanner, AI, notification or environment
code changed in the rewrite, and no live route was invoked.

[PR #19](https://github.com/AlexBorsody/prove-it-clock/pull/19), original
implementation commit `70d744b`, now separates code release from activation.
The next handoff owns the Vercel plan, scheduling and database-queue review.
No hosted database mutation, live subscription, scheduler activation, or
deployment is claimed by the rewrite.
