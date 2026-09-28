import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { createClient } from '@supabase/supabase-js';
import { deliverPushOnce } from '../src/lib/push-delivery';
import { previewFanout } from '../src/lib/push-fanout';
import type { PushSubscriptionRecord } from '../src/lib/push';

const subscription: PushSubscriptionRecord = {
  id: '11111111-1111-4111-8111-111111111111', endpoint: 'https://push.example.test/device',
  p256dh: 'fixture', auth: 'fixture', scope: { project_slug: 'xrp', kind: 'resolution' },
};
const payload = { title: 'Fixture', body: 'Local test', url: '/projects/xrp', tag: 'fixture' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Real Supabase query builders, with all HTTP intercepted in memory.
function deliveryFixture(failure?: 'claim' | 'receipt' | 'delete') {
  const receipts = new Map<string, Record<string, unknown>>();
  let deleted = false;
  const db = createClient('https://db.example.test', 'fixture-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (input, init) => {
      const url = new URL(String(input));
      assert.equal(url.hostname, 'db.example.test');
      const method = init?.method;
      const body = init?.body ? JSON.parse(String(init.body)) : {};
      if (method === 'POST' && url.pathname.endsWith('/push_deliveries')) {
        if (failure === 'claim') return json({ code: '42703', message: 'migration missing' }, 400);
        const key = `${body.subscription_id}:${body.revision_key}:${body.kind}`;
        if (receipts.has(key)) return json({ code: '23505', message: 'duplicate claim' }, 409);
        const receipt = { ...body, id: `receipt-${receipts.size}` };
        receipts.set(key, receipt);
        return json({ id: receipt.id }, 201);
      }
      if (method === 'PATCH' && url.pathname.endsWith('/push_deliveries')) {
        if (failure === 'receipt') return json({ code: 'XX000', message: 'receipt write failed' }, 400);
        const receipt = [...receipts.values()].find((r) => `eq.${r.id}` === url.searchParams.get('id'));
        assert.ok(receipt);
        assert.equal(url.searchParams.get('delivery_status'), 'eq.pending');
        Object.assign(receipt, body);
        return json({ id: receipt.id });
      }
      if (method === 'DELETE' && url.pathname.endsWith('/push_subscriptions')) {
        if (failure === 'delete') return json({ code: 'XX000', message: 'delete failed' }, 400);
        deleted = true;
        receipts.clear(); // FK ON DELETE CASCADE.
        return new Response(null, { status: 204 });
      }
      throw new Error(`Unexpected fixture request: ${method} ${url.pathname}`);
    } },
  });
  return { db, receipts, wasDeleted: () => deleted };
}

test('migration 010 preserves legacy receipts and supports pending decisive claims', async () => {
  const pg = new PGlite();
  try {
    await pg.exec(readFileSync('../db/migrations/009_push_notifications.sql', 'utf8'));
    await pg.query('INSERT INTO push_subscriptions(id, endpoint, p256dh, auth, scope) VALUES ($1,$2,$3,$4,$5::jsonb)',
      [subscription.id, subscription.endpoint, subscription.p256dh, subscription.auth, JSON.stringify(subscription.scope)]);
    await pg.query("INSERT INTO push_deliveries(subscription_id,revision_key,kind) VALUES ($1,'old','news_mention')", [subscription.id]);
    await pg.exec(readFileSync('../db/migrations/010_push_delivery_claims.sql', 'utf8'));
    const old = (await pg.query<{ delivery_status: string; delivered_at: unknown }>('SELECT delivery_status,delivered_at FROM push_deliveries')).rows[0];
    assert.equal(old.delivery_status, 'sent');
    assert.ok(old.delivered_at);
    const claim = () => pg.query("INSERT INTO push_deliveries(subscription_id,revision_key,kind,delivery_status,delivered_at) VALUES ($1,'new','resolution_likely','pending',NULL)", [subscription.id]);
    const attempts = await Promise.allSettled([claim(), claim()]);
    assert.equal(attempts.filter((r) => r.status === 'fulfilled').length, 1);
    assert.equal(attempts.filter((r) => r.status === 'rejected').length, 1);
    await assert.rejects(pg.exec("UPDATE push_deliveries SET delivery_status='sent' WHERE revision_key='new'"), /push_delivery_status_timestamp/);
    await pg.exec("UPDATE push_deliveries SET delivery_status='sent',delivered_at=clock_timestamp() WHERE revision_key='new'");
    assert.equal((await pg.query("SELECT * FROM push_deliveries WHERE delivery_status='sent'")).rows.length, 2);
    await assert.rejects(pg.query("INSERT INTO push_deliveries(subscription_id,revision_key,kind) VALUES ($1,'invalid','price_alert')", [subscription.id]), /push_deliveries_kind_check/);
  } finally { await pg.close(); }
});

