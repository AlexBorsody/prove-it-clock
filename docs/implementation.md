# Prove Value: Implementation Plan

**Updated 2026-09-27.** [vision.md](vision.md) is the product authority.

**Current priority:** [evidence over ranking](tasks/2026-09-27-codex-tonight-decisions.md).
Remove the project warning score, preserve the heart inventory, and build the
source-linked timeline. Qualitative weights and new ranking algorithms are
parked. PR #8 retains only unweighted composition and pinned evidence receipts;
older weighted-verdict and warning instructions below are superseded.
The [timeline handoff](tasks/2026-09-27-timeline-foundation.md) now supplies the
event taxonomy and examples; gaps and implementation notes belong in that brief.

## Published evidence receipts (2026-09-27)

The delivery composition partitions the published inventory into kept,
lapsed/retired, open/in-progress and unknown counts. Each promise counts once.
There are no weights, verdict categories, project-level scores or new ordering
rules. Its evidence links use `/projects/[slug]/evidence?run=...&methodology=...`
with the assignment revision and optional category, group or promise filter.

The reader selects the exact published `heart_runs.id` and then paginates only
that run's `heart_rankings`. Missing runs, changed category versions and database
outages are explicit; none falls back to the newest assessment. The project
header, composition and Atlas share the request-cached ledger. These reads use
the existing schema; no migration, scoring publication or activation is part
of PR #8. A receipt preserves what was recorded; it does not validate the
research or invent event dates for the upcoming timeline.

## Promise event timeline v1 (2026-09-27)

The four-event taxonomy in [the foundation brief](tasks/2026-09-27-timeline-foundation.md)
is the current contract: `promise_stated`, `promise_repeated`, `evidence`,
`assessment`. It supersedes the older seven-event draft below.

### Storage and write contract

`007_promise_event_history.sql` extends the existing Supabase publication model
with `promise_history_revisions`. It does not alter heart publications or the
legacy `project_events`. A revision stores a small project's complete immutable
history; new events append to the exact previous revision. This deliberately
avoids a second mutable promise catalog. Large histories may later need event
normalization/pagination; this first release is for the current curated cohort.

`publish_promise_history(document)` accepts:

- `schema_version: 1`, a stable `revision_key`, `project_slug`, `ledger_run_id`,
  actual `author`, and `previous_revision_id` (null for the first publication).
- `events`: only the new events. Every event has `id`, `lineage`, `kind`,
  `occurredOn` (`YYYY`, `YYYY-MM` or `YYYY-MM-DD`), `summary`, actual `author`,
  and `source: { url, title, publishedOn, locator?, quote? }`.
- Original statements also have `speaker` and the ledger's `claimType`.
  Repeats have `originalId` and `wordingChange` (`same`, `narrowed`, `expanded`).
  Evidence has `stance` (`supports`, `refutes`, `context`) and nonempty
  `provenance` notes. Those notes must retain attribution/subsidy/bot caveats.
- Assessments have `runId`, `methodology`, the exact published `state`, and
  `supersedes` (null or a prior same-lineage assessment ID). A correction needs
  `correctionReason`. Its date must match the run's actual server-recorded
  publication date, never a historical delivery date inferred from its state.

The RPC validates lineage against a real published project assessment. It
serializes per-project updates, rejects conflicting retries and stale parents,
preserves all previous events, and stamps `recordedAt` itself. The event's
source URL/date describes its evidence; `occurredOn` describes the event;
`recordedAt` describes arrival in this ledger. They are never interchangeable.
No public write route is added. Anon/authenticated roles can read; only the
existing authorized service writer can call the publication RPC. Updates,
deletes and truncation are rejected. Database administrators remain a trust
boundary, as with heart publications.

### Read and display

`readPromiseTimeline` selects one revision from Supabase, with optional exact
revision ID. The project page server-loads it into the shared timeline component.
No live news/provider calls, weights, scoring functions or legacy timeline
reconstruction feed this view. Source text is rendered as text; links permit
HTTP(S) without embedded credentials.

The vertical timeline stays legible at 360px and includes keyboard-operable
event details, type/stance labels, source provenance and visible assessment
corrections. Filters select records only. The date switch distinguishes event
chronology from ingestion chronology; display spacing is not elapsed time.
Assessment details link to the run-pinned evidence receipt and promise anchor.
A missing revision or database failure never becomes an empty history.

### Release sequence

1. Review the code/migration and source gaps in the foundation task. Local
   PostgreSQL fixtures are not research acceptance or hosted schema verification.
2. Apply 007 to the explicitly confirmed Supabase target through the established
   migration process. No target is guessed or changed by this task.
3. Review and publish the first real event batch through the RPC. Original
   Codius sourcing and a real correction pair remain editorial handoffs.
4. Check the public project timeline against that revision. Before migration it
   reports unavailable; after migration and before publication it reports empty
   coverage. Neither condition claims a project failed or did nothing.

## Proposed company domain — Tesla first

Alex supplied a Speculative Tech / Stocks brief on September 27. The
[scope and reuse review](tasks/2026-09-27-stocks-v1-scope.md) records the phased
work, guidance-target versioning and unresolved ranking/ownership decisions.
It is separate from the crypto timeline rollout. The present crypto writer
cannot accept company records unchanged; preserve its contract while adding
domain adapters. No company data, ranking or valuation model is activated.

## Prior implementation history

