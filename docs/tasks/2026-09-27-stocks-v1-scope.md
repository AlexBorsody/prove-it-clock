# Codex build brief: Prove Value Speculative Tech / Stocks v1
2026-09-27. From Alex — the authoritative stocks v1 scope. Saved verbatim.

## 1. What Prove Value is

Prove Value is an accountability and valuation-research product.

The core idea is:

> Track what an entity said would happen, preserve the evidence and revisions, record what actually happened, then separate facts from model-driven interpretation.

The architecture is layered:

1. **Ledger facts**
   - What was promised
   - When it was promised
   - Source and exact location
   - Deadline or target
   - Revisions
   - What actually happened
   - Evidence and corrections

2. **Impact model**
   - Potential significance
   - Actual usage
   - Realized economic impact

3. **Valuation model**
   - What those facts and impacts may economically justify
   - What assumptions are required
   - How that compares with current market valuation

The core rule is:

> **Facts change when reality changes. Models change when our interpretation changes. Never confuse the two.**

Changing an impact formula must never change whether a promise was fulfilled.

Changing valuation assumptions must never rewrite the historical promise record.

---

## 2. What we are building now

Build the first **Speculative Tech / Stocks** domain inside Prove Value.

This is not a separate product.

Reuse the same core architecture as crypto:

> **claim → source → target/test → event history → outcome → impact/context**

The economic framing changes.

For crypto, Prove Value asks:

> What was promised, what was delivered, what is actually used, and what remains speculation?

For stocks:

> **What has management delivered, what does the business earn today, and how much of the current valuation depends on future promises becoming real?**

Start with **Tesla** as the reference implementation.

Architect so companies like Nvidia, Broadcom, Oracle, SpaceX, OpenAI, Anthropic, and similar high-expectation companies can be added later without redesigning the system.

---

## 3. Product definition

Create a new domain:

```text
Speculative Tech

The initial universe is companies where valuation depends heavily on future execution.

For public companies, the primary discovery screen is:

Trailing P/E > 30
OR
earnings <= 0

This is not a judgment that the company is bad.

It means:

> The market is assigning substantial value beyond current earnings, so future execution matters unusually much.

Negative earnings are important, not an edge case.

Represent them explicitly:

P/E: N/M
Reason: earnings are negative

Do not treat negative P/E as directly comparable to a normal positive multiple.

For loss-making public companies also show, where available:

Market cap
Revenue
Revenue growth
Net income
EPS
Free cash flow
Price / sales
Cash and equivalents

Private high-expectation companies may eventually appear in the same broader domain, but they cannot participate in a public-equity P/E ranking.

Architect for:

entity_type: "public_company" | "private_company"

Do not invent public-market metrics for private companies.
```

---

## 4. The differentiator

Do not build another stock screener.

The differentiator is:

> Prove Value preserves what management said would happen, every revision to that claim, what actually happened, and how much of today's story still depends on unfinished commitments.

Other financial products already provide price, market cap, revenue, and filings.

We are building the accountability and historical evidence layer.

---

## 5. Reuse the append-only event architecture

Never overwrite history.

For every company commitment preserve events such as:

promise created
promise repeated
deadline announced
deadline revised
target raised
target lowered
guidance revised
product launched
target met
target missed
promise withdrawn
promise superseded
evidence added
assessment corrected

Every event should include:

occurred_at
recorded_at
source_url
source_type
source_locator
event_type
notes

Definitions:

occurred_at = when the real-world event happened
recorded_at = when Prove Value captured or researched it

These must remain separate.

A historical event researched today must not appear as something Prove Value knew at the time.

---

## 6. Stock promise model

Use the existing ledger abstractions where possible.

The stock domain needs fields roughly like:

```typescript
interface CompanyPromise {
  id: string;
  companyId: string;
  lineageId: string;

  claimText: string;

  sourceUrl: string;
  sourceType:
    | "10-k"
    | "10-q"
    | "8-k"
    | "earnings-call"
    | "investor-day"
    | "press-release"
    | "executive-interview"
    | "executive-social";

  sourceDate: string;
  sourceLocator?: string;

  category: CompanyPromiseCategory;

  issuedAt: string;
  targetStart?: string;
  targetEnd?: string;
  deadline?: string;

  fulfillmentTest: string;

  state:
    | "open"
    | "active"
    | "fulfilled"
    | "missed"
    | "withdrawn"
    | "superseded";

  originalTarget?: string;
  currentTarget?: string;

  supersedesId?: string;
  supersededById?: string;

  core: boolean;

  evidence: EvidenceRecord[];
}
```

Do not duplicate existing domain types unnecessarily.

---

## 7. Promise categories

Start with these stock categories:

Financial Guidance
Product / Technology
Adoption / Market Expansion
Operations / Capacity
Strategic Transformation
Capital Allocation
M&A / Portfolio
Moonshots

Use cross-cutting tags such as:

AI
Autonomy
Robotics
Space
Energy
Semiconductors
Cloud
Manufacturing

Examples:

Tesla robotaxi target
Category: Product / Technology
Tags: Autonomy, AI

