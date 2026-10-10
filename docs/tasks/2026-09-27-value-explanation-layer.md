# Codex brief: value explanation layer (glossary, /learn/value, "What gives this asset value?")

**From Alex, 2026-09-27 ~00:33 EDT. Distilled and triaged by Habib (Muse)
from a long-form input. Status: approved to build.**

## The one-paragraph version

Bubble or Build is becoming an explanation layer for value, not just a
ranking dashboard. Three buildable features: (1) a real glossary with a
shared definition schema used by inline help, (2) a `/learn/value`
education page with five worked examples, (3) a "What gives this asset
value?" explanatory section on each project page. No new scores. No
fabricated data. The central message: "Belief can support value. Prove
Value shows what the belief is resting on."

## Triage

| Item | Disposition |
|---|---|
| Glossary v2 (`/glossary` + inline definitions) | BUILD FIRST. Revive parked `~/workspace/proveit-glossary-later/glossary-page/page.tsx`, upgrade schema |
| `/learn/value` education page | BUILD SECOND. Five worked examples, spec below |
| "What gives this asset value?" project-page section | BUILD THIRD. Component now; per-project editorial content follows from Habib/Alex |
| Visualization labeling rules (atlas/timeline/warning) | Fold into existing briefs (`2026-09-26-promise-atlas.md`, `2026-09-26-timeline-and-ledger.md`), not new work |
| Trust Token | PARKED. Not part of this build |
| Valuation model | RESEARCH ONLY. Ship market context (mcap beside profile); modeled gap comes later |
| "x% utility / y% hype" splits | NEVER without a defensible model. Do not invent |

## Deliverable 1: Glossary v2

Upgrade the parked glossary. Replace the flat `{term, def}` shape with:

```ts
type GlossaryEntry = {
  id: string;              // stable slug
  term: string;
  aliases: string[];
  plain_definition: string;
  example: string;
  common_misconception: string;  // the "not the same as" distinction
  related_terms: string[];       // ids
  sources: string[];             // urls
  definition_version: string;    // e.g. "2026-09-27"
};
```

Requirements:

- One searchable `/glossary` page AND shared inline definitions
  (tooltips/help) reading from the same data. Never maintain
  conflicting definitions across tooltips, methodology pages, and copy.
- Keep the existing parked terms; add the new monetary-utility
  vocabulary: **monetary utility, digital portability, monetary demand,
  value thesis, value capture, economic substance, realized impact,
  potential significance, value attribution, evidence-backed
  valuation, demystification, accountability layer.**
- Each entry teaches through the instrument: definition, example,
  misconception, links to relevant project records where applicable.
- Public terms must read plain before anyone opens the technical
  explanation. No em dashes in public copy.

## Deliverable 2: `/learn/value` — "What makes something valuable?"

Short guided page, interactive examples, each linking back to the
relevant product feature:

1. **Price is not manufacturing cost.** Hypothetical collectible:
   scarcity, identity, willingness to pay. (Teaches: value thesis.)
2. **Market cap is not money deposited.** Interactive: user changes
   illustrative price and supply; show mcap = price x supply without
   claiming that amount was invested. (Teaches: market context.)
3. **Owning units is not preserving purchasing power.** Custody vs
   transferability vs store-of-value performance. (Teaches: monetary
   utility distinctions.)
4. **A successful product is not automatically a valuable token.**
   Hypothetical flow: customer payment -> service provider; ask what,
   if anything, reaches the token. (Teaches: value capture.)
5. **A promise is not a delivery.** Use one real reviewed project
   record: original claim, test, evidence, timeline. (Teaches: the
   ledger.)

## Deliverable 3: "What gives this asset value?" (project pages)

Explanatory section, not a score. Framing question (adopted from
review):

> Is this project creating additional economic substance, or mainly
> participating in the market for tradeable digital assets?

Five fixed questions; answers link to the ledger or a named model
version. These double as the impact model's burden of proof — for a
monetary asset, examine the monetary proposition itself; for a project
claiming to transform advertising, computing, finance, or settlement,
require evidence of that additional contribution:

1. What does holding this asset let you do? (capabilities/rights,
   sourced) — *basic functionality: it actually works.*
2. Why might someone want it? (documented value thesis)
3. What is already demonstrated? (fulfilled promises + usage
   evidence) — *actual demand: people use it, with trading and
   incentive-driven activity identified rather than disguised; then
   realized impact at demonstrated scale.*
4. Who receives the economic benefit? (users, validators, company,
   treasury, token holders — distinguished) — *token connection:
   those benefits give a reason to hold this particular token.*
5. What still depends on future success or continued demand?
   (unresolved assumptions) — *valuation assumptions: what growth
   or continued demand the market price requires.*

Holding and transferring a token is not proof that its broader
promises have succeeded. Market enthusiasm never substitutes for that
evidence.

