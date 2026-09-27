import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { adaptAtlas } from '../src/lib/atlas/adapter';
import type { AtlasNode, AtlasDataset } from '../src/lib/atlas/types';
import { calibrate, formatStateBreakdown, measure, parseDraftWeights, PROFILES, type DraftWeights } from './lib/ranking-calibration';

const artifact = JSON.parse(readFileSync(new URL('../../db/seed/heart-runs/hearts-promise-2026-09-26.json', import.meta.url), 'utf8'));
const draft = readFileSync(new URL('../../docs/tasks/2026-09-26-verdict-weights-draft.md', import.meta.url), 'utf8');
const data = adaptAtlas({
  run: { id: artifact.run_key, as_of: artifact.as_of, methodology: artifact.methodology, review_status: artifact.review_status },
  projects: artifact.projects.map((project: Record<string, unknown>) => ({ ...project, run_id: artifact.run_key, methodology: artifact.methodology })),
})!;
const weights = parseDraftWeights(draft, data.nodes);
const profile = PROFILES.find(p => p.id === '1:2:4')!;
const node = (id: string, state: AtlasNode['state'], project = 'a', extra: Partial<AtlasNode> = {}): AtlasNode =>
  ({ ...data.nodes[0], id, lineageId: id, state, projectSlug: project, primaryCategory: 'payments', core: false, ...extra });
const fixture = (nodes: AtlasNode[]): AtlasDataset => ({ ...data, nodes });
const equalAssignments = (nodes: AtlasNode[]): DraftWeights => new Map(nodes.map(n => [n.id, { tier: 1, rationale: 'Fictional test' }]));

test('real artifact and draft are replayed without changing records or claiming BTC weights', () => {
  const before = JSON.stringify(data);
  const result = calibrate(data, weights);
  assert.equal(result.coverage.promises, 115);
  assert.equal(result.coverage.draftWeights, 99);
  assert.equal(result.profiles.length, 10);
  assert.equal(result.coverage.missingWeightIds.length, 16);
  assert.ok(result.coverage.missingWeightIds.every(id => id.startsWith('btc:')));
  assert.ok(result.scopes.filter(s => s.project === 'btc').every(s => Object.values(s.profiles).every(p => p.rank === null)));
  assert.equal(JSON.stringify(data), before);
  assert.deepEqual(calibrate(data, weights), result);
});

test('malformed, duplicate, unknown and ambiguous editorial assignments fail closed', () => {
  const table = (lineage: string, tier = '4', rationale = 'review') => `| lineage | tier | rationale |\n|---|---|---|\n| ${lineage} | ${tier} | ${rationale} |`;
  const n = data.nodes[0];
  assert.throws(() => parseDraftWeights(table(n.lineageId, '0'), data.nodes), /Invalid draft/);
  assert.throws(() => parseDraftWeights(table(n.lineageId, '4', ''), data.nodes), /Invalid draft/);
  assert.throws(() => parseDraftWeights(table('unknown-id'), data.nodes), /Unknown/);
  assert.throws(() => parseDraftWeights(`${table(n.lineageId)}\n${table(n.lineageId)}`, data.nodes), /Duplicate/);
  assert.throws(() => parseDraftWeights(table(n.lineageId), [n, { ...n, id: 'other' }]), /ambiguous/);
  assert.throws(() => parseDraftWeights('No tables', data.nodes), /No draft/);
});

test('missing weight, empty scope and unresolved outcomes remain different', () => {
  const nodes = [node('kept', 'kept'), node('unknown', 'unknown'), node('open', 'open')];
  const assignments = equalAssignments(nodes);
  const measured = measure(nodes, assignments, profile);
  assert.equal(measured.keptShare, 1 / 3);
  assert.equal(measured.stateWeights!.unknown, 1);
  assert.equal(measured.stateWeights!.open, 1);
  assert.equal(measured.stateWeights!.lapsed, 0);
  assignments.delete('unknown');
  assert.equal(measure(nodes, assignments, profile).availability, 'missing-weights');
  assert.equal(measure(nodes, assignments, profile).keptShare, null);
  assert.equal(measure([], assignments, profile).availability, 'not-applicable');
  const unresolved = [node('u', 'unknown'), node('o', 'open')];
  const scope = calibrate(fixture(unresolved), equalAssignments(unresolved)).scopes[0];
  assert.equal(scope.comparison, 'no-resolved-outcomes');
  assert.equal(scope.profiles['1:2:4'].rank, null);
  const failed = [node('failed', 'lapsed')];
  const failure = calibrate(fixture(failed), equalAssignments(failed)).scopes[0];
  assert.equal(failure.profiles['1:2:4'].keptShare, 0);
  assert.equal(failure.profiles['1:2:4'].rank, 1);
});

