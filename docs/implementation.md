# Prove-It Clock — Implementation

**Direction: September 22, 2026.** This replaces the previous multi-factor plan.
The existing v0.2.0 app is a prototype; it does not yet implement this model.

## The point

**What should a project's market cap be, given the promise it made and what it actually delivers?**

The Clock follows two things over time:

- **Promises kept:** how much of the promised outcome is demonstrably real.
- **Potential of the promise:** what fulfilling that outcome could be worth.

The goal is for delivery to reach the promised outcome. If it does, the project
wins. If its opportunity expires without delivery, the value attributed to that
unfulfilled promise should fall toward zero. Time matters because a promise
cannot justify value forever.

## Promise fulfilled?

Each project needs one clear core promise and an evidence-based definition of
success. Milestones show progress toward it; completing many small tasks is not
the same as fulfilling a valuable promise.

The chart shows delivery against that goal over time. They meet when the
original success criteria are met—not when we lower the goal to meet delivery.
A fulfilled promise stops being judged as perpetually late; maintaining what
was delivered becomes the evidence for its continuing value.

A deadline or opportunity window must have a stated basis. Passing it without
delivery means time is up for that promise. Changing the promise or extending
the window must remain visible in the history, never reset the clock silently.
The exact expiry rule still needs to be defined.

## Potential and value

Promise Potential Impact (PPI) asks how consequential fulfillment would be.
Assess each promise's potential separately from the overall project vision,
as Alex specified. Both belong under potential; avoid counting overlapping
promises twice when assessing the project as a whole.
The existing World Impact score can be a temporary, labeled project-level proxy;
it is not yet a sourced assessment of each promise or a dollar valuation.

Team, utility, adoption, competition, and execution evidence support the case
for the promise's potential and whether it remains attainable. They belong
behind the explanation, not in separate headline scores or a Context track.

The intended output is a reasoned estimate of **justified market cap**, compared
with actual market cap. Derive the estimate from delivery, remaining credible
potential, and how the token captures that value; do not use today's market cap
to justify itself. A successful project does not automatically make its token
valuable.

For a wholly failed thesis with no remaining delivered value, the model should
allow justified value to reach zero. If useful value has already been delivered,
separate that from the expired promise rather than erasing it. This describes
the model's valuation, not a claim that the traded market cap must reach zero.

## What the user sees

One project view: the promise, promises kept, potential of the promise, and the
clock. One timeline shows whether delivery is approaching fulfillment before
the opportunity runs out. Evidence and assumptions sit one click deeper.
Once the valuation method is defined, show justified versus actual market cap.
Until then, label valuation as not yet calculated; a 0–10 impact score is not dollars.

Delivery and the goal must use comparable measures. Do not plot a milestone
count and a potential score as if their numerical intersection proves success.
BTC, XRP, and LINK are the working examples; their outcomes must follow the
evidence rather than predetermined rankings.

## Next work — one focused prototype

1. Specify the core promise, success evidence, delivered progress, potential,
   and justified opportunity window for BTC, XRP, and LINK.
2. Define how fulfillment and expiry affect token value. State the assumptions
   needed to turn that into a market-cap estimate before choosing a formula.
3. Adapt the existing card and timeline to those concepts. Store dated evidence
   and assessments so every visible change can be inspected.

The previous weighted Promise formula, separate Context Score, seven-category
chart expansion, independent AI rating, and additional provider integrations
are out of the current plan. Do not build them from older docs or config mirrors.

## Implementation boundaries

Keep Next.js, Supabase, the existing providers/loader, and the shared chart.
Codex owns schemas, ingestion, and API contracts alongside Muse's existing work.
Backend changes should serve this prototype: dated promise evidence, potential
assessments, fulfillment/expiry history, and eventually valuation assumptions.
No new service or speculative schema is needed before those definitions settle.

Preserve historical snapshots and methodology versions. Missing evidence stays
unknown, not zero. New calculations need a new approved methodology; existing
v0.2.0 scores and speculative v0.3.0 records must not be relabeled or overwritten.
The loader still needs integrity work before unattended operation; that supports
the product rather than becoming another product track.

[Previous design and architecture findings](archive/2026-09-22-previous-implementation.md)
are archived for reference. This page is the current scope; daily logs record
progress, not competing roadmaps.
