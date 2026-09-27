# Pivot: evidence over ranking — 2026-09-27

**Alex's decision.** Stop building ranking algorithms. Present the data and let people decide.

## Rationale

The ranking algo is essentially qualitative and proving almost impossible: every
weight is a judgment call (what counts as core, how much it counts), and each
answer spawns three more questions. The evidence underneath it is not
qualitative. A promise was made on a date, evidence exists or it does not, a
timeline shows what changed and when. That is the product. Nobody else has the
receipts; that is the moat.

## What parks

- The 1/2/4 tier weights and the 99-promise weights draft. Not deleted, parked.
- The four tier rulings (BAT core legs, LINK Swift, AVAX subnets, XRP escrow
  budget). Moot under this direction; do not chase Alex for them.
- The ranking calibration CLI (shipped, PR #9). Keep the tool; stop tuning
  toward an ordering.
- The realized-substance ordering algo. The impact-models layer still matters
  as *data* (usage figures with provenance), not as a ranking input.
- The warning-formula rework as a ranking device. The v1 rule stays as a
  mechanical flag on documented failures, nothing more.

## What accelerates

1. **Timeline graph with data.** The promise timeline is the differentiator:
   what was promised, when, what the evidence showed, what changed. Every
   event needs dates, URLs, lineage. This is the instrument.
2. **Evidence and data.** The claims-and-evidence ledger: one evidence system,
   receipts pinned to assessments, provenance on everything. The four-event
   editorial handoff (original promise, repeated mention, delivery evidence,
   corrected assessment) feeds this directly.
3. **Comparison.** Compare table, CODE/HYPE context metrics, side-by-side
   project data. Factual, inspectable, no verdict math.

## What stays as data, not judgment

- Delivery composition (K/F/O/U, proven delivery, outcome coverage). These are
  counts from the ledger, not qualitative scores. PR #8's composition view is
  still the right build.
- Category delivery shares. Percentages of kept promises per category are
  data. No weighted ordering on top.
- The Shitcoin warning as a mechanical flag: a lapsed/retired core promise is
  a documented fact, and the flag points at it. It is not a score.

## Implications for in-flight work

- PR #8 (delivery composition + reviewed publication contract): still wanted.
  Its composition view and evidence receipts are data presentation. Keep any
  qualitative weighting out of it.
- Do not build any new ranking, scoring, or ordering feature until Alex says so.
- The homepage stays an unranked browser. Rankings appear nowhere as headlines.

## Open question this does not answer

How the timeline reads for a project with no promises (not applicable, never a
full meter) and how Bitcoin's Genesis page frames its inventory without a
verdict. Design details, not methodology.
