import test from 'node:test';
import assert from 'node:assert/strict';
import { GET } from '../src/app/api/cron/scan-news/route';

test('cron fails closed before any fetch when auth or write configuration is absent', async () => {
  const keys = ['CRON_SECRET', 'NEWS_SCAN_ENABLED', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const prior = keys.map(key => process.env[key]);
  const priorFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Unexpected network call'); };
  const request = (auth?: string) => new Request('https://example.test/api/cron/scan-news', {
    headers: auth ? { Authorization: auth } : {},
  });
  try {
    keys.forEach(key => delete process.env[key]);
    assert.equal((await GET(request('Bearer undefined'))).status, 401);
    process.env.CRON_SECRET = 'local-test-secret';
    assert.equal((await GET(request())).status, 401);
    assert.equal((await GET(request('Bearer wrong-token'))).status, 401);
    const disabled = await GET(request('Bearer local-test-secret'));
    assert.equal(disabled.status, 503);
    assert.equal(disabled.headers.get('cache-control'), 'no-store');
    process.env.NEWS_SCAN_ENABLED = 'true';
    assert.equal((await GET(request('Bearer local-test-secret'))).status, 503);
  } finally {
    keys.forEach((key, index) => prior[index] === undefined ? delete process.env[key] : process.env[key] = prior[index]);
    globalThis.fetch = priorFetch;
  }
});
