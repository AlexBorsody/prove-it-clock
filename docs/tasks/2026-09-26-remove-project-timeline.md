# Remove project timeline graphs — 2026-09-26

- Alex rejected the current Delivery Timeline and HYPE activity charts as the project's distinctive ranking visualization. Removed both from project details; no replacement graph or scoring formula is introduced.
- Removed their unused historical reconstruction code and the tour step advertising the timeline as the "special sauce".
- Kept the `#hearts` comparison link working by moving its target to promise stats.
- Existing published assessments, scores, evidence and history APIs remain unchanged.
- The second screenshot also circles CODE stats just updated in the prior task; clarification requested before removing that card.
- Validation: TypeScript check and `git diff --check` passed. Live acceptance should show CODE followed by Promises, with neither removed graph nor the old tour step.
