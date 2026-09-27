# Speculative Tech / Stocks v1 — Tesla-first scope

Alex supplied the ChatGPT build brief on September 27. This captures the proposed
scope and Codex's implementation review for Muse. It does not activate rankings,
publish company research, change crypto methodology or authorize hosted DDL.
Finish the crypto timeline's real publication first; see PR #16 and the timeline
foundation task. Muse owns token intake. Company implementation ownership is
not yet assigned.

## Product

Track what management promised, retain the original targets and every revision,
and show the sourced outcomes beside current business context. Tesla is the
first full company; do not create empty pages for the rest of the universe.

Separate ledger records, impact interpretations and valuation assumptions.
Assessments themselves are attributed judgments against stated tests, not raw
facts. A correction appends a new assessment with its predecessor and reason.
Neither a model change nor financial-data refresh rewrites an assessment.

Public and private companies share company identity. Only public companies
participate in public-equity financial discovery. Tesla, SpaceX and xAI have
distinct IDs even when an executive speaks for more than one.

## Reuse audit

- `app/src/lib/promise-timeline.ts`: date precision, source validation and
  correction references are reusable. Crypto states are not company states.
- `app/src/components/promise-timeline.tsx`: filters, source details and event
  selection are reusable. Heart-run receipts and project URLs need adapters.
  Its current evenly spaced vertical list is not the proposed shared time axis.
- Migration 007: append-only revision, idempotency, parent concurrency and
  server recording-time rules are reusable. Its foreign keys and validation
  deliberately require `projects`, `heart_runs`, crypto lineage and v3 states.
  Do not insert a company into that contract or weaken it to accept anything.
- Existing published-ledger readers and receipt links supply the publication
  pattern. Keep all live crypto routes and IDs compatible.

## Company contract to settle before DDL

1. Stable entity ID plus `public_company` or `private_company`; ticker/exchange
   are attributes, not identity. Company claims never join by executive name.
2. Stable claim lineage, attributable source, exact locator, source date,
   admission decision and explicit fulfillment test. Preserve source type;
   source prestige is not a promise weight or a guarantee of truth.
3. A target version records value/range, unit, period, accounting basis and
   deadline where applicable. An event introduces or revises it and links its
   predecessor. Preserve quarter/annual/multi-year/undated horizon and original
   date precision. Do not fabricate a deadline or test for vague rhetoric.
4. Assessments reference the **specific target version** and observed result.
   Original guidance missed / latest guidance met can coexist. Do not collapse
   those into one lineage-level fulfilled flag. Missing outcome research is
   unknown, not automatically missed when a deadline passes.
5. Source publication, occurrence and our recording times remain separate.
   A result restatement is another sourced record, not an overwrite.
6. Financial observations carry source, currency, period, observation time and
   basis. Price, market cap, revenue and EPS from incompatible periods/bases
   must not silently combine into a displayed ratio.

Initial categories: Financial Guidance; Product / Technology; Adoption / Market
Expansion; Operations / Capacity; Strategic Transformation; Capital Allocation;
M&A / Portfolio; Moonshots. Optional tags: AI, Autonomy, Robotics, Space, Energy,
Semiconductors, Cloud, Manufacturing. These organize commitments, not weights.

Keep company business events distinct from assessments: deadline/target/guidance
revision, launch, withdrawal, supersession and financial result are sourced
events; met/missed is an assessment against a target. Preserve the four-event
crypto taxonomy. Map domain-specific types into shared rendering rather than
silently adding stock semantics to old crypto records. Model revisions remain
outside issuer-performance events; no model infrastructure is needed in v1.

## Screens and acceptance

`/stocks`: High Expectations, an explicitly limited research universe, not a
claim of complete market coverage. Discovery selection is trailing P/E > 30
or earnings <= 0. Distinguish **negative** and **zero** earnings with N/M and
the correct reason; missing earnings are Unknown and do not satisfy either
filter. Forward P/E is a separately labeled estimate and never substitutes for
the trailing filter. Public/private status governs available fields.

Company detail: current business context; sourced promise record with delivered
and unresolved commitments; category/horizon filters; accountability timeline;
source receipts. No promises hardcoded in components. Financial data does not
change promise status. Missing context stays unknown, never a fake zero.

Timeline: a shared time axis with selectable event markers and a readable list
alternative. Show target revisions and the assessment's target together in the
detail view. Preserve precision and explain uncertain dates instead of implying
an exact day. Test mobile selection and dense same-date events. Price/revenue/EPS
overlays are deferred until the evidence interaction works.

## Small delivery tasks

- [ ] Finish crypto timeline publication/verification (PR #16 release handoff).
- [ ] Muse/Alex assign company data and UI ownership; resolve ranking scope below.
- [ ] Draft the company contract using one sourced Tesla guidance lineage with
      a revision and actual result. Record unavailable evidence rather than
      forcing this example to have a particular outcome.
- [ ] Add local additive storage and publisher/read adapters. Check original
      target retention, entity isolation, correction links and repeated writes.
      Do not migrate existing crypto records just to generalize names.
- [ ] Research a small Tesla set exercising product/operational deadlines,
      repetition, delivery, withdrawal and supersession where genuinely sourced.
      Missing examples are coverage gaps; never invent them for a test matrix.
- [ ] Build the company detail/timeline against that published contract.
- [ ] Add sourced financial observations and `/stocks` discovery; verify N/M,
      unknown, stale observations and public/private exclusions.
- [ ] Publish concise method/limitations copy; run focused checks, build and
      mobile/desktop inspection. Stop for review before adding more companies.

## Questions for Muse / Alex

1. The supplied brief proposes category rankings and hit rates. Tonight's adopted
   direction prohibits new rankings. Recommendation: v1 shows target-specific
   outcomes and coverage counts; keep ranking/hit-rate aggregation out until
   denominators and original/latest target policy are explicitly approved.
2. Confirm company implementation ownership so we do not build parallel schemas.
3. Select the financial-data source and acceptable update cadence during the
   Tesla slice. Verify source terms and metric definitions before integration;
   this scope does not claim provider research or API access is complete.

No stock hearts, universal score, AI grading, stock Atlas, fair-value estimate,
buy/sell label or cross-domain ranking is introduced. Valuation and impact
models remain later work with separate approval and versioned outputs.
