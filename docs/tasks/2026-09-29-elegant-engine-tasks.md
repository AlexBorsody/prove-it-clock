# Elegant Engine — task breakdown (2026-09-29)

Companion to the [vision](../vision.md#the-elegant-engine-2026-09-29) and
[implementation](../implementation.md#the-elegant-engine--build-plan-2026-09-29)
sections. Codex returns in ~a week; every task below must be executable
without clarifying questions. Anything still a judgment call goes to Alex or
to ChatGPT review in Phase 0 — never to the builder.

## Phase 0: Nail the mechanics (before code)

- [ ] Finalize the coverage denominator formula (candidate: assessed impact
      over total known-promise impact, unassessed known promises carrying a
      marked provisional estimate; meters provisional below 70%).
- [ ] Finalize promise-set revision mechanics: exactly which events stamp a
      new revision, how meter history is presented.
- [ ] ChatGPT methodology review of both. Reconcile with the earlier reviews:
      the single PotentialImpact number is the answer to the "no
      hand-assigned weights in v1" warning — confirm the reconciliation
      explicitly.
- [ ] Reconcile the data model with the live Supabase schema (migrations
      008/009). Read the actual tables before writing any migration.
- [ ] Bitcoin: Genesis exemption stays. The pivot-narrative transition needs
      Alex's explicit approval before any change touches it. Flag, don't
      touch.
- [ ] Decide whether the "Shitcoin Score" name survives contact with the
      lexicon ambition, or the meter gets a formal name with "shitcoin" as
      the colloquial layer.

## Phase 1: The Score (backward half + rails)

Data:
- [ ] Migration (additive only): promise impact fields, lineage links,
      ledger events table, meter revisions table. Existing data untouched.
- [ ] Backfill PotentialImpact + rationale for all assessed promises on the
      researched projects. Alex seeds; every score carries author +
      rationale from the start.
- [ ] State-to-bucket audit: map every existing promise state through the
      mechanical mapping; flag retired/superseded edge cases for Alex.

Computation:
- [ ] Pure computation lib (weights, partition with the 100% assert,
      shitcoin score, coverage, revision hash). Unit tests against seed data.

Components + UI:
- [ ] `<EngineMeters />`, `<MeterWithCoverage />`, `<ImpactRationale />`,
      `<LineageChain />`, `<ChallengeRail />`, `<SubmissionForm />`.
- [ ] Project page: meters block above the promise list; impact + state chip
      on row expand. Heart glyphs unchanged.
- [ ] Promise detail: ledger timeline, lineage chain, impact version
      history, open challenges.
- [ ] Methodology page: invariant, three meters, AIMM-adapted statement,
      pivot gate, coverage semantics. Public copy says "promises"; no em
      dashes.
- [ ] API routes per the sketch. `/api/hearts` untouched.

Rails:
- [ ] Submission (promise + exact source URL), evidence attach, challenge
      filing — attributed, provisional until reviewed.
- [ ] Render pass: every visible surface rendered and copy re-read before
      push. Then push live.

## Phase 2: Track records + AI pilot

- [ ] Public contributor/forecaster track records: attributed history of
      submissions, evidence, challenges and their outcomes.
- [ ] AI decomposition pipeline built and versioned; piloted on ONE promise
      (the Hedera/FedEx sketch). Output is inspectable structure only — no
      crowd pricing yet.
- [ ] Alex + ChatGPT review the pilot before a second promise is attempted.

## Phase 3: The Crowd Engine (forward meter)

- [ ] Forecaster accounts, blind voting windows, one vote per predictor per
      window, reputation staking, trimmed aggregation, holdings disclosure.
- [ ] Brier calibration wired to resolved promises; weight follows track
      record.
- [ ] Monte Carlo EV: expected world impact and expected token value per
      unresolved promise; project token EV as a range.
- [ ] Market-cap comparator on the meter-3 surface. The gap is the product.
- [ ] Meter-3 slot goes live where forecaster data exists.

## Parked (explicitly not in scope)

- The five-coefficient ProveValue ranking (four of five inputs don't exist).
- Monetary staking or prediction markets (regulatory complexity).
- Cross-project sorting on the new meters until the methodology has sat in
  public with challenges.
- Universal D+F+U framing beyond crypto: named as the long arc, not built
  now.

## Acceptance criteria (every task)

- Done means: implemented, unit-tested where computation is involved,
  rendered and copy-checked where UI is involved, and pushed live.
- The 100% invariant is asserted in tests, not just documented.
- No task is done while an open mechanical question from Phase 0 is still
  unresolved beneath it.
