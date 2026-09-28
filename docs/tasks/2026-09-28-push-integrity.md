# Push notification integration review

Owner: Codex. Based on Muse's `34cfb48`; preserves the two news tiers and
collapsible explanation. No scoring or promise UI redesign.

## Findings and fixes

- Confirmed in the actual Supabase project `tbigzpztybuvogpeflao`: 009's delivery
  constraint excludes `resolution_likely`. The CLI sent these alerts and silently
  lost their receipt, allowing duplicates. Additive migration 010 fixes the
  allowed kind and introduces pending/sent receipts. Do not edit applied 009.
- Both CLI news and ledger fanout now reserve the existing unique
  subscription/revision/kind tuple before contacting the provider. Database
  errors stop the send. Concurrent/repeated calls skip reserved or sent rows.
  Transport or receipt uncertainty remains pending, without automatic retry.
  This avoids duplicate alerts but can leave an unsent alert requiring operator
  review. `sent` means provider acceptance, not confirmed display on a device.
- Fanout consumes immutable `request.events` (the newly published batch), not
  cumulative `events`. Adding evidence no longer re-announces an old assessment.
  The canonical `promise_repeated` event is recognized.
- Existing untyped project subscriptions remain removable through a conditional
  control on the new card. Failed unsubscribe requests no longer appear successful.
- The CLI dry run now suppresses database writes as well as sends; local draft
  files remain available for inspection.
- Mixed lineage/news-tier scopes are rejected; sender queries and validation
  keep project-tier and promise subscriptions separate.

## Release order and remaining handoff

1. Review/apply `db/migrations/010_push_delivery_claims.sql` through the normal
   authorized release process before deploying these sender changes. **010 has
   only run locally.** Alex authorized timeline 007, not this new notification
   migration. No notification sends or activation happened during this review.
2. Pause legacy scanner/fanout execution while deploying sender changes. An old
   sender can still send before attempting its receipt; schema alone cannot fix it.
3. Check pending receipts by ID in service-side operations. Do not blindly delete
   reservations or rerun uncertain sends. Investigate provider acceptance first.
4. PR #19's hourly runner is still proposal-only and sends no notifications. Muse:
   the two new tiers currently live in the CLI; schedule activation alone will
   not service them. Reuse the checked delivery helper when that explicit
   integration ships. Do not run both scanners concurrently.
5. Verify deployed VAPID configuration and one real opt-in/unsubscribe/device
   delivery before claiming production acceptance. This review did not subscribe
   anyone, send pushes, change secrets, enable cron, or install a database hook.

## Checks

20 focused notification tests passed, including local PGlite 009→010 upgrade,
unique concurrent claims, missing-migration failure before send, pending receipts
after uncertain send/write, expired-subscription handling, and current-batch-only
fanout. TypeScript, whitespace checks and the production build passed (existing
`themeColor` metadata warnings remain). No real push delivery or device opt-in
was exercised. The final CLI-only dry-run guard and summary wording were
reviewed after that build; neither is bundled into the application routes.
