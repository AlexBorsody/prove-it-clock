# Remove the Shitcoin score — 2026-09-27

**Alex's decision.** Remove the Shitcoin score and badge entirely, now.

## Rationale

The evidence-over-ranking pivot (2026-09-27) says: present the data, let people
decide. A SHITCOIN badge is the product deciding. It also smuggles qualitative
judgment inside a mechanical rule: "core promise lapsed" depends on the `core`
flag, which is a researcher's judgment call. The Bitcoin 7 proved the formula
reads as random. The receipts have teeth on their own; the badge is theater.

## What gets removed

- The shitcoin dial/badge from project pages (including the Genesis-adjacent
  layout), scoreboard, compare table, HYPE cards, homepage.
- The `shitcoin_warning` field from the public API and the OpenAPI spec.
- The categorical verdict function (`lib/verdict.ts` and its gauge mapping) as
  a user-facing instrument. Archive, do not repurpose as a hidden score.

## What stays

- Promise states as facts. `lapsed` and `retired` remain on promise records;
  the promise list and timeline keep showing them with dates and sources.
- Documented problems as inspectable items, per the direction-v2 viz contract
  ("Warning: inspect documented problems"). A section that lists what failed,
  with evidence links. No badge, no dial, no category label.
- Delivery composition counts (K/F/O/U). Factual, stays.

## Notes

- This supersedes the "warning as a mechanical flag" line in the
  evidence-over-ranking brief. There is no flag anymore, only the documented
  problems themselves.
- The friend's warning-formula question is closed. Do not build a replacement
  score.
- Copy must not reintroduce verdict language ("risk", "watch", "verdict") as a
  badge. "Documented problems" with evidence links is the vocabulary.
