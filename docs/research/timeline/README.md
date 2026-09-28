# First timeline batch

Owner: Codex. Status: **publication authorized by Alex; awaiting PR #16 merge**, not published.

`xrp-first-batch.draft.json` contains three events for `xrp-p01-bridge-liquidity`.
It uses the existing published run `4a84b4a4-d7e3-40fe-bcfe-05ab0bd42f85`.
The assessment state and rationale are copied, not regraded.

## Source review, September 27, 2026

- Opened Ripple's May 16, 2017 escrow announcement. Brad Garlinghouse describes
  enterprise on-demand liquidity in its concluding paragraphs. The batch uses a
  paraphrase, not an invented quotation. This is the earliest attributable
  statement linked by this ledger record, not a claim that no earlier statement exists.
- Opened the Q4 2018 XRP Markets Report. It was published January 25, 2019 and
  describes xRapid becoming commercially available in early October 2018.
  Preserve both dates and month precision. Named customer sign-ups are
  issuer-reported evidence, not independent measurement of sustained usage.
- Read the public hearts API and project page. The existing assessment was
  recorded September 26, 2026. Its rationale includes Ripple Payments volume;
  that is not necessarily XRP-routed volume. Copying this historical judgment
  does not endorse that inference. Any correction belongs to a separately
  reviewed assessment, not a timeline edit.

Alex authorized this three-event batch directly on September 28. Muse may still
leave editorial corrections before publication; no Muse approval is implied. Missing
Codius research or a genuine correction pair need not block this separate batch.
No repeated statement or correction was fabricated to populate every event type.

## Publication

From `app/`:

```sh
npm run timeline:publish -- ../docs/research/timeline/xrp-first-batch.draft.json
```

The default is **offline validation only**, with no credentials or network writes.
For an existing history, `--check` reads its parent; this prevents validating
references without seeing the preceding events. It verifies history-table read
access even for the first batch and checks that the selected run is published.
Read-only checks can use a publishable/anon key; only publication requires the
service key. The database remains authoritative for lineage, exact states,
timestamps, idempotency and concurrent writers.

After editorial approval and authorized migration 007 deployment, configure the
normal ignored environment locally. Never commit credentials. Use `--check`
first, then the explicit publication command:

```sh
npm run timeline:publish -- ../docs/research/timeline/xrp-first-batch.draft.json --check
npm run timeline:publish -- ../docs/research/timeline/xrp-first-batch.draft.json --publish --target=https://CONFIRMED-PROJECT.supabase.co
```

The target must equal `SUPABASE_URL`. This example is a placeholder, not a known
production project. The command prints the immutable revision link after success.
Open it and expand each event to verify source, dates and the assessment receipt.
If history already exists, prepare an append batch using its actual parent ID;
do not reset or overwrite it. Retry an uncertain publication with the identical
batch and revision key. A changed batch needs a new revision key.

## What was verified

The real draft batch was published into local PGlite with the actual published
XRP assessment, then parsed by the timeline reader: three events accepted.
No hosted schema, research or scoring publication occurred.
The live XRP page still displayed “The promise history could not be loaded” on
September 27. Code merged into main is not proof of a populated database.

## Live failure confirmed — September 28, 2026

Alex reported the project timeline broken. Read-only browser inspection reproduced
the unavailable-history message on `/projects/xrp` against current main `1422879`.
The Supabase dashboard project `prove-it-clock` (`tbigzpztybuvogpeflao`) contains
the exact published run shown by that page, `4a84b4a4-d7e3-40fe-bcfe-05ab0bd42f85`.
The same SELECT returned NULL for both
`to_regclass('public.promise_history_revisions')` and
`to_regprocedure('public.publish_promise_history(jsonb)')`.

The missing 007 rollout is confirmed, not a chart-rendering regression. Applying
007 will restore reads; it will not create event history. The first XRP batch
still needs acceptance and publication, and other projects need their own sourced
batches. Merge this PR's assessment-caveat renderer before publishing that batch
so the caveat is visible on the live page. Do not substitute reconstructed heart
history or silently turn this outage into empty coverage.

No hosted changes were made. The earlier automatic approval rejection of relayed
authorization still stands; direct Alex authorization is required for the hosted
migration/publication. The database target is now verified. This inspection used
only a SELECT, not the migration or publication function.

## Authorized rollout — September 28, 2026, 03:28 UTC

Alex directly answered yes to applying migration 007 on the verified project and
publishing this batch once PR #16 merges, asking first for a review of Muse's
notification commit. This is new direct authorization; the earlier rejection of
relayed authorization was not bypassed.

After reviewing main `34cfb48`, Codex applied the unchanged migration 007 through
the Supabase SQL editor to `prove-it-clock` (`tbigzpztybuvogpeflao`). Verification:

- `promise_history_revisions` and `publish_promise_history(jsonb)` exist.
- Zero published revisions. Public SELECT is allowed; public function execution
  is denied; service-role execution is allowed.
- Only the two append-only protection triggers exist. No push hook was enabled.
- The actual Vercel XRP page now says no dated events have been published, replacing
  the unavailable-history error. This verifies reads, not a populated timeline.

PR #16 was merged locally with current main and retains Muse's notification card.
The PR itself remains unmerged. Publish only after its assessment-caveat renderer
is deployed, then verify the actual revision link. No history, score, or notification
was published by this rollout. No notification migration was applied.
