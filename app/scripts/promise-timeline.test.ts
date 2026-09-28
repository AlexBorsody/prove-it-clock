import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { PGlite } from '@electric-sql/pglite';
import { eventDateLabel, parseTimelineRow, validEventDate } from '../src/lib/promise-timeline';
import { readPromiseTimeline } from '../src/lib/promise-timeline-data';

const methodology='hearts promise-heart rule v3 (adopted 2026-09-25; one promise = one heart; capacity = promise count)';
const runA='11111111-1111-4111-8111-111111111111',runB='22222222-2222-4222-8222-222222222222';
const source={url:'https://example.org/fictional',title:'Fictional test source',publishedOn:'2017-05-16'};
const base={lineage:'fixture-promise',summary:'Fictional promise timeline fixture',author:'Test fixture',source};
const statement={...base,id:'stated',kind:'promise_stated',occurredOn:'2017-05-16',speaker:'Fictional issuer',claimType:'milestone'};
const evidence={...base,id:'observed',kind:'evidence',occurredOn:'2018-10',stance:'supports',provenance:['Fictional issuer-reported observation; not research']};
const assessment={...base,id:'assessed',kind:'assessment',occurredOn:'2026-09-26',runId:runA,methodology,state:'open',supersedes:null,note:'Issuer-reported volume is not independently verified.'};
const revision={id:'test-revision',project_slug:'xrp',ledger_run_id:runA,recorded_at:'2026-09-27T00:00:00Z'};
test('date precision and source safety are preserved by the timeline reader',()=>{
  for(const date of ['2015','2018-10','2024-02-29'])assert.equal(validEventDate(date),true);
  for(const date of ['2015-99','2023-02-29','2020-1','yesterday'])assert.equal(validEventDate(date),false);
  assert.equal(eventDateLabel('2015'),'2015');assert.equal(eventDateLabel('2018-10'),'Oct 2018');
  const row={...revision,events:[{...statement,recordedAt:revision.recorded_at}]};
  assert.equal(parseTimelineRow(row).events[0].occurredOn,'2017-05-16');
  assert.throws(()=>parseTimelineRow({...row,events:[{...row.events[0],source:{...source,url:'javascript:alert(1)'}}]}));
  assert.throws(()=>parseTimelineRow({...row,events:[row.events[0],row.events[0]]}));
});
test('malformed optional caveats stay visible without hiding history; publication rejects them',()=>{
  const directory=mkdtempSync(join(tmpdir(),'timeline-notes-'));
  try {
    for(const note of [null,{},'', ' \n\t']) {
      const event={...assessment,note,recordedAt:revision.recorded_at};
      const parsed=parseTimelineRow({...revision,events:[event]}).events[0];
      assert.equal(parsed.kind,'assessment');
      if(parsed.kind!=='assessment')throw new Error('Assessment lost');
      assert.equal(parsed.state,assessment.state);
      assert.equal(parsed.note,undefined);
      assert.equal(parsed.noteUnavailable,true);
      assert.deepEqual(event.note,note); // The stored record is not rewritten.
      const file=join(directory,'invalid.json');
      writeFileSync(file,JSON.stringify({schema_version:1,revision_key:'bad-note',project_slug:'xrp',
        ledger_run_id:runA,previous_revision_id:null,author:'Test fixture',events:[{...assessment,note}]}));
      const result=spawnSync(process.execPath,['--import','tsx','scripts/publish-timeline.ts',file],{encoding:'utf8'});
      assert.equal(result.status,1,result.stderr);
      assert.match(result.stderr,/Invalid assessment note/);
    }
  } finally {rmSync(directory,{recursive:true,force:true});}
});
test('history publication is atomic, append-only, replayable, and bound to real published assessments',async()=>{
  const db=new PGlite();
  try {
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
      CREATE TABLE projects(id uuid PRIMARY KEY,slug text UNIQUE);
      CREATE TABLE heart_runs(id uuid PRIMARY KEY,methodology text,review_status text,recorded_at timestamptz);
      CREATE TABLE heart_snapshots(run_id uuid,project_id uuid,availability text,assessment jsonb);
      INSERT INTO projects VALUES('33333333-3333-4333-8333-333333333333','xrp');`);
    for(const [id,date,state] of [[runA,'2026-09-26','open'],[runB,'2026-09-27','fulfilled']]) {
      await db.query('INSERT INTO heart_runs VALUES($1,$2,$3,$4)',[id,methodology,'published',date]);
      await db.query('INSERT INTO heart_snapshots VALUES($1,$2,$3,$4)',[id,'33333333-3333-4333-8333-333333333333','available',{promises:[{lineage:base.lineage,claim_type:'milestone',state}]}]);
    }
    await db.exec(readFileSync(new URL('../../db/migrations/007_promise_event_history.sql',import.meta.url),'utf8'));
    const publish=async(document:unknown)=>(await db.query<{id:string}>('SELECT public.publish_promise_history($1::jsonb) AS id',[JSON.stringify(document)])).rows[0].id;
    const first={schema_version:1,revision_key:'fixture-first',project_slug:'xrp',ledger_run_id:runA,previous_revision_id:null,author:'Test fixture',events:[statement,evidence,assessment]};
    const id=await publish(first);
    assert.equal(await publish(first),id);
    const old=(await db.query<any>('SELECT * FROM promise_history_revisions WHERE id=$1',[id])).rows[0];
    const corrected={...assessment,id:'corrected',runId:runB,occurredOn:'2026-09-27',state:'fulfilled',supersedes:'assessed',correctionReason:'Fictional new evidence received'};
    const second={...first,revision_key:'fixture-second',ledger_run_id:runB,previous_revision_id:id,events:[
      {...base,id:'repeated',kind:'promise_repeated',occurredOn:'2019',originalId:'stated',wordingChange:'same'},corrected,
    ]};
    const nextId=await publish(second);
    const latest=(await db.query<any>('SELECT * FROM promise_history_revisions WHERE id=$1',[nextId])).rows[0];
    assert.equal(parseTimelineRow(JSON.parse(JSON.stringify(latest))).events.find(e=>e.kind==='assessment')?.note,assessment.note);
    assert.deepEqual(latest.events.slice(0,3),old.events);assert.equal(latest.events.length,5);
    // PostgREST serializes PostgreSQL timestamps as JSON strings.
    assert.equal(parseTimelineRow(JSON.parse(JSON.stringify(latest))).events.length,5);
    assert.ok(Date.parse(latest.events[0].recordedAt)>Date.parse(statement.occurredOn));
    await assert.rejects(publish({...first,author:'changed'}),/Conflicting/);
    await assert.rejects(publish({...first,revision_key:'stale'}),/Stale/);
    const pending={...second,revision_key:'bad',previous_revision_id:nextId};
    for(const event of [
      {...statement,id:'again'},
      {...evidence,id:'unsafe',source:{...source,url:'javascript:alert(1)'}},
      {...evidence,id:'date',occurredOn:'2018-02-30'},
      {...evidence,id:'backdated-recording',recordedAt:'2018-01-01'},
      {...assessment,id:'historical',occurredOn:'2015'},
      {...assessment,id:'wrong-state',state:'fulfilled'},
      {...corrected,id:'fork'},
      {...corrected,id:'missing',supersedes:'absent'},
    ])await assert.rejects(publish({...pending,events:[{...evidence,id:'valid-before-error'},event]}));
    assert.equal((await db.query<{n:number}>('SELECT count(*)::int AS n FROM promise_history_revisions')).rows[0].n,2);
    await assert.rejects(db.exec("UPDATE promise_history_revisions SET author='tampered'"),/append-only/);
    await assert.rejects(db.exec('TRUNCATE promise_history_revisions'),/append-only/);
    await db.exec('SET ROLE anon');
    assert.equal((await db.query('SELECT id FROM promise_history_revisions')).rows.length,2);
    await assert.rejects(publish(first),/permission denied/);await db.exec('RESET ROLE');
    await db.exec('SET ROLE service_role');
    await assert.rejects(db.exec('DELETE FROM promise_history_revisions'),/permission denied/);await db.exec('RESET ROLE');
    if(process.env.PROMISE_HISTORY_PREVIEW)writeFileSync(process.env.PROMISE_HISTORY_PREVIEW,JSON.stringify(latest));
  } finally {await db.close();}
});
test('the read layer distinguishes empty coverage, missing revisions and outages',async()=>{
  const oldFetch=globalThis.fetch, oldUrl=process.env.SUPABASE_URL, oldKey=process.env.SUPABASE_PUBLISHABLE_KEY;
  process.env.SUPABASE_URL='https://history-fixture.invalid';process.env.SUPABASE_PUBLISHABLE_KEY='test-only';
  try {
    globalThis.fetch=async()=>new Response('[]',{headers:{'Content-Type':'application/json'}});
    assert.equal((await readPromiseTimeline('xrp')).status,'empty');
    assert.equal((await readPromiseTimeline('xrp','missing')).status,'unavailable');
    globalThis.fetch=async()=>new Response('unavailable',{status:503});
    assert.equal((await readPromiseTimeline('xrp')).status,'unavailable');
  } finally {
    globalThis.fetch=oldFetch;
    if(oldUrl===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=oldUrl;
    if(oldKey===undefined)delete process.env.SUPABASE_PUBLISHABLE_KEY;else process.env.SUPABASE_PUBLISHABLE_KEY=oldKey;
  }
});
