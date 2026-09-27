# Codex brief: make Compare the default Metrics tab

**From Alex, 2026-09-27 ~02:47 EDT. Triaged by Habib (Muse).**

## What Alex wants

The Metrics section (CODE / HYPE / Compare nested tabs under the bottom-nav
Metrics button) should open on **Compare** by default, not CODE.

## Current state

- `app/src/app/(site)/metrics/page.tsx` redirects `/metrics` to `/code`,
  with the comment "CODE is the default Context view."
- `METRIC_VIEWS` in `app/src/lib/metric-navigation.ts` lists CODE first,
  then HYPE, then Compare. Tab order follows this array.
- Existing page URLs (`/code`, `/hype`, `/compare`) must keep working.

## The change

1. `/metrics` redirects to `/compare` instead of `/code`. Update the comment.
2. Reorder `METRIC_VIEWS` so Compare is first. Tab order becomes
   Compare, CODE, HYPE.

That is the whole task. No URL changes, no content changes, no new tabs.
Keep the "Development and attention data" disclaimer behavior as is.

## Acceptance

- Tapping Metrics in the bottom nav lands on Compare.
- `/metrics`, `/code`, `/hype`, `/compare` all still resolve.
- Tab order reads Compare, CODE, HYPE on desktop and mobile.
