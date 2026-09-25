# Case study: XRP (Ripple) — evidence-first assessment

**Method:** [hearts-algorithm.md](../hearts-algorithm.md) v1 (adopted 2026-09-23).
**Researcher note:** Worked mechanically from the rubric. Illustrative scores were
not used as targets. **Status:** research complete, UI wiring pending (Codex task).

## Capacity

XRP's stated ambition since 2012: a bridge currency for cross-border settlement
that replaces SWIFT-scale correspondent banking — the "Internet of Value."
The capacity rubric assigns **20** to replacing/rewiring global infrastructure.
**Capacity = 20** (mechanical, not judgment).

## Starting allowance (present-tense checklist, last 12 months)

| Check | Result | Basis |
|---|---|---|
| Working product used for stated purpose | 1 | XRP Ledger settles in 3–5 seconds; Ripple Payments (formerly ODL) operates in live corridors |
| Identifiable team actively shipping | 1 | Ripple Labs |
| Measurable economic activity tied to the promise | 1 | ODL corridor volume, XRPL transactions |

Raw 3, capped at floor(20/5) = 4 → **A0 = 3**.

## Promise lineages

| ID | Promise | Reward | Criteria (predefined) | State | Evidence |
|---|---|---|---|---|---|
| L-XRP-1 | A working decentralized settlement ledger | 1 | Public ledger settling cross-currency transactions in seconds | **Fulfilled 2013** | XRP Ledger launched 2013; 3–5s settlement, ~1,500 TPS — [CCN](https://www.ccn.com/education/crypto/ripple-vs-swift-blockchain-banking-behemoth/) |
| L-XRP-2 | Banks settle cross-border payments in XRP at meaningful scale (the core-adjacent promise) | 2 | Banks using XRP as bridge currency in production at scale | **Open** | 12+ years of pilots and announcements; correspondent banking untouched. Early bank pilots (Fidor May 2014, CBW/Cross River Sep 2014) and Santander One Pay FX (2018) used the Ripple protocol / xCurrent **without XRP** — [CoinDesk](https://www.coindesk.com/markets/2014/05/05/fidor-becomes-first-bank-to-use-ripple-payment-protocol), [CCN](https://www.ccn.com/archive/crypto/santander-uses-ripple-to-launch-first-banking-blockchain-retail-payments-app/) |
| L-XRP-3 | A commercial XRP payments product with real customers | 1 | Commercial launch with named financial institutions using XRP | **Fulfilled 2018-10-01** | xRapid goes live with MercuryFX, Cuallix, Catalyst Corporate FCU — [CoinDesk](https://www.coindesk.com/markets/2018/10/01/ripple-event-reveal-3-companies-are-now-using-xrp-for-real-payments) |
| L-XRP-4 | A major remittance corridor running on ODL/XRP | 1 | Sustained production volume via ODL | **Fulfilled 2019-06, retired 2021-03-08** | MoneyGram partnership: XRP in 10–20% of ODL transactions, "billions of dollars" processed, $41–61.5M in Ripple market-development fees; ended over SEC-suit uncertainty — [AMBCrypto](https://ambcrypto.com/ripple-moneygram-end-partnership-citing-lack-of-crypto-reg-framework/). Textbook rise-and-fall: `+1 fulfilled — 2019`, `−1 retired — 2021` |

Context (not scored — never a founding promise): SEC sued Ripple 2020-12-22;
July 2023 split ruling (programmatic sales not securities; institutional sales
were); $125M penalty Aug 2024; case closed Aug 2025 —
[CoinMarketCap](https://coinmarketcap.com/community/articles/6a9fc1ad3528e4134ce0fcab/).

## Core promise

Replace SWIFT-scale settlement with XRP as the bridge currency. **Open.**
Correspondent banking and SWIFT remain dominant; XRP settlement is confined to
niche corridors. Gate applies: filled ≤ 19 (not binding here).

## Computation

```
earned     = 1 + 0 + 1 + 0 (L-XRP-4 retired) = 2
allowance  = 0  (last fulfillment 2019-06; S(t) ≈ 6 years > 2-year grace;
             strict event reading — see ambiguity A1)
filled     = min(20, 2 + 0) = 2
gate       = min(2, 19) = 2
```

**Result: XRP 2/20.**

This matches the illustrative 2/20 exactly. That convergence must be read
carefully: the same person wrote the rubric and applied it, so this is **not**
independent validation of the methodology — it may simply show the rubric was
shaped by the same intuitions. The real falsification test still requires an
independent researcher. What the exercise does demonstrate is mechanical
reproducibility: predefined criteria + dated evidence → the number falls out
without discretionary tuning.

Under the continuous-operation reading of A1 (Ripple still ships, ODL still
runs), the allowance would be 3 and the result **5/20** — still a small
fraction of a 20-heart ambition, which is the substantive point either way.

## Ambiguities (reported, not resolved)

- **A1 (same as BAT):** what resets S(t) — only new fulfillment events, or
  continuous operation of fulfilled lineages? Strict reading applied here per
  the formula's letter; the prose ("silence") cuts the other way.
- **A2:** L-XRP-2's criteria ("meaningful scale") needed a judgment call on what
  counts as scale. The methodology needs scale thresholds per capacity tier.
- **A3:** Ripple's bank partnerships routinely used non-XRP products (xCurrent).
  The lineages above score XRP-the-asset's promises, not Ripple-the-company's
  revenue — that separation should be explicit in the methodology.
