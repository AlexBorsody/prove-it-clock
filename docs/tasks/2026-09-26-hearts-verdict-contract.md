# Hearts feed the verdict: the data contract

Date: 2026-09-26. Alex's decision, locked in conversation.

## The issue this documents

The atlas brief (`2026-09-26-promise-atlas.md`) says: "Hearts stay dumb
(promise in, heart out) and become drill-down/metadata." That decision is
superseded. If hearts are metadata only, the verdict's promise component
needs its own promise pipeline: two research pipelines, and the first time
they disagree there is no way to answer "where did this number come from."

New rule: **one promise record, two jobs.** The 8-bit hearts display shows
the unweighted inventory (promise in, heart out — that display does not
change). The verdict aggregates the *same records*, weighted. No duplication,
and every future index number resolves to the exact hearts that produced it.

## What to build

This brief authorizes plumbing only. It does not authorize computing the
index, changing the hearts display, or touching the shitcoin meter.

### 1. Heart record gains two fields

Every scored promise record carries, in addition to what it has today
(id, project, statement, state, core flag, evidence/source links):

- `weight` (float, 0-1): how central the promise is to what the project is for.
- `category` (string): the promise category it belongs to.

Provisional values until the methodology lands: `weight = 1.0` for every
promise, `category = "unclassified"`. The aggregation and any API must read
both fields from the data, never hardcode them, so real values flow in with
no code change when the taxonomy and weight definition land.

### 2. State-to-score mapping (proposed; Alex confirms)

- fulfilled/kept = 1
- lapsed/retired = 0
- open = excluded from the denominator, not scored as 0. An unjudged
  promise is unknown, never a failure. The open count stays visible
  alongside any aggregate so "9 of 9 judged kept, 7 still open" reads
  honestly.

### 3. Aggregation function (pure, deterministic, unit-tested)

Per project, per category, per snapshot date:

```
score = sum(weight * state_score) / sum(weight of judged promises)
```

Inputs are the dated heart snapshots already published (`heart_runs` /
`heart_snapshots`); the time series comes free. Same determinism rules as
the atlas brief: no randomness, no unpinned models, reproducible from the
ledger. This function computes the P (promise fulfillment) input of the
future index. It does not compute the index itself.

### 4. Read API for the verdict pipeline

New read-only endpoint (e.g. `/api/verdict-inputs`) serving per-promise
records: promise id, project, statement, state, state_score, weight,
category, evidence links, snapshot date. Phase 5 (index computation) will
read this; build it so that phase needs no rebuild here.

### 5. Display contract (no UI work now)

When the index ships, every number must link back to the contributing
promise records. Build the data so that resolution is a lookup, not a
reconstruction.

## Standing rules (do not break)

- The ledger is sacred: every promise keeps its exact source link.
- No scoring changes visible to users. No new meters, no new tabs, no
  changes to the hearts display or the shitcoin meter under this brief.
- Market data never feeds any score. HYPE is context only.
- No em dashes in public copy. Everything as components going forward.
- Missing data means unknown, never zero.

## What is blocked (do NOT build; methodology, with Alex + ChatGPT review)

- Promise weight definition (centrality formula). Plumbing uses 1.0.
- Promise category taxonomy. Plumbing uses "unclassified".
- The index formula itself: I(p,t) = alpha*V + beta*P, alpha/beta,
  category anchors, fulfillment thresholds, time decay. Do not compute it.
- The V (intrinsic value) pipeline. This brief covers P only.

## Validation

- Every scored promise in the ledger carries `weight` and `category`
  (provisional values acceptable).
- With provisional weights, the aggregation reproduces the unweighted
  inventory count exactly.
- Re-running the aggregation on the same snapshots produces identical
  output, byte for byte.
- The endpoint serves all 8 published projects; each record resolves to
  its evidence links.
