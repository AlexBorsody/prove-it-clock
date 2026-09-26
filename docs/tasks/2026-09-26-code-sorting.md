# CODE sorting — 2026-09-26

- Replaced the cramped segmented control with full-width, 48px targets, an amber selected state, and a descending-order indicator. Narrow phones use a two-by-two layout.
- Sorting now runs over the loaded public rows, without fetching GitHub/team data on every click. Native history keeps existing sort URLs, reloads, Back/Forward, and modified-click/new-tab behavior working.
- Renamed Follows to Watchers: the data is GitHub `subscribers_count`. The ranking list now displays and links that count; project CODE cards keep their existing three metrics.
- Sorts descend, unknown/failed measurements remain last (after real zeroes), and equal values break by project name. The source rows are not mutated.
- Two focused sort tests passed. Manual acceptance: select every sort, verify order and URL, use Back, reload a sort URL, and inspect controls at 320px.
- Production build (including lint/type checks) and `git diff --check` passed.
