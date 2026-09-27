# Tonight's decisions for Codex — 2026-09-27

Three product decisions from Alex tonight. Full briefs are on main; this is the
consolidated action list.

## 1. Evidence over ranking (brief: `2026-09-27-pivot-evidence-over-ranking.md`)

Stop building ranking algorithms. Present the data, let people decide. The
ranking algo is essentially qualitative and proving almost impossible; the
evidence underneath it is the product.

- Do not build any new ranking, scoring, or ordering feature until Alex says so.
- Parked: 1/2/4 weights, tier rulings, calibration tuning, substance ordering.
- Accelerated: timeline visualization with data, claims-and-evidence ledger,
  comparison tools.

## 2. Shitcoin score removed (brief: `2026-09-27-remove-shitcoin-score.md`)

Remove the score, the badge, and the API field. The badge is the product
deciding, which contradicts decision 1. The `core` flag smuggles qualitative
judgment into the mechanical rule.

- Strip the dial/badge from project pages, scoreboard, compare, HYPE cards.
- Remove `shitcoin_warning` from the public API and OpenAPI spec.
- Retire `lib/verdict.ts` as a user-facing instrument. Archive it.
- Promise states (`lapsed`, `retired`) stay as facts with dates and sources.
- Documented problems surface as an inspectable section with evidence links,
  per the direction-v2 warning viz contract. No badge, no dial, no category
  label. Do not use verdict vocabulary ("risk", "watch") as badges.
- The friend's warning-formula question is closed. No replacement score.

## 3. Timeline visualization is the focus

The promise timeline is now the headline build. A separate brief with the event
taxonomy and worked examples is in progress from Habib. What it will specify:

- Event model: original promise, repeated mention, delivery evidence, corrected
  assessment. Each with dates, URLs, lineage.
- Viz contract: see what changed, when, and why. Per project.
- The existing legacy timeline needs real work; do not polish it, rebuild
  toward the new event model.

## PR #8 guidance

Still wanted after rebase: the delivery composition view (K/F/O/U counts are
facts, not judgment) and evidence receipts pinned to assessments. Strip out
anything that computes a verdict category or score — that work is dead under
decisions 1 and 2. Keep qualitative weighting out of it entirely.

## Standing rules unchanged

- Never merge a stale branch. Rebase on current main first.
- Small shippable PRs, like #10/#11/#12 tonight. Do not re-bundle removed work.
