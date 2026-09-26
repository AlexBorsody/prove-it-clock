# CODE sorting — 2026-09-26

- Replaced the cramped segmented control with full-width, 48px targets, an amber selected state, and a descending-order indicator. Narrow phones use a two-by-two layout.
- Sorting now runs over the loaded public rows, without fetching GitHub/team data on every click. Native history keeps existing sort URLs, reloads, Back/Forward, and modified-click/new-tab behavior working.
- Renamed Follows to Watchers: the data is GitHub `subscribers_count`. The ranking list now displays and links that count; project CODE cards keep their existing three metrics.
- Sorts descend, unknown/failed measurements remain last (after real zeroes), and equal values break by project name. The source rows are not mutated.
- Two focused sort tests passed. Manual acceptance: select every sort, verify order and URL, use Back, reload a sort URL, and inspect controls at 320px.
- Production build (including lint/type checks) and `git diff --check` passed.

## Dropdown follow-up

- Synced Muse's main changes, preserving active-metric highlighting and project-page cleanup.
- Replaced the large sorting tiles with a labeled native dropdown. Selection updates local rows immediately; the URL tracks selection without server navigation or GitHub refetches. URL changes synchronize state for Back/Forward. A GET form supports sorting without JavaScript.
- Validate all four choices, direct sort URL reloads, Back/Forward, and 320px width. Previous tile-control notes above describe the superseded UI.
- Alignment follow-up: label sits above a full-width dropdown; both share the ranking panel’s left edge, and the dropdown shares its right edge. Removed the desktop width cap and inline label offset. Browser visual verification remains blocked by automatic approval review treating the earlier Stop request as active.

## Dropdown restored (Muse, 2026-09-26)

- Correction to the section above: Alex said he likes the dropdown, so the
  native "Sort by" dropdown is restored. The earlier buttons-not-tabs
  direction is superseded for this control.
- The dropdown keeps the amber active-metric highlight in each row, so
  switches between correlated sorts (stars/forks/watchers) still show a
  visible change.