Every statement carries an evidence label: **observed evidence,
issuer-reported, model interpretation, disputed assessment,** or
**missing information**. These are labels, not ratings.

Component contract: build the section with clean empty states. The
per-project thesis content is editorial (Habib/Alex supply it); Codex
does not invent value theses.

A useful illustrative read the section should be able to produce:

> "The service is operational and has documented usage. A mechanism
> connecting that usage to benefits for token holders has not yet been
> established in this assessment."

## Methodology notes (do not code these; respect them)

- **Bitcoin framing correction.** The "Satoshi never stated it"
  framing is now wrong. Satoshi's BitcoinTalk post of 2010-08-27
  (topic 583, Mises regression thread) imagined "a base metal as
  scarce as gold" with "one special, magical property: can be
  transported over a communications channel," and described buying it,
  transmitting it, and the recipient selling it to move wealth over
  distance. Monetary utility has early Satoshi roots. BUT:
  transferability is technically demonstrable; purchasing-power
  preservation is a separate time-dependent economic question. Never
  award "store of value" as a permanent checkmark because a wallet
  works. Update the BTC case-study framing accordingly.
- **Key distinctions to preserve in copy:** social acceptance is not
  protocol consensus (the network agrees on valid ledger state; it
  does not vote a dollar price into existence); market cap is price x
  circulating supply, not money invested; transaction value is not
  wealth created; custody/transferability is not costless operation
  (mining, fees, key security are real).
- **Public language:** "explain the basis of value," not "determine
  value." "Substantiate the value thesis" for the research.
  "Model valuation" only when a real model with assumptions exists.
- **Layer rule still holds:** changing a model never changes whether a
  promise was delivered. This explanation layer reads the ledger and
  models; it adds no new scoring.

## Acceptance test

A new visitor can answer: What does it do? What was promised? What is
proven? Who benefits? What am I still being asked to believe?

## Editorial stance: the market's foundation (Alex, 2026-09-27)

Earlier editorial framing, preserved here as context. Alex's later direct
brief requires testing this thesis, not assuming its conclusion; the build
rules below implement that clarification.

> Bitcoin has demonstrated two monetary properties: transferability
> (send value without moving a physical object) and durable savings
> demand. That is the only fully demonstrated monetary foundation in
> crypto. The rest of the market's trillion-dollar capitalization rests
> predominantly on expectation. The product must emphasize this, not
> soften it with even-handed taxonomy.

Implementation consequences:

- **The "store of value" test must meet Alex's own precision
  standard.** Distinguish transferability, sustained savings demand and
  purchasing-power performance. Specify observation periods and separate
  tests before grading. No permanent store-of-value checkmark from a
  functioning wallet or a high current price.
- **Do not publish "everything else is speculation" as a global
  fact.** Nor assume that most valuations exceed substance without a
  defined model. Populate each project's demonstrated/assumed/missing
  statements from its evidence, including Bitcoin's. Do not prefill a
  favorable Bitcoin column or unfavorable altcoin columns to manufacture
  the expected pattern. A delivered application does not settle valuation.
- **A versioned aggregate is allowed:** e.g. "share of total crypto
  market cap whose value thesis rests primarily on future
  expectations," with published assumptions and model version. Until
  that model exists, show the raw components (total mcap, BTC mcap,
  BTC dominance) as market context.
- **`/learn/value` gets a sixth beat:** "What supports the rest of the
  market?" Start with Bitcoin's monetary proposition, then examine
  additional value claims and the composition of market capitalization.
  The $1.7T/$2.99T/57% figures supplied in discussion have no retained
  timestamped provider response in this brief; do not ship them as current
  facts. Use a captured, dated market observation or an unavailable state.
  Market share does not establish the share of value that is speculative.
- **Unequal-standards guardrail.** Bitcoin's market price cannot prove
  its value while another token's market price proves only
  speculation. Neither price proves fair value by itself. Bitcoin can
  have a demonstrated monetary role while its price still contains
  speculation — those statements are compatible, and the product must
  hold both. "Everything else is speculation" stays a hypothesis the
  evidence can confirm or overturn per project, never the answer
  hardcoded into the product. That is what separates an
  accountability instrument from another crypto faction.

### Source check and limits (Codex, 2026-09-27)

- [Bitcoin's FAQ](https://bitcoin.org/en/faq#why-do-bitcoins-have-value)
  describes monetary properties, trust and adoption; its adjacent price and
  risk sections describe supply/demand and possible loss of value. This is
  project documentation of the proposition, not an independent fair-value test.
- [The Crypto Cycle and US Monetary Policy, IMF working paper 2023/163](https://www.imf.org/en/publications/wp/issues/2023/08/04/the-crypto-cycle-and-us-monetary-policy-534834)
  reports a common factor explaining about 80% of price variation in its
  sample and discusses monetary policy and risk appetite. It supports
  investigating shared market demand; it does not attribute causation solely
  to Bitcoin or measure an asset's speculative share or fair value.
