import test from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import { HEARTS_METHODOLOGY } from '../src/lib/heart-data';
import { runNewsScan } from '../src/lib/scan-news-run';

type Row = Record<string, unknown>;
type Result = { data: Row | Row[] | null; error: { code?: string; message: string } | null };
const NOW = new Date('2026-09-27T13:04:00Z');
const ARTICLE_URL = 'https://example.com/mainnet';
const promise = { lineage: 'ship-upgrade', criteria: 'Ship the mainnet upgrade', state: 'open' };

class FakeDb {
  rows: Record<string, Row[]> = {
    heart_runs: [{ id: 'published-run', review_status: 'published', methodology: HEARTS_METHODOLOGY, as_of: '2026-09-27', recorded_at: NOW.toISOString() }],
    heart_rankings: [{ run_id: 'published-run', slug: 'link', name: 'Chainlink', assessment: { promises: [promise] } }],
    scan_runs: [], scan_proposals: [], scan_match_log: [],
  };
  calls: Array<{ table: string; action: string; filters: Array<[string, unknown]>; range?: [number, number] }> = [];
  failures: Array<{ table: string; action: string; message: string }> = [];
  hideExistingProposals = false;
  from(table: string) { return new FakeQuery(this, table); }
  client() { return this as unknown as SupabaseClient; }
}

class FakeQuery {
  action = 'select';
  values: Row[] = [];
  filters: Array<[string, unknown]> = [];
  orders: Array<[string, boolean]> = [];
  bounds?: [number, number];
  one = false;
  required = false;
  ignoreDuplicates = false;
  signal?: AbortSignal;
  constructor(readonly db: FakeDb, readonly table: string) {}
  select() { return this; }
  insert(value: Row | Row[]) { this.action = 'insert'; this.values = Array.isArray(value) ? value : [value]; return this; }
  upsert(value: Row[], options: { onConflict: string; ignoreDuplicates: boolean }) {
    assert.equal(options.onConflict, 'id');
    this.action = 'upsert'; this.values = value; this.ignoreDuplicates = options.ignoreDuplicates; return this;
  }
  update(value: Row) { this.action = 'update'; this.values = [value]; return this; }
  eq(key: string, value: unknown) { this.filters.push([key, value]); return this; }
  order(key: string, options?: { ascending?: boolean }) { this.orders.push([key, options?.ascending !== false]); return this; }
  range(start: number, end: number) { this.bounds = [start, end]; return this; }
  limit(count: number) { return this.range(0, count - 1); }
  single() { this.one = true; this.required = true; return this; }
  maybeSingle() { this.one = true; return this; }
  abortSignal(signal: AbortSignal) { this.signal = signal; return this; }
  then<T = Result, U = never>(resolve?: ((value: Result) => T | PromiseLike<T>) | null, reject?: ((reason: unknown) => U | PromiseLike<U>) | null): Promise<T | U> {
    return Promise.resolve().then(() => this.execute()).then(resolve, reject);
  }
  execute(): Result {
    this.signal?.throwIfAborted();
    this.db.calls.push({ table: this.table, action: this.action, filters: this.filters, range: this.bounds });
    const fail = this.db.failures.find((f) => f.table === this.table && f.action === this.action);
    if (fail) return { data: null, error: { message: fail.message } };
    const rows = this.db.rows[this.table];
    assert.ok(rows, `unexpected table: ${this.table}`);
    let result: Row[] = [];
    if (this.action === 'insert' || this.action === 'upsert') {
      for (const value of this.values) {
        const duplicate = value.id && rows.find((row) => row.id === value.id);
        if (duplicate) {
          if (this.action === 'upsert' && this.ignoreDuplicates) continue;
          return { data: null, error: { code: '23505', message: 'duplicate primary key' } };
        }
        const row = { ...(this.table === 'scan_proposals' ? { status: 'pending' } : {}), ...structuredClone(value) };
        rows.push(row); result.push(row);
      }
    } else {
      result = rows.filter((row) => this.filters.every(([key, value]) => row[key] === value));
      if (this.action === 'update') result.forEach((row) => Object.assign(row, structuredClone(this.values[0])));
      else {
        if (this.table === 'scan_proposals' && this.db.hideExistingProposals) result = [];
        result = [...result].sort((a, b) => {
          for (const [key, ascending] of this.orders) {
            const compared = String(a[key]).localeCompare(String(b[key]));
            if (compared) return ascending ? compared : -compared;
          }
          return 0;
        });
        if (this.bounds) result = result.slice(this.bounds[0], this.bounds[1] + 1);
      }
    }
    if (this.required && result.length !== 1) return { data: null, error: { message: 'expected one row' } };
    return { data: this.one ? structuredClone(result[0] ?? null) : structuredClone(result), error: null };
  }
}

function rss(title = 'Chainlink ships mainnet upgrade') {
  return new Response(`<rss><channel><item><title>${title} - Example</title><link>${ARTICLE_URL}</link><pubDate>${new Date().toUTCString()}</pubDate><source url="https://example.com">Example</source></item></channel></rss>`);
}
const fetcher: typeof fetch = async () => rss();
const options = { now: () => NOW, fetcher };

