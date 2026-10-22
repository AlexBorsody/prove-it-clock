import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { parseContribution, resolveContribution } from '../src/lib/community/input';
import { issueContributionToken, verifyContributionToken, readContributionRequest } from '../src/lib/community/security';

const source = { kind: 'promise', project_slug: '', project_name: 'Example project', lineage: '', claim: 'Ship an openly documented release.',
  detail: 'Check the original roadmap against the published release and its source.', source_url: 'https://example.org/roadmap', source_date: '', deadline: 'Q4 2026', website: '' };
process.env.COMMUNITY_TOKEN_SECRET = 'local-test-only-secret-at-least-32-characters';

test('intake requires a public source, preserves unknown dates, and resolves existing promise identity', async () => {
  assert.equal(parseContribution(source).source_date, '');
  for (const source_url of ['javascript:alert(1)', 'http://localhost/private', 'https://user:pass@example.org', 'https://127.0.0.1', 'http://10.1.2.3/'])
    assert.throws(() => parseContribution({ ...source, source_url }));
  assert.throws(() => parseContribution({ ...source, source_date: '2026-02-30' }));
  assert.throws(() => parseContribution({ ...source, kind: 'evidence' }));
  const evidence = parseContribution({ ...source, kind: 'evidence', project_slug: 'example', lineage: 'p1', claim: 'Fake claim' });
  const projects = [{ slug: 'example', name: 'Canonical name', promises: [{ lineage: 'p1', claim: 'Original public claim' }] }];
  const resolved = resolveContribution(evidence, projects);
  assert.equal(resolved.claim, 'Original public claim');
  assert.equal(resolved.project_name, 'Canonical name');
  assert.throws(() => resolveContribution({ ...evidence, lineage: 'wrong' }, projects));
  await assert.rejects(readContributionRequest(new Request('https://example.org', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ long: 'x'.repeat(33000) }),
  })), /too long/);
});

test('submission tokens cannot move between networks, be altered, or live past their expiry', () => {
  const token = issueContributionToken('192.0.2.1', 1000);
  assert.equal(verifyContributionToken(token, '192.0.2.1', 4000).elapsed, 3000);
  assert.throws(() => verifyContributionToken(token, '192.0.2.2', 4000));
  assert.throws(() => verifyContributionToken(`x${token}`, '192.0.2.1', 4000));
  assert.throws(() => verifyContributionToken(token, '192.0.2.1', 3_601_001));
});

test('database keeps submissions private, retries idempotent, limits durable and reviews append-only', async () => {
  const db = new PGlite();
  try {
    await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
    await db.exec(readFileSync('../db/migrations/013_community_contributions.sql', 'utf8'));
    const submit = async (payload = source, nonce = randomUUID(), ip = 'a'.repeat(64), elapsed = 3000) => {
      const result = await db.query<{ result: { outcome: string; id: string } }>('SELECT submit_community_contribution($1,$2,$3,$4) AS result', [nonce, ip, elapsed, JSON.stringify(payload)]);
      return result.rows[0].result;
    };
    const nonce = randomUUID();
    const first = await submit(source, nonce);
    assert.equal(first.outcome, 'saved');
    assert.equal((await submit(source, nonce)).id, first.id);
    assert.equal((await submit({ ...source, claim: 'A different obligation' }, nonce)).outcome, 'conflict');
    assert.equal((await db.query('SELECT * FROM community_contributions_public')).rows.length, 0);
    await db.exec('SET ROLE anon');
    await assert.rejects(db.query('SELECT * FROM community_contributions'), /permission denied/);
    await assert.rejects(submit(), /permission denied/);
    await assert.rejects(db.query("SELECT review_community_contribution($1,'accepted','Source checked','Tester')", [first.id]), /permission denied/);
    await db.exec('RESET ROLE');
    assert.equal((await submit({ ...source, website: 'spam' })).outcome, 'rejected');
    for (let i = 0; i < 4; i++) assert.equal((await submit()).outcome, 'saved');
    assert.equal((await submit()).outcome, 'rate_limited');
    await db.exec('SET ROLE service_role');
    await db.query("SELECT review_community_contribution($1,'accepted','Original source checked; outcome still pending.','Test reviewer')", [first.id]);
    const visible = (await db.query<Record<string, unknown>>('SELECT * FROM community_contributions_public')).rows;
    assert.equal(visible.length, 1);
    assert.equal(visible[0].claim, source.claim);
    assert.equal('ip_hash' in visible[0], false);
    await assert.rejects(db.query("UPDATE community_contributions SET claim='changed' WHERE id=$1", [first.id]), /permission denied/);
    await assert.rejects(db.query('DELETE FROM community_reviews'), /permission denied/);
    await db.query("SELECT review_community_contribution($1,'needs_info','Correction: the source lacks the full release context.','Test reviewer')", [first.id]);
    assert.equal((await db.query('SELECT * FROM community_reviews')).rows.length, 2);
    assert.equal((await db.query('SELECT * FROM community_contributions_public')).rows.length, 0);
  } finally { await db.close(); }
});
