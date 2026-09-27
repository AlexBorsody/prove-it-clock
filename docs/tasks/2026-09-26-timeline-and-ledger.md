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
  a node, positioned by meaning, colored by state.
- **Timeline:** the HISTORY. "When did they promise, deliver, fail, go
  silent?" Promise lifecycle events on a time axis.

Clicking a timeline event opens the promise in the atlas. Clicking a
meter segment filters the timeline to those promises. Three views, one
ledger underneath.

## The ledger: append-only promise events

Requirements for the schema (Codex owns the DDL):

1. **Promise-scoped.** Events belong to a promise lineage, not just a
   project. The existing `project_events` table is project-level, has no
   promise link, no event/recorded time split, and is mutable. Extend it
   or replace it; the semantics below are what matter.
2. **Append-only and immutable.** Corrections are new superseding
   events, never edits. An event, once published, is forever.
3. **Event time vs. recorded time.** Every event carries both: when it
   happened in the world, and when we logged it. They are different
   fields and the timeline can show either.
4. **Evidence on every event.** A URL to the source that establishes the
   event happened. No event without evidence.
5. **Version-pinned.** Every event records the methodology version and
   the author. Methodology changes are themselves timeline markers.

### Event taxonomy

- `promised`: the claim entered the public record (the original
  statement: tweet, whitepaper, interview). This is the "mention" side.
- `fulfilled`: delivery against the success criterion (the "delivery"
  side).
- `lapsed`: deadline passed unfulfilled, or an ongoing claim's evidence
  stopped.
- `retired`: the team withdrew it.
- `superseded`: replaced by a newer promise, with the pointer.
- `assessment`: our grading event (we checked, on this date, with this
  evidence).
- `note`: dated progress evidence that changes no state.

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
5. **Empty states are content.** A promise with one dot (promised, then
   silence) tells the XRP story better than any score: twelve years of
   nothing after the dot.

## Backfill policy

- `effective_at` dates in the current ledger are real promise dates and
  may seed `promised` events.
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

## Open questions for Alex

1. Should `note` events (progress without state change) be admitted by
   anyone, or analyst-only? (Spam/advocacy risk.)
2. Does the timeline show all promises or only material+core by
   default, with supporting behind a filter?
