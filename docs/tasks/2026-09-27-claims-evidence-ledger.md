# Codex brief: direction v2 — the claims-and-evidence ledger

**From Alex, 2026-09-27 ~01:07 EDT ("next version"). Distilled by Habib. Status: approved direction.**

Purpose: separate the asset, the story, the evidence, and the price.
Help people understand what something does, why people value it, what
is demonstrated, and what remains a bet.

## Relationship to existing briefs

- Extends `2026-09-27-codex-layer-sequence.md`. The layer sequence
  stands: evidence ledger → impact models → category rankings →
  valuation models → explanation layer.
- Extends `2026-09-27-value-explanation-layer.md`. Triage unchanged
  (glossary v2 first, /learn/value second, project-page section
  third). Section title alias: "What supports this asset's value?" is
  the same section as "What gives this asset value?".
- Refines the visualization contracts in `2026-09-26-promise-atlas.md`
  and `2026-09-26-timeline-and-ledger.md` (adds the Warning's job).
- The genuinely new material is the domain-ready ledger design
  (section 3) and the scope gate (section 6). Nothing here overrides a
  build that is gated on tomorrow's resolutions.

## 1. The crypto spine question (adopted)

Use as the crypto-domain framing for the value section:

> What has this project demonstrated beyond creating another asset
> people can hold, transfer, and speculate on?

This is the same question as the earlier "additional economic
substance vs. another tradeable asset" framing — keep both, one as
heading, one as the test.

The central thesis, preserved: monetary usefulness, portability,
collectibility, and shared demand can support value without business
cash flow. "Everything else is speculation" remains a hypothesis the
evidence tests per project, never a verdict hardcoded into the product.

## 2. Layers and invariants

Evidence ledger → impact models → category rankings → valuation models.

- Changing an impact, ranking, or valuation formula NEVER changes
  whether a promise was delivered. Delivery is a ledger fact; every
  layer above is a versioned model reading it.
- Assessments are append-only; every event carries event_time and
  recorded_time (per the timeline-and-ledger brief); every model
  version is pinned and published.
- Market data never determines delivery.

## 3. Domain-ready ledger (the new design work)

The ledger must be designed for later domains without forcing
identical scoring:

| Domain | What we examine |
|---|---|
| Crypto | Promises, functionality, usage, impact, token value capture |
| Companies | Management commitments, forecasts, revisions, reported outcomes |
| Art | Attribution, provenance, edition, ownership and sales claims |
| Collectibles | Identity, rarity, condition, grading and sales claims |

Design constraints (Codex owns the DDL; semantics here are binding):

- Claims have types; "promise" is one claim type among others. Do not
  hardcode the schema to promises-only.
- **No promises means not applicable, not perfect delivery.** An asset
  with no recorded promises renders "not applicable," never a full
  meter. A zero-promise ledger is a coverage gap, not a clean bill of
  health.
- Instruments are domain-scoped. The Shitcoin warning and any
  "World Economic Impact"-style aggregates are crypto-domain
  instruments. Do not apply them indiscriminately to paintings and
  cards. Each domain gets its own models.
- One evidence system, domain-specific models — never one formula
  pretending everything creates value the same way.
- Repeated announcements of the same claim add MENTIONS, not
  additional fulfilled promises. (Maps to the repeat-mention event in
  Habib's 4-event handoff, coming tomorrow.)

## 4. Visualization contracts

Each visualization has one job; all consume the same ledger:

- **Atlas:** discover related claims.
- **Timeline:** see what changed, when, and why.
- **Warning:** inspect specific documented problems.
- **Meter** (from the timeline-and-ledger brief): the verdict now.

Note: the warning formula is under review with Alex's friend (brief:
`~/workspace/your_files/prove-value-shitcoin-formula-question.md`).
Do not build new warning UI until that review lands — the contract
above is about the job, not the current v1 badge.

## 5. Vocabulary additions for glossary v2

Add to the glossary v2 term list from the value-explanation-layer
brief: **provenance, speculative demand**. Shared definitions feed
`/learn/value` and the project-page section — one definition, used
everywhere, never conflicting copies across tooltips, methodology
pages, and copy.

## 6. Scope gate (Alex's decision)

1. Finish the crypto experience first.
2. The ledger schema is extension-ready (section 3) but
   crypto-populated only.
3. Then test ONE collectible case study before building another full
   section. The collectible test validates the domain design; it is
   not a second product.
4. Build one evidence system with domain-specific models, not one
   formula pretending everything creates value the same way.

## What is NOT changing tonight

- Gated builds (impact model, category indices) still wait on
  tomorrow's resolutions: weights review, promise-type taxonomy,
  warning formula, XRP/SWIFT research, Habib's 4-event handoff.
- Glossary v2 remains the most question-free build if you want to
  start tonight.
