import test from 'node:test';
import assert from 'node:assert/strict';
import { GET } from '../src/app/api/v1/verdicts/route';
import { verdictFixture } from './verdict-fixture';

test('verdict API pins published inputs, keeps denominators under filters and fails visibly',async()=>{
  const doc=verdictFixture(),id='11111111-1111-4111-8111-111111111111';
  const realFetch=globalThis.fetch,previousUrl=process.env.SUPABASE_URL,previousKey=process.env.SUPABASE_PUBLISHABLE_KEY;
  process.env.SUPABASE_URL='http://fixture.invalid';process.env.SUPABASE_PUBLISHABLE_KEY='test-only';
  let mode:'ok'|'absent'|'draft'|'outage'='ok';
  const calls:URL[]=[];
  globalThis.fetch=async(input,init)=>{
    const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url);calls.push(url);
    if(mode==='outage') return new Response('Database unavailable',{status:503});
    const run={id,as_of:doc.as_of,methodology:doc.methodology,versions:doc.versions,importance_model:doc.importance_model,review_status:mode==='draft'?'draft':'published'};
    const rows=url.pathname.endsWith('/heart_runs') ? mode==='absent'?[]:[run] : doc.projects.map(p=>({...p,name:p.slug,symbol:'FA',run_id:id,methodology:doc.methodology,earned:1,capacity:2}));
    const singleton=new Headers(init?.headers).get('accept')?.includes('vnd.pgrst.object');
    return Response.json(singleton?rows[0]??null:rows,{headers:{'Content-Range':`0-${rows.length-1}/${rows.length}`}});
  };
  const query=new URLSearchParams({run:id,methodology:doc.methodology,project:'fixture-a',category:'payments',group:'kept'});
  const request=()=>new Request(`https://example.org/api/v1/verdicts?${query}`);
  try {
    const response=await GET(request()),body=await response.json();
    assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
    assert.equal(body.records.length,1);assert.equal(body.projects[0].scope_summary.calculation.totalWeight,5);
    assert.equal(body.projects[0].summary.calculation.provenShare,.2);assert.equal(body.projects[0].summary.core.outcome,'pending');
    assert.equal(body.records[0].importance.author,doc.importance_model.entries[1].importance!.author);
    assert.equal('importance' in body.records[0].reviewed_assessment,false);
    assert.equal(new URL(body.records[0].receipt,'https://example.org').searchParams.get('run'),id);
    assert.equal(calls[0].searchParams.get('review_status'),'eq.published');assert.equal(calls[0].searchParams.get('id'),`eq.${id}`);
    assert.ok(calls.slice(1).every(url=>url.searchParams.get('run_id')===`eq.${id}`));
    query.set('assignments','unavailable-revision');assert.equal((await GET(request())).status,409);query.delete('assignments');
    query.set('category','unknown-category');assert.equal((await GET(request())).status,400);query.set('category','payments');
    mode='absent';assert.equal((await GET(request())).status,404);
    mode='draft';assert.equal((await GET(request())).status,503);
    mode='outage';assert.equal((await GET(request())).status,503);
  } finally {
    globalThis.fetch=realFetch;
    if(previousUrl===undefined) delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=previousUrl;
    if(previousKey===undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY;else process.env.SUPABASE_PUBLISHABLE_KEY=previousKey;
  }
});
