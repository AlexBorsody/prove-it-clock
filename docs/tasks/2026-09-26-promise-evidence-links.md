# Promise metrics → evidence — 2026-09-26

- Delivery-health counts and bar segments link to the matching promises with evidence expanded. Show all restores the complete list. Filters use the same legacy-state normalization as scoring displays; failed includes lapsed and retired, while open-heart stats exclude unknown states.
- Promise hearts and status badges link to that promise's exact evidence disclosure. Verdict reasons and the rules table link there too. The full verdict uses a group role so assistive technology can reach its links.
- Promise-stat counts link to the corresponding records; related-news links restore all promises before targeting a card.
- URLs carry the filter or evidence lineage, so reload/back/share preserve the requested view. No new scoring, source inference, database changes or client state store.
- Missing evidence is explicitly labeled. Existing source URLs are used without inventing citations.
- Focused checks: six promise-context tests passed, including filter/count consistency and escaped evidence anchors. Manual acceptance: tap kept/failed counts, inspect sources, tap a status and a verdict reason, then use Show all and browser Back.
- Production build (including lint/type checks) and `git diff --check` passed.
