# Prove-It — Technical Implementation

**Revised 2026-09-25.** [Game design](game_design.md) defines what to build;
[hearts-algorithm.md](hearts-algorithm.md) defines the rule. This document
describes the system as it actually runs. (The v0.2.0 scorer, its pipeline,
and its pages are retired but preserved in git history.)

## Current system

| Layer | Location | Behavior |
|---|---|---|
| App | `app/src/app/` | Next.js pages and API routes, deployed on Vercel (auto-deploy from `main`). |
| Pages | `app/src/app/(site)/` | Home = project cards with heart meters; `/projects/[slug]` = meter + heart-history graph + promise evidence; `/methodology` = the rule. |
| Reads | `app/src/lib/heart-data.ts` | Server-side reads of `heart_runs` / `heart_rankings` (latest published run for the active methodology). |
| API | `app/src/app/api/hearts[/[slug]]` | `GET` rankings and per-project heart history. Read-only. |
| Publication | `db/migrations/002_heart_publications.sql` | Append-only `heart_runs`, `heart_snapshots`, `heart_market_observations`; `publish_heart_run(document)` RPC validates and writes one run atomically. RLS: no direct writes, ever. |
| Arithmetic | `app/src/lib/hearts.ts` | Pure functions: claim-type rule, capacity/core clipping. Tested (`npm run test:hearts`). |

Flow: analyst writes a publication document → dry-run validation → `publish_heart_run`
→ Supabase → server readers/API → meter + graph. No backend service, no scheduler.

Published runs (all claim-type rule v2): `hearts-2013-01-01`, `hearts-2017-06-01`,
`hearts-2018-06-01`, `hearts-2019-06-01`, `hearts-2021-06-01` (backdated
reconstructions from case-study evidence), `hearts-claimtype-2026-09-25`
(current). Artifacts live in `db/seed/heart-runs/`.

## Invariants

- Snapshots are immutable; runs are append-only; history is never rewritten.
- One run_key per run; conflicting payloads fail visibly (the RPC raises, nothing partial writes).
- Missing evidence is unavailable, never zero. Announcements never change scores.
- Reads go through the `heart_rankings` view (published runs only). The publishable
  key is enough for every page; the service role is used only to publish.
- Secrets stay in ignored env / deployment configuration, never in the repo.

## Checks

`npm run test:hearts` (arithmetic), `npm run test:db` (migration + RPC),
`tsc --noEmit`, `next build`. Publication artifacts validate with the dry-run
before the RPC call.
