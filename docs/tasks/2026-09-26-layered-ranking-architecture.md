# Layered ranking architecture: evidence, impact, ranking, valuation

**Alex's architecture, 2026-09-26 ~23:40 EDT. Status: approved direction.**
Transcribed by Habib (Muse) from Alex's message; wording is his unless
marked. This resolves the overall-ranking problem by layering, not by
one inseparable formula.

> **The proposal:** separate the evidence, impact, and valuation layers.
> We are keeping usage and World Economic Impact weighting. The proposal
> is to layer them above the evidence ledger, not remove them or return
> to treating every promise as equally valuable.
>
> A fulfilled major promise should be able to contribute substantially
> more than a fulfilled minor promise. But what happened, how much it
> matters, and what the market pays for it are different questions. They
> should not become one inseparable formula.

## 1. Evidence ledger: what was promised, and what happened?

The permanent record.

Each promise has a stable identity, original source, fulfillment test,
supporting evidence, and dated assessment events. Repeated mentions,
revised deadlines, deliveries, lapses, and corrections connect to that
same promise history.

Preserve both when an event happened and when Bubble or Build recorded it. A
historical event researched today is different from an observation
captured at the time.

The ledger records evidence and published assessments, not economic
weights. Assessments can be disputed or corrected. Corrections create
new records rather than silently replacing old ones.

Changing the impact formula must never change whether a promise was
delivered or erase an earlier commitment.

> One promise gets one traceable record. That does not mean every
> promise gets equal economic weight.

## 2. Impact model: how much does this delivery matter?

This is where World Economic Impact, actual usage, and relevance to the
project's function belong.

The model reads the ledger and relevant observations, then assigns
explicit, reproducible impact measures. It should distinguish:

- **Potential significance:** how consequential the promised capability
  could be under stated assumptions.
- **Realized impact:** the scale of use and economic activity actually
  supported by evidence.

A huge ambition is not realized impact. A shipped capability is not
automatically widely used. Conversely, two fulfilled promises can have
dramatically different real-world consequences.

Keep the proposed dimensions, normalization, and weights in a versioned
model. Every result must expose its inputs and calculation. A
model-derived weight is a model judgment, not an additional fact in the
ledger.

Usage can substantiate fulfillment and inform scale, but avoid
unknowingly awarding the same usage twice through overlapping terms.

Embeddings may help classify promises or identify functional
relationships. Cosine similarity alone must not be labeled economic
impact.

## 3. Ranking model: how do projects compare?

The ranking layer consumes the graded ledger and impact model to produce
the per-category indices.

Preserve two distinct readings:

> **Weighted fulfillment:** How much of its important promised work has
> the project delivered?
>
> **Realized economic scale:** How much evidenced impact has the
> delivered work achieved?

These are not interchangeable. Completing 90% of a small mission does
not imply the same economic substance as completing 90% of a much larger
mission. A normalized completion percentage must not erase the scale we
are trying to capture.

Hearts can remain a simple count or drill-down. They do not have to be
the headline ranking or carry the entire valuation thesis.

Missing usage or impact evidence must be visibly incomplete, not quietly
converted to zero or a favorable default.

## 4. Valuation layer: does market capitalization reflect the substance?

This is where market data enters.

The hypothesis is that market capitalization should bear a defensible
relationship to evidenced economic substance. The formula establishing
that relationship is still research work, not something this
architecture presumes.

Keep market cap out of the underlying delivery and impact calculations.
Otherwise, we risk using price to manufacture a score that supposedly
independently explains price.

Also distinguish benefit created by the product from benefit captured by
its token. The valuation model needs that connection.

The eventual output could expose a price-versus-substance gap, but it
must not assume that one score point already equals a particular dollar
amount.

## Implementation rule

Use one underlying record with separately versioned calculations:

```
Sources and observations
        ↓
Append-only promise and assessment ledger
        ↓
Impact and usage model
        ↓
Category rankings
        ↓
Market-cap comparison
```

Every published result should identify its ledger revision, assessment
date, grading version, impact-model version, and ranking-model version.

When a model changes, preserve the original published results. A
recalculated timeline must be labeled as recalculated. A methodological
change must not masquerade as a project improving or deteriorating.

## How the visualizations fit

- **Atlas:** What promises exist, how they relate by subject, and their
  recorded outcomes. Any impact-based node sizing must identify the
  model behind it.
- **Timeline:** What changed, when, and why. Let users distinguish
  delivery events, usage changes, and model revisions.
- **Shitcoin warning:** Which documented delivery problems require
  attention, under its own published rules.

These are different views of the same underlying record, not competing
sources of truth.

> The ledger preserves the record. The impact model assesses
> significance. The ranking compares projects. The valuation layer tests
> the relationship to market price. We can improve any model without
> rewriting what happened.

---

## Habib's read: how this settles the open threads

*(Muse's mapping, not Alex's words.)*

- **The 99-promise weights draft (1/2/4)** lives in the impact model as
  versioned importance judgments, not ledger facts. This resolves
  Codex's "core vs importance" objection: the v3 `core` flag is a
  ledger-level verdict trigger; tier 4 is an impact-model judgment. Two
  different layers, no silent override.
- **The USE metrics spec** becomes realized-impact inputs, with Codex's
  attribution caveats (BAT MAU vs BAT users, Ripple Payments volume vs
  XRP-routed volume, bot load) as admission rules for the model.
- **Parent/child double-counting** (XRP p03/p04) is an impact-model
  allocation rule: the ledger keeps both records; the model decides how
  weight flows. No history deleted.
- **The 1:1 hook** is the valuation layer, with the no-circularity rule
  Alex states: market cap enters only at the top.
- **Potential vs realized** dissolves the BAT/XRP arguments: BAT has
  realized usage with overstated potential; XRP's bridge ambition had
  large potential significance with disputed realized scale. Both can be
  true at once, in different cells.
- **"Missing ≠ zero"** is now architectural: incomplete evidence is
  visibly incomplete at every layer.

## Resolved: category indices and a separate valuation model

Alex's subsequent [no-universal-score decision](2026-09-26-codex-no-universal-score.md)
answers the former open question. Do not build a cross-category overall score.
Keep category indices and a separately justified valuation model; until the
latter exists, market capitalization is context, not a calculated value gap.
