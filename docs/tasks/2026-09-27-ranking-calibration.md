# Ranking calibration: fix meaning before selecting coefficients

**Codex, 2026-09-27. Alex requested immediate work on weights and algorithms.**
This authorizes model investigation now, while the reviewed publication gate
remains. Built a local calibration command, not a new public score. Ledger and
source records are unchanged. [Generated results](../research/2026-09-27-ranking-calibration.md).

## What the replay establishes

The command reads all 115 published v3 records and Muse's 99-lineage draft
directly, with the existing Atlas state/category adapter. It tests nine weight
ratios, retains missing data and exact ties, and produces category-only
diagnostics. It never publishes, contacts providers or reads credentials.

| Current recorded scope | Equal weights | Draft 1:2:4 | Stress 1:2:8 |
|---|---:|---:|---:|
| BAT payments, 2 of 7 kept | 28.6% | 50.0% | 66.7% |
| ETH platform, 6 of 10 kept | 60.0% | 75.0% | 83.3% |
| XRP payments, 2 of 2 kept | 100% | 100% | 100% |
| AVAX platform, 8 of 8 kept | 100% | 100% | 100% |

These are conditional arithmetic results from the checked-in artifact, not
new research judgments or ratings. XRP and AVAX cannot move below 100% in
these scopes by changing positive weights: every included record is kept.
That does not establish economic scale or justify changing their outcomes to
force a desired rank. Review fulfillment tests and comparable scope first.

Three structural findings:

1. **Completion is not scale.** A small completed mission and a huge completed
   mission both yield 100%. A category-wide economic-importance multiplier
   cancels from a normalized completion fraction: `cK / cW = K / W`. It cannot
   make that fraction measure economic impact.
2. **A finite weight cannot defeat unlimited easy promises.** With a weight-4
   failed core, nine kept supporting promises yield `9/13 = 69.2%`; 100 yield
   `100/104 = 96.2%`. Count control and an independent core finding are needed,
   not just a bigger multiplier. Repeated statements are not new obligations.
3. **The tier rubric mixes different concepts.** Tier 4 currently means either
   functional necessity or a category-defining ambition. Record centrality and
   potential scope separately. Draft tier 4 must never rewrite the v3 core flag.

## Model recommendation for Muse/Alex review

Keep three explicit outputs instead of blending them into another percentage:

- **Delivery:** for a category's reviewed independent obligations `g`, calculate
  `sum(weight_g * kept_g) / sum(weight_g)`. Weights apply to independent
  obligations, not each sentence, milestone announcement or supporting check.
  Parent/child evidence must not multiply the obligation's budget. Unresolved
  and unknown weights remain visible in the denominator; show coverage and
  core failures alongside the result. The 1/2/4 ratio is a candidate, not a
  validated measure of economic importance.
- **Realized use and impact:** measured activity of delivered capabilities in
  stated units and windows. Compare compatible measures within a category;
  preserve absolute scale. If a normalized index is proposed, publish its
  reference scale, exclusions and uncertainty. Do not derive scale from the
  delivery percentage or the project's stated addressable market. Low use,
  missing observations and an inapplicable metric are different cases.
- **Token benefit:** identify how that use creates demand for, or benefits
  holders of, this token. Product success alone is insufficient. Keep this
  evidence visible separately before attempting a valuation model.

Do not multiply completion by the same usage evidence already used to award
delivery, or penalize it again with outcome coverage. Do not add a new age
penalty: sourced deadlines, confirmed misses and persistence of actual use
must be reviewed first. No universal cross-category score is introduced.

The [OECD/JRC composite-indicator handbook, sections 1.6–1.7](https://www.oecd.org/content/dam/oecd/en/publications/reports/2008/08/handbook-on-constructing-composite-indicators-methodology-and-user-guide_g1gh9301/9789264043466-en.pdf)
supports making weighting/aggregation choices explicit and testing sensitivity;
it also discusses compensation and duplicate dimensions. It does not endorse
our ratios, claim assessments or crypto valuation model. The equations and
recommendations above are our analysis, not conclusions from that handbook.

## Specific handoff and next iteration

**Muse owns editorial inputs; Codex owns the replay and calculation code.**

1. Review the high-influence claims in the generated report before tuning:
   XRP bridge-liquidity P1 accounts for 66.7 percentage points of its payment
   category under the draft. Clarify the attributable claim/test and token
   usage evidence; do not broaden it to SWIFT replacement. Apply the same
   evidence standard to BAT's reward loop and AVAX's recorded platform claims.
2. Resolve independent-obligation allocation for XRP p02/p03, p01/p04 and ETH
   p02/p03. The current draft itself describes mechanics/corollaries. Keep all
   history, but decide which records are separate scored obligations before
   interpreting any weighted result as fair.
3. Pick the first intended-use observation contract in the existing USE draft:
   population, unit, period, exact source/query, exclusions, product/token
   attribution, subsidy/bot caveats and missing-data behavior. BAT browser MAU
   and Ripple platform volume are not substitutes for token-specific use.
4. Review a revised tier rationale without looking at the desired coin order.
   Codex reruns the same report against the revision, explains changes and
   tests ranks for sensitivity. Build on PR #8's versioned evaluator for an
   eventual reviewed publication; do not turn this diagnostic into another
   production scoring engine.

Bitcoin's 16 records remain visible and unranked under the Genesis decision;
no weight assignments are fabricated. Its monetary-demand/utility model is a
separate pending editorial question, not a missing-value shortcut to first place.

## Verification and ownership

- Added `app/scripts/calibrate-ranking.ts` and its analysis helper; no app
  route, renderer, production evaluator, database or publishing path changed.
- `npm run ranking:calibrate` prints Markdown; append `-- --json` for exact
  state weights, missing IDs, core findings and all diagnostic ranks. Source
  hashes and methodology/assignment versions make the input revision explicit.
- 23 focused tests passed: seven calibration cases and 16 existing Atlas /
  verdict regressions. TypeScript and `git diff --check` passed.
- The committed Markdown report reproduces byte-for-byte from the command;
  its relative link and the implementation task pointer resolve.
- No browser, hosted-data or deployment verification: this is a local tool.
- Work isolated on `codex/ranking-calibration`, based on main `429d703`.
  PR #7 owns the broad scope review; PR #8 owns delivery implementation.
