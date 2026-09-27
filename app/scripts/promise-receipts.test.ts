import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { adaptAtlas } from '../src/lib/atlas/adapter';
import { summarizeDelivery } from '../src/lib/promise-verdict';
import { readPublishedPromiseLedger } from '../src/lib/heart-data';
import { compositionCounts, evidenceReceipt, parseReceiptQuery, receiptNodes, receiptRevision } from '../src/lib/promise-receipts';
const artifact=JSON.parse(readFileSync(new URL('../../db/seed/heart-runs/hearts-promise-2026-09-26.json',import.meta.url),'utf8'));
const runId='11111111-1111-4111-8111-111111111111';
function fixture() {
  return {run:{id:runId,as_of:artifact.as_of,methodology:artifact.methodology,review_status:'published'},
    projects:artifact.projects.map((p:any)=>({...structuredClone(p),run_id:runId,methodology:artifact.methodology,name:p.slug,symbol:p.slug.toUpperCase()}))};
}
test('composition counts and every receipt population agree without changing the 115 records',()=>{
  const input=fixture(), before=JSON.stringify(input), data=adaptAtlas(input)!;
  let total=0;
  for (const project of input.projects) {
    const summary=summarizeDelivery(data,project.slug)!;
    const counts=compositionCounts(summary);
    assert.equal(Object.values(counts).reduce((a,b)=>a+b,0),summary.total);
    for(const group of ['kept','unkept','open','unknown'] as const) {
      const url=new URL(evidenceReceipt(project.slug,receiptRevision(data),{group}),'https://example.org');
      assert.equal(receiptNodes(data,project.slug,parseReceiptQuery(url.searchParams)).length,counts[group]);
    }
    total+=summary.total;
  }
  assert.equal(total,115);assert.equal(JSON.stringify(input),before);
  input.projects[0].assessment.promises[0].state='active';
  const unknown=adaptAtlas(input)!;
  assert.equal(compositionCounts(summarizeDelivery(unknown,input.projects[0].slug)!).unknown,1);
});
test('receipts reject invalid parameters and changed category populations instead of drifting',()=>{
  const data=adaptAtlas(fixture())!;
  const query=new URL(evidenceReceipt('btc',receiptRevision(data),{category:'privacy',group:'unkept'}),'https://example.org').searchParams;
  const selected=parseReceiptQuery(query);
  assert.equal(receiptNodes(data,'btc',selected).length,1);
  assert.throws(()=>receiptNodes({...data,dataRevision:'new-run'},'btc',selected),/run mismatch/);
  assert.throws(()=>receiptNodes({...data,assignmentVersion:'new-categories'},'btc',selected),/Category revision/);
  for (const [key,value] of [['run','bad'],['category','wrong'],['group','perfect']]) {
    const bad=new URLSearchParams(query);bad.set(key,value);assert.throws(()=>parseReceiptQuery(bad));
  }
  const duplicate=new URLSearchParams(query);duplicate.append('run',runId);assert.throws(()=>parseReceiptQuery(duplicate));
});
test('database reads pin run and methodology, never substituting the latest or an unavailable run',async()=>{
  const oldFetch=globalThis.fetch;
  const env={url:process.env.SUPABASE_URL,key:process.env.SUPABASE_PUBLISHABLE_KEY};
  process.env.SUPABASE_URL='https://receipt-test.invalid';process.env.SUPABASE_PUBLISHABLE_KEY='test-only';
  const input=fixture(), urls:URL[]=[];
  globalThis.fetch=async(request)=>{
    const url=new URL(typeof request==='string' || request instanceof URL ? request : request.url);urls.push(url);
    assert.equal(url.hostname,'receipt-test.invalid');
    const run=url.pathname.endsWith('heart_runs');
    const exists=url.searchParams.get(run?'id':'run_id')===`eq.${runId}`;
    const body=exists ? run ? [input.run] : input.projects : [];
    return new Response(JSON.stringify(body),{headers:{'Content-Type':'application/json','Content-Range':`0-${Math.max(0,body.length-1)}/${body.length}`}});
  };
  try {
    const ledger=await readPublishedPromiseLedger({runId,methodology:artifact.methodology});
    assert.equal(ledger.run?.id,runId);assert.equal(ledger.projects.length,8);
    assert.equal(urls[0].searchParams.get('review_status'),'eq.published');
    assert.equal(urls[0].searchParams.get('methodology'),`eq.${artifact.methodology}`);
    assert.equal(urls[1].searchParams.get('run_id'),`eq.${runId}`);
    const missing=await readPublishedPromiseLedger({runId:'22222222-2222-4222-8222-222222222222',methodology:artifact.methodology});
    assert.equal(missing.run,null);assert.equal(missing.projects.length,0);
    globalThis.fetch=async()=>new Response('unavailable',{status:503});
    await assert.rejects(readPublishedPromiseLedger({runId,methodology:artifact.methodology}));
  } finally {
    globalThis.fetch=oldFetch;
    if(env.url===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=env.url;
    if(env.key===undefined)delete process.env.SUPABASE_PUBLISHABLE_KEY;else process.env.SUPABASE_PUBLISHABLE_KEY=env.key;
  }
});
