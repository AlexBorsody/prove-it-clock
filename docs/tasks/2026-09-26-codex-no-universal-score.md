# Codex direction: no universal overall score — category indices + separate valuation model

**From Alex, 2026-09-26 ~23:45 EDT. Relayed by Habib (Muse).**
Decision: remove the universal overall score from the public product.
This extends `2026-09-26-layered-ranking-architecture.md` and answers
its open question: there is no single cross-category number.

## The decision

No universal "best coin" number. But do not ban aggregation forever:
require every aggregate to answer a specific question with defensible
units and assumptions. A whole-token valuation gap is itself an
aggregate judgment — you cannot eliminate that modeling problem simply
by dropping the overall Index.

## 1. Category indices are the headline

A project gets a profile across the categories it actually competes in,
rather than one grade pretending everything is interchangeable.

Within each category, preserve delivery, potential significance, and
realized impact as inspectable components. Impact weighting belongs
here.

Averaging everything creates questions such as: how much payment
adoption offsets failed privacy promises? Equal weights do not avoid
judgment; they merely assign equal importance. These are established
issues in composite-index construction.

Also, 80 in Payments and 80 in Privacy do not automatically represent
equal economic value just because both use a 0–100 scale.

**Implementation:** distinguish not applicable, insufficient evidence,
and low performance. None should quietly become the other.

## 2. Valuation layer: a different contract

This preserves the money hook (proven value vs market cap 1:1).

Two different outputs:

- **Market context, available without a valuation model:** "Here is the
  market capitalization beside the project's delivery and impact
  profile."
- **Modeled valuation gap, available once its methodology is defined:**
  "Here is the market capitalization compared with the token-value
  range estimated under this model and these assumptions."

The second requires combining economic contributions, accounting for
overlap, and explaining how value reaches the token. That is legitimate
modeling work, but it is not the same as averaging category scores.

For example, the same activity might appear under Payments, Platform,
and Interoperability. It cannot automatically become three separate
economic contributions when calculating total value. Double-counting
related inputs is a recognized aggregation risk.

Publish the valuation model's assumptions, version, coverage, and
uncertainty. Until that model exists, show market context rather than an
unexplained gap percentage.

## 3. Direct instruction to Codex

> Do not implement a universal cross-category Prove Value score.
> Publish category indices and their underlying delivery, potential, and
> realized-impact components. Keep valuation as a separate, versioned
> model that may eventually produce a token-level range and market
> comparison. Never calculate that valuation by simply averaging
> category scores.

The warning remains separate too. A strong category result must not
erase a documented core failure.

## Architecture summary (unchanged)

The ledger records what happened, category models assess its
significance, and the valuation model asks what that substance could
justify economically.
