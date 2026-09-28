import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateScope,
  validateSubscriptionInput,
  copyForEvent,
  copyForNewsMention,
  copyForResolutionLikely,
  planFanout,
  promiseDeepLink,
  type LedgerRevision,
  type PushSubscriptionRecord,
} from '../src/lib/push';
import { extractKeywords, matchLineage, draftProposals } from '../src/lib/scan';

const SUB = (id: string, scope: PushSubscriptionRecord['scope']): PushSubscriptionRecord => ({
  id, endpoint: `https://push.example.com/${id}`, p256dh: 'p256dh', auth: 'auth', scope,
});

function noEmDash(s: string) {
  assert.ok(!s.includes('\u2014'), `em dash in copy: ${s}`);
}

test('validateScope accepts coin and promise scopes, rejects junk', () => {
  assert.deepEqual(validateScope({ project_slug: 'link' }), { project_slug: 'link' });
  assert.deepEqual(validateScope({ project_slug: 'link', lineage: 'ship-mainnet' }), { project_slug: 'link', lineage: 'ship-mainnet' });
  assert.deepEqual(validateScope({ project_slug: 'link', kind: 'news' }), { project_slug: 'link', kind: 'news' });
  assert.deepEqual(validateScope({ project_slug: 'link', kind: 'resolution' }), { project_slug: 'link', kind: 'resolution' });
  assert.throws(() => validateScope({ project_slug: 'LINK!' }), /project_slug/);
  assert.throws(() => validateScope({ project_slug: 'link', lineage: 'bad lineage!' }), /lineage/);
  assert.throws(() => validateScope({ project_slug: 'link', kind: 'everything' }), /kind/);
  assert.throws(() => validateScope(null), /object/);
});

test('validateSubscriptionInput requires https endpoint and keys', () => {
  const good = { endpoint: 'https://push.example.com/a#b', p256dh: 'k1', auth: 'k2', scope: { project_slug: 'link' } };
  const parsed = validateSubscriptionInput(good);
  assert.equal(parsed.endpoint, 'https://push.example.com/a');
  assert.throws(() => validateSubscriptionInput({ ...good, endpoint: 'http://x.com/a' }), /https/);
  assert.throws(() => validateSubscriptionInput({ ...good, p256dh: '' }), /keys/);
});

test('copyForEvent builds factual copy per kind, null for non-notifiable kinds', () => {
  const criteria = { 'ship-x': 'Ship product X' };
  const kinds: Array<[string, RegExp, RegExp]> = [
    ['assessment', /promise fulfilled/, /now fulfilled/],
    ['promise_stated', /new promise tracked/, /Ship product X/],
    ['evidence', /new evidence/, /New evidence on/],
    ['claim_repeated', /promise restated/, /was restated/],
    ['claim_revised', /guidance revised/, /was revised/],
  ];
  for (const [kind, titleRe, bodyRe] of kinds) {
    const payload = copyForEvent('link', 'Chainlink', { id: 'e1', kind, lineage: 'ship-x', state: 'fulfilled' }, criteria);
    assert.ok(payload, kind);
    assert.match(payload.title, /Chainlink/);
    assert.match(payload.title, titleRe);
    assert.match(payload.body, bodyRe);
    assert.ok(payload.body.includes('Ship product X'));
    assert.ok(payload.url.startsWith('/projects/link'));
    noEmDash(payload.title + payload.body);
  }
  assert.equal(copyForEvent('link', 'Chainlink', { id: 'e9', kind: 'hype_snapshot' }, {}), null);
  assert.equal(copyForEvent('link', 'Chainlink', { id: 'e9', kind: 'market_update' }, {}), null);
});

test('copyForEvent never mentions price or trading advice', () => {
  const payload = copyForEvent('btc', 'Bitcoin', { id: 'e1', kind: 'assessment', lineage: 'x', state: 'lapsed' }, {});
  assert.ok(payload);
  assert.ok(!/price|buy|sell|trade|moon|\$/.test(payload.title + payload.body), 'trading language in copy');
});

