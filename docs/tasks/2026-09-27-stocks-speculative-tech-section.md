# Speculative Tech (Stocks) Section — Product Direction Brief
Alex, 2026-09-27. Saved verbatim from his message; the stocks section brief.

## Product thesis

The stock/tech version actually sharpens Prove Value because there is a real economic floor to compare the story against: revenue, profit, cash flow, margins, customers. Crypto mostly asks, "what has this thing actually proven?" Speculative tech asks, "how much of this valuation is supported by the current business, and how much depends on promises about the future?"

> Crypto = proof versus speculation.
> Speculative tech = fundamentals versus expectations.

Tesla is an ideal pilot because you can separate three things cleanly: what the business produces today, what management has publicly promised, and what future outcomes appear necessary to support the valuation narrative.

## Category definition

Do not use P/E >30 as the fundamental definition of the section. Use it as one discovery screen. It breaks immediately for private companies like SpaceX, OpenAI and Anthropic, and for companies with negative or tiny earnings where P/E is meaningless or distorted. The broader category should be something like High-Expectation Companies or Speculative Tech.

## Architecture (transfers from crypto)

- **Ledger:** exact management claims, source, date, deadline, revisions, evidence and outcome.
- **Delivery:** what actually shipped or happened.
- **Realized impact:** users, revenue, cost savings, production, market adoption, etc.
- **Potential:** what the promised thing could matter if it succeeds.
- **Fundamentals:** current revenue, profit, free cash flow, margins.
- **Valuation:** what expectations appear embedded in the current market value.
- **Expectation Gap:** the distance between demonstrated business substance and the future story required by the valuation.

That last piece could become the stock equivalent of the crypto thesis.

## Entity scoping rule

For Tesla, do not make "everything Elon ever said" one ledger. Scope every claim to an entity. Tesla claims belong to Tesla. SpaceX/Mars belongs to SpaceX. xAI belongs to xAI. Musk statements only count when they are clearly made as a commitment or forecast for the relevant company. Otherwise the system turns into an Elon quote tracker.

## Stock promise taxonomy (starting point)

- Financial Guidance
- Product/Technology
- Adoption/Market Expansion
- Operations/Capacity
- Strategic Transformation
- Moonshots

Cross-cutting tags: AI, autonomy, robotics, space, energy, chips.

## Guidance revision history (stock-specific)

Guidance revisions need history. If a company says $10B, later cuts it to $8B, then reports $8.1B, preserve all three facts. "Met latest guidance" and "missed original guidance" can both be true. That is exactly where the append-only ledger becomes valuable.

## The moat

Bloomberg, Yahoo, etc. already have price and financials. What they generally do not give as the central product is:

> Here is what management told the world would happen, every revision they made, what actually happened, and how much of today's valuation still depends on outcomes that have not happened yet.

That is the stock version of Prove Value.

## Product direction (one line)

> Add a Speculative Tech domain where Prove Value tracks management promises against actual delivery, current fundamentals, realized impact, and the expectations embedded in valuation. Start with Tesla as the reference case, but build the schema so Nvidia, Broadcom, SpaceX, OpenAI, Anthropic and similar high-expectation companies fit without changing the core ledger.

## Valuation-layer caution

Once you start saying a stock's price "requires" specific future outcomes, that becomes a valuation model, not an observed fact. Keep that layer versioned and assumption-driven just like decided for crypto.

## UI call (open)

Separate bottom tab for now; the context tab gets a stocks section too. Details still to think through.
