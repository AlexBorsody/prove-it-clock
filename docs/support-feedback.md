# Anonymous ideas board

Alex's September 28 decision replaces private submissions and email with public,
anonymous comments and votes. `/support` collects an idea, details and an optional
reason. There are no names, email addresses, mail provider calls or notifications.
The donation block remains deferred. No nested reply threads or accounts are built.

## Data and access

Migration `011_feature_requests.sql` is independent of pending notification migration
010. It creates comments, vote receipts and short-lived abuse records. New comments
are public immediately. The public view includes only displayed text, status, vote
total and creation time used for pagination. The API never returns network hashes.
Public roles cannot write the view, read base tables or execute the write RPC.
Only the server service role can submit validated writes or moderate.

Each network gets one vote per idea, five posts per day and thirty new votes per
hour. Rate limits and increments run atomically in PostgreSQL. Duplicate votes do
not increment; retrying a saved submission with its original nonce returns its
receipt. Limits cover all server instances. A burst ceiling stops recording new
attempts after one hundred in a minute. Honeypot and under-two-second submissions
are rejected. Signed actions expire after ten minutes and are bound to a network.

Production uses Vercel's overwritten `x-vercel-forwarded-for` header, documented
in [Vercel's request headers](https://vercel.com/docs/headers/request-headers#x-vercel-forwarded-for).
Other production hosts fail closed until a trusted proxy adapter is implemented.
IPv4-mapped IPv6 addresses normalize to IPv4; native IPv6 uses its /64 network.
Only keyed hashes persist. Activity records expire after thirty days on the next
write; vote hashes remain to prevent repeat votes. Rotating the signing key resets
network identity and should be a deliberate operator action.

These controls limit casual abuse. Shared networks share an allowance; VPNs and
multiple networks can evade it. Fingerprinting, proof-of-work and risk-based CAPTCHA
are intentionally deferred under Alex's latest request. No claim of unique people.

## Release

1. Confirm production Supabase target and direct authorization for migration 011.
   Apply that migration only; it neither changes scores nor enables notifications.
2. Set server-only `FEEDBACK_TOKEN_SECRET` to a generated random secret of at least
   32 characters. Keep it stable across deployments and instances. Use existing
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` on the same target.
3. Set `FEEDBACK_ENABLED=true`, deploy through the established Vercel process, then
   verify posting and voting on the published page. With the flag absent the form
   is unavailable, writes fail closed and the site footer link is hidden.
4. To suspend intake, disable the flag. To hide an abusive comment, set its
   `feature_requests.public=false` in the authenticated database console. It leaves
   the public board and can no longer receive votes. Restore by setting it true.

Do not put the signing secret or service key in `NEXT_PUBLIC_*` variables. No mail
server, Resend key, recipient address, VAPID or notification migration is required.

## Verification checkpoint

- Two focused tests exercise the real SQL migration: public/private access,
  duplicate and cross-idea voting, hidden comments, submission retries, honeypot,
  rate limits, IPv6 grouping and signed-token integrity.
- TypeScript and production build passed. Existing themeColor metadata warnings
  remain. The support stylesheet warnings were corrected.
- Desktop browser: a comment posted immediately; the same anonymous visitor voted
  on two ideas; totals persisted after reload and a repeat vote stayed at one.
  This used a disposable local HTTP adapter backed by the real PostgreSQL migration,
  not the hosted Supabase API. Proxy origin mismatch found and fixed during this check.
- Mobile CSS inspected: single column below 720px, wrapping comment text, full-width
  fields and 44px minimum actions. No mobile emulation or physical-phone test.
- No production migration, environment change or public test comment has been made.