test('concurrent hourly requests claim once; keyword proposals never write the ledger or send pushes', async () => {
  const db = new FakeDb();
  db.rows.heart_rankings[0].assessment = { promises: [promise, ...['active', 'fulfilled', 'unfulfilled', 'unknown'].map((state) => ({ ...promise, lineage: state, state }))] };
  const results = await Promise.all([runNewsScan(db.client(), options), runNewsScan(db.client(), options)]);
  assert.deepEqual(results.map((r) => r.status).sort(), ['completed', 'skipped']);
  assert.equal(db.rows.scan_runs.length, 1);
  assert.equal(db.rows.scan_match_log.length, 2);
  assert.equal(db.rows.scan_proposals.length, 4);
  assert.equal(results.find((r) => r.status === 'completed')?.proposals_created, 4);
  assert.ok(db.rows.scan_proposals.every((p) => p.status === 'pending' && [promise.lineage, 'unfulfilled'].includes(String(p.lineage))));
  assert.deepEqual([...new Set(db.calls.filter((c) => c.action !== 'select').map((c) => c.table))].sort(), ['scan_match_log', 'scan_proposals', 'scan_runs']);
  assert.ok(db.calls.some((c) => c.table === 'heart_runs' && c.filters.some(([key, value]) => key === 'methodology' && value === HEARTS_METHODOLOGY)));
});

test('stable proposal IDs preserve reviewed rows even when a concurrent read misses them', async () => {
  const db = new FakeDb();
  await runNewsScan(db.client(), options);
  db.rows.scan_proposals[0].status = 'approved';
  db.rows.scan_proposals[0].review_note = 'reviewed source';
  db.rows.scan_proposals[1].status = 'rejected';
  db.rows.scan_proposals[1].review_note = 'headline is insufficient';
  const reviewed = structuredClone(db.rows.scan_proposals);
  db.hideExistingProposals = true;
  const next = await runNewsScan(db.client(), { ...options, now: () => new Date(NOW.getTime() + 3_600_000) });
  assert.equal(next.proposals_created, 0);
  assert.deepEqual(db.rows.scan_proposals, reviewed);
});

test('legacy random-ID proposals in all review statuses are deduplicated beyond the first page', async () => {
  const db = new FakeDb();
  db.rows.scan_proposals = Array.from({ length: 501 }, (_, i) => ({
    id: `000-${String(i).padStart(4, '0')}`, project_slug: 'link', lineage: 'other',
    kind: 'evidence', article_url: `https://example.com/old-${i}`, status: 'pending',
  }));
  db.rows.scan_proposals.push(
    { id: 'f84d2ed0-9c45-4f27-ae65-c0c55b6c4ffe', project_slug: 'link', lineage: promise.lineage, kind: 'evidence', article_url: ARTICLE_URL, status: 'approved' },
    { id: 'fc07f4ef-6cfd-4ce9-b2b0-cbcd21e20205', project_slug: 'link', lineage: promise.lineage, kind: 'assessment', article_url: ARTICLE_URL, status: 'rejected' },
  );
  const previous = structuredClone(db.rows.scan_proposals);
  const result = await runNewsScan(db.client(), options);
  assert.equal(result.proposals_created, 0);
  assert.deepEqual(db.rows.scan_proposals, previous);
  const reads = db.calls.filter((c) => c.table === 'scan_proposals' && c.action === 'select');
  assert.deepEqual(reads.map((c) => c.range), [[0, 499], [500, 999]]);
  assert.ok(reads.every((c) => !c.filters.some(([key]) => key === 'status')));
});

test('feed failure is recorded as partial while other projects continue', async () => {
  const db = new FakeDb();
  db.rows.heart_rankings.push({ run_id: 'published-run', slug: 'eth', name: 'Ethereum', assessment: { promises: [promise] } });
  const partialFetch: typeof fetch = async (input) => {
    if (String(input).toLowerCase().includes('ethereum')) throw new Error('provider unavailable');
    return rss();
  };
  const result = await runNewsScan(db.client(), { ...options, fetcher: partialFetch });
  assert.equal(result.status, 'partial');
  assert.equal(result.projects_checked, 2);
  assert.equal(result.proposals_created, 2);
  assert.deepEqual(result.feed_errors, [{ project_slug: 'eth', error: 'provider unavailable' }]);
  assert.match(String(db.rows.scan_runs[0].error), /eth.*provider unavailable/);
  assert.ok(db.rows.scan_runs[0].finished_at);
});

test('proposal write and failure-bookkeeping errors cannot return success', async () => {
  for (const bookkeepingFails of [false, true]) {
    const db = new FakeDb();
    db.failures.push({ table: 'scan_proposals', action: 'upsert', message: 'database unavailable' });
    if (bookkeepingFails) db.failures.push({ table: 'scan_runs', action: 'update', message: 'bookkeeping unavailable' });
    await assert.rejects(runNewsScan(db.client(), options), bookkeepingFails ? /database unavailable; failure bookkeeping also failed.*bookkeeping unavailable/ : /Could not write scan proposals: database unavailable/);
    if (!bookkeepingFails) {
      assert.match(String(db.rows.scan_runs[0].error), /database unavailable/);
      assert.ok(db.rows.scan_runs[0].finished_at);
    }
  }
});

test('overall cancellation reaches an in-flight feed and records a failed run', async () => {
  const db = new FakeDb();
  const controller = new AbortController();
  const waitingFetch: typeof fetch = async (_input, init) => {
    assert.ok(init?.signal);
    controller.abort(new Error('scan deadline exceeded'));
    init.signal.throwIfAborted();
    throw new Error('unreachable');
  };
  await assert.rejects(runNewsScan(db.client(), { ...options, signal: controller.signal, fetcher: waitingFetch }), /scan deadline exceeded/);
  assert.match(String(db.rows.scan_runs[0].error), /scan deadline exceeded/);
  assert.ok(db.rows.scan_runs[0].finished_at);
});
