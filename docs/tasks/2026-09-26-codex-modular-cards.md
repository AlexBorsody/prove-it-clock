# Modular metric cards: list views and project pages share components

Date: 2026-09-26. From Alex: every metric's list-view row and the project
detail page must render the SAME component. No bespoke per-page copies.

## Rule (going forward)

Any metric with a list view (`/code`, `/hype`, a future `/team`) gets its
row/card as a component in `app/src/components/`. The project detail page
imports that component and renders it for its project. One component, two
surfaces. Never duplicate the markup.

## Work

1. **Extract `CodeRow`** from `app/src/app/(site)/code/page.tsx` into
   `app/src/components/code-row.tsx`. Props: the row data the page already
   builds (slug, name, symbol, commits90d, stars, forks, watchers, repoUrl,
   teamLine, failed) plus an optional `rank`. The `/code` page renders the
   list with it (ranked), unchanged visually.

2. **Add a CODE section to the project detail page**
   (`app/src/app/(site)/projects/[slug]/page.tsx`). It renders the same
   `CodeRow` component for that project (no rank, or rank within the 8).
   The power-grid CODE row stays as the at-a-glance overview; the new
   section is the full-fidelity view, identical to the `/code` list row.
   Keep the `project-{slug}-code` searchMeta block on the section.

3. **Extract a single-row `HypeRowCard`** from
   `app/src/components/hype-leaderboard.tsx`. The leaderboard keeps
   rendering the list with it, unchanged visually. The project page's
   existing HYPE section (currently a bespoke big-number block) renders the
   same `HypeRowCard` for its project instead. Keep the
   `project-{slug}-hype` searchMeta block on the section.

4. **TEAM** stays inside the CODE row for now (it already renders there via
   `teamLine`). If TEAM ever gets its own list view, its card follows this
   same rule.

## Constraints

- No visual changes to `/code` or `/hype` list views. Pixel-identical.
- Project page sections must look like the list rows they reuse, not
  restyled copies.
- No em dashes in any user-facing copy. No new timestamps or count labels.
- `npm run typecheck` and `npm run build` must pass.
- Push via the usual safe procedure (fetch remote main first; Codex may be
  mid-push on charts, so coordinate, never force-push a stale tree).

## Semantic section HTML (Alex 2026-09-26, from DevTools inspection)

Every page section must render inspectable, linkable HTML: a unique `id`
and a descriptive class, not a bare `<div class="panel">`.

- Project page sections: `<section id="project-{slug}-{name}"
  class="panel {name}-section ...">` where name is market, power, timeline,
  promises, hype, code, verdict, evidence. The searchMeta ids already follow
  this pattern (`project-{slug}-power` etc.); keep them and add the matching
  `{name}-section` class.
- `MarketPanel` currently renders `<div className="panel">` with no id and
  the page renders it bare (`<MarketPanel slug={slug} />`, no searchMeta).
  Fix: the component takes the section identity itself and renders
  `<section id="project-{slug}-market" class="panel market-section">`.
  Same rule for the new CODE section and the HypeRowCard section.
- New shared row components (`CodeRow`, `HypeRowCard`) render
  `<article class="{name}-row">` with the existing row classes kept.
