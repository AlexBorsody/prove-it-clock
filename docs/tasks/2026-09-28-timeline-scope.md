# Timeline scope — the verdict, over time

**2026-09-28, Alex: "we really need to scope out the timeline."**
The product thesis is that the verdict is *living*: promises get reassessed,
verdicts move, rankings reshuffle, users return. The timeline is the surface
that proves the "living" part. Right now the project page has a "Promise
timeline" that is only an event log (promise stated / repeated / evidence /
assessment events from `promise_history_revisions`). Honest, but it is the
receipts drawer, not the instrument. The instrument is hearts meter +
timeline graph; the graph's rise-and-fall is the differentiator. This brief
scopes the graph.

## What the timeline is

One project, one line: the verdict's headline number across published runs.
X axis is run date, Y axis is kept share of assessed promises. Every point
is a published ledger run; the line moves only when a new run is published.

## In scope

- **The line.** Kept share per published run, drawn from the published
  ledger only (`heart_history` points: earned/capacity/as_of). No
  interpolation between runs, no smoothing. Points connected by straight
  segments; the honest shape of reassessment.
- **Per-category toggle.** The line can switch to one Atlas category,
  showing kept share within that category (primary assignments only,
  same rule as the homepage category switcher). Ties to the category
  switcher work, not a separate taxonomy.
- **Event markers on the line.** State transitions (promise stated, kept,
  lapsed) from `promise_history_revisions` appear as markers on the line at
  their occurred date. Clicking a marker opens the event's receipt (source,
  quote, published run). This is the "what moved it" layer: the line shows
  *that* the verdict moved, markers show *why*.
- **Verdict-change flags.** When the verdict label itself changes between
  runs, the point is flagged (not just the number moving).
- **Hover values.** Each point shows run date, kept/total, and verdict
  label. No other chrome.
- **Honest empty states.** With fewer than 2 real runs, show "not enough
  history yet" — never a flat fake line between two same-day dots (we
  already made this mistake on the homepage sparkline and removed it).
- **Placement.** Project page, above the existing event log. The event log
  stays as the expandable receipts beneath the graph: graph first ("how the
  verdict moved"), events second ("what changed, when, and the sources").

## Out of scope

- Price overlay. The verdict stays pure (promises only, no price in the
  score); the timeline is the delivery record, not a trading chart.
- Predictions, projections, trend extrapolation. The line ends at the last
  published run.
- Cross-project lines on one chart. Comparison lives in the ranking views.
- Animation/playback. Static, readable, fast.

## Data rules

- Published ledger only. Every point links to its published run receipt.
- The timeline becomes meaningful only with regular published runs; run
  cadence is a pipeline concern, but this scope assumes it exists. Until
  then, the empty state is the correct UI.

## Alex calls (open)

- Y axis: kept share (recommended, matches the verdict card) vs raw hearts
  earned. Recommend kept share; hearts are the inventory, the verdict is
  the share.
- Whether the category toggle defaults to Overall or remembers the
  homepage's selected category.

## Acceptance

- Project page shows the verdict line with per-run points, category
  toggle, clickable event markers, and verdict-change flags.
- Fewer than 2 runs renders the honest empty state, no fake line.
- Existing event log intact beneath the graph, unchanged behavior.
- Every point and marker links to its published run / event receipt.
- Build, typecheck, and relevant tests pass.
