import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateHeartPublication, type HeartPublication } from '../src/lib/heart-publication';
import { calculateHeartBalance, type HeartBalanceInput } from '../src/lib/hearts';
import { heartQuery } from '../src/lib/heart-data';

type Assessment = NonNullable<NonNullable<HeartPublication['projects'][number]['assessment']>>;

function fixture(key = 'fixture-1'): HeartPublication {
  return {
    schema_version:3,run_key:key,as_of:'2026-09-25T00:00:00Z',methodology:'test-only',review_status:'published',
    reviewed_by:'test reviewer',policy_ref:'fixture only; not production policy',
    projects:[{slug:'fixture-a',availability:'available',assessment:{capacity:2,allowance:0,
      rationale:'Test promises',allowance_rationale:'No allowance under the promise-heart rule',promises:[
        {lineage:'core',claim_type:'milestone',criteria:'Core test',core:true,state:'open',
          effective_at:'2020-01-01T00:00:00Z',rationale:'Not yet delivered',
          evidence:[{url:'https://example.org/core',summary:'Test evidence'}]},
        {lineage:'delivery',claim_type:'ongoing',criteria:'Delivery test',core:false,state:'fulfilled',
          effective_at:'2023-09-24T00:00:00Z',rationale:'Delivered and used',
          evidence:[{url:'https://example.org/delivery',summary:'Test evidence'}]}
      ]},market:{observed_at:'2026-09-24T00:00:00Z',source_url:'https://example.org/markets',price_usd:2,
        market_cap_usd:100,raw_payload:{test:true}}},
      {slug:'fixture-b',availability:'unavailable',unavailable_reason:'Awaiting evidence',market:{
        observed_at:'2026-09-24T00:00:00Z',source_url:'https://example.org/markets',price_usd:3,
        market_cap_usd:200,raw_payload:{test:true}}}]
  };
}

function toInput(a: Assessment): HeartBalanceInput {
  return {promises: a.promises.map(p => ({
    lineage: p.lineage, claimType: p.claim_type, state: p.state, core: p.core}))};
}

