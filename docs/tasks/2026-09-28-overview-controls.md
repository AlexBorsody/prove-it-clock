# Overview and project-page UI repair

Owner: Codex. Branch: `codex/overview-controls-fix`.
Base: main `00377ef`. Worktree: `/private/tmp/prove-value-overview-controls`.
Alex explicitly authorized updating and merging current PRs after the original
home commit/push hold. Preserve Muse's removal of the home context panel and
placement of the project heart meter inside Promises.

## Completed UI requests

- Align Sort and Cards/List with matching heights, 44px targets and a distinct
  selected state. Keep existing sort rules; the dropdown is the single control.
- Remove redundant group headings and empty action columns. Keep one mounted
  view and preserve selection/expansion when switching layouts.
- Make List fit phones using two-column rows with named metric cells. Desktop
  retains the table; narrow layouts do not squeeze a desktop-width table.
- Render the actual heart inventory horizontally with wrapping. Hide visible
  heart-count text on phone overview rows/cards; accessible counts remain.
- Remove the redundant Active CODE badge in overview and comparison. Keep
  missing-data/quiet context and actual promise statuses.
- Give Bitcoin's filled meter hearts a static multicolor pattern in overview,
  project and comparison views. Empty hearts stay neutral. No score changes.
- Hide the visible Promise category label; retain the filter's accessible name.
- Group the existing Recent promise news and Promise notifications panels in
  one section immediately above project Atlas. Keep their existing behavior.
- Keep Compare above bottom navigation in one compact row, truncating long
  selection names visually while retaining the full accessible text.

The shared card background link and independent controls are preserved. No new
UI components: one scoped project-page CSS module groups existing components.
No new copy, ranking, score, data fetching or notification behavior. Removed the
accidental tracked regular `app/node_modules` file containing a machine-local
path; ignore that name whether directory, regular file or symlink.

## Review and verification

Production desktop handlers responded before this repair; no dead handler was
reproduced. The phone screenshots exposed CSS compression and misleading
header/control layout. Local desktop fixture checks confirmed sort changes,
Cards/List selection persistence, comparison open/close, promise expansion,
Bitcoin's pattern, and category filtering after its label was hidden. The
fixture used the checked-in ledger and explicit missing context; it is removed.
Mobile CSS was inspected for 320/360px constraints, wrapping, safe-area spacing
and separate card-control hit targets. No mobile viewport emulation or device
push test was performed. Alex's physical-phone acceptance remains.

TypeScript, production build and whitespace checks passed. Existing themeColor
metadata warnings remain. No new test suite was added for this UI repair.

## PR coordination

PR #18 was closed as superseded. Its original integration would restore hero
hearts and replace Muse's newer category-filtered PromisesPanel and comparison
layout. This repair retains the useful outstanding actual-inventory/mobile
requirements. Its old category-color disclosure remains in branch history;
there is no extra promise UI in this change.

PR #16 owns timeline optional-caveat resilience. PR #20 owns notification
receipt retries and still requires hosted migration010 before sender deploy.
PR #19 is being narrowed to disabled-by-default review intake without automatic
cron registration. This UI repair performs no hosted writes or activation.