The [verdict-layer tasks](tasks/2026-09-26-verdict-layer.md) are the latest
product direction: a published-ledger summary near the top of project pages,
with category rankings. They supersede the Atlas brief's restriction on
category performance rankings; the Atlas remains the supporting evidence
view. Implementation caveats and handoff are recorded in that task's review.
The [Promise Atlas v1 plan](#promise-atlas-v1-implementation) below and its
[task queue](tasks/2026-09-26-promise-atlas.md) supersede older embeddings-first
and Index formula instructions. Atlas build progress and acceptance results are recorded in that queue; the
rest of this document includes earlier implementation history.

## Layer-by-layer build sequence (Alex, 2026-09-27)

Standing rule: one layer at a time, stay focused. Each layer's open
questions get resolved before that layer builds. Habib and Alex resolve
methodology questions; Codex writes the in-depth technical spec per
layer. What follows is the light spec: what gets built and what gates
it. No layer starts until its questions are answered.

### Layer 1: Evidence ledger

The foundation. Everything else reads it; nothing rewrites it.

Light spec: append-only promise/event store (extend migrations 001/002;
do not fork a parallel pipeline). Event types: promised, repeated
mention, delivered, lapsed, retired, assessed, corrected. Every event
carries promise lineage, occurred-at (possibly unknown) and recorded-at dates,
source URL and locator, quotation where captured, and author. Corrections append
with a predecessor reference; originals stay inspectable. The timeline renders real
recorded events only; unknowns are labeled, never interpolated.

Muse's [claims-and-evidence brief](tasks/2026-09-27-claims-evidence-ledger.md)
extends the data contract to typed claims and domain-scoped instruments.
Finish crypto first; do not build other domain pages or a universal formula.

Questions to resolve first:
- Event contract finalization. Habib owes Codex four sourced examples
  (original claim, repeat mention, delivery evidence, corrected
  assessment) with dates, URLs, lineage, and missing fields.
- XRP/SWIFT: research the exact attributable claim before touching
  xrp-p01. "Replace SWIFT" is not a ledger fact until sourced.

### Layer 2: Impact model

Versioned judgments about significance, reading the ledger.

**2026-09-27 calibration work:** Alex requested immediate weight/algorithm
investigation. The [calibration task](tasks/2026-09-27-ranking-calibration.md)
and its generated report compare candidate ratios against the captured ledger
without publishing scores. This analysis can proceed now; missing usage,
independent-obligation decisions and weight approval still gate activation.

Light spec: a versioned model with published dimensions, normalization,
and weights. Inputs: ledger outcomes plus usage observations. Outputs:
potential significance and realized impact per promise/project, with
inputs and calculation exposed. Importance weights live here as model
judgments, never as ledger facts. Missing evidence renders as
incomplete, never zero. No double counting across overlapping terms.

Questions to resolve first:
- The 1/2/4 importance draft is unreviewed. Needs parent/child
  allocation rules (XRP p03/p04) and a rubric amendment separating
  tier from the v3 core flag.
- USE metrics need attribution rules: BAT MAU is not BAT users;
  Ripple Payments volume is not XRP-routed volume; bot/subsidized
  load caveats; self-reported data handling.

### Layer 3: Category indices

Per-category comparison. No universal score, ever.

Light spec: indices computed per category from the ledger plus the
impact model. Each index shows delivery, potential significance, and
realized impact as inspectable components. Not applicable,
insufficient evidence, and low performance are three separate states.
The verdict/warning stays independent: a strong category result never
erases a documented core failure.

Questions to resolve first:
- Promise category taxonomy (Atlas v1 needs it too).
  Atlas v1 already has a versioned taxonomy and assignments; review their
  boundaries and suitability for impact comparisons rather than replacing them.
- Shitcoin warning formula (under review with Alex's friend).

### Layer 4: Valuation

Market context now; a modeled gap only when the model exists.

Light spec: market cap beside the delivery/impact profile from the
existing bounded CoinGecko batch. Context only, never an input to
delivery or impact. A modeled valuation gap ships only with a
versioned model publishing its assumptions, coverage, and
uncertainty. Never average category scores into a valuation.

Questions to resolve first:
- The valuation formula itself (research, not presumed).
- Token-vs-product benefit connection, per project (editorial).

### Explanation layer (spans all layers)

Light spec: `/glossary` v2 (richer entry schema; single source for
inline definitions), `/learn/value` (six worked examples, one
interactive), and the "What gives this asset value?" project section
(five fixed questions, evidence labels per statement, clean empty
states). No new scores. Full brief:
[tasks/2026-09-27-value-explanation-layer.md](tasks/2026-09-27-value-explanation-layer.md).

Each value explanation must separate functionality, actual demand, realized
impact, token benefit and valuation assumptions. Link statements to dated
evidence or a named model; do not promote an issuer claim or a working product
into proven demand, impact or token value. Apply this to monetary assets too.
Market-wide co-movement is context for the investigation, not an attribution
of all value to Bitcoin or a measured percentage of speculation.

Questions to resolve first:
- Per-project value-thesis content is editorial (Habib/Alex supply;
  Codex does not invent it).
- Exact store-of-value test wording for Bitcoin.

## Active implementation: hearts and verdict

Alex approved the design review and requested continued implementation plus
direct Markdown coordination with Muse to ship the verdict visualization.
The [ten-question review and proposed contract](tasks/2026-09-26-hearts-verdict-review.md)
is the single proposal for weighted delivery, outcome coverage, core findings,
retirement semantics and gaming defenses. Its implementation sequence remains
active under [the shared contract](tasks/2026-09-26-hearts-verdict-contract.md).
It does not revive the superseded Index plan.

Extend the existing versioned publication/reader/evaluator path;
do not create a second promise-scoring pipeline. The plan requires reviewed
weights and provenance, distinct fulfillment/lifecycle facts, confirmed missed
milestones, one pinned result across page/API/receipts, and a compatible
published run before activation. Existing editorial questions remain in the
[verdict task](tasks/2026-09-26-verdict-layer.md#research-sign-off-still-required).
Preserve v3 interpretations and the rendered algorithm appendix until a
compatible reviewed publication can activate the new contract.

**Latest direction: category indices and separate valuation.**
The [layered architecture](tasks/2026-09-26-layered-ranking-architecture.md)
and [no-universal-score decision](tasks/2026-09-26-codex-no-universal-score.md)
supersede plans for a cross-category overall score. Keep the unranked browser
and existing category delivery ranks. Evolve category models to expose
delivery, potential significance and realized impact, with reviewed usage
inputs. Preserve distinct not-applicable, insufficient-evidence and measured
low-performance states. No invented weights or new publication.

**Separate records from model judgments.** Keep event/assessment provenance
and frozen published results. Version impact and ranking calculations
independently and pin their ledger revision; changing a model cannot rewrite
delivery history. Stored importance inputs are attributed model judgments,
not additional evidence that delivery occurred.

**Market-cap comparison:** show observed market cap as context now. A future
valuation model needs its own version, token value-capture assumptions,
overlap accounting, coverage and uncertainty before displaying a value range
or gap. Do not average category indices into a universal score or dollars.
Market cap stays outside delivery/impact inputs. This clarification adds no
schema migration, valuation code or active-methodology switch.

## Promise history and timeline

**Layer 1 technical proposal, 2026-09-27. Not built or approved for publication.**
The meter, Atlas and timeline expose different questions over one sourced
ledger. Accumulated evidence history is the durable product asset.

### Inspected foundations and migration boundary

The checked-in published artifact `hearts-promise-2026-09-26.json` contains
115 distinct promises across eight projects under v3. Every record has an
`evidence` list and `effective_at`, but none separately stores claim sources,
outcome evidence, assessment dates or transitions. These are coverage gaps,
not evidence that the linked sources or historical events do not exist.
For BTC P1, `effective_at` is 2009-01-03 while its reference names the
2008-10-31 whitepaper. Backfill must classify these dates and links first.

- Migration `001` has project-level `project_events(event_date, created_at)`.
  It lacks promise lineage, correction provenance and append-only protections.
  Preserve its legacy readers while extending the existing database.
- Migration `002` protects published runs/snapshots against UPDATE/DELETE.
  Reuse that publication mechanism and the shared published-ledger reader.
- PR #8 (`1417625`) proposes separate claim/outcome sources, nullable dates,
  assessment transitions, independently versioned importance and pinned
  receipts. Reuse those contracts after review. Embedded transitions still
  need stable event IDs and correction references for a public event history.
- `history.ts` derives a legacy kept-count series from milestone seed dates.
  That series and the old heart sparkline are not inputs to this timeline.

This is a repository audit, not verification of hosted database enforcement.
No v3 record is rewritten or reinterpreted to populate the new view.

### Event contract and write path

**Claim identity boundary:** events reference a stable claim, with domain and
subject identity. For this first slice, map the existing crypto project and
promise lineage without replacing its ID or maintaining a second claim list.
The proposed `claim_kind: promise` is distinct from the existing `claim_type`
(`milestone`/`ongoing`), which describes a promise's obligation. Preserve those
stored meanings. Other claim kinds can later use this evidence contract with
their own instruments; do not give them synthetic promise outcomes. Exact
column/foreign-key choices follow the example review, not a generic framework.

Zero recorded promises means the delivery instrument is not applicable to
that inventory, with coverage disclosed. It does not prove the subject made
no promises or earned a perfect result. A failed data read remains unavailable.
The crypto meter/warning never becomes a default score for another domain.

Keep source events distinct from published judgments. A repeated statement or
community note does not change the promise's outcome. The event vocabulary
must be reconciled against Muse's four examples and PR #8's transitions before
DDL: the current briefs use both `delivered`/`fulfilled` and
`assessed`/`assessment`. No silent enum aliases with different meanings.
Evidence of a delivery becomes a kept outcome only through the existing
reviewed assessment/publication process.

| Contract field | Rule |
|---|---|
| Identity | Stable event ID and claim identity; the crypto mapping preserves project/promise lineage. Repeated mentions share the claim but have their own event IDs. |
| Time | Event date/time with explicit precision, or unknown; preserve date-only sources without inventing an exact time. Database-generated `recorded_at` means arrival in our ledger. Source publication, observation and assessment dates remain distinct. |
| Provenance | Source roles, URL, locator, actual author/collector and rationale. Reuse the reviewed source type; quotations only when captured exactly. Retain source capture time/hash where available without implying that a hash proves truth. |
| Assessment | Published run and methodology for grading events; a source-only claim need not pretend it was made under today's methodology. Link the assessment explanation and fulfillment test from that run. |
| Correction | New event points to an existing predecessor in the same lineage and records why it was corrected. Preserve the original and the correction chain. |
| Retry | A stable ingestion key returns the existing event for identical content; the same key with different content fails. A source URL alone is not a unique event key. |

Extend the existing Supabase ingestion/publication path; introduce only the
promise-event storage and references needed by these examples. The public
reader gets no write credentials. Alex permits notes from anyone: attribute
them as notes through a validated server write path, never as reviewed
outcomes or authority to publish scores. Submission details belong to the
event-contract review; this does not require another grading pipeline.

An immutable history revision must identify the exact events shown. Pin that
revision alongside the published assessment run, so later notes or corrections
cannot change a shared historical receipt. New notes may advance history
without a new score publication. A correction does not silently recalculate
an existing score. Publish the revision and its event references atomically;
on failure, readers retain the previous complete revision.

Ordinary writers cannot update, delete or truncate published events or their
revision membership. Validate correction references and reject cycles or
cross-lineage targets. Verify grants, triggers and rollback behavior locally
before a separately authorized hosted migration. Database administrators remain
a disclosed trust boundary; append-only application access is not tamper-proof
storage against an administrator.

### Read contract, API and timeline

Extend the existing reader with a project history result containing availability,
run ID, history revision, source methodology, event coverage and dated/undated
events. Page reads stay on that revision. Unknown project/revision, an empty
known history and a database outage remain different responses. Reuse the
versioned API's validation, safe-link and error conventions if exposing the
reader publicly; document the contract in OpenAPI before adding a route.
Do not change the meaning of the legacy history endpoint in place.

The project timeline reads this result, not GitHub, market or social providers.
It uses one lane per promise and dated markers with a visible type/status.
Markers open the source, explanation and exact promise receipt. A toggle
switches between event time and recorded time; undated events remain available
in a list rather than being assigned the publication date. Methodology markers
require an actual recorded publication change. No interpolated score line.

Default to material+core only when the pinned, reviewed model supplies those
designations. Until then show all promises and disclose missing importance;
never guess materiality or equate the v3 core flag with a draft tier. Pan or
scroll within the timeline, retain readable promise labels and provide the
same events in a keyboard-accessible list. All links into the meter, Atlas or
timeline preserve their run and history revision.

A gap means no events recorded for that period. It cannot establish no work,
no usage or a lapsed promise. Late discovery appears at its actual recording
time in the as-known view, even when a reliable source dates it years earlier.

### Bounded implementation and acceptance

1. **Muse supplies four sourced examples**, already promised in the
   [layer sequence](tasks/2026-09-27-codex-layer-sequence.md): original claim,
   repeated mention, delivery evidence and corrected assessment. Codex maps
   them to this contract and returns unresolved fields; no invented backfill.
2. **Storage/read PR:** migration and compatible writer/reader with these
   fixtures. Test identity, retries, correction chains, append-only privileges,
   atomic revision publication, pinned pagination and empty/error separation.
   v3 publication/read behavior must remain compatible. Verify empty claim
   inventories never receive perfect delivery or a domain-inappropriate meter.
3. **Timeline PR:** consume the same records on a project page, with pinned
   evidence links, date precision, undated list, filters and accessible mobile
   behavior. Test a correction, late-discovered event and missing date at narrow
   and desktop widths; verify filtering changes neither positions nor history.

Review before activation. No scoring weights, automatic decay, usage inference,
valuation formula or hosted changes are authorized by this spec. The latest
audit, file ownership and questions live in the
[layer-sequence handoff](tasks/2026-09-27-codex-layer-sequence.md#codex-reply-repository-review-and-scope).

## Delivery verdict and homepage rankings (2026-09-26)

The new delivery summary is a read-only view of the active published ledger.
`getPublishedLedger()` uses React's request cache: the project header, promise
list, delivery card and embedded Atlas use one immutable run per render.
`getPublishedAtlas()` adapts that same dataset; `summarizeDelivery()` supplies
both the card and homepage categories. No new table, RPC, publication or score.

- `promise-verdict.ts`: exact state totals, primary-category counts and receipt
  URLs. Missing assessments return unavailable, not zero. Atlas's pinned state
  mapping preserves unknown. Evidence links add `scope=primary` so their
  population agrees with each category's denominator.
- `scoreboard-ranking.ts`: category kept share, competition ties, nonmembers
  unranked, numeric context sorting and missing values last. All-projects
  browsing defaults to name order without ordinal ranks; selecting a category
  enables delivery ranks. Project headers have no overall rank badge.
  The client stores category/sort in URL parameters.
- `delivery-verdict.tsx`: near the top of each project, replacing the old
  PromiseStats block. Exact lapsed/retired/open counts stay separate. Data date
  and revision are disclosed. No inferred recent-lapse count.
- Market capitalization comes from one bounded CoinGecko universe batch,
  joined by existing canonical provider IDs. Projects outside that response
  remain unavailable. Context metrics never feed delivery counts.
- New publications refresh on new server requests. An already-open tab is not
  a live subscription; reload to see a newer revision. Receipt URLs intentionally
  show the current published ledger, not an archived immutable snapshot.

The existing warning formula is untouched. Correct arithmetic does not certify
research quality: the [verdict task audit](tasks/2026-09-26-verdict-layer.md#research-sign-off-still-required)
records outstanding source/claim concerns for editorial review.

## Prior system status (recorded before this planning pass)

The following snapshot is historical context, not a fresh hosted-data audit.
Atlas task A1 must establish current coverage from the published reader.

- Renamed to **Prove Value** 2026-09-26 (Alex: "I'd actually change the
  name to prove value"). User-facing copy, tab title, docs all say Prove
  Value; repo name `prove-it-clock` and the Vercel URL unchanged.
- 8 projects published, promise-heart rule v3
  (`hearts promise-heart rule v3 (adopted 2026-09-25; one promise = one
  heart; capacity = promise count)`). Current run:
  `hearts-promise-2026-09-26` (id `4a84b4a4-d7e3-40fe-bcfe-05ab0bd42f85`),
  all in Supabase via `publish_heart_run`. Older methodology runs remain
  as the immutable audit archive.
- Live site serves the latest run from `heart_runs` / `heart_rankings`.
- CODE data: GitHub fetcher exists (`/api/vitals/[slug]`, 8 curated repos,
  6h revalidation). Sort switch: Stars (default) / Forks / Follows / Commits;
  Follows uses `subscribers_count`. TEAM read (`app/src/lib/team.ts`, shown
  on /code rows): active contributors 90d / 365d, top-3 share of trailing-52w
  commits, and contributors recurring across quarters, from
  `/repos/{repo}/stats/contributors` (bots excluded). Read: Broad /
  Concentrated (top 3 >= 50%) / Thin (< 5 active in 90d) / Unknown (fetch
  failed or GitHub returned an empty body while computing, which must never
  render as a false zero). TEAM is development context only; it never moves
  hearts or the verdict. HYPE data: `social_snapshots` table +
  daily collector. USAGE data: none yet.
- UI 2026-09-26: slim sticky header with no brand wordmark (brand lives in
  the tab title only); search is a lone icon button that expands into a
  full-width field (Fuse.js over name/symbol/slug, coin icons, keyboard
  nav). Homepage goes straight to the rankings, no hero text. Bottom tabs:
  Scoreboard / Metrics / Methodology / API / Tour (walkthrough
  replay). Pixel-heart Home icon. Project grid: PROMISES / CODE / USAGE /
  HYPE power meters (Marvel-card pattern); CODE and HYPE bars scale to the
  current leader; CODE/HYPE rows are buttons into /code and /hype.
- UI 2026-09-25: teaching homepage (the question + four factors), mobile
  project cards, Shitcoin warning as a 1-10 meter (number only, no category
  labels). Every metric taps to its data: meter -> project verdict breakdown
  ("What feeds this meter" lists each failed promise), HYPE -> /hype,
  CODE -> /code.

Current earned scores (2026-09-26, promise-heart rule v3):

| Project | Hearts | Verdict |
|---|---|---|
| BTC | 9/16 | Shitcoin risk (meter 7) |
| ETH | 7/12 | Shitcoin risk (meter 7) |
| SOL | 7/11 | Shitcoin risk (meter 7) |
| LINK | 11/14 | Not a shitcoin (meter 1) |
| AVAX | 14/17 | Not a shitcoin (meter 1) |
| BAT | 7/17 | Not a shitcoin (meter 1) |
| XRP | 12/19 | Shitcoin risk (meter 7) |
| DASH | 5/9 | Shitcoin risk (meter 7) |

Failed lineages driving the risk verdicts: BTC p11 (anonymity), p12
(block-size raise); ETH p08 (full sharding), p09 (ASIC resistance), p10
(Plasma); XRP p07 (Forte gaming), p19 (Codius); SOL p08 (Saga); DASH p06
(merchant economy), p09 (onchain scaling).

## Site search

Search indexes the actual text of tagged HTML containers. Each has a stable,
namespaced `id` plus `data-search-title`, `data-search-kind`, optional project
and keywords. Shared `search-section` classes handle presentation; IDs identify
individual targets. `searchMeta()` supplies the contract. Preserve IDs when copy
changes and add the same tags to new content sections.

The dropdown searches titles, metadata and body text with the existing Fuse.js,
shows snippets and all matches in a scrolling list, and links to `page#section`.
Deep links open enclosing details panels and focus/highlight the target.
The server uses LinkeDOM to read rendered HTML; no page scripts run in the crawler.
Static docs and live project sections use the same path. New page types go in
`siteSearchPaths()`; published project routes are discovered from the database.

`GET /api/search-index` stores a shared index in Next's Data Cache. Crawl attempts
are cached for a rolling 24 hours, including failures. A search or every fifth
page visit in the browser session checks the index; after 24 hours, Next serves
the cached attempt while refreshing in the background. Each newer complete
index becomes the saved fallback. Failed or partial refreshes keep that last
complete index; on the first build, partial coverage is explicitly shown.
Cache scope is the deployment origin. Requests in one process share an active
crawl; simultaneous cold starts across instances can still duplicate it. Fresh
deployments/cache resets can warm again. This is request-triggered refresh,
not an unattended daily scheduler.

Set `SEARCH_SITE_URL` to this deployment's origin for non-Vercel hosting or a
custom local port; Vercel production uses `VERCEL_PROJECT_PRODUCTION_URL`
(generated deployment URLs may be protected), previews use `VERCEL_URL`, and
development defaults to localhost:3000.
Only allowlisted same-origin pages are read, with bounded concurrency/time and
no redirects. A protected preview must make its public pages reachable to its
own indexer. No external search service or database migration is needed.

Library review: [Fuse.js](https://www.fusejs.io/) fits this small dynamic site;
[Pagefind](https://pagefind.app/docs/running-pagefind/) primarily indexes generated
static HTML. [Next Data Cache](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)
provides shared daily caching. Verify with `npm run test:search`, typecheck/build,
then search body text, follow a cross-page result, and open a closed methodology
section from its result. Repeated index requests should retain `generated_at`.

## Promise Atlas v1 implementation

**Implemented 2026-09-26 from Alex's build brief; verification is recorded in the task queue.**
The [vision](vision.md#promise-atlas-v1) defines the product and taxonomy.
The [task queue](tasks/2026-09-26-promise-atlas.md) is the ordered execution
record. This replaces the earlier embeddings-first Atlas plan and Index
formula instructions. Do not build that superseded pipeline as a prerequisite.

### Current code inspection and first audit

Inspected main at `4bd9db5`; origin matched at the planning pass.

- Published reads: `app/src/lib/heart-data.ts`, `heart_runs` and the
  published-only `heart_rankings` view. `HEARTS_METHODOLOGY` selects the
  runtime methodology; use it rather than an Atlas-specific hardcoded copy.
- Scored promises live in `assessment.promises`. Current storage includes
  lineage, criteria, claim type, core, state, effective_at, rationale and
  evidence `{url, summary}`. The publication contract is in
  `heart-publication.ts`; SQL enforcement is in migration 006.
- `normalizePromiseState` maps legacy `active` to fulfilled without taking
  methodology. Do not call it blindly from the Atlas adapter. Current v3
  publication rejects `active` as ambiguous.
- The existing research contract defines `criteria` as what counts as
  fulfilled. Preserve that as the stored fulfillment test; do not require a
  newly named `fulfillment_test` field. No separate exact claim text,
  claim-source role, source locator or quotation is required by this schema.
- `promiseAnchor` / `promiseEvidenceHref` provide stable project links.
  `PromiseList` currently renders three promises by default; a later
  promise deep link needs to reveal its target before Atlas can rely on it.
- Next/React/Supabase and SVG are already available. Reuse their conventions;
  no new visualization framework or dependency is required by the plan.

A read-only audit of the checked-in artifact
`db/seed/heart-runs/hearts-promise-2026-09-26.json` found 8 projects, 115
promises, no duplicate `(project, lineage)` IDs, and states fulfilled 72 /
open 33 / lapsed 5 / retired 5. All 115 have `criteria`; none has a dedicated
claim-source field. The file says published, but this is **artifact coverage,
not verification of the current hosted dataset or original-source coverage**.
Evidence URLs may contain original claims without storing their roles.
No Atlas category assignments/configuration exists in the inspected tree.

Task A1 must repeat the audit against the actual current published run:
count projects/promises, duplicate or absent identities, observed state
values, source-role coverage, stored tests, missing assessments and existing
assignments. Record run/methodology/as-of and data-quality gaps in the task
notes. If live read access is unavailable, record that limitation and keep
artifact results explicitly separate. Do not infer production counts from
this document or use a seed fallback after a database failure.

### Data path and file responsibilities

```text
Published run + scored assessments (server, one pinned run)
  -> Atlas adapter / validation
  -> versioned taxonomy + assignments + coordinate manifest
  -> serializable Atlas dataset
  -> map, filters, accessible list and evidence details
```

| Location | Responsibility |
|---|---|
| `app/src/lib/heart-data.ts` | Reuse/extend published reads; select run once and page its rows by that run ID |
| `app/src/lib/atlas/` | Small types, adapter, validation, filtering and layout helpers; server reader kept separate from client-safe functions |
| `app/data/atlas-taxonomy.ts` | Stable category IDs, definitions, tags and taxonomy version |
| `app/data/atlas-assignments.ts` | Stable promise ID to primary/secondary category, tags, rationale and actual author/reviewer |
| `app/data/atlas-layout.ts` | Region geometry, slots, retained coordinates and layout version |
| `app/src/components/atlas/` | Map, controls, legend/info, details and accessible list; shared data and selection state |
| `app/src/app/(site)/atlas/page.tsx` | Server-loaded public route with explicit load-error state |
| `app/scripts/atlas-audit.ts` and `atlas.test.ts` | Read-only coverage report and focused integrity/interaction-helper tests |

These responsibilities now have implementations; the coordinate membership
manifest is `app/data/atlas-slots.json`. Reuse domain
shapes from `HeartPublication` where suitable; do not create another promise
store. A public API is optional: server props are enough for v1. If an endpoint
is later needed, document it in the existing OpenAPI spec, not a parallel spec.
No new database tables, migrations, collectors or publications are required.
Server credentials never enter the dataset or browser bundle.

Project detail pages also render `ProjectAtlas` after the promise panel.
This server component reuses the published-ledger reader and adapter, then
`projectAtlas` scopes the already positioned dataset to that coin. It sends
only that project's nodes/evidence/positions to the browser; occupied regions
retain their global coordinates. `AtlasExplorer`'s embedded mode reuses all
map/evidence/list controls with local filter state, so interacting does not
overwrite project-page query parameters. Its full-Atlas link carries current
filters and selection. This adds no database writes or scoring rules.

### Published dataset contract

Select the newest published run for the active runtime methodology using the
existing tie-break order. Load all rows from that same run, through pagination
where required. Do not reselect the latest run independently on each page;
a concurrent publication must not mix runs. Do not pull history to create
more current nodes or reuse the homepage's enrichment calls to GitHub/HYPE.

Use canonical promise ID if present; otherwise a collision-safe encoded tuple
of project identifier and lineage. IDs cannot depend on statement text,
array position, status, category or run ID. Preserve the run separately as
provenance. Duplicate IDs are an integrity error, not silently overwritten.
Absent identity is an audit error requiring ledger repair, not a random ID.
An unavailable assessment is a coverage gap, not a project with zero failures.

Minimal display contract (adapt to existing types; no scoring fields added):

```ts
type AtlasState = "kept" | "open" | "in_progress" | "lapsed" | "retired" | "unknown";
interface AtlasSource {
  url: string;
  title?: string;
  publishedAt?: string;
  locator?: string;
  quote?: string;
}
interface AtlasNode {
  id: string;
  lineageId: string;
  sourceRunId: string;
  projectSlug: string;
  projectName: string;
  symbol: string;
  claimText: string;
  claimTextKind: "quote" | "published-description" | "published-criteria";
  state: AtlasState;
  originalState: string;
  core: boolean;
  assessmentExplanation: string | null;
  assessedAt: string | null;
  snapshotAsOf: string;
  claimSources: AtlasSource[];
  outcomeEvidence: AtlasSource[];
  fulfillmentTest: string | null;
  primaryCategory: string | null;
  secondaryCategories: string[];
  tags: string[];
  assignmentRationale: string | null;
  projectHref: string;
  promiseHref: string | null;
  qualityFlags: string[];
}
interface AtlasPosition { nodeId: string; x: number; y: number }
interface AtlasDataset {
  dataRevision: string;
  methodologyVersion: string; // Published ledger methodology, unchanged.
  taxonomyVersion: string;
  assignmentVersion: string;
  layoutVersion: string;
  asOf: string;
  positioningMethod: "curated-category";
  nodes: AtlasNode[];
  positions: AtlasPosition[];
  regions: { id: string; label: string; x: number; y: number; width: number; height: number }[];
}
```

`dataRevision` identifies the immutable run and its content, not the fetch
clock. Versions for taxonomy/assignments/layout are independent of the ledger
methodology. Keep load and coverage diagnostics alongside the dataset; never
serialize credential-bearing exceptions. No weight or importance field in v1.

### State, claim and evidence adaptation

| Input under current v3 | Atlas label / color |
|---|---|
| `fulfilled` | Kept / green |
| `open` or documented legacy alias `unfulfilled` | Open / grey |
| `lapsed` | Lapsed / red |
| `retired` | Retired / red |
| `active`, absent or unrecognized value | Unknown / grey, with quality flag |

Keep original state unchanged. Mapping is dispatched by the record's exact
methodology. Only a methodology that explicitly defines in-progress `active`
may map it to In progress; only a documented older earning definition may
map it to Kept. Unsupported methodology is flagged and states stay Unknown
until its mapping is reviewed. Do not change normalization or scoring for
other routes in order to build Atlas.

Use explicit stored claim text where available, else show `criteria` as
“Published fulfillment criteria,” not a quotation, and flag missing original
claim text. `criteria` is a stored test in the inspected contract. If no
explicit test exists in a future record, show: “No explicit fulfillment test
is stored in this published record.” Do not derive a new test from a headline.

Populate original claim sources only from explicit provenance roles. Keep
existing `evidence` entries as the assessment's references without upgrading
any to the original claim. Where roles are unseparated, label that limitation
under outcome evidence and flag it in the audit. Never treat `evidence[0]`, a
project homepage or a guessed whitepaper URL as the claim source. All valid
references remain available; missing provenance does not remove the promise.

Render claim text and quotes as text, not executable HTML. Validate URLs as
HTTP(S), rejecting credentials and unsafe schemes; show invalid-link warnings
without navigating. Reuse external-link affordances and safe rel attributes.
Preserve exact source locators/quotes when stored. Do not enrich or classify
sources by fetching arbitrary external URLs in the public route.

Use an explicitly stored assessment date when present; otherwise show
“Assessment date not separately recorded” alongside labeled snapshot as-of.
`effective_at` currently records the promise date and is not a research date.
History links use actual existing records only; no synthetic playback.

### Assignments, coordinates and maintenance

Use the eight category definitions plus Unclassified in the vision. Stable
category IDs are `money`, `payments`, `platform`, `defi`, `privacy`,
`interoperability`, `governance`, `real-world`; `primaryCategory: null` maps to
Unclassified. Optional tag IDs: `scale`, `inclusion`, `sovereignty`.

Assignments contain primary category, distinct secondary categories, tags,
rationale, actual author and optional actual reviewer. Codex's initial file
is labeled Codex-authored, not Alex-reviewed. Validate all IDs, avoid repeating
the primary in secondaries, and keep a short ambiguous/unmapped list for
review. Assignment changes record old/new categories, rationale, author and
version in task/change notes. Never derive core or outcome from assignment.

Fixed category regions share world coordinates. Initially assign uniform
non-overlapping slots by project identifier then promise ID. Retain a versioned
manifest so inserting a new ID does not re-sort and move old nodes. Removed
nodes leave slots; new IDs take vacant slots. Deterministic overflow slots in
Unclassified keep unmapped new promises visible between manifest updates;
record their data revision and report them for maintenance. Region expansion
or reassignment requiring relocation produces an explicit layout revision.
No silent missing-coordinate drops; same inputs/versions reproduce positions.

Filtering, search and selection never compute a new layout. The renderer
receives nodes, positions and region labels; it has no dependency on taxonomy
assignment logic or a future AI provider. V2 can supply semantic-projection
coordinates behind that small boundary; no plugin framework or vectors now.

### Route, controls and evidence details

Server-load `/atlas` using the published reader only. Show a readable static
SVG overview first. Uniform nodes, core rings, selection outlines and exact
state labels follow the vision. More labels appear at closer zoom without
covering all points with full sentences. Region counts count primaries only.

Use a single client controller for filters, selection and camera. Project
multi-select, category association, exact state and ordinary case-insensitive
text search (claim, project, ticker) operate on the same nodes as the list.
Secondary category matches stay at their primary coordinates and carry a
“Secondary category match” label. Counts describe matching dataset coverage.

Validate query parameters, accept repeated `project` values, one `category`,
repeated `state` values, bounded `q` text and one stable `promise` ID. Ignore
unsupported filter values safely. Use replace for typed search updates and
intentional history entries for selection/filter actions; Back/Forward restores
both controls and selection. A selected valid promise that conflicts with
filters clears the conflicting filters with a short notice, opens details and
moves only the camera to reveal it. An unknown ID shows an unavailable-record
message. Selection must not silently disappear behind filters.

Pan uses pointer capture and a movement threshold; dragging does not select.
Pinch zoom and zoom buttons preserve a sensible focal point and bound scale.
Confine touch-action handling to the map; page scroll works outside it. Reset
view changes camera only, Fit results fits matching bounds, and Reset filters
clears filters. Empty-space click clears selection without resetting camera.
Respect reduced motion. Do not run a continuous force simulation.

Desktop details stay alongside the map. Mobile uses an inline full-width
panel or sheet with reachable close control above bottom nav/safe areas.
Hover previews are supplemental. A list of the filtered nodes offers keyboard
selection and source access without traversing every SVG node. Preserve focus
on updates; closing details returns it to the selected list action or map
control. A modal sheet, if chosen, also needs focus containment and Escape.

Drawer order: project/category/core identity; claim and quote/description
label; exact status and existing rationale; assessment date/snapshot date;
fulfillment test; original claim sources; outcome evidence; existing project
and individual promise/history links. Load these references with the dataset
so selection works without another chain of requests.

Successful zero matches: “No promises match these filters.” Database/load
failure: “The promise ledger could not be loaded.” No published run is an
explicit unpublished-ledger state. Never catch a read error and replace it
with an empty array or a claim that no failures exist.

### Product integration and acceptance

- Add the homepage and project links specified in the vision. Use a compact
  Scores / Atlas secondary navigation pattern, reusing MetricsNav styling
  where suitable. Keep five usable bottom controls; retain the heart Home
  icon and current homepage ordering. Atlas is not another Metrics tab.
- Preserve project deep-link targets. Fix the narrow PromiseList reveal
  behavior required for links to later promises; do not launch a general
  page redesign. Render searchable Atlas/list sections using the existing
  search metadata contract, with unique stable anchors.
- Expose all five versions and data date through an information panel. Add
  the curated-layout disclosure near the legend and an implementation-audit
  summary for missing sources, tests, mappings and unsupported states.
- Review service-worker treatment of Next page-data requests before shipping:
  the current catch-all cache-first path can retain stale ledger data. Ensure
  Atlas refreshes reach the current dataset; this is freshness verification,
  not permission for an offline rewrite.
- Tests cover same-run pagination, draft exclusion, duplicate IDs, state
  mapping by methodology, source-role separation, missing data, safe URLs,
  assignment coverage, deterministic positions, insert stability, fixed
  coordinates under filters, query round-trips and selected-node reveal.
- Run build, typecheck, focused Atlas tests and the existing hearts/publication
  regression checks. Browser-check at 320px and desktop: pan/pinch/buttons,
  tap versus drag, reset/fit, keyboard/list/focus, Back/Forward, direct links,
  missing data, ordinary/core/open/failed examples and source destinations.
- Use the established deployment workflow only when executing release work.
  No unrelated scoring publication, live schema mutation or new domains.
  Report route, changed files, verified dataset coverage, unresolved source
  and classification gaps, actual checks and remaining limitations. Browser
  testing and deployment claims require actual verification.

## Phase 0: Vision and plan (earlier application build)

Docs written, tree clean. Alex said go 2026-09-25 ("get started building
one step at a time"). Build proceeds phase by phase below.

## Phase 1: Data layer

1. `app/src/lib/verdict.ts`: pure function
   `verdictFor(promises) -> { category, failedLineages }`. Rules from
   vision.md. Unit tested (`npm run test:hearts` or a new
   `test:verdict` script). Mechanical check: XRP and DASH ->
   Delivery concern, other six -> No concern.
2. `app/data/verdict-lines.ts`: analyst-written one-liner per project,
   updated only when promise states change. Drafts below ship as-is and
   Alex edits on the verification pass (open question 4):

   - BTC: "Delivered payments at scale and the store-of-value case."
   - ETH: "Delivered the Merge, rollups, and a live dapp ecosystem."
   - SOL: "Delivered high-throughput mainnet and a live ecosystem."
   - LINK: "Delivered oracle feeds and CCIP."
   - AVAX: "Delivered subnets and a live DeFi ecosystem."
   - BAT: "Delivered the Brave Ads loop and creator payouts."
   - XRP: "MoneyGram corridor retired; bank settlement never delivered."
   - DASH: "Merchant economy lapsed; core privacy features holding."

3. Summary helpers in `heart-data.ts`: CODE word (Active = commits in
   last 90d across tracked repos; Quiet = none; Unknown = fetch failed),
   HYPE word (absolute mentions/week; "collecting" until 8-week baseline,
   no trend percentages before week 9), USAGE word ("coming" until metrics
   are defined).
4. Sparkline data: expose each project's published earned hearts for the
   active methodology via the existing `/api/hearts` routes. No new
   endpoint unless the existing shape cannot carry it.

Acceptance: `tsc --noEmit` clean, verdict tests pass, the eight verdicts
match the table above exactly.

## Phase 2: Homepage scoreboard

CoinMarketCap-style dense table (vision.md): rank (# by hearts filled %),
coin (icon + name, links to detail), hearts meter (earned-only), Shitcoin
warning dial (1-10, number only), CODE / USAGE / HYPE compact columns,
Proof history sparkline column on desktop. Sortable by column. Mobile
renders one card per project instead of the table. Compare button above
the table opens Phase 2b.

Below the table: stacked area chart of HYPE share across projects over
time (from `social_snapshots`).

Dark theme ships with this phase: the whole app goes dark, CMC-style.
Slogan "Truth, not hype." under the page title.

Acceptance: 8 rows, correct hearts and verdicts, sparklines render from
published runs, sorting works, dark theme throughout, no em dashes, no
timestamps, no count labels.

## Phase 2a: HYPE leaderboard tab

News explorer (2026-09-26): `/api/v1/mentions/{slug}` returns a cached,
rolling seven-day Google News RSS sample for the eight configured projects.
HYPE shows daily publication bars, publisher breakdowns and linked headlines;
selecting a day or publisher filters the list. Counts are returned feed items,
not exhaustive internet mentions. UTC edge days are partial. Cache the fetch
timestamp with the records for one hour; provider errors are unavailable, not zero.
This source view is independent of Supabase; existing daily numeric snapshots
remain the saved comparison. Headline records are not persisted historical evidence.
Reddit/Telegram currently measure audience size only; X is not connected.
The endpoint is documented in OpenAPI. No scoring or methodology changes.


CMC Alpha > Socials pattern per vision.md: rows of coin, hearts, HYPE
mentions + change vs baseline, Shitcoin warning dial. Sortable by mentions
and by hearts. Gated like all HYPE trends: absolute mentions only until 8 weeks
of snapshots, then change vs baseline. No sentiment column, ever.

The hype bubble (vision.md): animated bubble per project, bubble size =
HYPE mentions, substance fill = hearts filled %. All sizzle, no steak
reads at a glance.

Acceptance: rows render from `social_snapshots`, sorting works, bubbles
render with honest proportions, baseline gating honest, no em dashes.

## Phase 2b: Compare view

Route `/compare`. Pick 2-4 projects (default 4); metrics as rows,
projects as columns:

- Hearts (compact meter + earned/capacity)
- Shitcoin warning dial (1-10, number only) + one-liner
- Promises: N fulfilled · N active · N open · N lapsed · N retired
- CODE: activity word + commits 90d + contributors + last release
- USAGE: per-project metric, or honest "coming"
- HYPE: mentions/week + baseline status
- Index: mini sparkline + current score (renders only when the Index
  itself renders)

Every row header links to the methodology anchor that defines the metric
and its limits. Numbers never appear without their context. Horizontally
scrollable on mobile; project names link to detail pages. Entry point: a
Compare button on the homepage.

Acceptance: 2-4 project selection works, all rows correct against the
data layer, methodology links land on the right anchors, mobile scrolls
cleanly.

## Phase 3: Detail page

1. Header: CoinMarketCap-style coin header (icon, name, big
   hearts, Shitcoin warning dial, one-line why from `verdict-lines.ts`),
   then the verdict inputs ("What feeds this meter": each failed promise
   with state and core flag, or the clean/overdue note), then the
   stat strip: PROMISES / CODE / USAGE / HYPE per vision.md. USAGE stat shows
   the honest "metrics coming" state. HYPE stat shows absolute mentions +
   baseline week.
2. Delivery Timeline: removed by the later decision in item 7. The old
   effective-date reconstruction is superseded: current promise states
   cannot establish historical fulfillment. Atlas does not restore it.
3. HYPE mindshare bump chart: per-project rank by mentions over time,
   30d/90d toggle, coin icons on rank lines. Gated on 8 weeks of snapshots
   like all HYPE trends; before that, the section does not render.
4. Delivery-health gauge in the header stat strip: hearts filled %,
   green/amber/red. Never sentiment.
5. Promises list. Every state renders as a pill: green fulfilled, grey
   open/active/neutral, red lapsed/retired. Evidence links sit behind
   `Sources (n)` disclosure toggles; the source list uses individual rows,
   not wrapping dot separators. Canonical promise states: open /
   active / fulfilled / lapsed / retired. Legacy DB values normalize at the
   boundary (unfulfilled -> open, old active -> fulfilled); display labels
   match the states. Note: every stored "active" today means the legacy
   earning sense (= fulfilled). The in-progress sense of "active" has no
   stored instances and must not be written to storage until a backfill
   relabels stored rows; readers cannot distinguish the two senses. Overdue
   is defined in the model but has no v1 trigger and does not render.
6. Evidence / Methodology bottom section: sources, tracked repos, data
   coverage, methodology version, run id. Replaces the "under the hood"
   drawer (same content, visible by default).
7. Project timeline graphs: DECIDED 2026-09-26 (Alex): remove the
   Delivery Timeline and its HYPE activity chart. They are not the intended
   distinctive ranking graph; its design remains pending. Supersedes the
   September 25 instruction to keep both timelines.
8. Market panel (2026-09-26): reusable `MarketPanel` fetches CoinGecko
   spot/market-cap data and OHLC history; `MarketChart` renders the same
   interactive chart inline and expanded. Default shaded price line,
   optional candles, 1D / 1W / 1M. Mouse/touch scrubbing and arrow keys
   select the nearest actual sample, updating price, UTC time and change
   from the first plotted close. Candle mode includes OHLC readouts.
   The latest plotted close is distinct from the spot quote; no interpolated
   prices or claims of live ticks. Client history cache: 15 minutes per
   project/range. Abort stale requests, validate data, show loading/retry
   states instead of silently hiding failures. Native dialog provides focus
   containment, Escape/backdrop dismissal and focus restoration. Chart
   resizes to its container and simplifies date ticks on phones.
   Components: `components/market-panel.tsx`, `components/market-chart.tsx`.
   Preserve `<section class="panel market-section" id="project-{slug}-market">`.
   Market data never feeds hearts, the verdict, or the Index.
9. Modular metric components (2026-09-26, Alex's rule): every metric with
   a list view ships its row as a shared component in
   `app/src/components/`, and the project detail page renders the SAME
   component. One component, two surfaces; never duplicate the markup.
   `CodeRow` (`components/code-row.tsx`) is used by `/code` and the
   detail page's CODE section; `HypeRowCard`
   (`components/hype-leaderboard.tsx`) is used by `/hype` and the detail
   page's HYPE section. Rows render `<article class="{metric}-row">`.
   Page sections render `<section class="panel {name}-section">` with a
   unique search id (`project-{slug}-code`, `project-{slug}-hype`,
   `project-{slug}-market`, ...). A future `/team` list follows the same
   rule.
10. USAGE naming (2026-09-26, Alex): the "Use" factor displays as
    "Usage" everywhere user-facing (power grid, scoreboard column,
    methodology). Code keys (`key: "use"`, icon `name="use"`) unchanged.
11. **Supporting context** (Alex, 2026-09-26): one container at the bottom
    of project details groups existing CODE, HYPE and market cards beneath
    a shared heading. Rename the bottom Metrics tab to **Context**, retaining
    route URLs. Delivery and context are labeled separately in the scoreboard
    and Compare. Remove homepage Hype Share. See
    [the Context handoff](tasks/2026-09-26-supporting-context.md).

Acceptance: all eight detail pages render with correct data, toggle
works, empty states honest, `next build` clean.


### Promise context cards (2026-09-26)

Project pages lead with shared `PromiseStats` and `PromiseNews` components
before market context. Stats read the same published assessment as the meter:
earned, open, lapsed, retired, total tracked, stored methodology and assessment
as-of. A distinct research timestamp is not currently stored: show “Not recorded”
for last research rather than relabel a publication or promise-effective date.

Recently happened reuses `/api/v1/mentions/{slug}`. Match headline words against
published promise criteria and lineage topics, excluding stop words, market
boilerplate and project names/aliases. Require two distinct shared topic terms;
show at most three promise references per story, with the terms inspectable.
These are automatic topic suggestions, never accepted evidence or state changes.
Weak/unmatched headlines are omitted. Empty coverage and provider errors remain
explicit. No human action is needed per story and no scoring write occurs.

Stable anchors come from `promiseAnchor`; cards and full promise rows share the
same identifiers. P labels use the existing lineage number where present. News
records retain the existing hourly feed cache; no claim of persisted event history.


## Phase 4: Verify and ship

1. Methodology page: DONE 2026-09-25 (rewritten, collapsible sections,
   bigger type, live on Vercel).
2. Full verification: `npm run test:hearts`, `tsc --noEmit`,
   `next build`, mechanical verdict check, screenshot review of home +
   two detail pages (one No concern, one Delivery concern).
3. Commit, push via `~/workspace/bin/gh-push.py`, verify Vercel deploy
   and the live pages.

## Gating rule: nothing unfinished ships

A section, metric, or verdict that lacks real data or a reviewed definition
does not render publicly. No "coming soon" panels, no provisional scores,
no zeros standing in for unknowns. The UI shows only what is real; the
rest waits in the plan.

Currently gated:

- **Prove Value Index**: separate future work requiring an approved
  methodology/specification. Additional inputs alone do not authorize it.
- **USAGE stat card / home row**: renders "metrics coming" until per-project
  USAGE metrics are defined. Never a number before that.
- **HYPE trend percentages**: gated on 8 complete weeks of snapshots.
  Until then, absolute mentions + "baseline collecting, week N/8".
- **Watch verdict**: no v1 trigger. Renders nothing until deadline
  evidence is researched and reviewed.
- **Overdue promise state**: defined in the data model, never rendered
  until deadline evidence exists.
- **USAGE timeline toggle**: hidden until USAGE metrics exist.
- **Valuation, rebrand, timeline strips beyond CODE**: parked, not gated.
  Parked means no spec and no build; gated means spec'd and waiting on
  data.

## Phase 5: Prove Value Index (superseded; not authorized)

The earlier composite formula, event-log schema and Index build order are
superseded by Alex's Promise Atlas v1 brief (2026-09-26). Do not implement
weights, decay, new scores or a ranking line graph from the old plan.
Any Index needs a separate reviewed methodology and implementation spec.
Curated Atlas v1 does not depend on that research or on embeddings.

## Invariants (unchanged)

- Snapshots immutable; runs append-only; history never rewritten.
- One run_key per run; the RPC raises on conflict, nothing partial writes.
- Reads go through `heart_rankings` (published runs only).
- Secrets in ignored env / deployment config, never in the repo.
- Direct Postgres on 5432 is blocked from this VM; use REST or the
  dashboard SQL editor, never raw psql.

## Open questions for Alex

1. **USAGE on the home row:** DECIDED 2026-09-25: show "coming" as the
   honest placeholder per the gating rule (never hide the slot, never
   show a number).
2. **HYPE word:** once the 8-week baseline exists the word is vs
   baseline; until then, show just "collecting" or rank vs the
   cross-project median that week?
3. **Project timeline graphs:** DECIDED 2026-09-26 (Alex): remove the
   current Delivery Timeline and HYPE activity charts. Replacement ranking
   visualization remains to be designed.
4. **Verdict one-liners:** approve the eight drafts in Phase 1, or edit?
5. **Index gating:** SUPERSEDED 2026-09-26 by Atlas v1. Index remains
   separate future work requiring a new approved spec, not just more data.

## Appendix: Hearts algorithm (promise-heart rule v3)

The scoring rule, precisely. Also rendered on the site at
`/case-studies/algorithm`.

<!-- ALGORITHM-START -->
# Hearts: promise-heart rule v3

**Adopted 2026-09-25 (Alex).** Every tracked promise earns exactly one heart
when fulfilled, zero otherwise. Capacity is the promise count: 16 promises
means a 16-heart meter. Amended 2026-09-25 (Alex): community-promise rule for
founderless protocols ("Where promises come from"). Historical runs were
restated under the new rule and republished; original runs remain as an
immutable audit history. One meter per project: **filled / capacity**.
Live in production: append-only runs in Supabase, published via RPC, served by
the site. Methodology string:
`hearts promise-heart rule v3 (adopted 2026-09-25; one promise = one heart; capacity = promise count)`.

> Methodology update: fixed capacity tiers {5, 10, 20} and reward weights
> {0, 1, 2} removed. One promise = one heart. Historical scores restated.
> This is not a change in project performance.

## The idea

Every promise the project made gets one heart slot. Keep the promise, earn
the heart; fail it, earn nothing. **A heart remains earned only while the
evidence condition under which it was awarded remains true**: milestone
claims ("shipped mainnet") are permanent once achieved; ongoing claims
("advertisers are buying ads") must be revalidated. Scores change because
evidence changes, not because time passes. No weighting, no free hearts,
no decay.

## Constants (versioned, never per-project)

REMOVED 2026-09-25: `CAPACITY_TIERS` {5, 10, 20}; `REWARDS` {0, 1, 2};
`MAX_ALLOWANCE` (was min(3, floor(capacity / 5))). Time-based decay is
deliberately absent: no grace period, no per-year drain. (Adopted 2026-09-25:
generic decay killed as arbitrary; see case-studies/review.md.)

## Per-project inputs (analyst-set, rationale required, versioned)

**Capacity**: the promise count. No tiers, no headroom.

**Promise lineages**: each lineage is typed at carving:
- **milestone**: "shipped X". Fulfillment is permanent; time cannot unship it.
- **ongoing**: "X is true" (activity, volume, participation). The heart exists
  only while the evidence condition is currently satisfied.

States: open / active / fulfilled / lapsed / retired. A milestone
goes open → fulfilled (permanent). An ongoing claim goes open → active →
fulfilled while the evidence condition holds, and lapses when evidence stops
supporting it: lapsing is reversible, so the graph
can fall and rise again on real events. A fulfilled-then-dead lineage
**retires** its hearts as a separate visible event: the graph rises at
fulfillment and falls at retirement; history is never rewritten. A replaced
promise is recorded as retired with a note pointing at the new lineage (no
double count). One lineage is the **core promise**: a label for the main
promise, not a gate; it earns its heart like every other promise.

## Where promises come from

The default source is the issuer: the whitepaper, the launch announcement,
the claims the team put in writing. That is what the instrument holds the
project to. Any attributable public statement qualifies: whitepapers, tweets,
interviews, articles, websites, founder statements.

Founderless protocols have no issuer, so the rule adapts: promises can be the
claims the community actually converged on, Schelling points rather than issuer
commitments. A community narrative counts as a promise only if all three hold:

1. **Dominant and long-standing:** the claim has been the shared story for
   years, not a passing meme.
2. **Measurable with real evidence:** there is data that shows the claim
   holding, not just people repeating it.
3. **Broad consensus:** the wider ecosystem converged on it, not one
   marketing team.

Hype alone never qualifies. The bar is deliberately high: the instrument
scores claims people actually rely on, whether an issuer wrote them down or a
community converged on them.

## The adoption test

Shipping the tech is not enough. A promise counts as fulfilled only if the
thing was delivered **and** real people actually use it. A proof of concept
nobody touches, a mainnet nobody transacts on, a feature with no users:
unfulfilled. Teams routinely declare victory at the demo stage. We score
the usage, not the press release.

## Promise research methodology

### Expansion and evolving utility (Alex, 2026-09-26)

The next intake target is approximately 100 coins/tokens, with automated
discovery, source collection and draft extraction. Use the first cohort to
calibrate the process, then automate subsequent cohorts further. Human effort
goes to ambiguous attribution, duplicate obligations, evidence conflicts and
verdict-changing judgments, plus sample review of apparently routine results.
Source fetching or passing validation alone never publishes a verdict.
The old fragments procedure below describes v3; new drafts must follow the
active [reviewed verdict contract](tasks/2026-09-26-hearts-verdict-contract.md).

For Bitcoin, implement the [Genesis asset decision](tasks/2026-09-26-bitcoin-genesis-exemption.md)
through an explicit project attribute. The verdict workstream owns excluding
it consistently from altcoin comparative rankings and verdict badges; keep
its hearts inventory, underlying promise categories and evidence visible.
Document original commitment outcomes, observed present use and historical
contribution separately. Do not collapse them into an unsupported composite.

Before quantifying store-of-value use, define the question, source, observation
window and limitations: custody/holdings records can demonstrate documented
holding; they do not prove inflation protection or a fair token price. On-chain
address counts are not person counts, and dormant balances do not prove intent.
Price performance alone is not a fulfillment test. Historical contribution
starts as sourced explanation, not an invented numerical founding bonus.

Documentation-only follow-up, after altcoin priorities: resolve BTC P11 against the exact claim in
[whitepaper section 10](https://bitcoin.org/bitcoin.pdf#page=6), including its
stated linking limitations. Attribute later community claims to their actual
authors and dates. Correcting an overbroad test requires a reviewed new record;
do not silently rewrite the old assessment or treat evolution as forgiveness.

The repeatable recipe for onboarding a project. One checklist, one fragment
format, one merge, one publish path. Works for crypto and for stocks
(earnings calls, investor days, 10-K strategy sections, CEO public
statements are promise sources too: "robotaxi next year" is a promise).

**1. Identify promise sources.** Crypto: whitepaper, official docs, official
blog, founder/team public statements (tweets, interviews, talks), roadmap
and launch announcements. Stocks: earnings calls, investor-day decks, 10-K
strategy sections, CEO public statements, product launches. Primary sources
first; secondary only to verify usage.

**2. Extract discrete promises.** One attributable statement = one candidate
promise. Deduplicate restatements. Assign lineage `<slug>-pNN-short-slug`
(unique, stable). Aim for the real number of distinct public promises:
comprehensive, not padded.

**3. Classify.** `claim_type`: `milestone` (a shipped thing) or `ongoing`
(a standing claim). `core`: exactly one `true` per project, the main
promise (a label, not a gate). `effective_at`: ISO date the promise was
stated, never in the future.

**4. Score on the adoption test.** `fulfilled`: real usage exists now.
`open`: still pending. `lapsed`: ongoing promise with no meaningful progress
for a long stretch. `retired`: explicitly dropped by the project. Never
`active` (rejected at the publish boundary). `milestone` can never be
`lapsed`.

**5. Write criteria, rationale, evidence.** `criteria`: what would count as
fulfilled, in plain words. `rationale`: one line explaining the state.
`evidence`: at least one entry per promise with the EXACT source URL and a
summary of what the source is. No guessed URLs.

**6. Write the fragment** to `db/seed/heart-runs/fragments/<slug>-promises.json`:

```json
{
  "slug": "<slug>",
  "rationale": "one or two sentences on what sources were researched",
  "allowance_rationale": "No allowance under the promise-heart rule: one promise earns one heart.",
  "promises": [
    { "lineage": "<slug>-pNN-short-slug",
      "claim_type": "milestone|ongoing",
      "criteria": "what would count as fulfilled, in plain words",
      "core": true,
      "state": "open|fulfilled|lapsed|retired",
      "effective_at": "2020-03-12T00:00:00Z",
      "rationale": "one line explaining the state",
      "evidence": [{"url": "https://exact-source-url", "summary": "what this source is"}] }
  ]
}
```

**7. Merge and publish.** Fragments merge into a run artifact (capacity =
promise count, earned = fulfilled count per project); dry-run validate;
publish via `publish_heart_run`; never point `HEARTS_METHODOLOGY` at a
string with no published run. Published runs need non-null `reviewed_by` +
`policy_ref` (DB CHECK); drafts don't. Researcher agents write fragments
only, never app code or the artifact directly.

## Computation at time t

```
capacity(t) = promise count
earned(t)   = Σ fulfilled lineages at t (one heart each)
filled(t)   = earned(t)
```

No clocks, no timers. Display `filled / capacity`, earned hearts only.
Every point carries provenance (observed / reconstructed / missing).

## Shitcoin warning: the verdict

The section keeps the name **Shitcoin warning**. It renders as a 1-10 circular
meter showing the number only, never a category label. It is a
delivery-accountability rating, not a fraud or investment-risk rating.

Underneath, the rule is categorical, from promise states
(`app/src/lib/verdict.ts`, `verdictFor`):

- **Not a shitcoin** (meter 1): no retired or lapsed promise on record.
- **Watch** (meter 4): reserved for verified overdue promises once deadline
  evidence has been researched. No v1 trigger; the function never returns it.
- **Shitcoin risk** (meter 7): a supporting promise retired or lapsed.
- **Shitcoin** (meter 10): the core promise retired or lapsed.

The 1-10 positions are fixed per category, not computed from a scoring
formula. The formula itself is under review (2026-09-26): it has no sense of
proportion (one failed promise out of 19 reads the same as 8 out of 12), no
recency, and no redemption path. Review brief:
`~/workspace/your_files/prove-value-shitcoin-formula-question.md`.

Tapping the meter opens the project's verdict section, which lists exactly
what feeds it: each failed promise, its state, and whether it was core.
Humans resolve ambiguous evidence. Software picks the category and
templates the explanation from reviewed promise records. CODE and HYPE
never move the verdict directly; USAGE may support a promise state only
when it measures a predefined promise-specific condition.

## Gaming defenses

Open promises pay zero: only fulfillment pays. Abandoning a fulfilled lineage
retires its hearts visibly and can never improve the meter. Announcements
change nothing: only evidence does. POC-stage delivery is not fulfillment
(the adoption test). Nothing can exceed capacity.

## Valuation: postponed to v2

v1 shows the meter **beside** market cap and lets the market provide the
valuation. No fair-value calculation until the case studies survive scrutiny.

## Case studies

Scored assessments live in [case-studies/](case-studies/) ([BAT](case-studies/bat.md),
[XRP](case-studies/xrp.md)); the methodology decisions behind them are recorded in
[case-studies/review.md](case-studies/review.md). The illustrative sketches that
used to sit in this doc are retired: the case studies are the examples now.
<!-- ALGORITHM-END -->

## Appendix: Social pipeline

Our proprietary attention-metrics layer. Not a CoinGecko clone: we juxtapose
**hype** (observed attention) against **substance** (hearts earned). A project
with massive hype and few hearts reads as all sizzle, no steak. That
contrast is the differentiator; raw community numbers are not.

**Display only.** Hype metrics never feed the hearts scoring algorithm and
carry 0% weight in the Prove Value Index. Hype is context: observed attention,
never proof of support or adoption. Per [vision.md](vision.md), no trend
percentages publish until 8 complete weeks of snapshots exist; until then,
absolute mentions plus "baseline collecting, week N/8".

## What is shown

Per project, in the HYPE stat card:

- News mentions in the last 7 days (trend vs baseline once the baseline exists)
- Reddit subscribers (once credentials exist; the tile hides until then)
- Telegram members (best-effort; the tile hides when unavailable)
- A **hype-vs-substance read**: one plain-language line contrasting hype
  against hearts earned.

### The read rules

Hype is measured against the median 7-day news mentions across all tracked
projects in the latest collector batch (our own dataset, our own baseline):

- **high**: mentions at least 2x the cross-project median
- **low**: mentions at most half the median
- **moderate**: everything between

Then:

- high hype + under 40% of hearts filled: **"All sizzle, no steak."**
- low hype + at least 60% of hearts filled: **"Quietly proven."**
- anything else: neutral juxtaposition, no judgment.

No composite score is computed from hype. The two numbers sit side by side.
Hype needs at least 4 projects with news data in the batch; otherwise no
hype judgment is made.

## Architecture

```
GitHub Action (daily 06:30 UTC, manual via workflow_dispatch)
  -> app/scripts/collect-social.ts
    -> app/src/lib/social-collect.ts (Reddit OAuth, Telegram preview, News RSS)
    -> INSERT into public.social_snapshots (service role)
  -> app/src/app/api/social/[slug]/route.ts (anon key, RLS public read)
    -> latest 2 snapshots + cross-project median
  -> HYPE stat card + hype-vs-substance read
```

Scheduler choice: GitHub Actions over Vercel Cron. The collector fans out
to three free APIs per project with politeness delays and can run past
serverless duration limits. Runs are idempotent: one snapshot row per
project per run. A failed collection never renders as zero; the tile shows
the last good value marked stale, or hides.

## Data sources

| Source | Metric | Access | Notes |
|---|---|---|---|
| Reddit OAuth API | subreddit subscribers | Free app registration | Needs `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET`; without them the metric is skipped, not faked |
| Telegram `t.me/s/` preview | channel members | None | Best-effort: only channels with public previews enabled expose a count; anything else yields null and the tile hides |
| Google News RSS | mentions, last 7d | None | Counts items with pubDate in the window |
| X/Twitter | followers, mentions | **Paywalled** | See upgrade path below. No scraper: unreliable and against ToS |

Per-project source handles live in `SOCIAL_SOURCES` in
`app/src/lib/social.ts`.

## Credentials and env vars (names only)

Collector / GitHub Action secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (writes only; reads go through RLS + anon key)
- `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` (optional; free at
  reddit.com/prefs/apps, type "script")

App runtime (already configured):

- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (or `SUPABASE_ANON_KEY`)

## Database

Migration `db/migrations/004_social_snapshots.sql` creates
`public.social_snapshots` (one row per project per run) with RLS: public
SELECT, writes via service role only. Apply via the Supabase dashboard SQL
editor; raw Postgres on 5432 is blocked from the build workspace.

## X/Twitter upgrade path (future, paid)

When hype becomes a paid-tier feature, X is the missing venue that
matters most (crypto conversation lives there). The path:

1. X API Basic tier (~$100+/mo at time of writing): `GET /2/users/by/username/:u`
   for follower counts; filtered stream or recent search for mention volume
   per project handle.
2. Add an `x_followers` / `x_mentions_7d` column pair to
   `social_snapshots` (new migration), a fetcher in `social-collect.ts`,
   and a tile in the HYPE card. The read rules stay unchanged;
   X mentions fold into the hype median.
3. Alternative: LunarCrush API (crypto-native social metrics, has a free
   tier but requires API-key signup) as a second paid/free source.

Until then, X is documented as absent, not approximated.

## Local verification

```bash
cd app
npm run social:collect -- --dry-run   # real sources, no DB write
npm run test:social
```

## Metrics navigation (2026-09-26)

CODE, HYPE and Compare are supporting views grouped under one Metrics bottom-nav
item. The shared MetricsNav supplies CODE / HYPE / Compare links above those
existing pages. `/metrics` opens CODE by redirecting to `/code`; the existing
`/code`, `/hype`, `/compare` URLs, sorting queries, search anchors and project
links keep working. The Metrics bottom item is active for all three views.
This is a navigation-only change: datasets, page components and project-detail
components remain intact. Project details carry the promise/evidence message.


## Atlas maintenance (2026-09-26)

`npm run atlas:audit` reads the configured published ledger without writes.
`-- --file /path/to/response.json` audits a captured published `/api/hearts`
response instead; the report labels which source it used. `npm run test:atlas`
checks adaptation, same-run pagination, state/source integrity, classifications,
layout/filter behavior and dynamic-page cache policy.

To classify a new record, add its stable ID and rationale to
`app/data/atlas-assignments.ts`, recording the actual author/reviewer. Increment
assignment version and record old/new categories and reason in the task notes.
Unmapped IDs remain visible in Unclassified. To retain new coordinates, append
IDs to the corresponding arrays in `atlas-slots.json`, preserving existing slot
order and holes; do not regenerate/sort the old arrays. Layout relocation or
region expansion requires a layout version change. Taxonomy definition changes
have their own version. None of these changes republishes a heart score.

The live/public audit found missing explicit original-claim provenance in all
115 current records and seven unresolved category assignments. See the task
queue for exact IDs and limitations. The grading workstream supplies any missing
claim text/roles/locators; Atlas does not infer them from an evidence array.
