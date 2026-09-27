import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectPromiseIntake, intakeCandidates } from '../src/pipeline/promise-intake';

const row = (id: string, rank: number, symbol = id) => ({ id, name: id, symbol, market_cap_rank: rank });
test('identity uses provider IDs, never ticker or array position', () => {
  const a = intakeCandidates([row('impostor', 2, 'BTC'), row('bitcoin', 1, 'BTC')]);
  assert.equal(a[0].existingProjectSlug, 'btc');
  assert.equal(a[1].existingProjectSlug, null);
  assert.notEqual(a[0].id, a[1].id);
  assert.deepEqual(a, intakeCandidates([row('bitcoin', 1, 'BTC'), row('impostor', 2, 'BTC')]));
});
test('rejects duplicate IDs, empty/error responses and malformed ranks', () => {
  for (const bad of [[], { error: 'rate limited' }, [row('bitcoin', 1), row('bitcoin', 2)], [row('coin', 0)], [row('coin', NaN)], [{ id: 'coin' }]]) {
    assert.throws(() => intakeCandidates(bad));
  }
});
test('reuses a capture for 24 hours, retains older snapshots and labels partial coverage', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'promise-intake-'));
  let calls = 0;
  const fetchMarkets = async () => { calls++; return [row('bitcoin', 1)]; };
  try {
    const first = await collectPromiseIntake({ directory, fetchMarkets, now: new Date('2026-09-26T23:00:00Z') });
    const repeated = await collectPromiseIntake({ directory, fetchMarkets, now: new Date('2026-09-27T12:00:00Z') });
    assert.equal(calls, 1); assert.equal(repeated.reused, true);
    assert.equal(repeated.snapshot.coverage, 'partial');
    const next = await collectPromiseIntake({ directory, fetchMarkets, now: new Date('2026-09-27T23:00:00Z') });
    assert.equal(calls, 2); assert.notEqual(first.path, next.path);
    assert.equal(JSON.parse(await readFile(first.path, 'utf8')).capturedAt, first.snapshot.capturedAt);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('provider failure preserves previous data and tampered cached candidates are rejected', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'promise-intake-'));
  try {
    const first = await collectPromiseIntake({ directory, fetchMarkets: async () => [row('bitcoin', 1)], now: new Date('2026-09-26T00:00:00Z') });
    const original = await readFile(first.path, 'utf8');
    await assert.rejects(collectPromiseIntake({ directory, fetchMarkets: async () => { throw new Error('rate limit'); }, now: new Date('2026-09-27T00:00:00Z') }));
    assert.equal(await readFile(first.path, 'utf8'), original);
    const changed = JSON.parse(original); changed.candidates[0].existingProjectSlug = 'wrong';
    await writeFile(first.path, JSON.stringify(changed));
    await assert.rejects(collectPromiseIntake({ directory, fetchMarkets: async () => assert.fail('must not refetch corrupt cache'), now: new Date('2026-09-26T01:00:00Z') }));
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('onboarding a mapping keeps old captures valid and appears in the next daily capture', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'promise-intake-'));
  const fetchMarkets = async () => [row('new-coin', 1)];
  try {
    const first = await collectPromiseIntake({ directory, fetchMarkets, projectMappings: {}, now: new Date('2026-09-26T00:00:00Z') });
    const projectMappings = { newcoin: 'new-coin' };
    const cached = await collectPromiseIntake({ directory, fetchMarkets: async () => assert.fail('reuse the original capture'), projectMappings, now: new Date('2026-09-26T12:00:00Z') });
    assert.equal(cached.snapshot.candidates[0].existingProjectSlug, null);
    assert.equal(cached.path, first.path);
    const next = await collectPromiseIntake({ directory, fetchMarkets, projectMappings, now: new Date('2026-09-27T00:00:00Z') });
    assert.equal(next.snapshot.candidates[0].existingProjectSlug, 'newcoin');
    assert.equal(JSON.parse(await readFile(first.path, 'utf8')).candidates[0].existingProjectSlug, null);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
