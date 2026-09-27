# Testing standard — 2026-09-27

**Alex's rule: fewer tests. Do not over-engineer testing.**

## The rule

Test the contract, not the implementation. Before writing a test, answer: what
real bug would this catch? If you cannot name one, do not write it.

## What earns a test

- The behavior the PR actually changes, one test per behavior.
- Data integrity the product stands on: ledger counts match the published run,
  receipts resolve to the right records, hearts equal promises.
- Anything that has broken before.

## What does not

- A test per helper, per branch, per file.
- Broad regression suites added per PR.
- Tests that restate the implementation in assertion form.
- Growing the existing suites with every change. They stay as they are unless
  the behavior they cover changes.

Small PRs carry small test deltas. A 10-file PR does not need 10 new tests.