Tesla production target
Category: Operations / Capacity
Tags: Manufacturing

Mars timeline
Company: SpaceX
Category: Moonshots
Tags: Space

Do not mix entities because they share an executive.

Tesla claims belong to Tesla.

SpaceX claims belong to SpaceX.

xAI claims belong to xAI.

---

## 8. Promise admission rule

Do not track every executive quote.

A scored promise should be:

attributable
materially communicated
testable

The same high-level philosophy as crypto applies.

Examples:

"Tesla will produce X units by Y date"

is a candidate promise.

"AI will transform society"

is probably rhetoric, not a company promise.

Do not invent measurable tests for vague statements.

If the claim cannot be evaluated objectively, track it separately or exclude it from scoring.

---

## 9. Source hierarchy

Preserve the exact source type.

Suggested confidence order:

1. SEC filing
2. formal earnings guidance
3. investor-day presentation
4. earnings-call statement
5. official press release
6. executive interview
7. executive social post

Do not make higher-source promises worth more.

Source strength affects provenance and confidence, not promise size.

A social post can still contain a real attributable commitment.

---

## 10. Guidance must preserve revisions

This is critical.

Do not overwrite guidance.

Example:

FY2027 Revenue Guidance

January:
$10.0B to $10.5B

April:
$9.7B to $10.1B

July:
$9.2B to $9.6B

Actual:
$9.4B

The system must preserve all versions.

It should be possible to show:

Original guidance: missed
Latest guidance: met

Both can be true.

This is one of the strongest potential features of the stock product.

Model this as a stable promise lineage with versioned target events.

---

## 11. Time horizon is first-class metadata

Every applicable promise should have:

```text
horizon:
  | "quarter"
  | "annual"
  | "multi_year"
  | "undated"
```

Do not automatically assign more weight to long-term promises.

Use horizon for filtering and context.

Examples:

Quarterly guidance
Annual target
5-year strategy
Undated moonshot

These are different commitment types even if all are promise records.

---

## 12. Financial context panel

Each public company page should show factual market and business context.

Include where available:

Price
Market cap
Trailing P/E
Forward P/E
Revenue
Revenue growth
Net income
EPS
Free cash flow
Price / sales
Cash

If earnings are negative:

P/E: N/M
Negative earnings

Never show fake zero values.

Missing data means unknown.

Market and fundamental data must never alter historical promise fulfillment.

---

## 13. Valuation model architecture

Do not treat valuation as a fact.

Valuation is model-driven and assumption-driven.

Example:

Tesla valuation model v1

Assumptions:
- Revenue growth: X
- Long-term margin: Y
- Robotaxi adoption: Z
- Optimus adoption: A
- Discount rate: B

That model may estimate:

What future outcomes are required to support current valuation

What valuation range follows from a set of assumptions

How sensitive valuation is to major open promises

If the assumptions change later:

Tesla valuation model v2

Do not overwrite v1.

Preserve historical model outputs.

Core rule:

> Facts change when reality changes. Models change when our interpretation changes.

If Tesla's modeled value changes because our assumptions changed, record:

Model revision:
valuation methodology v1 -> v2

If the modeled value changes because Tesla actually delivered something, record:

Evidence event:
robotaxi adoption milestone achieved

These are different event classes and must remain distinguishable.

---

## 14. Do not build fair value yet

Do not publish yet:

Overvalued
Undervalued
Buy
Sell
Fair value
Price target

Those require a separate approved valuation methodology.

For v1, show factual and promise-context layers.

Potential future framing:

> A substantial portion of the company's future strategy remains dependent on these open commitments.

This is safer and more honest than prematurely assigning a price verdict.

---

## 15. Current business vs future promises

Each company page should separate three layers.

Current business

What economically exists today?

Examples:

Revenue
Profit or loss
Cash flow
Customers
Units
Installed capacity

Delivered promises

What management said would happen and actually happened.

Future-dependent promises

What meaningful commitments remain unresolved.

This separation is central to the stock product.

---

## 16. Tesla detail page

Use Tesla as the calibration case.

Suggested page shape:

```text
TESLA

Market context
- Market cap
- P/E
- Revenue
- Earnings
- FCF

----------------

PROMISE RECORD
- N kept
- N open
- N missed
- N withdrawn

----------------

Promise categories
- Financial Guidance
- Product / Technology
- Operations
- Market Expansion
- Moonshots

----------------

Accountability Timeline

2016  claim made
2019  target revised
2022  deadline missed
2024  promise repeated
2026  fulfilled / still open / withdrawn

----------------

Current major open commitments

Robotaxi
FSD capability
Optimus
Energy/storage targets
etc.

----------------

Evidence and sources

Do not hardcode Tesla promises inside UI components.

They belong in the data and ledger layer.
```

---

## 17. Timeline is a major feature

The stock timeline is extremely important.

Use a shared X-axis.

Distinguish event types visually:

promise made
target changed
deadline moved
guidance revised
delivered
missed
withdrawn
financial result
model revision

Optional contextual overlays later:

price
revenue
EPS

These overlays never change promise status.

