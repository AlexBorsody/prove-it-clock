# Codex: promise-research pipeline (per-project checklist + automation)

Status: ACTIVE. This is the repeatable recipe for onboarding promise inventories
at scale — hundreds of crypto projects now, stocks later (Tesla/Elon promises,
Oracle promises, etc.). One checklist, one fragment format, one merge script,
one publish path.

## The per-project checklist (hand this to a researcher agent)

For project `<slug>` (e.g. `xrp`, `tsla`):

1. **Identify promise sources.** Crypto: whitepaper, official docs, official
   blog, founder/team public statements (tweets, interviews, talks), roadmap
   and launch announcements. Stocks: earnings calls, investor-day decks,
   10-K strategy sections, CEO public statements (tweets, interviews, product
   launches). Primary sources first; secondary only to verify usage.
2. **Extract discrete promises.** One attributable statement = one candidate
   promise. Deduplicate restatements of the same promise. Assign lineage
   `<slug>-pNN-short-slug` (unique, stable).
3. **Classify each promise.**
   - `claim_type`: `milestone` (a shipped thing) or `ongoing` (a standing claim).
   - `core`: exactly one `true` per project — the main promise. Label, not gate.
   - `effective_at`: ISO date the promise was stated. Never in the future.
4. **Score each promise** on the adoption test — real usage, not the press
   release. "We score the usage, not the press release."
   - `fulfilled`: real usage exists now.
   - `open`: still pending.
   - `lapsed`: ongoing promise with no meaningful progress for a long stretch.
   - `retired`: the project explicitly dropped it.
   - Never `active` (banned at the publish boundary). `milestone` can never
     be `lapsed`.
5. **Write criteria + rationale + evidence.** `criteria`: what would count as
   fulfilled, plain words. `rationale`: one line explaining the state.
   `evidence`: at least one entry per promise with the EXACT source URL and a
   summary of what the source is. No guessed URLs.
6. **Write the fragment** to `db/seed/heart-runs/fragments/<slug>-promises.json`
   in the exact shape below. Touch nothing else.

```json
{
  "slug": "<slug>",
  "rationale": "one or two sentences on what sources were researched",
  "allowance_rationale": "No allowance under the promise-heart rule: one promise earns one heart.",
  "promises": [
    { "lineage": "<slug>-pNN-short-slug",
      "claim_type": "milestone|ongoing",
      "criteria": "what would count as fulfilled, in plain words",
      "core": true,
      "state": "open|fulfilled|lapsed|retired",
      "effective_at": "2020-03-12T00:00:00Z",
      "rationale": "one line explaining the state",
      "evidence": [{"url": "https://exact-source-url", "summary": "what this source is"}] }
  ]
}
```

## Automation to build

1. **`scripts/scaffold-promise-fragment.ts <slug>`** — writes the fragment
   skeleton above to the fragments dir and prints this checklist.
2. **`scripts/merge-promise-run.ts`** — reads all fragments in
   `db/seed/heart-runs/fragments/` plus the BTC/ETH base assessments from the
   current published v3 run, computes `capacity` = promise count and
   `earned` = fulfilled count per project, validates the v3 invariants
   (one core, no reward fields, canonical states, allowance 0, evidence
   URLs, effective_at <= as_of), and writes a new run JSON. Never hand-edit
   the artifact again after this exists.
3. **Batch runner** — a queue file (`promise-queue.txt`, one slug per line):
   scaffold each slug, spawn one researcher agent per slug with the checklist
   above, merge, dry-run `npm run hearts:publish -- --dry-run`, report
   per-project counts. Researchers stay parallel; merge stays serial.

## Watch-outs (learned the hard way)

- `HEARTS_METHODOLOGY` must never point at a methodology string with no
  published run — the whole site goes empty. Publish first, flip second.
- Published runs need non-null `reviewed_by` + `policy_ref` (DB CHECK
  `heart_runs_check`); drafts don't.
- No em dashes anywhere in public copy.
- Researcher agents write fragments only — never app code, never search
  components, never the artifact directly.
- Migration 006 (promise-heart rule) is applied in production; schema v3
  invariants are enforced by `publish_heart_run` itself.
