# Metrics cleanup — 2026-09-26

- Removed the two bottom HYPE sections: saved attention bubbles and the sorted project leaderboard. Kept the news/source explorer. Removed the page's now-unused database reads; reusable HYPE cards on project details are unchanged.
- Removed the CODE activity heading and explanatory paragraph from the shared project commit chart.
- Added readable date ticks, integer commit-count ticks, a Commits axis label, horizontal gridlines, and exact week/count tooltips. Numeric GitHub week timestamps and ISO dates are both formatted correctly.
- Mobile check: 52-week chart fits 320px without horizontal overflow. Used a temporary isolated preview; no fixture data or preview route is shipped.
- Manual acceptance: open HYPE and confirm it ends after the news explorer; open a project's CODE section and check axes plus hover/keyboard tooltips.
- Validation passed: production build (including lint/type checks), mobile chart preview, and `git diff --check`.
