import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { openStockPromises } from '../src/lib/scan-runner';
import { newsFeedUrl } from '../src/lib/news-mentions';
import { isSocialSlug, isStockSlug, STOCK_SOURCES } from '../src/lib/social';
import { promiseDeepLink } from '../src/lib/push';

test('stock registry covers all seven companies with scoped news queries', () => {
  const slugs = Object.keys(STOCK_SOURCES).sort();
  assert.deepEqual(slugs, ['anthropic', 'broadcom', 'nvidia', 'openai', 'oracle', 'spacex', 'tesla']);
  for (const slug of slugs) {
    assert.ok(STOCK_SOURCES[slug].newsQuery.length > 0, slug);
    assert.ok(isStockSlug(slug));
    assert.ok(!isSocialSlug(slug), `${slug} must not collide with a crypto slug`);
  }
});

test('newsFeedUrl serves stock slugs and still rejects unknown ones', () => {
  const url = newsFeedUrl('anthropic');
  assert.ok(url.includes('news.google.com/rss/search'));
  assert.ok(url.includes('q=Anthropic'));
  assert.throws(() => newsFeedUrl('__proto__'));
  assert.throws(() => newsFeedUrl('not-a-company'));
});

test('promise deep links route stocks to /stocks and crypto to /projects', () => {
  assert.ok(promiseDeepLink('anthropic', 'ipo-execution').startsWith('/stocks/anthropic'));
  assert.ok(promiseDeepLink('btc', 'halving').startsWith('/projects/btc'));
});

test('openStockPromises loads open/active lineages from the real ledgers', () => {
  const projects = openStockPromises();
  // Tesla has only resolved lineages, so it contributes nothing to scan.
  assert.ok(!('tesla' in projects));
  for (const slug of ['nvidia', 'broadcom', 'oracle', 'spacex', 'openai', 'anthropic']) {
    assert.ok(slug in projects, `${slug} should have open promises`);
    assert.ok(projects[slug].promises.length > 0);
    for (const p of projects[slug].promises) {
      assert.ok(p.lineage.length > 0);
      assert.ok(p.criteria.length > 0, `${slug}:${p.lineage} needs a fulfillment test`);
    }
  }
});

test('openStockPromises keeps scanner state aligned with latest ledger events', () => {
  const projects = openStockPromises();
  const byLineage = new Map<string, string>();
  for (const [slug, { promises }] of Object.entries(projects)) {
    for (const p of promises) byLineage.set(`${slug}:${p.lineage}`, p.criteria);
  }
  // Spot checks against known open promises from the research ledgers.
  assert.ok(byLineage.has('anthropic:ipo-execution'));
  assert.ok(byLineage.has('nvidia:us-manufacturing-500b'));
  assert.ok(byLineage.has('spacex:mars-2026-uncrewed'));
  assert.ok(byLineage.has('openai:stargate-500b'));
  assert.ok(byLineage.has('oracle:fy2027-revenue-90b'));
  assert.ok(byLineage.has('broadcom:vmware-ebitda-8.5b'));
});
