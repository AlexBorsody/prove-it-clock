# Card heart clicks and promise categories

Owner: Codex. Based on main cfa3824, including Muse's 0f0b798 horizontal-scroll table repair and d093c70 evidence-link cleanup.

## Request and implementation

Alex reported that List heart expansion works but Cards does not, asked for the missing category meters and a category on each promise, and explicitly authorized merging verified changes without waiting for routine PR feedback.

The card's old pressed-state scale changes the hit area while clicking. A direct first-heart click failed during local reproduction while a click at the button center worked. Replace the scale with opacity feedback, keep a stable 44px control, add an expansion chevron, and place the existing expanded promise content immediately below the hearts, ahead of supporting context. The whole-card project link and Compare control remain separate actions.

One new display component, `PromiseCategoryMeters`, is necessary to reuse the category breakdown in both Cards and List. It reuses `HeartMeter` and the existing `DeliverySummary`, counts only primary assignments, and links to the same Atlas category population. Colors identify subjects. Filled and empty hearts retain their existing meaning. No weights, ranking changes, new data requests or duplicate ledger are introduced. This salvages the useful approved mechanic from closed PR18 without restoring its stale project-page structure.

Each homepage promise now carries its stable lineage and existing Atlas category. Both expanded homepage promises and project-page promise rows display the category name, with Unclassified for missing mappings. No new classification is inferred. Aggregate heart count text is removed under the existing inventory display brief; accessible heart counts remain. Genesis filled hearts retain their pattern.

Muse's mobile List remains a six-column table with horizontal scrolling. No mobile grid conversion or replacement Cards/List toggle.

## Verification

- Live desktop reproduction: the prior card button could expand content below supporting context; category meters and individual category labels were absent.
- Local desktop browser using the existing published seed fixture: direct first SVG-heart click expands without navigation; Enter collapses with focus retained; List expansion includes five Avalanche category meters and 17 promises; Cards/List switching retains expansion; Compare selects two assets; existing Hearts sorting still works.
- Ethereum's unmapped promise appears in both the Unclassified meter and its own category badge. Category links include project, category and primary scope. No desktop page overflow observed.
- Mobile CSS inspected: horizontal-scroll table and wrapping heart flex layout retained. No mobile viewport emulation or physical-phone acceptance claimed.
- Temporary fixture route removed before production build. No hosted data writes.

TypeScript, production build, whitespace check and two existing delivery-population checks passed. The build reports existing themeColor metadata warnings. The checks cover all 115 promises in the seed fixture; they do not claim a new hosted assessment publication. Final visible copy was re-read. Muse's later bottom-tab ordering change at 67b796b is integrated unchanged.

## Concurrent Muse update

Muse's 7726a1d arrived while PR23's preview was building. Preserve its project promise Cards/List switch and default List presentation. Thread the existing category assignment into both variants: a secondary line beneath the compact row title and a category badge in Cards. No rollback of the new layout.

After integrating 7726a1d, desktop fixture checks passed for project List row expansion, category text under compact titles, category badges in Cards, and homepage first-heart click (five meters, 17 labeled Avalanche promises). Removed the fixture again. PR: https://github.com/AlexBorsody/prove-it-clock/pull/23.