test('all-kept scopes saturate; category-wide multipliers cancel rather than add impact', () => {
  const nodes = [node('high', 'kept'), node('low', 'open')];
  const assignments: DraftWeights = new Map([['high', { tier: 4, rationale: 'test' }], ['low', { tier: 1, rationale: 'test' }]]);
  assert.equal(measure(nodes, assignments, profile).keptShare, 4 / 5);
  assert.equal(measure(nodes, assignments, { id: 'scaled', weights: { 1: 10, 2: 20, 4: 40 } }).keptShare, 4 / 5);
  for (const probe of PROFILES) assert.equal(measure(nodes.map(n => ({ ...n, state: 'kept' })), assignments, probe).keptShare, 1);
});

test('the required 1:2:3 comparison reweights draft tiers without changing their assignments', () => {
  const nodes = [node('high', 'kept'), node('low', 'open')];
  const assignments: DraftWeights = new Map([['high', { tier: 4, rationale: 'test' }], ['low', { tier: 1, rationale: 'test' }]]);
  const scope = calibrate(fixture(nodes), assignments).scopes[0];
  assert.equal(scope.profiles['1:1:1'].keptShare, 1 / 2);
  assert.equal(scope.profiles['1:2:3'].keptShare, 3 / 4);
  assert.equal(scope.profiles['1:2:4'].keptShare, 4 / 5);
  assert.equal(assignments.get('high')!.tier, 4);
});

test('report state breakdown distinguishes unresolved outcomes from lapsed and retired at the same kept share', () => {
  for (const state of ['open', 'in_progress', 'lapsed', 'retired', 'unknown'] as const) {
    const nodes = [node('kept', 'kept'), node('other', state)];
    const assignments: DraftWeights = new Map([['kept', { tier: 4, rationale: 'test' }], ['other', { tier: 2, rationale: 'test' }]]);
    const scope = calibrate(fixture(nodes), assignments).scopes[0];
    assert.equal(scope.profiles['1:2:4'].keptShare, 2 / 3);
    assert.equal(formatStateBreakdown(scope), `1 kept (weight 4); 1 ${state.replace('_', ' ')} (weight 2)`);
    assignments.delete('other');
    const missing = calibrate(fixture(nodes), assignments).scopes[0];
    assert.equal(formatStateBreakdown(missing), `1 kept (weight unavailable); 1 ${state.replace('_', ' ')} (weight unavailable)`);
  }
});

test('core failure survives other successes and a category filter without tier-based reassignment', () => {
  const nodes = [node('core', 'lapsed', 'a', { core: true, primaryCategory: 'platform' }),
    ...Array.from({ length: 9 }, (_, i) => node(`support-${i}`, 'kept'))];
  const assignments = equalAssignments(nodes);
  assignments.set('core', { tier: 4, rationale: 'test' });
  assert.equal(measure(nodes, assignments, profile).keptShare, 9 / 13);
  const payments = calibrate(fixture(nodes), assignments).scopes.find(s => s.category === 'payments')!;
  assert.deepEqual(payments.coreFindings, [{ id: 'core', state: 'lapsed' }]);
  assert.equal(payments.profiles['1:2:4'].keptShare, 1);
});

test('ranks retain exact ties; secondary categories and Unclassified never double-count', () => {
  const nodes = [node('a1', 'kept', 'a', { secondaryCategories: ['privacy'] }), node('a2', 'open'),
    node('b1', 'kept', 'b'), node('b2', 'kept', 'b'), node('b3', 'open', 'b'), node('b4', 'open', 'b'),
    node('c1', 'lapsed', 'c'), node('unclassified', 'kept', 'd', { primaryCategory: null })];
  const result = calibrate(fixture(nodes), equalAssignments(nodes));
  assert.equal(result.scopes.find(s => s.project === 'a')!.profiles['1:2:4'].rank, 1);
  assert.equal(result.scopes.find(s => s.project === 'b')!.profiles['1:2:4'].rank, 1);
  assert.equal(result.scopes.find(s => s.project === 'c')!.profiles['1:2:4'].rank, 3);
  assert.equal(result.scopes.find(s => s.project === 'd')!.profiles['1:2:4'].rank, null);
  assert.equal(result.scopes.filter(s => s.category === 'privacy').length, 0);
  assert.equal(result.scopes.reduce((sum, s) => sum + s.promiseIds.length, 0), nodes.length);
});

test('duplicate promises and invalid weights are rejected rather than silently changing ranks', () => {
  const n = node('same', 'kept');
  assert.throws(() => measure([n, n], equalAssignments([n]), profile), /Duplicate/);
  assert.throws(() => calibrate(fixture([n, n]), equalAssignments([n])), /Duplicate/);
  for (const bad of [0, -1, NaN, Infinity]) {
    assert.throws(() => measure([n], equalAssignments([n]), { id: 'bad', weights: { 1: 1, 2: 2, 4: bad } }), /positive/);
  }
  assert.throws(() => calibrate(data, weights, [profile, profile]), /duplicate profiles/);
});
