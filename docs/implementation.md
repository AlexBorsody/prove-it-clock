# Prove-It — Technical Implementation

**September 22, 2026.** [Game design](game_design.md) defines what to build.
This document covers architecture, data contracts, and delivery. Proposed
hearts storage/API changes below are not implemented or finalized migrations.

## Current system

| Layer | Location | Current behavior |
| --- | --- | --- |
| App | `app/src/app/` | Next.js pages and API routes, deployed on Vercel. |
| Chart | `app/src/components/timeline-*.tsx` | Shared SVG renderer for project pages and embeds. |
| Reads | `app/src/lib/data.ts`, `history.ts`, `supabase.ts` | Server-side Supabase reads; project details/milestones still use bundled seeds. |
| Providers | `app/src/providers/` | CoinGecko, DefiLlama, Bitcoin adapters. |
| Pipeline | `app/src/pipeline/` | Writes local metrics, scores, and explanations. |
| Loader | `app/scripts/load-snapshot.ts` | Inserts scores/explanations with conflict-ignore; verifies score count. |
| Schema | `db/migrations/001_initial.sql` | Projects, observations, methodology versions, snapshots, components, events, explanations. |

Flow: providers → local observations → deterministic scorer → loader → Supabase
→ server readers/API → chart. Keep this structure; no new backend service.

Active output remains v0.2.0 for six projects. The hearts model needs a new
approved methodology identifier; existing speculative v0.3.0 already represents
a different config. Preserve both historical datasets.

## Proposed data model

Reuse project, evidence, and methodology references. Add only what the approved
heart rules require; settle exact tables and constraints before writing DDL.

| Record | Required information |
| --- | --- |
| Promise revision | Project, promise, success criteria, reward hearts, publication/effective date, recorded-at time, evidence links, supersession reference. |
| Assessment | Project, methodology, maximum hearts, starting allowance, rationale, input/evidence revision. |
| Delivery event | Promise revision, fulfillment/change date, recorded-at time, evidence, and reward provenance. |
| Heart snapshot | Project, date, methodology, capacity, remaining starting allowance, delivery/decay breakdown, filled hearts, availability reason, run/input references. |
| Completed run | Run date, input/config identity, expected coverage, completion state, artifact references. |

Snapshots are immutable. Enforce natural-key uniqueness, finite nonnegative
heart values, filled hearts ≤ capacity, and consistent unavailable/null states.
Missing evidence must not become a zero score. Store effective and recorded-at
dates separately so later research cannot masquerade as an earlier observation.

Valuation stays absent until its method is approved; do not add speculative
price fields or convert hearts to dollars in the frontend.

## API and frontend contract

Existing endpoints: `GET /api/projects` and
`GET /api/projects/[slug]/history?metrics=<csv>&from=<date>&to=<date>`.
Keep legacy responses stable while defining an additive or explicitly versioned
hearts contract; do not silently reinterpret existing score codes.

A heart-history point needs date, methodology, filled hearts, maximum hearts,
availability, observed/reconstructed provenance, and references explaining the
change. The current-value meter and timeline must use the same completed snapshot.
Validate date ranges, paginate complete history, and apply filters to every series.

Adapt the shared SVG to variable capacity and a maximum reference line. Preserve
missing-data gaps and version boundaries. Render the compact pixel-heart meter
from the same values; keep scoring and decay calculations server-side.

## Integrity work before daily operation

- Make local artifacts immutable. Reject stale/partial inputs; do not treat any raw-cache hit as a completed ingest.
- Validate allowed projects, score codes, numeric bounds, methodology/config identity, and explanation coverage in the existing loader.
- Publish a run atomically or only after a completion marker. Scores and explanations currently write separately.
- Identical retries are no-ops; conflicting existing payloads must fail visibly. Verify values and explanations, not only row counts.
- Persist or expose snapshot-linked observations/components. Fix zero-age/empty-evidence mappings and latest-metric selection in current readers.
- Propagate DB errors, replace broad history scans with indexed filtered/latest queries, and bound caches.
- Inspect deployed grants/RLS before migrations; separate read credentials from the ingestion writer. Apply DB invariants to historical writes.

`npm run daily` runs pipeline then loader; it is not a scheduler. Schedule only
after a complete run and safe rerun are verified. Scheduler location remains open.
Historical SQL batches in `db/seed/` are not an ordered bootstrap sequence.

## Delivery order and checks

1. Feature freeze. Complete evidence-first BAT and XRP case studies under the
   current heart methodology: reconstruct major promise lineages from dated
   primary sources, predefine fulfillment criteria and rewards, calculate
   mechanically, surface every judgment and evidence source in the UI. The
   researcher works blind to Alex's illustrative scores. Report methodology
   ambiguities instead of inventing rules. No new features until both pages
   survive scrutiny; BTC/LINK after.
2. Specify migrations and the shared API contract against those rules; implement versioned calculations and reliable persistence.
3. Wire the meter and graph. Verify evidence-backed gains, non-delivery decay, differing capacities, missing data, and historical reproducibility.

Run typecheck/build and targeted checks for changed behavior. Test loader retries
and incomplete-run failures before deployment; spot-check API/card/embed agreement.
No new test framework or provider is needed for this scope.

Codex owns backend work alongside Muse. GitHub access is verified; direct
Supabase/Vercel management access remains unverified in this checkout. Existing
local credentials/project setup are needed before live schema checks. Secrets
stay in ignored env/deployment configuration. See [README](../README.md) for
commands and [daily logs](tasks/) for progress.

## Case-study work in progress — September 24

The first delivery task has [BAT and XRP evidence worksheets](case-studies/README.md).
Sources, candidate lineage judgments, conditional calculations and manual tests
are available for review. [Alex/Muse questions](case-studies/review.md) are tracked
in Markdown. These are non-blinded research drafts, not accepted ratings or live
pages; feature development remains frozen pending the case-study review.
