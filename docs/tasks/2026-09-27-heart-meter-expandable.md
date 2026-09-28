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