The key interaction should be:

> Click a point and see exactly what management said, where they said it, and what happened afterward.

---

## 18. Rankings

Do not create one universal stock leaderboard yet.

Use category rankings.

Examples:

Financial Guidance Track Record
Product Delivery
Technology / AI Commitments
Operational Commitments
Moonshots

Companies only participate where they made qualifying commitments.

For Financial Guidance, show enough context to prevent misleading percentages:

number of periods scored
original guidance hit rate
latest guidance hit rate

A company with two guidance events should not look directly equivalent to one with forty.

---

## 19. P/E discovery page

P/E should be a major stock discovery surface.

Proposed route:

/stocks

Headline:

High Expectations

Subhead:

> Companies priced heavily on future execution.

Public-company filter:

P/E > 30
OR negative earnings

Table fields:

Company
Market cap
P/E
Revenue growth
Profit / loss
Promise fulfillment
Open major promises

Filters:

P/E > 30
P/E > 50
P/E > 100
Negative earnings
AI
Space
Semiconductors
Autonomy

P/E is a discovery and context metric.

It is not the Prove Value score.

---

## 20. Tesla is the calibration case

Before expanding the universe, make Tesla excellent.

Research enough promises to test every important pathway:

hard financial target
product deadline
repeated delayed promise
fulfilled product commitment
operational capacity goal
long-term moonshot
withdrawn commitment
superseded commitment
guidance revision

Do not catalog every statement ever made by Elon Musk.

The goal is to validate the model, not create a quote archive.

---

## 21. Executive attribution rule

Be strict.

An executive statement counts for a company only when the statement clearly refers to that company's product, strategy, guidance, or operations.

Examples:

"Tesla will..." -> Tesla candidate promise
"SpaceX will..." -> SpaceX candidate promise
"Humanity will..." -> likely rhetoric, not a company promise

Always preserve exact source, time, and location.

---

## 22. Public vs private company architecture

Create a shared entity abstraction.

Example:

```typescript
interface ProveValueEntity {
  id: string;
  name: string;
  domain: "crypto" | "company";
  entityType:
    | "crypto_project"
    | "public_company"
    | "private_company";
}
```

Public companies may have:

ticker
exchange
price
market cap
earnings
P/E
SEC filings

Private companies may have:

latest disclosed valuation
funding round context
reported revenue if sourced

Do not fabricate public-market fields for private companies.

---

## 23. Shared architecture across crypto and stocks

Long-term architecture:

```text
Sources
  ↓
Claim extraction / research
  ↓
Append-only claims and event ledger
  ↓
Outcome assessment
  ↓
Domain-specific context
  ├── Crypto:
  │   CODE
  │   USE
  │   HYPE
  │   token economics
  │
  └── Companies:
      fundamentals
      guidance
      operations
      product delivery
  ↓
Category rankings
  ↓
Impact models
  ↓
Separate valuation models
```

The ledger is shared.

The economic interpretation changes by domain.

---

## 24. Out of scope for this build

Do not build yet:

buy/sell recommendations
fair-value price targets
universal company score
AI-generated promise grading
automatic sentiment score
portfolio advice
options analysis
stocks Atlas
cross-domain crypto vs stocks ranking

Do not alter the crypto methodology while building the stock section.

---

## 25. Initial company universe

Reference targets:

Tesla
Nvidia
Broadcom
Oracle
SpaceX
OpenAI
Anthropic

Only Tesla needs full implementation in phase 1.

Create placeholders for others only if useful to architecture.

Do not invent promises or financial metrics.

---

## 26. Build order

Phase 1

Inspect the existing crypto ledger, event model, promise schema, navigation, and timeline infrastructure.

Identify reusable abstractions.

Phase 2

Add company entity and company-promise extensions.

Phase 3

Implement the Tesla dataset and exact source/evidence records.

Phase 4

Build /stocks with the high-expectations discovery screen.

Phase 5

Build the Tesla detail page and accountability timeline.

Phase 6

Add stock category-ranking infrastructure.

Phase 7

Add methodology documentation and limitations.

Then stop and review before expanding to the rest of the company universe.

---

## 27. Acceptance criteria

The feature is ready when:

Tesla has a real sourced promise ledger.

Every promise has an exact attributable source.

Original targets and revisions remain visible.

Quarterly, annual, multi-year, and undated horizons are preserved.

Guidance revisions do not overwrite previous guidance.

Financial results do not overwrite promise history.

P/E > 30 and negative-earnings filtering works.

Negative earnings display N/M, never fake zero P/E.

Promise-state changes are append-only.

Timeline explains why every state changed.

Tesla, SpaceX, xAI, and other entities cannot contaminate one another.

Market and fundamental data do not alter fulfillment state.

Valuation models are versioned separately from the ledger.

Model revisions do not masquerade as company performance changes.

No buy/sell/fair-value judgment appears.

Typecheck, tests, and build pass.

---

## Core product sentence

> Crypto asks what is proven beyond speculation. Speculative tech asks how much of today's valuation rests on tomorrow's promises. Prove Value keeps the receipts for both.
