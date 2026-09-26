# Codex: promise-research pipeline (automation)

Status: ACTIVE. The per-project research methodology now lives durably in
`docs/implementation.md` ("Promise research methodology"): the checklist a
researcher agent follows, the exact fragment format, and the merge/publish
rules. This doc covers only the automation to build on top of it.

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
