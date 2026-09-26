# Promise Atlas v1: build tasks

**2026-09-26, Alex's revised brief. A1–A6 implemented, pushed and verified on Vercel.**
This replaces the previous embeddings-first task sequence. Build a curated,
stable map of the published promise ledger. No scoring changes, vectors,
Index, weights, category performance rankings or homepage replacement.

Product: [vision](../vision.md#promise-atlas-v1).
Technical contract: [implementation](../implementation.md#promise-atlas-v1-implementation).
Keep progress, real validation results and questions here as each slice lands.
Do not invent methodology or call Codex assignments Alex-reviewed.

## Ordered tasks

### A1. Inspect and audit the published ledger

- [x] Recheck Git status/latest main and preserve other agents' changes.
- [x] Read the active methodology, publication/read contracts, navigation and
  dependency setup. Pin one published run; enumerate all its rows.
- [x] Record current counts, duplicate/missing IDs, states, source roles,
  fulfillment-test coverage, unavailable assessments and existing categories.
- [x] Separate confirmed live results from checked-in artifact observations.

Done when: coverage and data-quality gaps are documented against a named
run/methodology. Missing credentials become a stated limitation, not fake data.

### A2. Establish the server reader and Atlas adapter

- [x] Reuse published reads with one run ID across all pages. No enrichment
  calls to market/social/GitHub; no new database or public API required.
- [x] Stable identities; explicit methodology-dependent state mapping;
  original claim sources separate from outcome evidence; quality flags.
- [x] Preserve stored criteria/rationale/core and original state. Distinguish
  assessment date from snapshot as-of and promise effective date.
- [x] Add focused adapter tests for duplicates, drafts, source gaps, missing
  tests, unknown states, pagination, outage versus empty, and safe links.

Done when: every valid current scored promise is represented once without
altering the ledger; integrity errors are visible and missing provenance is
reported. No silent dropping or invented sources/tests.

### A3. Version taxonomy and initial assignments

- [x] Add the eight approved categories, Unclassified, and three tags.
- [x] Prepare per-promise primary/secondary assignments and rationales with
  actual authorship. Keep genuinely ambiguous assignments Unclassified.
- [x] Validate category/tag IDs and publish the short ambiguous/unmapped list.
- [x] Record assignment changes separately from ledger and layout revisions.

Done when: all nodes have an assignment or explicit Unclassified coverage;
primary counts never double-count secondary associations.

### A4. Build the stable static map

- [x] Fixed world regions, retained slot/coordinate manifest and versions.
- [x] Uniform SVG nodes, exact status colors, core ring and readable labels.
- [x] New nodes retain existing positions; overflow is visible and reported.
- [x] Assert deterministic output and no overlapping nodes at supported scale.

Done when: same inputs/versions reproduce positions and filters cannot change
node coordinates. A usable overview precedes gesture/animation work.

### A5. Add discovery, evidence and accessible interaction

- [x] Project/category/status/text filters with counts, reset and empty state.
- [x] URL validation, shareable selection, Back/Forward, hidden-selection reveal.
- [x] Preview, full evidence drawer/panel and filtered accessible list.
- [x] Drag/pinch/buttons, tap threshold, reset view, fit results, reduced motion,
  focus return and safe mobile scrolling outside the map.

Done when: selecting a visual pattern leads to the actual claim/test/evidence;
mobile and keyboard users can complete the same journey.

### A6. Integrate, verify and hand off

- [x] Homepage entry, project-filter links, secondary Scores / Atlas navigation.
- [x] Verify individual promise links reveal later collapsed rows; search IDs
  remain unique and source links stay separate from primary card navigation.
- [x] Information panel includes methodology/taxonomy/assignment/layout/data
  versions, data date and placement limitations.
- [x] Check page-data cache freshness across published revisions.
- [x] Build, typecheck, focused tests and existing hearts/publication checks.
- [x] Browser verification at narrow mobile (320px) and desktop, including
  ordinary/core/open/failed/missing-data records and source destinations.
- [x] Record exact coverage, unresolved classification/source issues, checks
  actually run, and release status through the established workflow.

Done when: the brief's data, layout, interaction, evidence and accessibility
acceptance checks pass. Do not report a deployment or browser check by inference.

## Planning-pass observations (not live acceptance)

Inspected main/origin `4bd9db5`. Local artifact
`db/seed/heart-runs/hearts-promise-2026-09-26.json`: 115 promises across 8
projects; 72 fulfilled, 33 open, 5 lapsed, 5 retired; no duplicate project +
lineage IDs. All have stored criteria. Separate claim-source roles and exact
claim text are not modeled in the current required publication shape.
These counts are not a hosted-data audit. The live public-run audit below now confirms this coverage.

`criteria` already means the fulfillment test: do not mark it missing merely
because no field is named `fulfillment_test`. Missing original-claim provenance
stays flagged while its existing assessment references remain accessible.
The legacy state helper maps active to fulfilled; current v3 publication rejects
active. Atlas must interpret the actual record methodology explicitly.

## Questions / grading handoff

- Original claim attribution: the grading workstream should supply explicit
  claim-source roles, quotes/locators and claim text where missing. Atlas will
  expose gaps without blocking map/list work or inventing attribution.
- Seven ambiguous assignments remain Unclassified; see the build audit below.
- No new fulfillment rubric or warning formula is decided in this workstream.

## Build progress — Codex, 2026-09-26

- A1 live read audit: the public `/api/hearts` response returned published run
  `4a84b4a4-d7e3-40fe-bcfe-05ab0bd42f85`, as-of `2026-09-26T03:06:37+00:00`,
  methodology promise-heart rule v3. Total 8 rows / 115 promises, no duplicate
  identities, 72 fulfilled / 33 open / 5 lapsed / 5 retired. No unavailable
  assessments. This verifies the public dataset, not hosted SQL migrations.
- All 115 have stored criteria and assessment references. None separately
  identifies the original claim text/source; those gaps are exposed in the
  drawer. `atlas:audit` can inspect configured DB reads or a captured public
  response (`--file`). No publication or database mutation was performed.
- A2 adapter/reader implemented: one pinned run across pagination, explicit
  state mapping, provenance/quality flags, safe source links and load errors.
- A3 assignments prepared by Codex with rationales, version 1; not reviewed by
  Alex. Seven stay Unclassified: ETH energy reduction; LINK BUILD/SCALE;
  SOL developer retention; XRP Xpring, UBRI, developer funding, and net-zero.
  These span subjects or fall outside the initial category definitions.
- A4/A5 implemented: retained SVG slots, uniform state-colored nodes/core rings,
  fixed positions under filters, project/category/status/text controls, URL
  state, pan/zoom, evidence panel and a keyboard-accessible list.
- A6 integration complete: secondary Scores/Atlas navigation, entry links,
  later-promise reveal through native disclosures, and network-backed dynamic
  page-data requests. Removed redundant `docs/vitals.md` at Alex's request;
  no references pointed to it, and CODE remains documented in implementation.
- Focused verification: 10 Atlas/cache tests pass and TypeScript passes.
  All 82 tests and production builds pass. No hosted schema changes were made.


### Verification results

- Entire existing suite plus new Atlas tests: **82 passed**, including local
  PostgreSQL publication/access tests. Focused Atlas/cache suite: **10 passed**.
- Production build passed (Atlas route approximately 8 kB; first-load JS 114 kB). Existing
  global `themeColor` metadata warnings remain unrelated to Atlas.
- Browser checks use an isolated production-build server and a read-only local
  PostgREST fixture of the captured public run, because this checkout has no
  database credentials. No app fallback to fixture/seed data was added.
- At 1280px and 320px: no horizontal document overflow. Category/state/search
  filtering and zero matches verified. Map click selected a lapsed promise;
  its original-source warning and separate assessment references rendered.
- Keyboard list selection opened an open Lightning promise. Closing details
  returned focus to its list button. Its full-record link reached P16 on the
  project page with both the enclosing disclosure and evidence open.
- Found and fixed first-visit tour interception of `/atlas`; explicit Tour
  replay remains available. Enlarged overview category labels for mobile.
- Fresh-origin core-promise link with a conflicting ETH filter revealed BTC,
  cleared conflicting filters with a notice, and stayed on Atlas. Back/Forward
  restored filters. Retired filter showed 5 records. Fit/zoom changed the
  camera; dragging panned without opening a promise. No horizontal overflow.
- No-credential server rendered “The promise ledger could not be loaded.”
  The error did not become a zero-match or no-failures claim.
- Browser logs exposed an SVG title hydration warning. Converted title children
  to a single string; a fresh development render reports no Atlas errors.
- Browser input verified pointer drag and zoom buttons, not a physical
  two-finger touchscreen pinch. Pinch handling is implemented but a real-device
  gesture check remains a release follow-up. Original-source gaps and the seven
  classification decisions remain with the grading/review workstream.

### Release verification

- Implementation commit `ae4fd51` pushed to `main`; Vercel reported success.
- Opened [the live Atlas](https://prove-it-clock.vercel.app/atlas) in the browser:
  all 115 published promises loaded. Bitcoin + Lapsed filters returned one
  promise; selecting it opened the recorded rationale, source-role warning,
  assessment reference and full-record link. No production console errors
  were recorded during these checks.
- Live page document width matched the 320px mobile viewport. Desktop/mobile
  interaction coverage above remains applicable; physical pinch is still the
  explicitly unverified device check.
- No database writes, scoring publications or methodology changes. The seven
  Unclassified assignments and missing original-source attribution remain
  visible review work, not hidden omissions.

### Per-project Atlas — requested 2026-09-26

- Added the shared interactive Atlas immediately after the promise panel on
  every `/projects/[slug]` page. It displays only that project's published
  promises and occupied category regions, with the existing evidence panel,
  category/status/search controls and accessible list.
- The server reads the current published ledger, adapts/layouts once, then
  scopes the dataset before sending it to the client. Positions and versions
  match the global Atlas, including new/unmapped records. No new DB schema.
- Embedded controls stay local to the panel, preserving the project page's
  existing promise/evidence query parameters. “Open full Atlas” carries the
  current project, filters and selected promise to a shareable Atlas URL.
- Added project-specific section/list/detail IDs. Load failures and missing
  published assessments remain explicit. Review/test/release results follow.
- Verification: 11 Atlas/cache tests and TypeScript passed. The isolated
  production build passed after copying the archive Markdown needed by the
  existing case-study build into the test directory (the initial isolated
  build lacked those files; no app workaround was added).
- Browser checks against the read-only captured published run: BTC shows
  16 promises; Lapsed narrows to 1; selecting it opens the assessment evidence
  on the same page. Its existing `?promises=kept` parameter remains intact.
  No duplicate HTML IDs were found. At desktop 1280px and mobile 360px the
  BTC document width matched the viewport; evidence controls remained usable.
- The core BTC promise opened on mobile, and “Open full Atlas” carried BTC
  plus its selected promise into the global view (16/115 records). ETH shows
  its own 12 promises and its energy-use promise under Unclassified. No
  browser console errors were recorded. Physical pinch remains unverified.
- Muse's verdict-layer brief was pulled and reviewed in its task document.
  This embedded map remains below the promise panel, leaving the approved
  verdict-card position above the promise list available.
- Released in `14d5f95`; Muse review feedback is in `05844ce`. Both were
  pushed after fetching the latest main. Vercel reported a successful
  deployment. Live BTC project-page browser check loaded 16/16 promises,
  filtered to its one lapsed promise, and opened its recorded assessment
  and evidence without leaving the project route. No production console
  errors appeared in that check. Temporary local test servers were stopped.
