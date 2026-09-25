# XRP: case study

**Method:** [hearts-algorithm.md](../hearts-algorithm.md) v2 (claim-type rule, adopted 2026-09-25; time decay removed).
**Research:** two passes (Muse 2026-09-23, Codex 2026-09-24), non-blinded.
**Status:** published to production 2026-09-25 under adopted rules; single-analyst
(non-blinded), blinded replication outstanding before scores are called verified.

## Result

**XRP 5/20.** Earned 2 (ledger milestone permanent; payments product ongoing,
currently active), allowance 3, core open (cap 19, not binding).

```
earned    = 1 (ledger, milestone) + 1 (XRP payments, ongoing/active) + 0 (MoneyGram, retired) = 2
allowance = 3   (3 checks pass, capped at floor(20/5)=4)
filled    = min(20, 2 + 3) = 5
```

## Lineages

| Promise | Type | Reward | State | Key evidence |
|---|---|---|---|---|
| Working XRP settlement ledger | milestone | 1 | Fulfilled 2012-06 (permanent) | Ledger launch June 2012, [xrpl.org history](https://xrpl.org/about/history) |
| Commercial XRP payments product with named customers | ongoing | 1 | Active (revalidated 2026-09-25) | xRapid live 2018-10-01 with MercuryFX, Cuallix, Catalyst, [CoinDesk](https://www.coindesk.com/markets/2018/10/01/ripple-event-reveal-3-companies-are-now-using-xrp-for-real-payments); ODL >$15B in 2024 (+32% YoY); Ripple Q1 2026 update: ODL $35B, +41% YoY, supplier-reported via [CoinGabbar](https://www.coingabbar.com/en/crypto-blogs-details/what-is-ripple-xrp-odl-how-it-changes-cross-border-payments) / [Phemex](https://phemex.com/blogs/xrp-utility-2026-ripplenet-odl-rlusd-real-world-demand-may-13) |
| Major MoneyGram/ODL corridor | ongoing | 1 | **Retired 2021-03-07** | Cessation early Dec 2020, contract terminated 2021-03-07, [MoneyGram 2021 10-K](https://www.sec.gov/Archives/edgar/data/1273931/000127393122000039/mgi-20211231x.htm). Rise and fall: `+1, 2019`, `−1, 2021` |
| Banks settle in XRP at meaningful scale | n/a | 2 | Open | 12+ years of pilots; correspondent banking untouched |

Capacity 20: global settlement infrastructure ambition (mechanical per rubric).

## Allowance

Present-tense checklist (last 12 months): working product (XRPL ~1.8M
tx/day, Q3 2025), active team (Ripple, 60+ licenses, US bank charter
application), economic activity tied to the promise (ODL volume above).
3 checks → capped at floor(20/5) = **3**.

## Judgment calls (Muse's, Alex can override)

- **Granularity:** MoneyGram kept as its own lineage (not folded into a grouped
  bridge lineage) so the retirement stays visible, the adopted rise-and-fall
  rule demands it. Grouping would hide the −1 behind surviving SBI corridors.
- **Claim typing:** the ledger is a **milestone** (deployed 2012, time cannot
  unship it). The payments product is **ongoing**: xRapid → ODL → Ripple
  Payments treated as one continuing lineage (supersession, no double count);
  the heart exists while commercial XRP payment volume is real.
- **Evidence caveat:** the 2024–2026 ODL volume figures are secondary sources
  citing Ripple's own reports, supplier-adjacent. Blinded replication must
  re-verify against primary sources before production.
- **Entity/asset separation:** early bank pilots (Fidor 2014, CBW/Cross River
  2014, Santander One Pay FX 2018) used Ripple tech **without XRP** , 
  [CoinDesk](https://www.coindesk.com/markets/2014/05/05/fidor-becomes-first-bank-to-use-ripple-payment-protocol).
  Ripple-the-company's footprint earns XRP-the-asset nothing.
- **Ledger date:** June 2012 per xrpl.org (a first pass said 2013; corrected).

## Open

- SBI's XRP bridge remittances (Philippines from 2021, bank expansion Sep 2023
  per [SBI release](https://www.sbigroup.co.jp/english/news/pdf/2023/0906_c_en.pdf)):
  candidate separate lineage or same-lineage corridor expansion, undecided.

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
