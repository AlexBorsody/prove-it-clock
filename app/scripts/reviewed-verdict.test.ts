import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { adaptAtlas } from '../src/lib/atlas/adapter';
import { calculateDelivery, coreFinding, verdictReceipt } from '../src/lib/delivery-calculation';
import { validateVerdictPublication, type ReviewedPromise } from '../src/lib/promise-assessment';
import { validateHeartPublication } from '../src/lib/heart-publication';
import { parseVerdictQuery } from '../src/lib/verdict-query';
import { summarizeDelivery } from '../src/lib/promise-verdict';
import { categoryRanks, deliveryShare, sortScoreboard } from '../src/lib/scoreboard-ranking';
import { reviewedPromise, verdictFixture, fixtureSource, fixtureParts } from './verdict-fixture';
function nodes(promises:ReviewedPromise[]) {
  const d=verdictFixture(),parts=fixtureParts('fixture-a',promises);d.projects[0].assessment!.promises=parts.records;d.projects[0].assessment!.capacity=promises.length;d.importance_model.entries=parts.entries;
  return adaptAtlas({run:{id:'11111111-1111-4111-8111-111111111111',as_of:d.as_of,methodology:d.methodology,review_status:'published',versions:d.versions,importance_model:d.importance_model},projects:d.projects.map(p => ({...p,run_id:'11111111-1111-4111-8111-111111111111',methodology:d.methodology,name:p.slug,symbol:'FA'}))})!.nodes;
}
test('whole-record delivery cannot masquerade as resolved-only perfection',()=>{
  const ns=nodes(Array.from({length:16},(_,i)=>reviewedPromise(`p${i}`,i<2?'kept':'pending')));
  const before=JSON.stringify(ns),s=calculateDelivery(ns);
  assert.equal(s.provenShare,2/16);assert.equal(s.outcomeCoverage,2/16);assert.equal(s.resolvedShare,1);
  assert.equal(s.groups.pending.recordIds.length,14);assert.equal(JSON.stringify(ns),before);
  assert.deepEqual(calculateDelivery([...ns].reverse()),s);
  const pending=calculateDelivery(nodes([reviewedPromise('p','pending')]));
  assert.equal(pending.provenShare,null);assert.equal(pending.resolvedShare,null);assert.equal(pending.outcomeCoverage,0);
  const failed=calculateDelivery(nodes([reviewedPromise('p','unkept')]));assert.equal(failed.provenShare,0);assert.equal(failed.outcomeCoverage,1);
});
test('core failure survives supporting successes; unknown and open do not mean failure',()=>{
  const kept=Array.from({length:9},(_,i)=>reviewedPromise(`p${i}`,'kept'));
  for (const outcome of ['unkept','pending','unknown'] as const) {
    const ns=nodes([...kept,reviewedPromise('core',outcome,true)]),s=calculateDelivery(ns);
    assert.equal(s.provenShare,9/13);assert.equal(s.outcomeCoverage,outcome==='unkept'?1:9/13);
    assert.equal(coreFinding(ns).outcome,outcome);
  }
});
test('missing weights, empty scopes and duplicate obligations never become clean scores',()=>{
  const p=reviewedPromise('p','kept');p.importance=null;
  const s=calculateDelivery(nodes([p]));assert.equal(s.availability,'unreviewed');assert.equal(s.totalWeight,null);assert.equal(s.provenShare,null);
  assert.equal(calculateDelivery([]).availability,'not-applicable');
  const ns=nodes([reviewedPromise('p','kept')]);assert.throws(()=>calculateDelivery([...ns,...ns]),/Duplicate/);
  const duplicate=reviewedPromise('other','kept');duplicate.admission.obligation_id='p';
  assert.throws(()=>nodes([reviewedPromise('p','kept'),duplicate]),/Duplicate independent/);
});
test('reviewed lifecycle, evidence, author and fixed tier validation preserve the original test',()=>{
  validateHeartPublication(verdictFixture());
  const d=verdictFixture(),p=d.projects[0].assessment!.promises[1];
  p.claim_type='milestone';p.lifecycle='archived';validateVerdictPublication(d);
  assert.equal(calculateDelivery(nodes(d.projects[0].assessment!.promises)).groups.kept.count,1);
  p.lifecycle='retired';assert.throws(()=>validateVerdictPublication(d),/archiv/);
});
test('unknown claim dates stay unknown; late delivery preserves a missed target but cannot erase an essential deadline',()=>{
  const d=verdictFixture(),p=d.projects[0].assessment!.promises[1];
  p.effective_at=null;validateVerdictPublication(d);
  p.claim_type='milestone';p.evidence_valid_until=null;
  p.deadline={at:'2026-09-10T00:00:00Z',kind:'target',source:{...fixtureSource}};
  p.transitions=[{event:'missed',effective_at:'2026-09-10T00:00:00Z',recorded_at:'2026-09-11T00:00:00Z',rationale:'A documented target miss',author:'Test author',evidence:[{...fixtureSource}]}];
  validateVerdictPublication(d);assert.equal(p.transitions[0].event,'missed');
  p.deadline.kind='essential';assert.throws(()=>validateVerdictPublication(d),/essential/);
});
test('receipts pin methodology and run, reject ambiguous scope, and retain outcome filters',()=>{
  const d=verdictFixture(),url=new URL(verdictReceipt('fixture-a',{runId:'11111111-1111-4111-8111-111111111111',methodology:d.methodology,assignments:d.versions.assignments},{category:'payments',group:'unknown'}),'https://example.org');
  const q=parseVerdictQuery(url.searchParams);assert.equal(q.group,'unknown');assert.equal(q.category,'payments');assert.equal(q.methodology,d.methodology);
  assert.equal(q.assignmentVersion,d.versions.assignments);
  for (const bad of ['run=invalid','run=','category=','category=vibes','group=clean','category=payments&category=privacy']) assert.throws(()=>parseVerdictQuery(new URLSearchParams(bad)));
});
test('reviewed category ranks use proven delivery; unresolved, unreviewed and Genesis stay unranked',()=>{
  const d=verdictFixture(),id='11111111-1111-4111-8111-111111111111';
  const makeRow=(slug:string,promises:ReviewedPromise[])=>{
    const parts=fixtureParts(slug,promises);
    const project={slug,name:slug,symbol:slug,availability:'available',run_id:id,methodology:d.methodology,assessment:{promises:parts.records}};
    const data=adaptAtlas({run:{id,as_of:d.as_of,methodology:d.methodology,versions:d.versions,review_status:'published',importance_model:{version:d.importance_model.version,entries:parts.entries}},projects:[project]})!;
    return {slug,name:slug,rank:0,filledPct:1,verdict:'Not a shitcoin',code:'Unknown',codeStars:null,codeCommits:null,hypeMentions:null,marketCap:null,delivery:summarizeDelivery(data,slug)!};
  };
  const rows=[makeRow('a',[reviewedPromise('core','pending',true),reviewedPromise('kept','kept')]),makeRow('b',[reviewedPromise('core','kept',true),reviewedPromise('open','pending')]),
    makeRow('pending',[reviewedPromise('core','pending',true)]),makeRow('btc',[reviewedPromise('core','kept',true)])];
  const unreviewed=reviewedPromise('core','kept',true);unreviewed.importance=null;rows.push(makeRow('unreviewed',[unreviewed]));
  assert.equal(deliveryShare(rows[0],'payments'),.2);assert.equal(deliveryShare(rows[1],'payments'),.8);
  assert.deepEqual([...categoryRanks(rows,'payments')],[['b',1],['a',2]]);
  assert.equal(categoryRanks(rows,'').size,0);assert.equal(rows[3].delivery.calculation!.provenShare,null);
  assert.equal(rows[3].delivery.kept,1);assert.equal(rows[3].delivery.core,undefined);
  assert.equal(sortScoreboard(rows,'rank','')[0].slug,'a');
  const filtered={...rows[0].delivery.categories.payments};assert.equal(filtered.calculation!.groups.pending.weight,4);
  assert.equal(rows[0].delivery.core!.outcome,'pending');
});
test('v4 SQL and TypeScript validation; immutable runs, draft exclusion, v3 compatibility and atomic failures',async()=>{
  const db=new PGlite();
  try {
    await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
    for (const file of ['001_initial.sql','002_heart_publications.sql','005_canonical_promise_states.sql','006_promise_heart_rule.sql','007_reviewed_verdict_publications.sql'])
      await db.exec(readFileSync(new URL(`../../db/migrations/${file}`,import.meta.url),'utf8').replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;',''));
    await db.exec("INSERT INTO projects(slug,name,symbol) VALUES ('fixture-a','Fixture A','FA'); GRANT SELECT ON projects TO anon,authenticated,service_role;");
    const publish=async(d:unknown)=>(await db.query<{id:string}>('SELECT public.publish_heart_run($1::jsonb) id',[JSON.stringify(d)])).rows[0].id;
    const doc=verdictFixture();validateHeartPublication(doc);const id=await publish(doc);assert.equal(await publish(doc),id);
    const stored=(await db.query<any>('SELECT earned,capacity,assessment FROM heart_snapshots WHERE run_id=$1',[id])).rows[0];
    assert.equal(stored.earned,1);assert.equal(stored.capacity,2);assert.deepEqual(stored.assessment,doc.projects[0].assessment);
    await assert.rejects(publish({...doc,policy_ref:'changed'}),/Conflicting/);
    await publish({...verdictFixture('draft'),review_status:'draft'});
    await db.exec('SET ROLE anon');assert.equal((await db.query('SELECT * FROM heart_runs')).rows.length,1);
    await assert.rejects(publish(verdictFixture('unauthorized')),/permission denied/);await db.exec('RESET ROLE');
    await assert.rejects(db.exec('UPDATE heart_snapshots SET earned=0'),/append-only/);
    const mutations: Array<(d:any)=>void> = [
      d=>d.importance_model.entries[1].importance.weight=.5,
      d=>delete d.importance_model.entries[1].importance,
      d=>d.importance_model.entries[1].importance.author='',
      d=>d.projects[0].assessment.promises[1].claim_sources=[],
      d=>d.projects[0].assessment.promises[1].outcome_evidence=[],
      d=>d.projects[0].assessment.promises[1].lifecycle='retired',
      d=>d.projects[0].assessment.promises[1].state='open',
      d=>d.projects[0].assessment.promises[1].observed_at=null,
      d=>d.projects[0].assessment.promises[1].evidence_valid_until='2026-09-20T00:00:00Z',
      d=>d.projects[0].assessment.promises[1].admission.obligation_id='core',
      d=>d.projects[0].assessment.promises[1].claim_sources=[{...fixtureSource,url:'https://user:password@example.org/private'}],
      d=>d.projects[0].assessment.promises[1].classification.primary='made-up',
      d=>d.projects[0].assessment.promises[1].core=true,
      d=>d.projects[0].assessment.promises[1].deadline=undefined,
      d=>d.versions.importance='unapproved',
      d=>delete d.reviewed_by,
      d=>d.reviewed_by=5,
      d=>d.versions.assignments=5,
      d=>d.projects[0].assessment.research_scope=5,
      d=>d.projects[0].assessment.promises[1].classification.author=5,
      d=>d.importance_model.entries[1].importance.author=5,
      d=>d.projects[0].assessment.promises[1].claim_sources[0].published_at='2027-01-01T00:00:00Z',
      d=>d.projects[0].assessment.promises[1].claim_sources[0].summary=5,
      d=>d.projects[0].assessment.promises[1].effective_at='2026-09-26T19:30:00Z',
      d=>d.importance_model.entries.pop(),
      d=>d.importance_model.entries.push(d.importance_model.entries[0]),
      d=>d.importance_model.entries[1].lineage='not-in-this-ledger',
      d=>d.projects[0].assessment.promises[1].importance={tier:'supporting',weight:1,rationale:'Do not mix layers',author:'Test'},
    ];
    for (const [i,mutate] of mutations.entries()) {
      const bad=verdictFixture(`bad-${i}`);mutate(bad);assert.throws(()=>validateHeartPublication(bad));await assert.rejects(publish(bad));
      assert.equal((await db.query('SELECT id FROM heart_runs WHERE run_key=$1',[bad.run_key])).rows.length,0);
    }
    const missing=verdictFixture('missing-weight');missing.importance_model.entries[1].importance=null;
    validateHeartPublication(missing);await publish(missing);
    const undated=verdictFixture('unknown-claim-date');undated.projects[0].assessment!.promises[1].effective_at=null;
    validateHeartPublication(undated);await publish(undated);
    const separate=verdictFixture('model-judgment');const ledgerBefore=JSON.stringify(separate.projects);
    separate.importance_model.entries[1].importance!.tier='core';separate.importance_model.entries[1].importance!.weight=4;
    validateHeartPublication(separate);const separatedId=await publish(separate);
    assert.equal(JSON.stringify(separate.projects),ledgerBefore);
    assert.deepEqual((await db.query<any>('SELECT assessment FROM heart_snapshots WHERE run_id=$1',[separatedId])).rows[0].assessment,separate.projects[0].assessment);
    assert.equal(separate.projects[0].assessment!.promises[1].core,false);
    const legacy={schema_version:3,run_key:'legacy',as_of:doc.as_of,methodology:'legacy-fixture',review_status:'published',reviewed_by:'test',policy_ref:'test',projects:[{
      slug:'fixture-a',availability:'available',assessment:{capacity:1,allowance:0,rationale:'test',allowance_rationale:'none',promises:[{
        lineage:'core',claim_type:'milestone',criteria:'Test',core:true,state:'fulfilled',effective_at:'2026-01-01T00:00:00Z',rationale:'Test',evidence:[{url:'https://example.org',summary:'Test'}]
      }]}}]};
    validateHeartPublication(legacy);await publish(legacy);
    await db.exec('SET ROLE service_role');await assert.rejects(db.query('SELECT public.publish_heart_run_v3($1::jsonb)',[JSON.stringify(legacy)]),/permission denied/);
    await db.exec('RESET ROLE');
  } finally {await db.close();}
});
