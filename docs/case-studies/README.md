# BAT/XRP case-study review

**Completed 2026-09-25.** Scores published to production under the adopted
claim-type rule v2; backdated runs (2013–2021) published 2026-09-25 for the
timeline graph. What follows is the original research brief, kept for the record.

Started 2026-09-24. This is the first delivery task in
[the adopted plan](../tasks/2026-09-23.md), not authorization for other features.
Work sequentially: BAT, then XRP, then Alex/Muse review before implementation.

## Research protocol

- Apply [the adopted algorithm](../hearts-algorithm.md); do not tune to example scores.
- This reviewer has already seen the examples. These studies are **not blinded**.
  An independent blinded replication remains outstanding; do not mislabel this pass.
- Sources establish announcements, release claims and limitations. Analyst-defined
  criteria, rewards and state judgments are separate, reviewable inputs.
- The initial criteria below are recorded before arithmetic, but after exploratory
  source reading. This is retrospective research, not preregistration before events.
- All historical results are reconstructed. Record source publication date separately
  from this research date. A current edited webpage is not a preserved historical copy.
- Do not infer abandonment from a missing search result, or general token adoption
  from a company's partnership. No live score or production UI changes in this pass.

## Candidate criteria, revision 1 (recorded before totals)

These weights are proposals for a review fixture, not approved published rewards.
“Publication time” in the algorithm needs clarification for retrospective imports.
Freeze this revision in Git before calculating; later edits must describe the reason.

| ID | Candidate promise | Fulfillment criterion | Proposed reward |
| --- | --- | --- | --- |
| BAT-C | Improve advertising economics for users, publishers and advertisers with privacy-preserving BAT exchange | Reviewers must define measurable ecosystem success; a browser release alone does not establish it | 0, core gate |
| BAT-1 | Reward users for private opt-in advertising | Public production release pays/credits BAT for attention; state platform/region limits | 2, main economic loop |
| BAT-2 | Enable BAT support of creators | Public creator contribution/payout feature; no separate reward for each channel added | 1 |
| BAT-3 | Extend BAT outside Brave through integrations | Production use by an independent application using the proposed integration route; roadmap/SDK alone insufficient | 1 |
| BAT-4 | Self-custody Rewards payouts | Publicly available payout route to user-controlled wallets, with eligibility stated | 1; assess overlap with BAT-1 |
| XRP-C | XRP materially supports cross-border settlement at infrastructure scale | Define scale, duration and XRP-specific settlement evidence; do not substitute Ripple's company footprint | 0, core gate |
| XRP-1 | Operational ledger supporting XRP payments | Public ledger implementation and dated operation, not token price | 1 |
| XRP-2 | Production cross-border payments using XRP as bridge liquidity | Named customer live use explicitly uses XRP; testing/partnership alone insufficient | 2, principal use-case delivery |
| XRP-3 | Extend production XRP bridge payments to another corridor | Dated customer confirmation of production use, not availability alone | 0, same economic lineage as XRP-2; tests anti-double-counting |

Capacity proposals follow the locked rubric: BAT 10 (advertising sector), XRP 20
(global settlement). These judgments do not establish a justified market value.
The lineage inventory is a first bounded pass, not an exhaustive promise audit.

## Review queue

1. [BAT evidence and calculation worksheet](bat.md).
2. [XRP evidence and calculation worksheet](xrp.md).
3. [BTC evidence and calculation worksheet](btc.md).
4. [LINK evidence and calculation worksheet](link.md).
5. [ETH evidence and calculation worksheet](eth.md).
6. [SOL evidence and calculation worksheet](sol.md).
7. [DASH evidence and calculation worksheet](dash.md).
8. [AVAX evidence and calculation worksheet](avax.md).
9. [Questions and manual acceptance checks](review.md).

Status: worksheets available on draft review pages under `/case-studies`; no
accepted production rating or DB write. Acceptance requires source review, methodology decisions, and a separate
implementation handoff. Keep feature development frozen meanwhile.
