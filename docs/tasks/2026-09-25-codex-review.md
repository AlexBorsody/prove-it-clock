# Codex project review — September 25

Reviewed Muse's `03ee1e1` across the docs, pages, data readers, API, publication
validation and migrations. Search is integrated separately on top, preserving
the header heart/home icon, CODE sorting and promise icons. Work uses an
isolated checkout so Muse's server and working tree stay untouched.

## Feedback for Muse / Habib

1. **V3 cutover: resolved during review.** At `03ee1e1`, the reader selected v2
   while public explanations described v3. Muse then published the v3 run and
   switched the reader in `ba33662`; the live site now shows XRP 2/4 and BAT 2/3.
   That update is preserved in the search integration. README's schema-v2
   publishing instructions and the implementation opening still need updating.
2. **Keep unknown assessments unknown.** Project, home and comparison models
   turn a missing assessment into `[]`; `verdictFor([])` produces a clean 1/10.
   Preserve availability and omit the verdict for unavailable assessments.
   A failed project-history read should also be a retryable error, not a 404.
3. **Preserve missing HYPE data.** `hype-share-chart.tsx` replaces missing
   mentions with zero. `heart-data.ts` reads the oldest 1,000 global / 500
   per-project rows, eventually freezing “latest” data. Read a recent window,
   keep gaps, and count successful complete periods per project for the
   eight-week baseline; failed snapshots currently count toward it.
4. **Align preflight with SQL.** `heart-publication.ts` accepts a promise's
   removed `reward` property; migration 006 rejects it. Reject it in dry-run
   too. The v3 draft still needs analyst review: e.g. BTC's first fulfilled
   promise cites its whitepaper as the only evidence. That establishes the
   promise, not delivery/usage. The subsequently published run distinguishes
   researched BTC/ETH from six carry-overs pending research; preserve those
   qualifications and check delivery evidence as that research progresses.
5. **Small doc cleanup.** Vision still says “one or two” hearts and core gating;
   README/appendix links still point to moved case-study paths. Preserve the
   archive, fix links, and keep one current task-status block rather than
   treating old daily-log instructions as today's queue.

These are bounded fixes within the current architecture. No new backend
framework, scoring formula, database project or extra product surface is needed.

## Codex queue

- Search: live on Vercel from `3864b57`. Production build/type checks and
  13 focused tests passed. Live index: 307 sections across 25 pages, no failed
  pages; repeated requests reuse the cached timestamp. Searched “double spending”
  and verified navigation/focus to the exact Bitcoin promise container.
- Done locally: [public API v3 audit](2026-09-25-codex-api-audit.md), commit
  `884fa4a` on `codex/public-api-v3`. Explicit methodology now reaches score and
  history reads; canonical enum/source URL contract tests, typecheck and the
  isolated production build pass. Six API tests; no hosted changes.
- On hold: [timeline redesign](2026-09-25-codex-timeline.md), as instructed.
- Habib owns canonical `active` semantics and v3 publication/activation. Codex
  will document the publish-time rejection without changing that policy.

Local search work originally lived at `1a0bb4f`; the integrated commit is
`165342e`. Earlier API planning (`10cd3fa`) remains in Git history. AI research notes
are preserved in `docs/archive/ai-promise-research-2026-09-25.md`, linked from
the existing vision research section; current scoring rules stay unchanged.

## Current ownership — search and responsive layout

Codex owns the search rollout and narrow viewport fixes (header/search, bottom
navigation, CODE rows, project evidence overflow). Work stays in the existing
isolated checkout; shared servers stay running. Before publishing, fetch main
and preserve newer changes. Vercel is the shared dev site; completion requires
checking that deployed search and mobile layout actually work there. Muse's
v3 publication is already included; timeline redesign remains on hold.

Responsive changes: six navigation tabs fit phone widths; CODE metrics move
to a second row; evidence links wrap and the promise rules table scrolls within
its container. Tour controls are explicit and its mobile panel stays on-screen.
Keep the existing upper-left Home heart. No database or scoring changes.

Live responsive checks: CODE and navigation at 320/430/768/1280px; exact
search link and Home icon; 320px project rules table scrolls inside its panel;
Compare, methodology and API pages stay within the viewport. Tour Close/Next
controls are visible on a 320px screen. Follow-up CSS wraps homepage hearts
and HYPE ranking rows after those two remaining overflows were reproduced.
Manual recheck: 320px homepage, HYPE ranking, then Tour → Next → Close.

## Shared-dev sync repair — September 26

The `a3daeda` sync removed search wiring and mobile controls; `1bac0dd`
restored the new helper files but left out LinkeDOM, the header integration,
page section tags and document tracing. That Vercel build failed. Codex is
restoring those reviewed pieces while preserving CODE Follows/watchers and
all September 26 research fragments and publication artifacts.

Local checkout now uses `main`, tracking `origin/main`; the older local-only
main commit is preserved on `backup/main-before-sync-20260926`. Local 3101
returns `503 Heart database unavailable`; no Supabase read settings exist in
`app/.env.local`. Vercel returns eight published projects. Use Vercel for data
acceptance until local read access is configured, not the stale 3101 build.

Working agreement: fetch/merge before editing and again before pushing; use
Git to integrate work, not directory copies over shared files. Record ownership
here, preserve other changes, and verify the deployed commit, API and search
before calling a task done. Local development uses `next dev` with database
read settings; a running `next start` does not rebuild after a pull.

Read Muse's latest `2026-09-26-codex-promise-pipeline.md` and the durable
research methodology in implementation.md. Next bounded task: fragment
scaffolder, then validated merge tooling, then queue execution. No research
or hosted publication is part of this sync repair; timeline stays on hold.
