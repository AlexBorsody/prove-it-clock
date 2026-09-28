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

## Hosted migration preflight — 2026-09-28 03:47 UTC

Alex asked to do the migrations. Refetched main `34cfb48`; 010 is the only
remaining migration in this feature. Read-only SQL on the confirmed production
project verified 007 exists, 010 is absent, and there are zero push receipt and
subscription rows. Reviewed 010's backward-compatible defaults and brief
ALTER TABLE lock; prior local upgrade checks already passed.

Automatic approval review rejected the attempted 010 execution, stating that
“do the migrations” did not explicitly identify this production notification
change. The browser action did not execute. Asked Alex to confirm migration010
and the verified target by name. **010 remains unapplied**; do not retry through
another tool or treat this preflight as rollout. No schema or data changed here.

## PR review follow-up — September 28

Integrated main `00377ef` in `8c46886`. Muse's Promises-panel heart placement,
overview comparison controls and unified notification styling remain intact.

Addressed the P2 provider-rejection review: completed HTTP 4xx rejections,
including 429, release only the caller's pending receipt so a later attempt can
claim it again. There is no immediate retry; the original provider error and
backoff headers remain available as the error cause. HTTP 408, 5xx, transport
failures and unconfirmed success receipts stay pending for operator review.
Failure to confirm a claim release is reported; it is never treated as a send.
The distinction uses the documented `statusCode` on a completed
[web-push response](https://github.com/web-push-libs/web-push#returns).

The 22 focused notification checks passed, including 429 followed by competing
retry attempts, unrelated sent-receipt preservation, failed release, ambiguous
HTTP/transport failures and the local 009-to-010 migration. TypeScript and
`git diff --check` passed. No new UI/browser or device-delivery checks were run
for this sender change.

**Release remains gated by migration 010.** Without it, the new sender fails
before contacting a provider. Since merging main deploys the app, hold this PR's
merge until the exact production notification migration is directly authorized
and applied. This update did not retry the rejected hosted action, change hosted
data, or activate notifications. The migration SQL is unchanged.