test('PostgreSQL publication: atomicity, evidence, retries, ranks, append-only history and access', async t => {
  const db = new PGlite();
  try {
    await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
    // PGlite has gen_random_uuid built in but not pgcrypto. Everything else in 001 runs unchanged.
    await db.exec(readFileSync('../db/migrations/001_initial.sql','utf8').replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;',''));
    await db.exec(readFileSync('../db/migrations/002_heart_publications.sql','utf8'));
    await db.exec(readFileSync('../db/migrations/005_canonical_promise_states.sql','utf8'));
    await db.exec(readFileSync('../db/migrations/006_promise_heart_rule.sql','utf8'));
    await db.exec("INSERT INTO projects(slug,name,symbol) VALUES ('fixture-a','Fixture A','FA'),('fixture-b','Fixture B','FB'); GRANT SELECT ON projects TO anon,authenticated,service_role;");
    const publish = async (doc: HeartPublication) => db.query<{id:string}>(
      'SELECT public.publish_heart_run($1::jsonb) AS id',[JSON.stringify(doc)]);
    const doc = fixture(); validateHeartPublication(doc);
    await t.test('writer RPC derives results and stores raw evidence and markets', async () => {
      await db.exec('SET ROLE service_role');
      await publish(doc);
      const {rows} = await db.query<{filled:number;earned:number;allowance:number;assessment:unknown}>(
        'SELECT filled,earned,allowance,assessment FROM heart_snapshots WHERE availability=\'available\'');
      assert.equal(rows[0].earned,1); assert.equal(rows[0].allowance,0); assert.equal(rows[0].filled,1);
      assert.deepEqual(rows[0].assessment,doc.projects[0].assessment);
      assert.equal((await db.query('SELECT * FROM heart_market_observations')).rows.length,2);
      await db.exec('RESET ROLE');
    });
    await t.test('identical retry is a no-op; changed same-key payload fails', async () => {
      const first = await publish(doc); const second = await publish(doc);
      assert.equal(first.rows[0].id,second.rows[0].id);
      await assert.rejects(publish({...doc,policy_ref:'conflicting'}),/Conflicting run_key/);
    });
    await t.test('late row failure rolls back the entire run', async () => {
      const bad = fixture('rollback');bad.projects[1].slug='missing';
      await assert.rejects(publish(bad),/Unknown project/);
      assert.equal((await db.query("SELECT * FROM heart_runs WHERE run_key='rollback'")).rows.length,0);
      assert.equal((await db.query('SELECT * FROM heart_snapshots')).rows.length,2);
    });
    await t.test('drafts are stored but inaccessible to public readers; rank is cohort market cap', async () => {
      await publish({...fixture('draft'),review_status:'draft'});
      await db.exec('SET ROLE anon');
      assert.equal((await db.query('SELECT * FROM heart_runs')).rows.length,1);
      assert.equal((await db.query('SELECT * FROM heart_snapshots')).rows.length,2);
      const rows = (await db.query<{slug:string;market_cap_rank:number;filled:number|null}>('SELECT * FROM heart_rankings ORDER BY market_cap_rank')).rows;
      assert.equal(rows[0].slug,'fixture-b');assert.equal(Number(rows[0].market_cap_rank),1);assert.equal(rows[0].filled,null);
      await assert.rejects(publish(fixture('unauthorized')),/permission denied/);
      await assert.rejects(db.exec("INSERT INTO heart_runs(run_key) VALUES ('bypass')"),/permission denied/);
      await db.exec('RESET ROLE');
    });
    await t.test('even writer cannot bypass the RPC or rewrite previous results', async () => {
      await db.exec('SET ROLE service_role');
      await assert.rejects(db.exec('DELETE FROM heart_snapshots'),/permission denied/);
      await assert.rejects(db.exec('TRUNCATE heart_snapshots CASCADE'),/permission denied/);
      await db.exec('RESET ROLE');
      await assert.rejects(db.exec('UPDATE heart_snapshots SET filled=0'),/append-only/);
      await assert.rejects(db.exec('DELETE FROM heart_runs'),/append-only/);
    });
    await t.test('duplicate lineages, missing core, capacity mismatch, rewards, lapsed milestones and review metadata rejected in SQL', async () => {
      const cases: Array<(d:HeartPublication)=>void> = [
        d=>d.projects[0].assessment!.promises.push(d.projects[0].assessment!.promises[1]),
        d=>{d.projects[0].assessment!.promises.shift();},
        d=>{d.projects[0].assessment!.capacity=7;},
        d=>{d.projects[0].assessment!.allowance=1;},
        d=>{const raw=JSON.parse(JSON.stringify(d.projects[0].assessment!.promises[1]));raw.reward=1;
          d.projects[0].assessment!.promises[1]=raw;},
        d=>{d.projects[0].assessment!.promises[1].claim_type='milestone';d.projects[0].assessment!.promises[1].state='lapsed';},
        d=>{d.projects[0].assessment!.promises[1].claim_type='vibes' as 'milestone';},
        d=>{d.projects[0].market!.observed_at='2027-01-01T00:00:00Z';},
        d=>{delete d.reviewed_by;},
        d=>{d.projects.push(d.projects[0]);},
        d=>{d.projects[0].assessment!.promises[1].evidence=[];},
        d=>{d.projects[0].assessment!.promises[1].state='active';},
      ];
      for (const [i,change] of cases.entries()) {
        const bad=fixture(`invalid-${i}`);change(bad);
        await assert.rejects(publish(bad));
        assert.equal((await db.query('SELECT * FROM heart_runs WHERE run_key=$1',[bad.run_key])).rows.length,0);
      }
    });
    await t.test('SQL matches TypeScript promise-heart arithmetic: lapse, reactivation, retirement, core label', async () => {
      const scenarios: Array<(a: Assessment) => void> = [
        a=>{}, // baseline: one fulfilled ongoing, core open -> 1/2
        a=>{a.promises[1].state='lapsed';}, // lapse drops the heart -> 0/2
        a=>{a.promises[1].state='retired';}, // retirement removes it visibly -> 0/2
        a=>{a.promises.push({lineage:'ledger',claim_type:'milestone',criteria:'Ledger test',core:false,
          state:'fulfilled',effective_at:'2012-06-01T00:00:00Z',rationale:'Deployed',
          evidence:[{url:'https://example.org/ledger',summary:'Test evidence'}]});
          a.capacity=3;}, // milestone permanent -> 2/3
        a=>{a.promises[0].state='fulfilled';
          a.promises.push({lineage:'ledger',claim_type:'milestone',criteria:'Ledger test',core:false,
            state:'fulfilled',effective_at:'2012-06-01T00:00:00Z',rationale:'Deployed',
            evidence:[{url:'https://example.org/ledger',summary:'Test evidence'}]});
          a.capacity=3;}, // core fulfilled earns like any other -> 3/3
        a=>{const raw=JSON.parse(JSON.stringify(a));raw.promises[1].state='unfulfilled';a.promises=raw.promises;},
        // legacy "unfulfilled" normalizes to open identically in SQL and TS -> 0/2
      ];
      for (const [i,change] of scenarios.entries()) {
        const d=fixture(`promiseheart-${i}`);const a=d.projects[0].assessment!;
        change(a); validateHeartPublication(d);
        const id=(await publish(d)).rows[0].id;
        const row=(await db.query<{filled:number;earned:number}>(
          'SELECT filled,earned FROM heart_snapshots WHERE run_id=$1 AND availability=\'available\'',[id])).rows[0];
        const expected=calculateHeartBalance(toInput(a));
        assert.equal(row.filled,expected.filled);
        assert.equal(row.earned,expected.earned);
      }
    });
  } finally {await db.close();}
});

test('publication artifact validation rejects unsafe inputs before network calls', () => {
  validateHeartPublication(fixture());
  const bad=fixture();bad.projects[0].assessment!.promises.push(bad.projects[0].assessment!.promises[1]);
  bad.projects[0].assessment!.capacity=3;
  assert.throws(()=>validateHeartPublication(bad),/Duplicate lineage/);
  const lapsed=fixture();lapsed.projects[0].assessment!.promises[1].claim_type='milestone';
  lapsed.projects[0].assessment!.promises[1].state='lapsed';
  assert.throws(()=>validateHeartPublication(lapsed),/cannot lapse/);
  const active=fixture();active.projects[0].assessment!.promises[1].state='active';
  assert.throws(()=>validateHeartPublication(active),/Ambiguous promise state/);
  assert.throws(()=>validateHeartPublication({...fixture(),reviewed_by:undefined}));
  assert.throws(()=>validateHeartPublication({...fixture(),projects:[]}));
  const v2=fixture() as unknown as Record<string,unknown>;v2.schema_version=2;
  assert.throws(()=>validateHeartPublication(v2),/Unsupported publication schema/);
});
test('API requires an explicit methodology and bounded pagination', () => {
  assert.throws(()=>heartQuery(new Request('https://example.org/api/hearts')));
  assert.throws(()=>heartQuery(new Request('https://example.org/api/hearts?methodology=test&per_page=101')));
  assert.deepEqual(heartQuery(new Request('https://example.org/api/hearts?methodology=test')), {methodology:'test',page:1,perPage:20});
});
