# The event ledger and the timeline: design brief

**2026-09-26 ~23:40 EDT. Alex's direction. Author: Habib (Muse).**
Status: design. Codex owns schema/DDL, evaluator, and the timeline
component; this brief defines the semantics. No synthetic history, no
reconstructed timelines: the old Delivery Timeline died for exactly that.

## The moat, in Alex's words

CoinGecko or Coinbase could copy a scoreboard tomorrow. What they
cannot copy is a multi-year, append-only, source-linked record of what
every project promised and when it delivered, lapsed, or went silent.
The immutable ledger of promise events IS the special sauce. The
timeline is its face.

## Three visualizations, no canonical one

Alex: we will not have one canonical visualization yet. Each answers a
different question, and they cross-link:

- **Meter:** the verdict NOW. "Is this team full of shit?" One number,
  one composition band, core findings that survive everything.
- **Atlas:** the evidence SPACE. "What did they promise?" Every promise
  a node, grouped by curated subject category in v1, colored by state.
- **Timeline:** the HISTORY. "When did they promise, deliver, fail, go
  silent?" Promise lifecycle events on a time axis.

Clicking a timeline event opens the promise in the atlas. Clicking a
meter segment filters the timeline to those promises. Three views, one
ledger underneath.

## The ledger: append-only promise events

Requirements for the schema (Codex owns the DDL):

1. **Promise-scoped.** Events belong to a promise lineage, not just a
   project. The existing `project_events` table is project-level and mutable.
   It already has `event_date` and `created_at`, but no promise link or
   immutable correction contract. Extend the existing storage path; preserve
   readers of the legacy project events during the transition.
2. **Append-only and immutable.** Corrections are new superseding
   events, never edits. An event, once published, is forever.
3. **Event time vs. recorded time.** Record when it happened in the world
   with its known precision, or unknown, and when we logged it. Recording
   time is server-generated; it must not be backdated to a historical source.
   The timeline can show either, with undated records kept visible.
4. **Evidence on every event.** A URL to the source that establishes the
   event happened. No event without evidence.
5. **Version-pinned.** Every event identifies its author. Assessment events
   reference their published run and methodology; source-only events need not
   claim a grading methodology. Pin the history revision too. Methodology
   changes are markers only when supported by actual publication records.

### Event taxonomy

**Draft vocabulary; reconcile with the four sourced examples and PR #8 before
DDL.** These are display concepts, not permission to derive new outcomes.

- `promised`: the claim entered the public record (the original
  statement: tweet, whitepaper, interview). This is the "mention" side.
- `fulfilled`: delivery against the success criterion (the "delivery"
  side).
- `lapsed`: a recorded assessment of an ongoing obligation under that run's
  methodology. Missing evidence alone is not a lapse; a confirmed missed
  deadline is a distinct transition in the reviewed contract.
- `retired`: a documented lifecycle change, retaining the actual outcome and
  reason. Do not infer issuer withdrawal or failure merely from this label.
- `superseded`: replaced by a newer promise, with the pointer.
- `assessment`: our grading event (we checked, on this date, with this
  evidence).
- `note`: dated progress evidence that changes no state.

The later layer-sequence brief also requires repeated mentions and corrections.
Repeated mentions do not add scored promises; corrections append with a
predecessor reference and preserve the original assessment.

## Timeline rendering rules

1. **Real events only.** A promise with a known promise date and an
   unknown fulfillment date renders the `promised` dot and an explicit
   "delivery timing unavailable" marker. Never interpolate, never
   connect dots across unknowns.
2. **Swimlanes per promise.** One horizontal lane per promise lineage;
   dots for events, color by state (green/red/grey, same as everywhere).
3. **Methodology markers.** Vertical lines where the methodology version
   changed, labeled. A viewer must see when the rules changed.
4. **Event/recorded toggle.** Default view is event time (when things
   happened); a toggle shows recorded time (when we logged them). The
   gap between the two is itself information about our coverage.
5. **Empty states describe coverage.** A gap means no events are recorded
   for that period. It does not prove no activity or delivery occurred. An
   XRP/SWIFT conclusion requires the attributable claim and outcome research;
   no automatic failure or decay comes from a blank timeline.

## Backfill policy

- Do not blanket-convert `effective_at` to `promised`. In the checked-in
  v3 artifact BTC P1 has `effective_at: 2009-01-03`, while its reference
  names the 2008-10-31 whitepaper. Confirm what each date means against
  its source; otherwise retain an unknown claim date and a coverage flag.
- Fulfillment and lapse dates are mostly unknown today. Those events are
  recorded with `event_time` unknown and displayed as such. Researching
  real transition dates is editorial work, not an implementation task,
  and guessing is forbidden.
- The five historical heart-run snapshots (2013-2021) are methodology
  v0/v1 reconstructions, not events. They do not become timeline dots.

## Acceptance

- A promise's full event history is append-only and publicly readable
  per lineage.
- The timeline renders every event from the ledger and nothing else;
  unknowns are labeled, not hidden or smoothed.
- Meter, atlas, and timeline cross-link and agree on states for the
  same published run.
- Build, typecheck, and focused tests pass; mobile timeline is usable
  (horizontal scroll with sticky promise labels, no tooltip-only info).

## Open questions: resolved by Alex 2026-09-26

1. `note` events: **admitted by anyone.** Spam/advocacy risk accepted;
   corrections append and everything stays source-linked, so abuse is
   visible rather than hidden.
2. Timeline default: **material+core promises**, with supporting behind
   a filter.

## Codex review, 2026-09-27

Corrected storage and backfill assumptions above against `001_initial.sql`
and `heart-runs/hearts-promise-2026-09-26.json`. No existing source records,
dates, outcomes or hosted data were changed. The detailed proposal is in
[implementation](../implementation.md#promise-history-and-timeline); builds
remain gated on Muse's promised four-event handoff and contract review.
Until a reviewed importance model exists, show all promises rather than
inventing the material tier needed by the intended default.
