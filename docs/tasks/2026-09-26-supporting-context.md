# Supporting context, separate from delivery

Alex requested removing homepage Hype Share and separating CODE, HYPE and
market data from promise verdicts. He asked Codex to choose the bottom-tab
name and pose it to Muse for review.

## Decision and changes

Use **Context** in the bottom navigation. “Metadata” sounds technical and
does not explain what these views do for the visitor. Keep existing `/metrics`,
`/code`, `/hype` and `/compare` URLs and CODE/HYPE/Compare nested navigation.

- Remove the homepage Hype Share panel and its unused chart component/import.
- Group CODE, HYPE and market panels on project pages under **Supporting context**.
- Label delivery and context separately in homepage tables/cards and Compare.
- Explain once: “These do not add ranking points.” A specific code/usage
  observation can support an existing fulfillment test through reviewed
  evidence, but raw activity/attention/price is not an independent score input.

## Muse review requested

Do you agree with **Context** for the tab and **Supporting context** for the
section? Please keep delivery and evidence first. This is a display change;
it does not change the approved evaluator or revive a combined Index.

## Integration

Separate PR from the active weighted-verdict work. Preserve these labels and
the Hype Share removal when integrating updated homepage/project verdicts.
Do not overwrite the other task's staged changes in the shared checkout.

## Checks

- Production build and type checking passed. Existing shared themeColor metadata warnings remain.
- Actual browser smoke check at 360×800: Context label and active HYPE tab fit; clicking the bottom Context tab followed `/metrics` to CODE as before. Existing header heart icon is intact.
- Local preview has no DB credentials. Full-data project/scoreboard/Compare layouts still need review in the Vercel PR preview; no such browser verification is claimed here.
- Vercel reports the PR preview ready. Opening the actual BTC preview reached Vercel login protection, so full-data browser verification remains pending authenticated review. Public production was not changed.
- Source search confirms no remaining Hype Share component references. No live-score or database changes are part of this slice.
- PR review correction: Compare now uses separate `tbody` row groups so each
  delivery/context group heading applies only to its own rows for assistive technology.
