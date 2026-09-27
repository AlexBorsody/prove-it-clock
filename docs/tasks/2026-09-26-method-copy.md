# Method page: plain-language review

Owner: Codex. Requested by Alex on 2026-09-26. Separate from the active verdict implementation.

## Changes

- Lead with claim, test and evidence. Keep the heart explanation visible; put the detailed rules in native disclosures.
- Explain current v3 counts, exact statuses, category ratios and the dial's fixed positions. An open promise is not a failure; a published record is not proof of independent verification.
- Remove the stale XRP 2-of-4 example, speculative intrinsic-value Index, unsupported independent-data/verification claims and repeated promotional copy.
- Explain approved v4 separately as **not yet published**, including 1/2/4 importance, all-tracked denominator, outcome coverage and lifecycle distinction.
- Retain comparison links to `#hearts`, `#verdict` and `#pillars`, plus section search metadata. No grading or database changes.
- Incorporate Alex's Bitcoin distinction: original delivery, present use and historical contribution. Follow Muse's fresh `4a30d97` handoff: Genesis asset is excluded from altcoin verdict rankings while retaining its inventory. No invented bonus.

## Handoff to Muse and verdict implementer

The method page is owned in this PR. Keep v4 changes in the verdict workstream.
At actual activation, update this page in the same release: v4 explanation becomes current, v3/dial explanation becomes historical, and Atlas status wording must match the active adapter. Do not describe a code deployment as a scoring publication.

Synced `4a30d97`, which supplies Muse's actual acceptance, draft ownership at
`docs/tasks/2026-09-26-verdict-weights-draft.md`, and the Bitcoin Genesis asset
decision. The earlier empty `79f09ce` alone did not provide that handoff.
The verdict implementer has been notified. At release, change the Method
page's future-tense Genesis wording only after the exclusion actually runs.

Muse: please review the tagline proposal in `docs/vision.md` and leave your
wording preference here or on the PR. Recommended: “An accountability layer
for speculative technology.” Supporting line: “What they promised. What they
delivered.” Alex's valuation framing remains the broader positioning idea;
the current product does not calculate a fair price.

Genesis rationale wording: present the exemption as Alex's explicit product
choice. An anonymous author can still make an attributable claim; we should
not imply that anonymity alone prevents checking evidence or that every other
crypto project has an identified founder.

Source check: read the original Bitcoin whitepaper section 10. It describes public-key privacy and explicitly acknowledges linking risks. P11 remains an editorial mismatch to resolve, not an independently confirmed promise of complete anonymity. No BTC rating was changed.

## Checks

- Production build and its type checks passed; existing shared `themeColor` metadata warnings remain.
- Actual browser review at 360×800 and 1280×800: readable wrapping, native disclosure click/Enter, and direct `#methodology-publication` link opening and focusing the section.
- Kept the existing navigation/icon intact. Isolated preview had no database credentials; this checks Method copy/navigation, not live scoring data. First-visit tour redirected to BTC before returning to Method, an existing behavior outside this change.
- No independent promise fact-checking or production deployment is claimed.

## Collaboration

The existing hourly coordination task was renewed without its old September 24 end date. It reads new commits, Markdown handoffs and PR feedback, preserves active work, and opens focused PRs. No direct implementation pushes to main or automatic merges. Unchanged checks stay quiet.
