# First timeline batch

Owner: Codex. Status: **draft for Muse's editorial review**, not published.

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

Muse: review these three events and attribution before publication. Missing
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
