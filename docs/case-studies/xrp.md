# XRP — case study

**Method:** [hearts-algorithm.md](../hearts-algorithm.md) v1 (adopted 2026-09-23).
**Research:** two passes (Muse 2026-09-23, Codex 2026-09-24), non-blinded.
**Status:** scored under adopted rules; Alex review required before any production use.

## Result

**XRP 2/20.** Earned 2, allowance decayed to 0, core open (cap 19, not binding).

```
earned    = 1 (ledger) + 1 (xRapid product) + 0 (MoneyGram, retired) = 2
allowance = max(0, 3 − 6) = 0   (A0=3; last fulfillment 2018-10-01; S≈8y)
filled    = min(20, 2 + 0) = 2
```

## Lineages

| Promise | Reward | State | Key evidence |
|---|---|---|---|
| Working XRP settlement ledger | 1 | Fulfilled 2012-06 | Ledger launch June 2012 — [xrpl.org history](https://xrpl.org/about/history) |
| Commercial XRP payments product with named customers | 1 | Fulfilled 2018-10-01 | xRapid live with MercuryFX, Cuallix, Catalyst — [CoinDesk](https://www.coindesk.com/markets/2018/10/01/ripple-event-reveal-3-companies-are-now-using-xrp-for-real-payments) |
| Major MoneyGram/ODL corridor | 1 | Fulfilled 2019, **retired 2021-03-07** | Cessation early Dec 2020, contract terminated 2021-03-07 — [MoneyGram 2021 10-K](https://www.sec.gov/Archives/edgar/data/1273931/000127393122000039/mgi-20211231x.htm). Rise and fall: `+1 — 2019`, `−1 — 2021` |
| Banks settle in XRP at meaningful scale | 2 | Open | 12+ years of pilots; correspondent banking untouched |

Capacity 20: global settlement infrastructure ambition (mechanical per rubric).

## Allowance

Present-tense checklist (last 12 months): not established — no dated current
XRP bridge-volume evidence found in this pass. **A0 treated as 3** (checklist
ceiling floor(20/5)=4, adopted 3-item cap) → decayed to 0 regardless. Missing
evidence is unavailable, never zero; a current-evidence pass could restore it.

## Judgment calls (Muse's, Alex can override)

- **Granularity:** MoneyGram kept as its own lineage (not folded into a grouped
  bridge lineage) so the retirement stays visible — the adopted rise-and-fall
  rule demands it. Grouping would hide the −1 behind surviving SBI corridors.
- **Recency:** strict event reading = the adopted rule as written. Continuous
  operation would give 5/20; not adopted.
- **Entity/asset separation:** early bank pilots (Fidor 2014, CBW/Cross River
  2014, Santander One Pay FX 2018) used Ripple tech **without XRP** —
  [CoinDesk](https://www.coindesk.com/markets/2014/05/05/fidor-becomes-first-bank-to-use-ripple-payment-protocol).
  Ripple-the-company's footprint earns XRP-the-asset nothing.
- **Ledger date:** June 2012 per xrpl.org (a first pass said 2013; corrected).

## Open

- SBI's XRP bridge remittances (Philippines from 2021, bank expansion Sep 2023
  per [SBI release](https://www.sbigroup.co.jp/english/news/pdf/2023/0906_c_en.pdf)):
  candidate separate lineage or same-lineage corridor expansion — undecided.
- Current-allowance evidence pass (dated ledger operation, shipping, XRP-tied
  economic activity in the trailing 12 months).

## Source register

| ID | Source | What it establishes |
|---|---|---|
| X01 | [XRPL history](https://xrpl.org/about/history) | Ledger launch June 2012 (month precision) |
| X02 | 2018-10-01 [CoinDesk: xRapid launch](https://www.coindesk.com/markets/2018/10/01/ripple-event-reveal-3-companies-are-now-using-xrp-for-real-payments) | Named customers using XRP for real payments |
| X03 | 2018-10-02 [Ripple: Swell report](https://ripple.com/insights/ceo-brad-garlinghouse-talks-internet-of-value-and-customer-traction-at-swell-2018/) | Live US–Mexico XRP payments via Cuallix (supplier-reported) |
| X04 | 2023-09-06 [SBI release (PDF)](https://www.sbigroup.co.jp/english/news/pdf/2023/0906_c_en.pdf) | XRP bridge remittances from 2021; corridor expansion (volume not disclosed) |
| X05 | [MoneyGram 2021 10-K](https://www.sec.gov/Archives/edgar/data/1273931/000127393122000039/mgi-20211231x.htm) | ODL cessation Dec 2020; termination 2021-03-07; market-development fees |
| X06 | 2014-05-05 [CoinDesk: Fidor](https://www.coindesk.com/markets/2014/05/05/fidor-becomes-first-bank-to-use-ripple-payment-protocol) | Bank used Ripple protocol without XRP (entity/asset split) |

Context, unscored: SEC sued Ripple 2020-12-22; July 2023 split ruling;
$125M penalty Aug 2024; case closed Aug 2025.
