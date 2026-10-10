# Speculative Tech (Stocks) — Implementation Spec
2026-09-27. Companion to `2026-09-27-stocks-speculative-tech-section.md` (the product brief).
Author: Habib. Implementation: Codex. Working tree only, no commit, no push.

> Superseded in scope by `2026-09-27-stocks-v1-scope.md` (Alex's v1 scope brief, authoritative).
> This doc remains as the build log for what was implemented first.

## 1. Goal

Add a Speculative Tech domain where Bubble or Build tracks management promises against actual
delivery, current fundamentals, realized impact, and the expectations embedded in valuation.
Tesla is the reference case. The schema must fit Nvidia, Broadcom, SpaceX, OpenAI, Anthropic
and similar high-expectation companies without changing the core ledger.

The one-line product promise for this section:

> Here is what management told the world would happen, every revision they made, what
> actually happened, and how much of today's valuation still depends on outcomes that
> have not happened yet.

## 2. Hard constraints

- Do not touch the crypto ledger, scoring, hearts, or ranking code paths. New tables,
  new routes, new components. Shared UI primitives (bottom nav, page chrome) may be
  extended, never rewritten.
- The crypto append-only discipline applies here too: claim events are immutable once
  recorded. Guidance revisions are new events that reference what they revise, never
  edits of the original.
- The valuation / expectation-gap layer is a versioned, assumption-driven MODEL, not an
  observed fact. It is always labeled as such in UI and API, with the model version and
  its assumptions visible. Never present "the price requires X" as a fact.
- No em dashes in any user-facing copy (standing rule, obviously AI).
- No timestamps or count labels on cards (standing rule: no LAST SCORED / N PROJECTS style).
- Working tree only. No commit, no push. Verify mechanically: `next build` passes,
  smoke-test dynamic routes with `next start` + curl before calling it done.

## 3. Data model

### 3.1 `companies`
- `slug` text PK (e.g. `tesla`, `nvidia`, `spacex`, `openai`, `anthropic`)
- `name` text, `sector` text
- `listing` text: `public` | `private`
- `ticker` text nullable (null for private companies)
- `created_at` timestamptz

### 3.2 `stock_history_revisions` (append-only, mirrors `promise_history_revisions`)
Same envelope pattern as the crypto ledger: `revision_key` unique, `company_slug` FK,
`previous_revision_id` chain, `author`, `events` jsonb array, `request` jsonb,
`recorded_at`, immutable triggers, RLS read-only for anon.

Event kinds (stock-adapted):
- `claim_stated` — the original management claim. Fields: `id`, `lineage` (stable claim
  identity across revisions), `occurredOn`, `summary`, `author` (who recorded it),
  `speaker` (name + role), `speakerCapacity` (e.g. `CEO on earnings call`, `10-K`,
  `investor day`), `claimCategory` (taxonomy below), `tags` (cross-cutting), `deadline`
  (nullable, YYYY-MM-DD or looser), `metric` + `targetValue` (nullable, for guidance),
  `source` {url, title, publishedOn, quote?, locator?}.
- `claim_repeated` — same/narrowed/expanded restatement, references `originalId`.
- `claim_revised` — a guidance revision. New `targetValue`, `supersedes` event id,
  `revisionReason` (quote or paraphrase with source). The original event is never edited.
- `evidence` — supports/refutes/context, with provenance. Delivery lives here.
- `fundamentals_reported` — a reported quarter/period: revenue, net income, free cash
  flow, gross/operating margin, plus the source (10-Q, earnings release) and period end
  date. Append-only snapshots, not a mutable "current" row.
- `assessment` — a published judgment on one claim lineage: open / fulfilled / lapsed /
  retired, tied to a methodology version, supersedes chain for corrections with reason.

Guidance revision history requirement: if a company guides $10B, cuts to $8B, then
reports $8.1B, all three facts persist. "Met latest guidance" and "missed original
guidance" can both be true and both must be derivable from the ledger.

### 3.3 Claim taxonomy (`claimCategory`)
- Financial Guidance
- Product/Technology
- Adoption/Market Expansion
- Operations/Capacity
- Strategic Transformation
- Moonshots

Cross-cutting `tags`: AI, autonomy, robotics, space, energy, chips. Tags are additive;
categories are single-select per claim.

### 3.4 Entity scoping rule (formal)
Every claim event has `company_slug`. A claim belongs to exactly one company.
A statement by a person counts only when made as a commitment or forecast for that
company in an official capacity (earnings call, filing, investor day, official
company channel). Personal social posts count only when they are unambiguously a
company commitment (e.g. guidance-level statements from the CEO account that the
company later ratifies). When in doubt, exclude. This is not a quote tracker.

### 3.5 Valuation + Expectation Gap (model layer, versioned)
- `valuation_models`: `version` text PK (e.g. `expectation-gap v1`), `assumptions` jsonb,
  `methodology` text, `created_at`. New version = new row, never an edit.
- `expectation_gap_assessments`: `company_slug`, `model_version` FK,
  `as_of` date, `inputs` jsonb (fundamentals snapshot ids, market value, sources),
  `embedded_expectations` jsonb (the future outcomes the valuation appears to require,
  each with the assumption it rests on), `gap_summary` text, `author`.
- UI and API must label this layer as a model with its version and assumptions visible.

The gap is the stock equivalent of the crypto thesis:
> Crypto = proof versus speculation. Speculative tech = fundamentals versus expectations.

## 4. Intake pipeline

Mirror `app/src/pipeline/promise-intake.ts` with `app/src/pipeline/stock-intake.ts`:
- Company intake: a curated registry (`app/src/lib/stock-companies.ts`) rather than a
  market-cap API, because the set includes private companies (SpaceX, OpenAI, Anthropic).
  Registry entries: slug, name, sector, listing, ticker?, data sources.
- Fundamentals intake: script to capture quarterly fundamentals from company filings /
  earnings releases into `fundamentals_reported` events. Start manual and sourced;
  automation later.
- Claim intake: script scaffolding for capturing `claim_stated` events with source,
  date, speaker capacity. Tesla pilot claims are researched and entered through this
  path with exact source URLs.

## 5. UI

- New bottom tab: **Stocks**, `href: "/stocks"`. Fifth tab next to Scoreboard / Context /
  Methodology / API. Reuse the bottom-nav component; add the tab, don't restyle.
- **Context tab** gains a stocks section (per Alex's call). The metrics/context page
  gets a stocks block linking into `/stocks`.
- Company page at `/stocks/[slug]`, mirroring the structure of crypto project pages:
  claim ledger (with revision history visible per claim), delivery, realized impact,
  fundamentals (from `fundamentals_reported` snapshots), valuation + expectation gap
  (clearly labeled as model v1 with assumptions).
- No leaderboard as the headline. Per crypto direction, no coin-vs-coin ranking here
  either; the expectation gap per company is the product.
- Copy rules: no em dashes, no timestamps, no count labels, green = good/delivered,
  red = missed/lapsed, grey = open.

## 6. Tesla pilot (reference case)

Seed the ledger with a first set of Tesla management claims across the taxonomy,
each with exact source, date, speaker capacity, deadline, and revision history where
guidance was cut. Suggested starting claims (researcher to verify each with primary
sources): vehicle delivery guidance and revisions, Full Self-Driving timelines,
Robotaxi, Optimus, energy storage deployment targets, 4680 ramp. Entity scoping
applies: Tesla claims only, not SpaceX/xAI.

## 7. Acceptance

- [ ] Migration `008_stock_ledger.sql` applies cleanly; append-only triggers verified.
- [ ] `next build` passes; `/stocks` and `/stocks/tesla` smoke-tested via `next start` + curl.
- [ ] Tesla pilot: at least 8 sourced claims in the ledger, at least one with a full
      guidance-revision chain (original, revision, actual).
- [ ] Expectation gap section renders with model version + assumptions labeled.
- [ ] No changes to crypto routes, ledger tables, or scoring. No commit, no push.