test('concurrent delivery attempts reserve before sending and only one reaches the provider', async () => {
  const { db, receipts } = deliveryFixture();
  let sends = 0;
  const sender = async () => {
    sends++;
    assert.equal([...receipts.values()][0].delivery_status, 'pending');
    assert.equal([...receipts.values()][0].delivered_at, null);
    return { ok: true, gone: false };
  };
  const results = await Promise.all([1, 2].map(() => deliverPushOnce(db, subscription, 'news:one', 'resolution_likely', payload, sender)));
  assert.deepEqual(results.sort(), ['sent', 'skipped']);
  assert.equal(sends, 1);
  assert.equal([...receipts.values()][0].delivery_status, 'sent');
  assert.equal(await deliverPushOnce(db, subscription, 'news:one', 'resolution_likely', payload, sender), 'skipped');
  assert.equal(sends, 1);
});

test('missing migration fails before send; uncertain sends and receipts remain pending without retry', async () => {
  const missing = deliveryFixture('claim');
  let sends = 0;
  const sender = async () => { sends++; return { ok: true, gone: false }; };
  await assert.rejects(deliverPushOnce(missing.db, subscription, 'news:one', 'resolution_likely', payload, sender), /migration missing/);
  assert.equal(sends, 0);
  for (const failure of ['transport', 'receipt'] as const) {
    const fixture = deliveryFixture(failure === 'receipt' ? 'receipt' : undefined);
    const send = async () => { sends++; if (failure === 'transport') throw new Error('timeout'); return { ok: true, gone: false }; };
    await assert.rejects(deliverPushOnce(fixture.db, subscription, failure, 'resolution_likely', payload, send), /uncertain|receipt could not be confirmed/);
    assert.equal([...fixture.receipts.values()][0].delivery_status, 'pending');
    const beforeRetry: number = sends;
    assert.equal(await deliverPushOnce(fixture.db, subscription, failure, 'resolution_likely', payload, send), 'skipped');
    assert.equal(sends, beforeRetry);
  }
});

test('expired subscriptions are removed and a failed delete is reported', async () => {
  for (const failure of [undefined, 'delete'] as const) {
    const fixture = deliveryFixture(failure);
    const result = deliverPushOnce(fixture.db, subscription, 'gone', 'news_mention', payload, async () => ({ ok: false, gone: true }));
    if (failure) {
      await assert.rejects(result, /Could not remove expired/);
      assert.equal([...fixture.receipts.values()][0].delivery_status, 'pending');
    } else {
      assert.equal(await result, 'removed');
      assert.equal(fixture.wasDeleted(), true);
    }
  }
});

test('fanout uses only the new immutable request batch, checks read errors, and distinguishes pending receipts', async () => {
  let missingBatch = false;
  let failReceipts = false;
  let pending = false;
  const db = createClient('https://db.example.test', 'fixture-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (input, init) => {
      assert.equal(init?.method, 'GET');
      const url = new URL(String(input));
      const table = url.pathname.split('/').pop();
      if (table === 'promise_history_revisions') return json({
        revision_key: 'rev2', project_slug: 'xrp', ledger_run_id: 'run',
        events: [{ id: 'old', kind: 'assessment', lineage: 'a', state: 'fulfilled' }],
        request: missingBatch ? null : { events: [{ id: 'new', kind: 'evidence', lineage: 'a' }] },
      });
      if (table === 'projects') return json({ slug: 'xrp', name: 'XRP' });
      if (table === 'heart_snapshots') return json({ assessment: { promises: [{ lineage: 'a', criteria: 'Fixture promise' }] } });
      if (table === 'push_subscriptions') return json([{ ...subscription, scope: { project_slug: 'xrp' } }]);
      if (table === 'push_deliveries') return failReceipts
        ? json({ code: 'XX000', message: 'receipt read failed' }, 400)
        : json(pending ? [{ subscription_id: subscription.id, delivery_status: 'pending' }] : []);
      throw new Error(`Unexpected fixture read: ${table}`);
    } },
  });
  const result = await previewFanout(db, 'rev2');
  assert.equal(result.planned.length, 1);
  assert.match(result.planned[0].payload.title, /new evidence/);
  assert.doesNotMatch(result.planned[0].payload.title, /fulfilled/);
  pending = true;
  const reserved = await previewFanout(db, 'rev2');
  assert.equal(reserved.planned.length, 0);
  assert.equal(reserved.summary.pending, 1);
  assert.equal(reserved.summary.alreadyNotified, 0);
  failReceipts = true;
  await assert.rejects(previewFanout(db, 'rev2'), /receipt read failed/);
  missingBatch = true;
  await assert.rejects(previewFanout(db, 'rev2'), /missing its published event batch/);
});
