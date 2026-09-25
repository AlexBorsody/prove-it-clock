# Case study: BAT (Basic Attention Token) — evidence-first assessment

**Method:** [hearts-algorithm.md](../hearts-algorithm.md) v1 (adopted 2026-09-23).
**Researcher note:** Worked mechanically from the rubric. Illustrative scores were
not used as targets; where the result differs from them, the methodology wins.
**Status:** research complete, UI wiring pending (Codex task).

## Capacity

BAT's stated ambition: a blockchain-based digital advertising platform that
rewards user attention ("reward participation in advertising"). The capacity
rubric assigns **10** to owning a sector and names advertising explicitly.
**Capacity = 10** (mechanical, not judgment).

## Starting allowance (present-tense checklist, last 12 months)

| Check | Result | Basis |
|---|---|---|
| Working product used for stated purpose | 1 | Brave browser + Brave Rewards + Brave Ads live and used |
| Identifiable team actively shipping | 1 | Brave Software Inc., Brendan Eich |
| Measurable economic activity tied to the promise | 1 | BAT ad buys, creator payouts ongoing |

Raw 3, capped at floor(10/5) = **A0 = 2**.

## Promise lineages

| ID | Promise (from 2017 whitepaper / ICO pitch) | Reward | Criteria (predefined) | State | Evidence |
|---|---|---|---|---|---|
| L-BAT-1 | Users compensated in BAT for their attention | 2 | Opt-in users receive BAT for viewing privacy-preserving ads matched on-device | **Fulfilled 2019-04-24** | Brave Ads launch: 70% ad-revenue share paid in BAT — [CoinDesk](https://www.coindesk.com/markets/2019/04/24/view-ads-get-bat-brave-delivers-on-ico-promise-of-paid-web-browsing) |
| L-BAT-2 | Publishers/creators earn BAT (improved revenue) | 1 | Verified creators receiving BAT payouts at scale (≥100k verified) | **Fulfilled 2019-10-17** | 290k Brave Verified Publishers; 8M MAU; ~400 ad campaigns — [AMBCrypto](https://eng.ambcrypto.com/brave-ads-reward-over-290000-online-creators-in-bat/). Caveat: payouts substantially subsidized by Brave's user growth pool, not purely organic ad revenue |
| L-BAT-3 | Advertisers transact on the platform | 1 | Real brands running paid campaigns settled in BAT | **Fulfilled 2019-10-17** | Launch advertisers (Vice, Home Chef, eToro…); Brave buying BAT with ad revenue to fund the 70% user share — [AMBCrypto](https://eng.ambcrypto.com/brave-ads-reward-over-290000-online-creators-in-bat/) |
| L-BAT-4 | BAT becomes a web standard / multi-platform attention layer | 2 | Adoption beyond Brave as a standard | **Open** | Stated as eventual aim in whitepaper; not realized |

Supporting timeline: ICO 2017-05-31 — 1B BAT, 156,250 ETH (~$35M), <30 seconds —
[CoinDesk](https://www.coindesk.com/markets/2017/05/31/35-million-in-30-seconds-token-sale-for-internet-browser-brave-sells-out/?outputType=amp).
Whitepaper: [basicattentiontoken.org](https://basicattentiontoken.org/wp-content/uploads/2017/05/BasicAttentionTokenWhitePaper-4.pdf).

## Core promise

"Fix digital advertising" via a decentralized, transparent ad exchange. The
platform exists and operates, but industry-scale transformation has not
happened. **Core = open (partially realized).** Gate applies: filled ≤ 9
(not binding here).

## Computation

```
earned     = 2 + 1 + 1 + 0 = 4
allowance  = 2  (no decay — project continuously delivers its fulfilled
             promises; see ambiguity A1)
filled     = min(10, 4 + 2) = 6
gate       = min(6, 9) = 6
```

**Result: BAT 6/10.**

This disagrees with the illustrative 3/10. Per the falsification rule, the
methodology wins: BAT earned more than the gut estimate — four kept promises
(2 major + 2 standard), a live product, an active team, real economic activity.
The gap between 6/10 delivery and BAT's market price is precisely the
undervaluation signal the instrument is built to surface.

## Ambiguities (reported, not resolved — methodology needs these defined)

- **A1. What resets the inactivity clock S(t)?** BAT's last *new* fulfillment was
  2019, but the platform delivers its promised utility continuously (monthly
  payouts, ongoing campaigns). Strict event-reading drains the allowance to 0
  (→ 4/10); continuous-operation reading keeps it (→ 6/10). The doc must define
  whether ongoing delivery of fulfilled promises counts as activity.
- **A2. Lineage granularity.** Users / publishers / advertisers could be read as
  one lineage (the ad platform works) rather than three. The anti-subdivision
  rule needs a sharper test than "don't split busywork."
- **A3. Subsidized fulfillment.** Creator payouts were largely funded by Brave's
  own token pool rather than organic ad revenue. Does subsidized delivery count
  as fulfilled? Counted here with the caveat surfaced.
