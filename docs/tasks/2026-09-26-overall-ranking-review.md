# Overall ranking: impact, delivery and usage

**Priority: urgent methodology review. Owners: Codex and Muse.** Alex's latest
direction supersedes the earlier deferred-only discussion: an overall ranking
must account for **promise-category world economic impact and demonstrated
usage**, alongside what was delivered. A kept-promises percentage is insufficient.
No category weights, usage coefficients or new scoring publication are approved.

Coordination: [Muse's overall TODO](2026-09-26-overall-ranking-todo.md) is the
shared design outline; this document adds the code/source audit and immediate
default correction. Read it with his [USE draft](2026-09-26-use-metrics-spec.md)
and [weight draft](2026-09-26-verdict-weights-draft.md), not as a parallel formula.
The latest user request explicitly calls for category economic-impact weighting;
whether this is a separate multiplier or an interpretable combined rubric is
still a design decision. No numerical category values have been supplied.

## Immediate product correction

- Default homepage: unranked project browser, alphabetical by name.
- Selecting a category exposes that category's delivery-share ranks and receipts.
- Remove overall ordinal badges from the homepage and project headers,
  including old `?sort=rank` links. Explicit metric sorts remain available;
  they do not create value ranks.
- Update Method to distinguish the working delivery calculation from the
  overall ranking under review. Preserve existing records and assessments.

## What the current order actually measures

Code audit at main `2f450b6`, confirmed against the live homepage and the checked-in
published artifact `db/seed/heart-runs/hearts-promise-2026-09-26.json`:

| Project | Kept / tracked | Share |
|---|---:|---:|
| AVAX | 14 / 17 | 82.4% |
| XRP | 12 / 19 | 63.2% |
| ETH | 7 / 12 | 58.3% |
| BTC | 9 / 16 | 56.3% |
| BAT | 7 / 17 | 41.2% |

These are five comparison cases, not the complete eight-project order. The
homepage sorts by kept share; `useWord()` and the Usage cell are placeholders.
There is no economic-impact or usage input behind the current rank.

Weights alone cannot repair inconsistent obligations:

- **BAT:** core P1 requires a web-wide attention standard beyond Brave; rewarded
  attention inside Brave is P2, already recorded fulfilled. Newly announced
  roadmap commitments increase the denominator without undoing existing utility.
- **XRP:** core P1 tests bridge-liquidity adoption, not replacement of SWIFT. Its
  rationale cites $70B Ripple Payments volume. [Ripple's report](https://ripple.com/insights/q4-2024-xrp-markets-report/)
  identifies that as platform volume and discusses RLUSD. That figure alone
  does not establish XRP-specific settlement volume. Review the other evidence
  before changing the outcome; this finding does not establish zero XRP use.
- **BTC:** P15's current test combines purchasing-power retention with volatility
  converging toward gold. Store-of-value adoption and that specific test are
  different questions. [Fidelity's research](https://www.fidelitydigitalassets.com/research-and-insights/bitcoin-aspirational-store-value-revisited)
  is an investment thesis, not a universal fulfillment definition.
- **ETH / AVAX:** launches, technical capacity, pilots and sustained economic use
  must not be interchangeable achievements. Review parent obligations and child
  checks before counting or weighting them. A valid pilot can satisfy a pilot
  promise without establishing production adoption.

## Model to work through with Muse

| Dimension | Required definition |
|---|---|
| Category economic impact | A shared, versioned rubric for the significance of the function delivered. Explain beneficiaries, scope and measurable benefit; disclose analyst judgment. A large advertised market is potential, not realized impact. |
| Delivery and importance | Independent user-facing obligations, their tests and reviewed importance. Technical subtasks cannot inflate a mission's weight. Category importance does not replace promise-level review. |
| Demonstrated usage | Intended-purpose use of the scored capability/token, with metric, unit, observation window, source, coverage and limitations. Product/company activity is not automatically token activity. |
| Time | Claim date, promised deadline where sourced, first delivery, ongoing use and confirmed missed commitments. Show progress and delay without erasing historical delivery or inventing deadlines. |

Start with comparable category evidence, then evaluate overall aggregation.
Do not average category scores after normalizing only over whichever categories
a project happens to cover: that can make one small successful function look
equivalent to delivering many important functions. Secondary tags do not earn
duplicate credit. Missing usage means unavailable, not zero and not an average
imputed from other projects. A usage observation used to establish fulfillment
must not earn the same delivery credit twice.

The 1/2/4 delivery model is reusable scaffolding, not the final overall model.
Test alternatives against evidence, without choosing coefficients to force BAT,
BTC and ETH above XRP or AVAX. Material core failures stay visible even when
other useful activity exists. Low usage alone is not proof of a broken promise.
CODE, HYPE and market prices remain context; adding usage does not authorize
an intrinsic-price estimate or resurrect the old 60/25/15 Index.

## Initial source leads, not completed usage ratings

- **BAT:** [Brave transparency](https://brave.com/transparency/) separates browser
  growth from Rewards/BAT activity and reports advertiser-funded BAT purchases.
  Collect reward recipients, advertiser-funded payouts and repeat use where
  disclosed. Browser MAU and registered creators are not active BAT users.
- **ETH:** [Ethereum's institutional page](https://institutions.ethereum.org/rwa)
  identifies stablecoins and tokenization as uses. Define the period, source
  methodology and mainnet/L2 boundary; token supply is not payment volume and
  one transfer routed across layers is not two economic activities.
- **AVAX:** [Franklin Templeton's contract registry](https://digitalassets.franklintempleton.com/benji/benji-contracts/)
  lists BENJI deployments on Avalanche and Ethereum. Deployment is evidence of
  availability; measure chain-specific assets/use before claiming adoption or
  assigning the entire multi-chain fund to each chain. Do not assume no utility.
- **XRP:** [XRPL payment documentation](https://xrpl.org/docs/concepts/payment-types/cross-currency-payments)
  explains XRP bridging functionality. Capability does not quantify adoption;
  seek observed XRP-routed settlement and distinguish it from Ripple totals.
- **BTC:** define store-of-value use separately from short-term price gains and
  generic transaction counts. Historical monetary contribution needs its own
  explicit rationale. Do not treat market cap as proof of fair economic value.

Sources read September 26, 2026 local time. This is a targeted integrity audit,
not a regrading of the five projects or an independent usage dataset.

## Next tasks and Muse reply requested

1. **Muse:** review comparable mission boundaries and the five cases above;
   correct source/test mismatches through the existing versioned publication path.
2. **Codex + Muse:** draft category-impact rubric and one measurable usage
   definition per category. Specify what unavailable, subsidized, repeated and
   self-directed activity mean. Automate observations only after those meanings
   are clear; retain raw provenance and observation dates.
3. **Together:** compare resulting delivery/use/impact profiles and sensitivity
   to proposed weights before recommending an overall formula. Show which
   comparisons remain unsupported. Alex's approval is for this direction, not
   fabricated coefficients or outcomes.
4. Resolve whether Bitcoin's Genesis exemption remains specific to altcoin
   accountability while Bitcoin participates in a future utility/impact view.
   The latest request that Bitcoin's value be represented does not by itself
   define how those two views combine.
5. Implement a new overall rank only after the rubric, inputs and worked cases
   are reviewed. Until then category delivery and the unranked browser remain.

## Verification

- Production build and type checking passed; existing themeColor metadata warnings remain.
- Six focused tests passed, including all 115 published promise receipts, default/legacy query behavior, category ties, nonmembers and context sorting.
- Actual browser checks at 1280x800 and 360x800 used a temporary local route with the checked-in published ledger and explicitly placeholder context/warnings. Verified default name ordering without global ordinals, category selection/reset, table alignment and promise expansion. Temporary route was removed afterward; this is not hosted-data or deployment verification of the new change.
- Previously approved PRs #3/#4/#5 are merged on main; their combined build and five intake tests passed. Public-browser checks confirmed the Method disclosure and Supporting context grouping/navigation before this new change.
- No DB migration, hosted mutation, new weights, usage scores or grading publication.

## PR #6 review follow-up, 2026-09-26

- Confirmed the automated review finding: a project header still calculated
  and displayed the global kept-share rank one click past the unranked board.
  Removed that calculation and badge; CODE/HYPE context ranks remain.
- Work isolated on `codex/category-first-ranking`; the other verdict task was
  notified of ownership of this small project-route edit. No shared edits were
  overwritten. [PR #6](https://github.com/AlexBorsody/prove-it-clock/pull/6)
  remains the review target; no merge or deployment requested here.
- Type checking passed after regenerating stale Next route types from the
  already-removed local browser fixture. Diff checks passed. Earlier build,
  tests and browser checks above predate this badge removal; no fresh browser
  or production verification is claimed for the follow-up.
