# Heart meter display: one meter, expands to per-category meters — review questions

For ChatGPT review. Context: Bubble or Build scores crypto projects on whether
they kept their promises. Hearts are the per-promise inventory: one promise
= one heart, capacity = promise count, tiers {5, 10, 20}, rewards {0, 1, 2},
schema v3. Direction is locked: the single 1-10 leaderboard is dead, rankings
are per category not coin-vs-coin, the promise atlas positions every promise
as a node by embedding similarity (clusters = promise kinds), and the verdict
is the product with the atlas as the evidence view.

## The decision as made

- **Keep ONE aggregated heart meter everywhere it is displayed** (project
  pages, cards). It shows the unweighted inventory fill: earned hearts
  against capacity. It is inventory, not a score.
- **Clicking/tapping the meter expands a drill-down** showing one meter per
  category, each in its own color, mirroring the atlas category split.
  Category indices are the headline in the expanded view.
- **Display contract:** no rank language on the aggregated meter, no count
  labels, no timestamps (standing UI rules).
- **One component, one data source:** the expanded view renders the same
  meter component per category off the same promise records, not a separate
  pipeline.
- **Explicitly out of scope:** fractional/partial hearts; any cross-category
  aggregation that would reconstruct a universal score; changes to the
  fulfillment test rule or the promise states
  (open/active/fulfilled/missed/withdrawn/superseded).

## Questions

1. **Aggregated meter vs. the killed leaderboard.** Does a single visible
   meter risk being read as a universal score no matter how we label it? If
   so, is there a visual treatment that makes "inventory, not rank"
   unambiguous, or does any single bar recreate the problem we killed?

2. **Expansion as the contract.** Is click-to-expand the right drill-down,
   or should the category meters be visible by default on some surfaces
   (e.g., the project page) and collapsed elsewhere? Where does the single
   meter suffice, and where does it hide too much?

3. **Category color semantics.** Each category gets its own color. Should
   the colors be neutral categorical colors, or carry meaning? Risk:
   colored meters get read as traffic-light judgments even when we intend
   no judgment.

4. **Category meter fill: inventory or index?** Should the expanded
   per-category meters show the same unweighted inventory fill as the
   aggregated meter, or the weighted category index? If both are shown, how
   do they stay visually distinct so the inventory meter and the index never
   get confused with each other?

5. **Empty categories.** A project with zero promises in a category: hide
   the meter, show a zero meter, or show "no promises tracked"? How does
   each choice interact with the standing distinction between insufficient
   evidence, low performance, and not applicable?

6. **The atlas relationship.** The expanded meters mirror the atlas category
   split. Should the expanded view link straight into the atlas evidence
   view (completing the verdict-to-atlas drill path), or stay
   self-contained? Is there redundancy between the expanded meters and the
   atlas itself that we should resolve now?

7. **Tom's round-1 hard-vs-soft point.** Tom argued subjective whitepaper
   material should be ranked with lesser value. Does per-category metering
   in an expanded view fully answer that, or do soft categories need an
   explicit lesser-value marker on their meters?

8. **Schema vs. presentation.** The expectation is that this is purely
   presentation off the existing promise records, no schema change, no
   migration. Confirm that holds, or flag what breaks.

9. **"Size of the promise."** Alex explicitly deferred weighting by promise
   magnitude (a "replace Swift in banking" promise vs. a minor one): no
   partial hearts now. Is per-category metering sufficient without any
   magnitude signal, or is there a non-weight way to acknowledge that
   promises differ in consequence?
