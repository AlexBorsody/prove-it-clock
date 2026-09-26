# Archived AI research direction

Design exploration from September 25; not the current scoring rule.

## Research direction: modeling promise versus reality

**Alex, 2026-09-25. Exploration for future rankings; code comes later.**
We are building a measurable model of what a project promised, what exists,
and whether it is moving toward fulfillment. AI could help map whitepaper and
founder claims to evidence and estimate what may materialize. The model's
quality depends on those inputs and on testing its predictions against reality.

| Question | Candidate approach |
|---|---|
| Is this evidence about the original promise? | Cosine similarity between representations of the claim and evidence can help find relevant material. Similar wording alone does not establish truth or delivery. |
| Is the project moving in the promised direction? | Compare measured progress with the target across explicit dimensions such as capability, intended use and adoption. Cosine similarity measures alignment, not amount delivered. |
| How much remains? | Euclidean distance between the current state and target on those same dimensions, with comparable scales and justified weights. A shrinking gap suggests progress only while the target and measurement rules stay fixed. |
| How big is the potential? | Define impact separately: who benefits, how much and at what scale. Vector length or an ambitious description does not automatically measure real-world value. |
| Will it happen, and when? | Explore a forecast using delivery history, remaining gaps, pace and dependencies. Predict fulfillment within a stated period and uncertainty; distance alone cannot produce a probability or completion date. |

Simple example: target `(1, 1)` and measured delivery `(0.1, 0.1)` have cosine
similarity 1 despite very little completion. We need both alignment and scale.
If we normalize both vectors to unit length, Euclidean distance and cosine
similarity become mathematically linked; counting both as independent ranking
signals would duplicate the same information.

A possible **AI estimate** would use explicit parameters and source evidence
to infer progress or fulfillment likelihood. Test tunable weights on historical
cases, including failures, then evaluate on later outcomes the model did not
see. Compare against a simple baseline and check whether predicted probabilities
match observed outcomes. Missing evidence stays unknown; a plausible generated
explanation is not a validated score.

Keep earned hearts as the record of demonstrated delivery. Research whether
these estimates improve future ranking or potential assessment; any combined
formula and weight remain undecided. Predictions must be distinguishable from
earned hearts. Value estimation also needs a separate account of token value
capture; delivery alone is not a token-price formula.

References: [cosine similarity](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.pairwise.cosine_similarity.html),
[Euclidean distance](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.pairwise.euclidean_distances.html),
[probability calibration](https://scikit-learn.org/stable/modules/calibration.html).
