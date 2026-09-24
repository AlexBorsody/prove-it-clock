# XRP — evidence worksheet

**2026-09-24 · retrospective, non-blinded research · review required.**
Uses [criteria revision 1](README.md). No production rating or valuation.

## What the evidence supports

There is primary evidence of XRP-specific payment use beyond early bank deals.
There is also evidence of a major customer's exit. Neither fact establishes
infrastructure-scale success or complete abandonment. The subject is XRP's
promises and delivery, not every product or customer belonging to Ripple.

## Source register

Accessed 2026-09-24. Live pages have not been preserved as historical captures.
Sources from Ripple, SBI and MoneyGram are participant accounts, not independent
market-wide verification. The SEC-hosted filing is MoneyGram's disclosure, not
an SEC endorsement of product performance.

| ID | Primary source / publication time | Supported fact and limit |
| --- | --- | --- |
| X01 | [XRPL history](https://xrpl.org/about/history), undated retrospective page | Dates ledger launch to June 2012, without a day. Describes payments origins. Supports a historical lead, not an exact inception timestamp or contemporaneous archive. |
| X02 | 2018-01-24 — [IDT/MercuryFX announcement](https://ripple.com/insights/more-global-payment-providers-idt-and-mercuryfx-sign-up-to-use-xrp/) | Explicitly frames XRP as bridge liquidity for remittances; includes pilot language. Establishes intended use, not fulfillment merely because partners signed. |
| X03 | 2018-10-02 — [Swell customer report](https://ripple.com/insights/ceo-brad-garlinghouse-talks-internet-of-value-and-customer-traction-at-swell-2018/) | Ripple specifically reports live US–Mexico XRP payments with Cuallix. Stronger than a generic RippleNet deal, but supplier-reported. |
| X04 | 2023-09-06 — [SBI joint release, English PDF](https://www.sbigroup.co.jp/english/news/pdf/2023/0906_c_en.pdf), page 1 | Confirms XRP bridge remittances to Philippine wallets began in 2021; announces bank-account expansion that month to three countries. Describes XRP transfer and fiat payout roles. Expansion notice is not per-corridor realized volume. |
| X05 | [MoneyGram 2021 Form 10-K](https://www.sec.gov/Archives/edgar/data/1273931/000127393122000039/mgi-20211231.htm), signed 2022-02-25; filing timestamp unverified | Reports cessation in early December 2020 and contract termination effective 2021-03-07; also reports market-development fees. Distinguish operating cessation from legal termination. Filing date must be resolved before as-of ingestion. |
| X06 | 2025-05-05 — [Ripple Q1 2025 markets report](https://ripple.com/insights/q1-2025-xrp-markets-report/) | Reports ledger transactions and XRP burned as fees. These metrics do not identify bank remittance volume. Outside the review's trailing-12-month window. |
| X07 | 2025-10-31 presentation — [SBI half-year results](https://www.sbigroup.co.jp/english/investors/disclosure/presentation/pdf/251031presentations.pdf), printed page 66 | Describes an ecosystem including XRP/XRPL services. A group strategy diagram is not a dated receipt, corridor-volume disclosure or proof of fresh product delivery. |

The exact “replace SWIFT” wording is not established by these reviewed sources.
XRP-C therefore uses sourced cross-border settlement framing. A reviewer must
identify the relevant original issuer/community promise before freezing the core;
do not make our paraphrase a harder promise than the project actually published.

## Lineage assessment

| ID | Judgment from this pass | Candidate reward/status |
| --- | --- | --- |
| XRP-C | Broad scale, duration and token-specific success criteria absent. Customer adoption alone does not prove the core | Unproven; gate closed in scenarios |
| XRP-1 | X01 supports ledger launch in June 2012. Current-operation verification remains separate | Candidate +1, approximate historical date only |
| XRP-2 | X03 reports live XRP payments in 2018; X04 corroborates later XRP-specific customer use in 2021 | Candidate +2 for the same cross-border bridge lineage, not +2 per customer |
| XRP-3 | X04 announces additional corridors in September 2023 | Proposed 0 reward under revision 1; operational corroboration pending; whether it resets recency is unresolved |
| MoneyGram exit | X05 establishes a customer-specific loss | Record visible adverse event; do not erase XRP-2 globally while other customers fulfill its criterion |

If MoneyGram were originally its own rewarded lineage, its retirement would
remove that lineage's hearts. Revision 1 instead groups bridge use. Do not switch
between grouped and customer-specific treatment after seeing which score looks
better. This granularity issue is consequential and belongs with Alex/Muse.

## Current allowance and evidence limits

Window: 2025-09-24 through 2026-09-24. X04 is historical. X06 is outside that
window. X07 shows current group positioning but does not independently establish
all three checklist items. This pass has **not established a current `A0`**.
Do not turn unverified current usage into zero usage, or award fresh activity
from a partnership diagram. Need dated current ledger operation, relevant
shipping evidence and economic activity tied to the chosen core promise.

Even a current aggregate ledger count would not establish XRP bridge-remittance
volume; distinguish chain operation from the specific economic use being assessed.

## Conditional arithmetic for review

This is a sensitivity fixture, not a published rating. Assume XRP-1 and XRP-2
remain fulfilled, no other accepted rewarded lineages, capacity 20, core open.
Earned subtotal is `1+2=3`. The adopted three-item checklist gives `A0 <= 3`
even though the capacity-based ceiling is four.

| Recency interpretation | Mechanical consequence at 2026-09-24 |
| --- | --- |
| First fulfillment of the grouped bridge lineage remains 2018-10-02; no later event resets it | `7<S<8`; at least five allowance hearts would have decayed; any possible `A0<=3` reaches zero; conditional filled subtotal is 3 |
| Accept a 2023-09-06 expansion as a qualifying reset, despite zero reward | `3<S<4`; allowance becomes `max(0,A0−1)`; conditional filled subtotal is 3–5 depending on approved `A0` |

Second row is explicitly hypothetical: X04's announcement does not establish the
exact production date, and the methodology has not settled whether this event
resets recency. These rows show how interpretation changes the result without
changing any constants. They are not lower/upper bounds for XRP's true score;
the lineage inventory and current evidence are incomplete.

A single scalar output would currently conceal unresolved judgment. Keep its
status review-required; no fake daily series or inferred current zero.

## Muse/Alex review and manual tests

- [ ] Read X02 and X03: distinguish an announced pilot from an explicit live-payment claim.
- [ ] Read page 1 of X04: distinguish Ripple software use since 2017 from XRP use beginning in 2021.
- [ ] Confirm whether XRP-2 is one economic lineage or separate accountable customer promises; apply the same rule to BAT integrations.
- [ ] Read X05: keep early-December cessation separate from March contract termination; do not invent an exact cessation day.
- [ ] Seek current partner-side XRP payment evidence and verify the three allowance inputs for the stated window.
- [ ] Define the core-promise scale test from a dated original promise, not token price or the number of partnership announcements.
- [ ] Record decisions in [review.md](review.md) before accepting a score.

Outstanding: original promise archive, precise launch/fulfillment dates, current
operation and economic evidence, customer corroboration beyond the selected SBI
release, missing promise families, and independent blinded replication. This pass
is a reviewable evidence packet, not a completed production case-study page.
