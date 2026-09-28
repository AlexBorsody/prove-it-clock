# Heart meter: single aggregated meter, expands to per-category meters

**From Alex, 2026-09-27. Relayed by Habib (Muse).**
Decision: keep ONE aggregated heart meter everywhere it is displayed.
Clicking/tapping it expands an inline drill-down showing one meter per
category, each in its own color, mirroring the atlas category split. The
[display review brief](2026-09-27-heart-meter-display-review.md) is out for
ChatGPT review; it carries the open visual-treatment questions.

## Tasks

1. **Make the heart meter expandable.** Clicking/tapping the aggregated
   meter expands an inline drill-down showing one meter per category. Render
   the expanded meters with the same meter component off the same promise
   records. One component, one data source, no second pipeline.

2. **Category colors.** Each category gets its own color in the expanded
   view. Colors must be neutral categorical colors, not traffic-light
   judgments, until the review brief resolves its color-semantics question.

3. **Display contract.** The aggregated meter carries no rank language, no
   count labels, no timestamps. It reads as inventory (earned hearts vs
   capacity), never as a score. In the expanded view the category indices
   are the headline.

4. **Atlas link.** The expanded per-category view links into the atlas
   evidence view, completing the verdict-to-atlas drill path. (Pending
   review question: confirm linked vs self-contained.)

5. **Gating.** The expandable mechanic can ship now. Final visual treatment
   (inventory vs index fill on the expanded meters, empty-category display)
   waits on the ChatGPT review brief. Do not invent weights or a new
   publication.

## Out of scope

- Fractional/partial hearts. Explicitly deferred by Alex, 2026-09-27.
- Any cross-category aggregation that would reconstruct a universal score.
- Changes to promise states or the fulfillment test rule.

## Codex implementation — September 27

Owner: `codex/expandable-heart-meter`, based on main `a14272a`.

- Added one native disclosure wrapper used on project headers, homepage desktop
  rows/mobile cards and Compare. It renders the existing pixel-heart component
  for the aggregate and each populated primary category. Separate All promises
  controls still work; the meter no longer opens that unrelated list.
- Reused `DeliverySummary` and `deliveryReceipt`; category populations count each
  promise once, including Unclassified. Compare now shares the cached published
  ledger/Atlas read instead of combining separate reads.
- Removed the mobile ten-slot approximation and Compare's duplicate bar/percentage
  beneath the aggregate. The header brand icon is unchanged.
- This is the expandable inventory mechanic, not a weighted category index.
  Category names lead; colors distinguish subjects without outcome grades.
  Only populated categories render in this slice; final empty-category and
  weighted-index visual decisions remain with the open review. No invented
  weights, fractional hearts or new publication.
- Missing category data is explicitly unavailable. Category links select the
  same project and primary-category population in Atlas. Native disclosure
  semantics provide keyboard expansion without nested buttons or added JS.

Verification: the existing seven summary/receipt checks, TypeScript and production
build pass. Browser checks used the real components with the checked-in published
seed fixture at 360×800 and 1280×900: card expansion, Compare expansion, keyboard
Enter, category navigation, and desktop row alignment. The mobile page stayed
360px wide when expanded; Compare keeps its existing horizontal table scrolling.
The temporary preview route was removed before committing. The Atlas link reached
the correct project/category/primary-scope URL; hosted ledger loading and production
deployment were not verified. No hosted database changes or score publications.

Handoff for Muse: the mechanic is ready for review; apply any approved visual
treatment in the shared wrapper rather than creating a separate category meter.