test('planFanout: coin subscriber gets most significant event, promise subscriber only its lineage', () => {
  const revision: LedgerRevision = {
    revision_key: 'rev-1',
    project_slug: 'link',
    events: [
      { id: 'e1', kind: 'evidence', lineage: 'a' },
      { id: 'e2', kind: 'assessment', lineage: 'b', state: 'fulfilled' },
    ],
  };
  const coin = SUB('s-coin', { project_slug: 'link' });
  const promiseA = SUB('s-a', { project_slug: 'link', lineage: 'a' });
  const other = SUB('s-other', { project_slug: 'btc' });
  const planned = planFanout(revision, 'Chainlink', [coin, promiseA, other], { a: 'Promise A', b: 'Promise B' });
  assert.equal(planned.length, 2);
  const byId = Object.fromEntries(planned.map((p) => [p.subscription.id, p]));
  // coin subscriber: assessment outranks evidence
  assert.match(byId['s-coin'].payload.title, /promise fulfilled/);
  assert.ok(byId['s-coin'].payload.body.includes('Promise B'));
  // promise subscriber: only lineage a
  assert.match(byId['s-a'].payload.title, /new evidence/);
  assert.ok(byId['s-a'].payload.body.includes('Promise A'));
  assert.equal(byId['s-a'].kind, 'status_change');
});

test('planFanout skips news-tier subscriptions for status changes', () => {
  const revision: LedgerRevision = {
    revision_key: 'rev-1',
    project_slug: 'link',
    events: [{ id: 'e1', kind: 'assessment', lineage: 'a', state: 'fulfilled' }],
  };
  const newsTier = SUB('s-news', { project_slug: 'link', kind: 'news' });
  const resolutionTier = SUB('s-res', { project_slug: 'link', kind: 'resolution' });
  const statusTier = SUB('s-coin', { project_slug: 'link' });
  const planned = planFanout(revision, 'Chainlink', [newsTier, resolutionTier, statusTier], { a: 'Promise A' });
  assert.equal(planned.length, 1);
  assert.equal(planned[0].subscription.id, 's-coin');
});

test('copyForResolutionLikely is factual, no em dash, no trading language', () => {
  const payload = copyForResolutionLikely(
    'link', 'Chainlink', 'ship-x', { 'ship-x': 'Ship X' },
    { title: 'Chainlink ships X mainnet', publisher: 'CoinDesk', url: 'https://example.com/x' },
    'fulfilled',
  );
  noEmDash(payload.title + payload.body);
  assert.match(payload.title, /may decide a promise/);
  assert.ok(payload.body.includes('fulfilled'));
  assert.ok(payload.body.includes('Human verification pending'));
  assert.ok(!/price|buy|sell|trade|moon|\$/.test(payload.title + payload.body), 'trading language in copy');
});

test('planFanout respects alreadyDelivered (dedupe)', () => {
  const revision: LedgerRevision = {
    revision_key: 'rev-1',
    project_slug: 'link',
    events: [{ id: 'e1', kind: 'evidence', lineage: 'a' }],
  };
  const coin = SUB('s-coin', { project_slug: 'link' });
  assert.equal(planFanout(revision, 'Chainlink', [coin], {}, new Set(['s-coin'])).length, 0);
  assert.equal(planFanout(revision, 'Chainlink', [coin], {}, new Set()).length, 1);
});

test('copyForNewsMention carries headline and deep link', () => {
  const payload = copyForNewsMention('link', 'Chainlink', 'ship-x', { 'ship-x': 'Ship product X' },
    { title: 'Chainlink ships product X', publisher: 'CoinDesk', url: 'https://x.com/a' });
  assert.match(payload.body, /Chainlink ships product X/);
  assert.match(payload.body, /CoinDesk/);
  assert.ok(payload.url.includes('evidence=ship-x'));
  noEmDash(payload.title + payload.body);
});

