# Timeline foundation: event taxonomy and worked examples — 2026-09-27

The timeline visualization is now the headline build. This brief defines the
event model it renders, with worked examples from real ledger data. The legacy
v0.2.0 timeline is not the base; the event model below is.

## The contract

Per project: see what changed, when, and why. Every event has a date, a source
URL, and a lineage back to its promise. No event without a source. No source
without a date.

## Event taxonomy

Four event types. A promise's timeline is the ordered sequence of its events.

1. **promise_stated** — the original promise as first attributable statement.
   Fields: date, source URL, quote or closest paraphrase, speaker/issuer,
   claim_type (milestone/ongoing). One per promise lineage. Repeated
   announcements are not new promises.
2. **promise_repeated** — the promise restated later. Fields: date, source URL,
   what changed in the wording vs. the original (narrowed, expanded, same).
   Links to the original `promise_stated`.
3. **evidence** — a dated observation bearing on fulfillment. Fields: date,
   source URL, summary, stance (`supports` | `refutes` | `context`), and
   provenance notes (issuer-reported, independent, subsidized, bot-caveat).
   Evidence never determines delivery by itself; it is the material the
   assessment cites.
4. **assessment** — a published judgment at a point in time. Fields: date,
   state (open/fulfilled/lapsed/retired), rationale, methodology version,
   supersedes (previous assessment). A **corrected assessment** is an
   assessment whose `supersedes` is non-null, with the reason for the change
   stated explicitly.

## Worked example 1: xrp-p01-bridge-liquidity (fulfilled)

| date | type | source |
|---|---|---|
| 2017-05-16 | promise_stated | Ripple escrow announcement: "XRP is a digital asset designed for enterprise use, with companies able to use XRP for on-demand liquidity as a bridge currency at lower cost." https://ripple.com/insights/ripple-to-place-55-billion-xrp-in-escrow-to-ensure-certainty-into-total-xrp-supply/ |
| 2018-10 | evidence (supports) | Ripple Q4 2018 XRP Markets Report: xRapid commercially available; MercuryFX, Cuallix, Catalyst Corporate Federal Credit Union signed. https://ripple.com/insights/q4-2018-xrp-markets-report/ |
| 2019-11-07 | evidence (supports) + promise_repeated | Daily Hodl: RippleNet 300+ clients, two dozen ODL customers, MoneyGram settling in seconds. Restates the bridge thesis at operating scale. https://dailyhodl.com/2019/11/07/ripple-hits-300-clients-as-moneygram-announces-expansion-of-xrp-powered-on-demand-liquidity/ |
| 2024-12-16 | evidence (supports, with caveat) | Ripple USD launch PR: Ripple Payments processed $70B+ across 90+ payout markets. Provenance note: issuer-reported; Ripple Payments volume is not automatically XRP-routed volume. https://www.businesswire.com/news/home/20241216911945/en/5762080/Raising-the-Standard-for-Stablecoins-Ripple-USD-Launches-Globally-with-Unmatched-Utility-Experience-and-Compliance |
| 2026-09-26 | assessment | fulfilled, methodology v3, rationale: commercial xRapid customers (2018), ODL at MoneyGram scale (2019), $70B+ Ripple Payments volume (2024). |

## Worked example 2: xrp-p19-codius (retired)

| date | type | source |
|---|---|---|
| 2014-07 | promise_stated | Ripple announces Codius, a smart-contract hosting platform. |
| 2015 | evidence (refutes) | Bitcoin Magazine: Ripple discontinued Codius development, citing a small market. https://bitcoinmagazine.com/business/ripple-discontinues-smart-contract-platform-codius-citing-small-market-1435182153 |
| 2015 | assessment | retired. Rationale: explicitly discontinued by the issuer for lack of demand. |
| 2018-06-06 | evidence (context) | CoinDesk: former CTO Stefan Thomas revived Codius outside Ripple. Lineage continues outside the issuer; the promise as stated by Ripple stays retired. https://www.coindesk.com/markets/2018/06/06/ripple-smart-contracts-creator-targets-ethereum-with-new-tech-launch |

This is the shape the timeline must render: a promise born, evidence arriving
for and against, an assessment, and later context that does not rewrite the
assessment.

## Backfill plan

The current fragments store evidence as untyped summary/URL pairs with dates
buried in prose. Backfill converts each promise's evidence array into typed
events:

- First evidence item dated at or near `effective_at` with issuer language
  becomes the `promise_stated` (verify against the actual source; do not guess).
- Remaining items become `evidence` with stance and provenance assigned by the
  researcher, never inferred by script.
- `effective_at` becomes the `promise_stated` date only when the source
  confirms it.
- Assessments come from the published heart runs, with methodology version.

Backfill is researcher work, promise by promise. Scripts may draft, humans
decide. This is the foundation Alex means: no visualization without the event
data underneath it.

## Viz direction for the build

- Per-project chronological timeline. Event markers differentiated by type;
  evidence markers carry their stance color; assessments are the spine.
- Click any event: the evidence drawer (Atlas pattern) with source link,
  quote, provenance notes.
