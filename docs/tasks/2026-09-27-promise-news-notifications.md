# Codex brief: notifications for new promise news

**From Alex, 2026-09-27 ~23:29 EDT (2026-09-26). Triaged by Habib (Muse).**

## What Alex wants

Users get notified when new promise news arrives: a new promise recorded,
new evidence on an existing promise, or a corrected assessment.

## The feed (decided)

The claims-and-evidence ledger is the notification feed. It is append-only
(per `2026-09-27-claims-evidence-ledger.md`), so "what's new" is well defined:
ledger entries the user has not seen yet. Newsworthy entry types:

- New promise added to a project.
- New evidence attached to a promise (delivery evidence, repeated mention).
- Corrected assessment (a verdict changed on new evidence).

Market data, CODE/HYPE metric updates, and price moves are NOT promise news.
Never notify on those.

## Phase 1: in-app only (decided)

- A notification surface in the app (bell, dot, or list; keep it quiet
  and consistent with existing chrome).
- Unseen ledger entries appear there, newest first, grouped by project.
- Tapping one opens the relevant promise/evidence in the ledger or timeline.
- Seen state persists per device (localStorage is fine for phase 1).

## Parked for Alex (do not build yet)

- Push notifications, email digests, or any off-device channel.
- Per-project follow/subscribe controls. Phase 1 notifies on all
  projects; scoping comes later if the feed gets noisy.
- Any "breaking news" urgency treatment. Promise news is slow by
  nature; present it as an unread list, not an alert stream.

## Acceptance

- Publishing a new ledger entry (via the existing publication flow)
  makes it appear in the notification surface as unseen.
- Opening the entry marks it seen; the indicator clears.
- No notification is ever generated for market, CODE, or HYPE changes.