test('promiseDeepLink anchors to the evidence section', () => {
  assert.equal(promiseDeepLink('link'), '/projects/link');
  assert.ok(promiseDeepLink('link', 'ship-x').includes('/projects/link'));
});

test('extractKeywords drops stopwords and short words', () => {
  const kws = extractKeywords('The team will ship the mainnet upgrade in 2025');
  assert.ok(kws.includes('mainnet'));
  assert.ok(kws.includes('upgrade'));
  assert.ok(kws.includes('2025'));
  assert.ok(!kws.includes('the'));
  assert.ok(!kws.includes('will'));
});

test('matchLineage is conservative: needs 2 promise-specific keywords', () => {
  const promise = { lineage: 'x', criteria: 'Ship the decentralized oracle mainnet upgrade' };
  const hit = matchLineage({ url: 'u', title: 'Chainlink mainnet upgrade goes live', publisher: 'P', published_at: '2026-01-01T00:00:00Z' }, promise, ['chainlink', 'link']);
  assert.equal(hit.matched, true);
  const miss = matchLineage({ url: 'u', title: 'Bitcoin price rallies on ETF flows', publisher: 'P', published_at: '2026-01-01T00:00:00Z' }, promise);
  assert.equal(miss.matched, false);
  assert.ok(miss.reasoning.length > 0, 'misses must log reasoning');
});

test('matchLineage excludes project-name tokens and price spam', () => {
  const promise = { lineage: 'avax-x', criteria: 'Avalanche subnet expansion for enterprise' };
  const nameOnly = matchLineage(
    { url: 'u', title: 'Avalanche jumps 55% as Bitwise launches first staking ETF', publisher: 'P', published_at: '2026-01-01T00:00:00Z' },
    promise, ['avalanche', 'avax'],
  );
  assert.equal(nameOnly.matched, false, 'project name alone is not a signal');
  const spam = matchLineage(
    { url: 'u', title: 'Avalanche Price Prediction: AVAX Rebounds After Helicon', publisher: 'P', published_at: '2026-01-01T00:00:00Z' },
    promise, ['avalanche', 'avax'],
  );
  assert.equal(spam.matched, false);
  assert.match(spam.reasoning, /spam/);
  const real = matchLineage(
    { url: 'u', title: 'Enterprise subnet expansion brings banks to Avalanche', publisher: 'P', published_at: '2026-01-01T00:00:00Z' },
    promise, ['avalanche', 'avax'],
  );
  assert.equal(real.matched, true);
});

test('draftProposals always drafts context evidence; assessment only on explicit signals', () => {
  const promise = { lineage: 'x', criteria: 'Ship the mainnet upgrade' };
  const mk = (title: string) => ({ url: 'u', title, publisher: 'P', published_at: '2026-03-01T00:00:00Z' });
  const plain = draftProposals(mk('Analysts discuss the mainnet upgrade timeline'), promise, { lineage: 'x', matched: true, reasoning: 'r' });
  assert.deepEqual(plain.map((p) => p.kind), ['evidence']);
  assert.equal(plain[0].payload.stance, 'context');
  const launched = draftProposals(mk('Team ships the mainnet upgrade'), promise, { lineage: 'x', matched: true, reasoning: 'r' });
  assert.ok(launched.some((p) => p.kind === 'assessment' && (p.payload as { state: string }).state === 'fulfilled'));
  const delayed = draftProposals(mk('Mainnet upgrade delayed to next year'), promise, { lineage: 'x', matched: true, reasoning: 'r' });
  assert.ok(delayed.some((p) => p.kind === 'assessment' && (p.payload as { state: string }).state === 'lapsed'));
  const restated = draftProposals(mk('CEO reiterates the mainnet upgrade plan'), promise, { lineage: 'x', matched: true, reasoning: 'r' });
  assert.ok(restated.some((p) => p.kind === 'claim_repeated'));
});
