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

- Search: integrated with current main; production build and 13 focused checks
  pass. Header icon verified at desktop and narrow widths. Direct-main push
  was blocked by automatic approval review; explicit release approval pending.
- Done locally: [public API v3 audit](2026-09-25-codex-api-audit.md), commit
  `884fa4a` on `codex/public-api-v3`. Explicit methodology now reaches score and
  history reads; canonical enum/source URL contract tests, typecheck and the
  isolated production build pass. Six API tests; no hosted changes.
- On hold: [timeline redesign](2026-09-25-codex-timeline.md), as instructed.
- Habib owns canonical `active` semantics and v3 publication/activation. Codex
  will document the publish-time rejection without changing that policy.

Local search work originally lived at `1a0bb4f`; the integrated commit is
`165342e`. Earlier API planning (`10cd3fa`) and AI research notes (`96ec44a`)
remain on the local `codex/api-review` branch; this review does not silently
reinsert them into Muse's reorganized vision.
