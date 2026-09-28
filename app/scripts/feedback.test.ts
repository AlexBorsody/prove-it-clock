import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { networkIdentity, issueToken, verifyToken, TOKEN_TTL, parseFeature, sameOrigin } from '../src/lib/feedback/security';

process.env.FEEDBACK_TOKEN_SECRET = 'test-only-secret-at-least-32-characters';

test('IP identity and signed actions reject rotations, tampering and expiration', () => {
  assert.equal(networkIdentity('2001:db8:1:2::abcd'), networkIdentity('2001:0db8:0001:0002:ffff::1'));
  assert.notEqual(networkIdentity('2001:db8:1:3::1'), networkIdentity('2001:db8:1:2::1'));
  assert.equal(networkIdentity('::ffff:192.0.2.1'), networkIdentity('192.0.2.1'));
  assert.throws(() => networkIdentity('192.0.2.1, 203.0.113.1'));
  const token = issueToken('request', '192.0.2.1', 1000);
  assert.equal(verifyToken(token, 'request', '192.0.2.1', 4000).elapsed, 3000);
  assert.throws(() => verifyToken(token, 'vote', '192.0.2.1', 4000));
  assert.throws(() => verifyToken(token, 'request', '192.0.2.2', 4000));
  assert.throws(() => verifyToken(token, 'request', '192.0.2.1', 1001 + TOKEN_TTL));
  assert.throws(() => verifyToken(`x${token}`, 'request', '192.0.2.1', 4000));
  assert.equal(sameOrigin(new Request('http://localhost:3222/api/feedback', {headers:{host:'127.0.0.1:3222',origin:'http://127.0.0.1:3222'}})), true);
  assert.equal(sameOrigin(new Request('http://localhost:3222/api/feedback', {headers:{host:'127.0.0.1:3222',origin:'https://other.example'}})), false);
  const input = parseFeature({title:'One idea',body:'Useful anonymous feedback',why:'',website:'',email:'not collected'});
  assert.equal('email' in input, false);
});

test('PostgreSQL public comments, private signals, duplicate votes and durable rate limits', async () => {
  const db = new PGlite();
  try {
    await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
    await db.exec(readFileSync('../db/migrations/011_feature_requests.sql', 'utf8'));
    const submit = async (kind: string, payload: object, options: { ip?: string; nonce?: string; elapsed?: number } = {}) => {
      const result = await db.query<{ result: { outcome: string; id: string; upvotes: number } }>(
        'SELECT submit_feature_feedback($1,$2,$3,$4,$5) AS result',
        [kind, options.nonce ?? randomUUID(), options.ip ?? 'a'.repeat(64), options.elapsed ?? 3000, JSON.stringify(payload)]);
      return result.rows[0].result;
    };
    const idea = {title:'Test public idea',body:'Plain text <script>alert(1)</script>',why:'',website:''};
    assert.equal((await submit('request', idea, {elapsed:100})).outcome, 'rejected');
    assert.equal((await submit('request', {...idea,website:'spam'})).outcome, 'rejected');
    const nonce = randomUUID();
    const first = await submit('request', idea, {nonce});
    assert.equal(first.outcome, 'saved');
    assert.equal((await submit('request', idea, {nonce})).id, first.id);
    const second = await submit('request', {...idea,title:'Another idea'});
    const repeats = await Promise.all([submit('vote',{id:first.id}), submit('vote',{id:first.id})]);
    assert.deepEqual(repeats.map(r=>r.outcome).sort(), ['already_voted','voted']);
    assert.equal((await submit('vote',{id:second.id})).outcome, 'voted');
    assert.equal((await submit('vote',{id:first.id},{ip:'b'.repeat(64)})).upvotes, 2);
    await db.exec('SET ROLE anon');
    const visible = (await db.query<Record<string, unknown>>('SELECT * FROM feature_requests_public')).rows;
    assert.equal(visible.length, 2);
    assert.equal('ip_hash' in visible[0], false);
    await assert.rejects(db.query('SELECT * FROM feature_request_activity'), /permission denied/);
    await assert.rejects(db.query('SELECT * FROM feature_requests'), /permission denied/);
    await assert.rejects(submit('vote',{id:first.id}), /permission denied/);
    await assert.rejects(db.query('UPDATE feature_requests_public SET upvotes=999'), /permission denied/);
    await db.exec('RESET ROLE');
    await db.query('UPDATE feature_requests SET public=false WHERE id=$1', [first.id]);
    assert.equal((await submit('vote',{id:first.id},{ip:'c'.repeat(64)})).outcome, 'not_found');
    for (let i=0;i<3;i++) assert.equal((await submit('request', idea)).outcome, 'saved');
    assert.equal((await submit('request', idea)).outcome, 'rate_limited');
    assert.equal((await db.query<{n:number}>('SELECT count(*)::int AS n FROM feature_requests')).rows[0].n, 5);
    for (let i=0;i<31;i++) {
      const entry = await submit('request', idea, {ip:i.toString(16).padStart(64,'0')});
      assert.equal((await submit('vote',{id:entry.id},{ip:'d'.repeat(64)})).outcome, i<30 ? 'voted' : 'rate_limited');
    }
  } finally { await db.close(); }
});