- Corrected assessments render as a visible revision: old state struck through
  with the reason, not silently replaced. The timeline must show we changed our
  mind and why.
- No verdict math anywhere on the timeline. Counts of events are fine.
- Mobile: the timeline must read at 360px. If it does not, it is not done.

## Codex feedback for Muse — 2026-09-27

The four event types are enough for v1. Before the research backfill:

- Supply the original Codius announcement URL; its 2014-07 example currently
  has no source link. Leave that event unpublished until sourced.
- Preserve year/month date precision. Keep event occurrence, source publication
  and our recording/assessment date separate; do not fill missing dates with
  January 1 or backdate a present assessment to the underlying event.
- The 2015 Codius retirement is source evidence. Unless a real published 2015
  assessment exists, the assessment event comes from the actual published run
  date, with 2015 described in the evidence.
- Provide one genuine corrected assessment with its predecessor and reason
  when available. Neither worked example currently contains that pair; do not
  fabricate a revision just to demonstrate the UI.
- Preserve the Ripple Payments versus XRP-routed-volume caveat in the event
  drawer. Source position in an array never establishes original-claim status.

These are checks of the supplied brief, not a new verification of its external
research. Next ready slice: a small append-only event contract and read adapter,
with no historical assessment inference or scoring publication.

## Codex build checkpoint — 2026-09-27

PR #8 was narrowed and rebased as `b5e4b1d`, then merged to main as `f841837`:
only unweighted composition and published-run receipts. No verdict, weights or
new scoring publication. The obsolete draft remains preserved locally. PR #13's
warning removal is also merged; the timeline branch includes both changes.

Timeline owner: Codex, isolated branch `codex/promise-event-timeline`.
Draft [PR #15](https://github.com/AlexBorsody/prove-it-clock/pull/15) contains
implementation commit `bae141a`. Ready for code/schema review; hosted rollout
and the first reviewed real event batch remain pending.

- Migration `007_promise_event_history.sql` adds immutable per-project history
  revisions beside the existing heart publications. The writer is an atomic,
  service-role-only RPC. Each revision appends new event IDs to the prior
  history; retries must match exactly, and stale/forked writes are rejected.
- All four event types carry source dates, URLs, attribution and stable promise
  lineage. Year/month precision stays intact. The database supplies recording
  timestamps; callers cannot backdate them. Incomplete source/date research
  stays unpublished, not assigned invented dates.
- Assessment events must match a real published v3 promise state and the
  publication's server-recorded date. The snapshot's `as_of` is not proof of
  when a historical delivery/lapse occurred. Corrected assessments retain the
  old event and require a same-lineage predecessor and reason.
- The reusable project timeline appears before Atlas. Expand an event for its
  source, quote, provenance and correction. Filter by promise/type; switch
  event time versus recording time. A shared history link pins its revision.
  Assessment details link to the exact published run's evidence receipt.
  There is no simulated price/score line or reconstructed legacy history.
- Public reads distinguish no published history from a failed read or missing
  requested revision. Hearts and the legacy event/scoring stores are untouched.

### Release and data handoff

This is local schema/code work. No hosted migration, real event publication or
score publication has been performed. Until 007 is applied through the reviewed
release process, the new panel truthfully reports history unavailable. Once the
table exists, projects without published revisions report no dated events yet.

Muse: supply reviewed events with source publication date, event date/precision,
lineage, author and provenance. The Codius original source and a real corrected
assessment pair are still missing from the examples. Do not import the 2015
Codius retirement as an assessment published in 2015. The exact write contract
and deployment sequence are in implementation.md. No backfill was guessed.

Checks: three focused tests pass for date/source validation; PostgreSQL atomicity,
idempotency, append-only permissions and correction rules; and empty/error read
distinctions. Production build (including TypeScript) passes on the rebased
branch. Existing `themeColor` metadata warnings remain.

The isolated production preview used five clearly fictional events generated by
the SQL writer. At 360px and 1280px, the page and timeline had no horizontal
overflow. Checked event filtering, event/recording date switching, month/year
precision, source/provenance details, the visible corrected state and reason,
focus returning to the prior assessment, and reopening a pinned history link.
The BTC fixture with no history renders the explicit empty-coverage message.
The final singular/plural count wording is a text-only change after that preview.
This is not a real research backfill or hosted rollout check.

PR #8's review found a stale Atlas test for the old evidence URL. Focused
follow-up [#14](https://github.com/AlexBorsody/prove-it-clock/pull/14), `4d7c3f5`,
validates the new receipt parameters and exact promise selection. Its 11 existing
Atlas/cache checks pass; application behavior is unchanged.

### Sync checkpoint — 2026-09-27 09:26 UTC

PR #14 is merged as `273f7f6`; #15 is rebased onto it. Application and migration
contents are unchanged from the checked `28ffbc4` revision, so no checks were
repeated. The prior preview reports Ready in Vercel's PR status; this is not
hosted database or event-data verification. No new review comments or research
handoff arrived. Codex retains #15; Muse's source/schema handoff above is pending.
The shared checkout and its untracked `.vscode/` remain untouched.
