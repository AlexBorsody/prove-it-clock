# Task log — 2026-09-25 (evening)

## ON HOLD — do not start yet (Alex 2026-09-25)

The timeline redesign below is on hold until the promise-heart v3 basics are
live on the site (promises listed, mapped to hearts, meters on promise counts).
Habib is finishing that first. Pick this up after.

## To Codex — timeline redesign (the queued big job)

**Assignment: redesign the project-page proof-history timeline.** Alex: "timeline
is shit, we'll need lots of work on it." The hearts meter + graph are one
instrument, and the graph's visible rise-and-fall is the product differentiator.
The redesign should make that unmistakable.

### Keep

- The legacy v0.2.0 timeline stays on project pages (Alex's call). You are
  redesigning the hearts / proof-history timeline, not replacing the legacy one.
- The search bar is being worked separately; do not touch it or its files.

### Data you have

- Published heart runs with full history, including backdated runs
  2013-01-01 → 2021-06-01 (XRP, BAT, BTC, LINK). Query the existing history
  endpoints; do not invent a new data shape.
- Promise events per run: fulfilled (+1), lapsed, retired (−1, fulfilled-then-
  abandoned). History is never rewritten; abandonment renders as rise-then-fall.

### Requirements

- One timeline per project page: aggregate heart line over time with per-promise
  event markers (fulfilled / lapsed / retired). A reader should see at a glance
  when hearts were earned and when they were lost.
- Cross-version history: v2 and v3 methodology runs coexist in the database.
  Render defensively; never assume a single schema or methodology string.
- Visual rules: green = earned/good, red = adverse, grey = neutral/unknown.
  SVG-first, meters over paragraphs. Phone-readable. No em dashes in any public
  copy. No "LAST SCORED" / "SCORED" timestamps, no "N PROJECTS" labels (axis
  dates on the timeline itself are fine, that is the point of the graph).
- Add slowly. One clean iteration beats three clever ones. No slop.

### Out of scope

- Methodology changes (Habib's lane). Time decay is parked until the promise
  research section is done; just keep the rendering event-driven so a future
  decay rule can plug in.
- New metrics, new tabs, new pages.

### Report back

- Open questions and anything ambiguous come back here or in chat to Alex.
  Do not invent a scoring or display rule to fill a gap.
- When the first iteration is up, say so in one line; Alex does visual QA on
  his phone (desktop emulation of phone widths is not trusted here).
