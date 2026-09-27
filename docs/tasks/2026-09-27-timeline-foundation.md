# Timeline foundation: event taxonomy and worked examples — 2026-09-27

The timeline visualization is now the headline build. This brief defines the
event model it renders, with worked examples from real ledger data. The legacy
v0.2.0 timeline is not the base; the event model below is.

## The contract

Per project: see what changed, when, and why. Every event has a date, a source
URL, and a lineage back to its promise. No event without a source. No source
without a date.

## Event taxonomy

Four event types. A promise's timeline is the ordered sequence of its events.

1. **promise_stated** — the original promise as first attributable statement.
   Fields: date, source URL, quote or closest paraphrase, speaker/issuer,
   claim_type (milestone/ongoing). One per promise lineage. Repeated
   announcements are not new promises.
2. **promise_repeated** — the promise restated later. Fields: date, source URL,
   what changed in the wording vs. the original (narrowed, expanded, same).
   Links to the original `promise_stated`.
3. **evidence** — a dated observation bearing on fulfillment. Fields: date,
   source URL, summary, stance (`supports` | `refutes` | `context`), and
   provenance notes (issuer-reported, independent, subsidized, bot-caveat).
   Evidence never determines delivery by itself; it is the material the
   assessment cites.
4. **assessment** — a published judgment at a point in time. Fields: date,
   state (open/fulfilled/lapsed/retired), rationale, methodology version,
   supersedes (previous assessment). A **corrected assessment** is an
   assessment whose `supersedes` is non-null, with the reason for the change
   stated explicitly.

## Worked example 1: xrp-p01-bridge-liquidity (fulfilled)

| date | type | source |
|---|---|---|
| 2017-05-16 | promise_stated | Ripple escrow announcement: "XRP is a digital asset designed for enterprise use, with companies able to use XRP for on-demand liquidity as a bridge currency at lower cost." https://ripple.com/insights/ripple-to-place-55-billion-xrp-in-escrow-to-ensure-certainty-into-total-xrp-supply/ |
| 2018-10 | evidence (supports) | Ripple Q4 2018 XRP Markets Report: xRapid commercially available; MercuryFX, Cuallix, Catalyst Corporate Federal Credit Union signed. https://ripple.com/insights/q4-2018-xrp-markets-report/ |
| 2019-11-07 | evidence (supports) + promise_repeated | Daily Hodl: RippleNet 300+ clients, two dozen ODL customers, MoneyGram settling in seconds. Restates the bridge thesis at operating scale. https://dailyhodl.com/2019/11/07/ripple-hits-300-clients-as-moneygram-announces-expansion-of-xrp-powered-on-demand-liquidity/ |
| 2024-12-16 | evidence (supports, with caveat) | Ripple USD launch PR: Ripple Payments processed $70B+ across 90+ payout markets. Provenance note: issuer-reported; Ripple Payments volume is not automatically XRP-routed volume. https://www.businesswire.com/news/home/20241216911945/en/5762080/Raising-the-Standard-for-Stablecoins-Ripple-USD-Launches-Globally-with-Unmatched-Utility-Experience-and-Compliance |
| 2026-09-26 | assessment | fulfilled, methodology v3, rationale: commercial xRapid customers (2018), ODL at MoneyGram scale (2019), $70B+ Ripple Payments volume (2024). |

## Worked example 2: xrp-p19-codius (retired)

| date | type | source |
|---|---|---|
| 2014-07 | promise_stated | Ripple announces Codius, a smart-contract hosting platform. |
| 2015 | evidence (refutes) | Bitcoin Magazine: Ripple discontinued Codius development, citing a small market. https://bitcoinmagazine.com/business/ripple-discontinues-smart-contract-platform-codius-citing-small-market-1435182153 |
| 2015 | assessment | retired. Rationale: explicitly discontinued by the issuer for lack of demand. |
| 2018-06-06 | evidence (context) | CoinDesk: former CTO Stefan Thomas revived Codius outside Ripple. Lineage continues outside the issuer; the promise as stated by Ripple stays retired. https://www.coindesk.com/markets/2018/06/06/ripple-smart-contracts-creator-targets-ethereum-with-new-tech-launch |

This is the shape the timeline must render: a promise born, evidence arriving
for and against, an assessment, and later context that does not rewrite the
assessment.

## Backfill plan

The current fragments store evidence as untyped summary/URL pairs with dates
buried in prose. Backfill converts each promise's evidence array into typed
events:

- First evidence item dated at or near `effective_at` with issuer language
  becomes the `promise_stated` (verify against the actual source; do not guess).
- Remaining items become `evidence` with stance and provenance assigned by the
  researcher, never inferred by script.
- `effective_at` becomes the `promise_stated` date only when the source
  confirms it.
- Assessments come from the published heart runs, with methodology version.

Backfill is researcher work, promise by promise. Scripts may draft, humans
decide. This is the foundation Alex means: no visualization without the event
data underneath it.

## Viz direction for the build

- Per-project chronological timeline. Event markers differentiated by type;
  evidence markers carry their stance color; assessments are the spine.
- Click any event: the evidence drawer (Atlas pattern) with source link,
  quote, provenance notes.
- Corrected assessments render as a visible revision: old state struck through
  with the reason, not silently replaced. The timeline must show we changed our
  mind and why.
- No verdict math anywhere on the timeline. Counts of events are fine.
- Mobile: the timeline must read at 360px. If it does not, it is not done.
