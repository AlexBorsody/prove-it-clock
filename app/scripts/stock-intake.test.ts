import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectStockIntake, validateStockClaimDocument } from '../src/pipeline/stock-intake';
import teslaLedger from '../data/stocks/tesla-ledger.json';

const baseSource = { url: 'https://example.com/source', title: 'Example source', publishedOn: '2025-01-01' };

function baseEvent(overrides = {}) {
  return {
    id: 'evt-1',
    lineage: 'test-lineage',
    kind: 'claim_stated',
    occurredOn: '2025-01-01',
    recordedAt: '2026-09-27',
    summary: 'We will deliver one million widgets this year.',
    author: 'Jane Doe',
    speaker: 'Jane Doe',
    speakerCapacity: 'CEO',
    source: { ...baseSource },
    stance: 'context',
    provenance: ['author notes'],
    ...overrides,
  };
}

function baseDocument(overrides = {}) {
  return {
    schemaVersion: 1,
    kind: 'stock-claim-capture',
    companySlug: 'tesla',
    lineage: 'test-lineage',
    claimCategory: 'Financial Guidance',
    tags: [],
    capturedAt: '2026-09-27T00:00:00.000Z',
    events: [baseEvent()],
    ...overrides,
  };
}

test('accepts a minimal valid document and publishes nothing', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'stock-intake-'));
  try {
    const result = await collectStockIntake({ directory, documents: [baseDocument()] });
    assert.equal(result.snapshot.validatedLineages.length, 1);
    assert.equal(result.snapshot.companies[0].slug, 'tesla');
    assert.equal(result.snapshot.publication, 'none');
    const parsed = JSON.parse(await readFile(result.path, 'utf8'));
    assert.equal(parsed.validatedLineages.length, 1);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('rejects unknown company slugs', () => {
  assert.throws(() => validateStockClaimDocument(baseDocument({ companySlug: 'acme' })), /Unknown companySlug/);
});

test('rejects unknown claim categories and tags', () => {
  assert.throws(() => validateStockClaimDocument(baseDocument({ claimCategory: 'vibes' })), /claimCategory must be one of/);
  assert.throws(() => validateStockClaimDocument(baseDocument({ tags: ['blockchain'] })), /tags must be a subset of/);
});

test('requires exactly one original statement per lineage', () => {
  const noOriginal = baseDocument({ events: [baseEvent({ id: 'evt-2', kind: 'evidence' })] });
  assert.throws(() => validateStockClaimDocument(noOriginal), /exactly one claim_stated/);
  const twoOriginals = baseDocument({ events: [baseEvent({ id: 'evt-1' }), baseEvent({ id: 'evt-2' })] });
  assert.throws(() => validateStockClaimDocument(twoOriginals), /exactly one claim_stated/);
});

test('rejects revisions that reference missing events', () => {
  const bad = baseDocument({
    events: [
      baseEvent(),
      baseEvent({ id: 'evt-2', kind: 'claim_revised', supersedes: 'evt-missing', revisionReason: 'Guidance toned down.' }),
    ],
  });
  assert.throws(() => validateStockClaimDocument(bad), /supersedes unknown event/);
  const badRepeat = baseDocument({
    events: [
      baseEvent(),
      baseEvent({ id: 'evt-2', kind: 'claim_repeated', originalId: 'evt-missing', wordingChange: 'same' }),
    ],
  });
  assert.throws(() => validateStockClaimDocument(badRepeat), /must reference the lineage claim_stated/);
});

test('rejects non-https sources and future dates', () => {
  const badUrl = baseDocument({ events: [baseEvent({ source: { ...baseSource, url: 'not a url' } })] });
  assert.throws(() => validateStockClaimDocument(badUrl), /http\(s\) URL/);
  const future = baseDocument({ events: [baseEvent({ occurredOn: '2999-01-01' })] });
  assert.throws(() => validateStockClaimDocument(future), /future/);
});

test('rejects duplicate event IDs', () => {
  const dup = baseDocument({ events: [baseEvent({ id: 'same' }), baseEvent({ id: 'same', kind: 'evidence' })] });
  assert.throws(() => validateStockClaimDocument(dup), /Duplicate event id/);
});

test('snapshot hash is stable for identical payloads', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'stock-intake-'));
  try {
    const doc = baseDocument();
    const a = await collectStockIntake({ directory, documents: [doc], now: new Date('2026-09-27T00:00:00Z') });
    await rm(a.path);
    const b = await collectStockIntake({ directory, documents: [doc], now: new Date('2026-09-27T00:00:00Z') });
    assert.equal(a.snapshot.payloadSha256, b.snapshot.payloadSha256);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('the Tesla pilot seed validates through the intake pipeline', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'stock-intake-'));
  try {
    const documents = (teslaLedger as { companySlug: string; lineages: Array<{ id: string; claimCategory: string; tags: string[]; events: unknown[] }> }).lineages.map(
      (lineage) => ({
        schemaVersion: 1,
        kind: 'stock-claim-capture',
        companySlug: 'tesla',
        lineage: lineage.id,
        claimCategory: lineage.claimCategory,
        tags: lineage.tags,
        capturedAt: '2026-09-27T00:00:00.000Z',
        events: lineage.events,
      })
    );
    const result = await collectStockIntake({ directory, documents, now: new Date('2026-09-27T00:00:00Z') });
    assert.equal(result.snapshot.validatedLineages.length, 8);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
