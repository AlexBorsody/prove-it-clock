import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { getStockLedger, lineageAssessment, lineageRevisions, lineageState } from '../src/lib/stock-data';

test('Tesla seed exposes eight claim lineages with revision chain intact', () => {
  const ledger = getStockLedger('tesla');
  assert.ok(ledger);
  assert.equal(ledger.lineages.length, 8);
  const guidance = ledger.lineages.find((l) => l.id === '2025-delivery-guidance');
  assert.ok(guidance);
  const revisions = lineageRevisions(guidance);
  assert.equal(revisions.length, 3);
  assert.equal(revisions[0].id, 'tsla-2025-delivery-guidance-stated');
  assert.equal(revisions[2].id, 'tsla-2025-delivery-guidance-revised-2');
  assert.equal(revisions[2].supersedes, 'tsla-2025-delivery-guidance-revised-1');
  assert.equal(lineageState(guidance), 'missed');
  const assessment = lineageAssessment(guidance);
  assert.ok(assessment);
  assert.equal(assessment.state, 'missed');
});

test('claims without assessments stay open', () => {
  const ledger = getStockLedger('tesla');
  assert.ok(ledger);
  const guidance = ledger.lineages.find((l) => l.id === '2025-delivery-guidance');
  assert.ok(guidance);
  const withoutAssessment = {
    ...guidance,
    events: guidance.events.filter((e) => e.kind !== 'assessment'),
  };
  assert.equal(lineageState(withoutAssessment), 'open');
  assert.equal(lineageAssessment(withoutAssessment), null);
});

test('fundamentals snapshots are append-only and expectation gap is versioned', () => {
  const ledger = getStockLedger('tesla');
  assert.ok(ledger);
  assert.equal(ledger.fundamentals.length, 3);
  const periods = ledger.fundamentals.map((f) => f.period).sort();
  assert.deepEqual(periods, ['FY2023', 'FY2024', 'FY2025']);
  assert.ok(ledger.expectationGap);
  assert.equal(ledger.expectationGap.modelVersion, 'expectation-gap v1');
  assert.ok(ledger.expectationGap.assumptions.length > 0);
  assert.ok(ledger.expectationGap.embeddedExpectations.length > 0);
});

test('unknown slugs return null; researched companies return their ledger', () => {
  assert.equal(getStockLedger('acme'), null);
  const nvda = getStockLedger('nvidia');
  assert.ok(nvda);
  assert.equal(nvda.lineages.length, 9);
});
