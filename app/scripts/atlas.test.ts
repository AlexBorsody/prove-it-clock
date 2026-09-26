import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { adaptAtlas, atlasState, safeSourceUrl, validateAssignments } from '../src/lib/atlas/adapter';
import { readAtlasLedger } from '../src/lib/atlas/reader';
import { atlasQuery, EMPTY_FILTERS, matchesAtlas, parseAtlasQuery, revealSelection } from '../src/lib/atlas/filters';
import { fitCamera, zoomCamera } from '../src/lib/atlas/camera';
import { promiseId, type PublishedHeartDataset, type AtlasNode } from '../src/lib/atlas/types';
import { layoutFor } from '../data/atlas-layout';
import { ASSIGNMENTS } from '../data/atlas-assignments';
import { projectAtlas } from '../src/lib/atlas/project';
const artifact=JSON.parse(readFileSync(new URL('../../db/seed/heart-runs/hearts-promise-2026-09-26.json',import.meta.url),'utf8'));
function fixture(): PublishedHeartDataset {
  return {run:{id:'test-published',as_of:artifact.as_of,methodology:artifact.methodology,review_status:'published'},projects:artifact.projects.map((p:any)=>({...structuredClone(p),run_id:'test-published',methodology:artifact.methodology,name:p.slug,symbol:p.slug.toUpperCase()}))};
}
test('all current scored promises appear once; ledger and hearts remain unchanged',()=>{
  const input=fixture(),before=JSON.stringify(input), data=adaptAtlas(input)!;
  assert.equal(data.nodes.length,115);assert.equal(new Set(data.nodes.map(n=>n.id)).size,115);
  assert.equal(data.nodes.filter(n=>n.state==='kept').length,72);
  assert.equal(data.nodes.filter(n=>n.primaryCategory===null).length,7);
  assert.equal(data.nodes.filter(n=>n.fulfillmentTest).length,115);
  assert.equal(data.coverage.layoutPending.length,0);assert.equal(JSON.stringify(input),before);
  assert.ok(data.nodes.every(n=>n.sourceRunId==='test-published' && n.promiseHref.includes('?evidence=')));
});
test('drafts, mixed runs and duplicate or missing identifiers fail visibly',()=>{
  const input=fixture();input.run!.review_status='draft';assert.throws(()=>adaptAtlas(input),/published/);
  const mixed=fixture();(mixed.projects[0] as any).run_id='different';assert.throws(()=>adaptAtlas(mixed),/Mixed/);
  const dup=fixture();const promises=(dup.projects[0] as any).assessment.promises;promises.push(promises[0]);assert.throws(()=>adaptAtlas(dup),/Duplicate/);
  const absent=fixture();delete (absent.projects[0] as any).assessment.promises[0].lineage;assert.throws(()=>adaptAtlas(absent),/Missing/);
  assert.notEqual(promiseId('a:b','c'),promiseId('a','b:c'));
});
test('state interpretation is methodology-specific and never promotes ambiguous active',()=>{
  for(const value of ['active','made-up',null,undefined]) assert.equal(atlasState(value,artifact.methodology),'unknown');
  assert.equal(atlasState('fulfilled',artifact.methodology),'kept');assert.equal(atlasState('retired',artifact.methodology),'retired');
  assert.equal(atlasState('fulfilled','unreviewed-method'),'unknown');assert.equal(atlasState('unfulfilled',artifact.methodology),'open');
});
test('source roles, tests and dates are preserved without invented attribution',()=>{
  const input=fixture();const pr=(input.projects[0] as any).assessment.promises[0];
  delete pr.criteria;pr.claim_text='A recorded statement';pr.claim_sources=[{url:'https://example.org/paper#p2',quote:'Exact quotation',locator:'Page 2'}];
  pr.outcome_evidence=[{url:'https://example.org/results',summary:'Measured outcome'}];
  const data=adaptAtlas(input)!;const n=data.nodes.find(n=>n.lineageId===pr.lineage)!;
  assert.equal(n.claimSources[0].quote,'Exact quotation');assert.equal(n.claimSources[0].locator,'Page 2');
  assert.equal(n.outcomeEvidence[0].url,'https://example.org/results');assert.equal(n.fulfillmentTest,null);assert.equal(n.assessedAt,null);
  const old=data.nodes.find(n=>n.id!==data.nodes[0].id&&!n.claimSources.length)!;assert.equal(old.claimSources.length,0);assert.ok(old.outcomeEvidence.length);
  assert.ok(old.qualityFlags.includes('Original claim source not separately recorded'));
  for(const url of ['javascript:alert(1)','data:text/html,evil','https://user:password@example.org','//evil.test','/relative']) assert.equal(safeSourceUrl(url),null);
});
test('unmapped records stay visible and bad classification IDs are rejected',()=>{
  const data=adaptAtlas(fixture(),{})!;assert.ok(data.nodes.every(n=>n.primaryCategory===null));assert.equal(data.positions.length,115);
  const bad=structuredClone(ASSIGNMENTS);bad[Object.keys(bad)[0]].secondary=['made-up' as any];assert.throws(()=>validateAssignments(bad),/Invalid/);
});
test('published reader pins one run across all pages and propagates outages',async()=>{
  const calls:string[]=[];
  const result=await readAtlasLedger({latest:async()=>({id:'one',as_of:artifact.as_of,methodology:artifact.methodology,review_status:'published'}),page:async(id,from,to)=>{calls.push(id);return {rows:Array.from({length:Math.min(205-from,to-from+1)},(_,i)=>from+i),total:205};}});
  assert.deepEqual(calls,['one','one','one']);assert.equal(result.projects.length,205);
  await assert.rejects(()=>readAtlasLedger({latest:async()=>{throw Error('outage');},page:async()=>({rows:[],total:0})}),/outage/);
  assert.deepEqual(await readAtlasLedger({latest:async()=>null,page:async()=>{throw Error('should not read');}}),{run:null,projects:[]});
  await assert.rejects(()=>readAtlasLedger({latest:async()=>fixture().run,page:async()=>({rows:[],total:1})}),/Incomplete/);
});
test('retained layout is deterministic, non-overlapping and unchanged by filtering or insertion',()=>{
  const data=adaptAtlas(fixture())!;
  assert.deepEqual(layoutFor([...data.nodes].reverse()).positions.sort((a,b)=>a.nodeId.localeCompare(b.nodeId)),[...data.positions].sort((a,b)=>a.nodeId.localeCompare(b.nodeId)));
  for(const a of data.positions) for(const b of data.positions) if(a.nodeId!==b.nodeId) assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>=32);
  const old=JSON.stringify(data.positions);
  const filtered=data.nodes.filter(n=>matchesAtlas(n,{...EMPTY_FILTERS,projects:['btc']}));assert.ok(filtered.length>0);assert.equal(JSON.stringify(data.positions),old);
  const inserted=layoutFor([...data.nodes,{id:'btc:new-promise',primaryCategory:null}]);
  for(const p of data.positions) assert.deepEqual(inserted.positions.find(n=>n.nodeId===p.nodeId),p);
  assert.ok(inserted.pending.includes('btc:new-promise'));
});
test('filters include labeled secondary associations, round-trip URLs and reveal linked promises',()=>{
  const data=adaptAtlas(fixture())!, node=data.nodes.find(n=>n.secondaryCategories.length)!;
  assert.equal(matchesAtlas(node,{...EMPTY_FILTERS,category:node.secondaryCategories[0]}),true);
  const filters={...EMPTY_FILTERS,projects:['btc','eth'],states:['kept' as const],q:'wallet',promise:node.id};
  assert.deepEqual(parseAtlasQuery(new URLSearchParams(atlasQuery(filters)),data.nodes),filters);
  const parsed=parseAtlasQuery(new URLSearchParams('project=bogus&state=winning&category=bad&q='+'a'.repeat(300)),data.nodes);
  assert.deepEqual(parsed.projects,[]);assert.deepEqual(parsed.states,[]);assert.equal(parsed.category,'');assert.equal(parsed.q.length,160);
  const hidden=revealSelection({...EMPTY_FILTERS,q:'no matches here',promise:node.id},data.nodes);
  assert.ok(hidden.cleared);assert.ok(matchesAtlas(node,hidden.filters));assert.equal(hidden.filters.promise,node.id);
  assert.ok(revealSelection({...EMPTY_FILTERS,promise:'missing'},data.nodes).missing);
});
test('camera fit/zoom keeps coordinates finite, bounded and anchored at the focal point',()=>{
  const c=fitCamera([{x:10,y:10},{x:100,y:400}],2);assert.equal(c.width/c.height,2);
  const z=zoomCamera(c,.5,{x:.25,y:.75});assert.equal(c.x+c.width*.25,z.x+z.width*.25);assert.equal(c.y+c.height*.75,z.y+z.height*.75);
  assert.equal(zoomCamera(c,0).width,150);assert.equal(zoomCamera(c,1e6).width,8000);
});
test('project Atlas scopes nodes, coordinates and coverage without rebuilding the layout',()=>{
  const data=adaptAtlas(fixture())!;
  const before=JSON.stringify(data);
  data.coverage.unavailableProjects=['missing'];
  data.coverage.layoutPending=[data.nodes[0].id];
  for(const slug of new Set(data.nodes.map(n=>n.projectSlug))) {
    const scoped=projectAtlas(data,slug);
    assert.ok(scoped.nodes.length>0);
    assert.ok(scoped.nodes.every(n=>n.projectSlug===slug));
    assert.equal(scoped.positions.length,scoped.nodes.length);
    assert.equal(scoped.dataRevision,data.dataRevision);
    assert.deepEqual(scoped.positions,data.positions.filter(p=>scoped.nodes.some(n=>n.id===p.nodeId)));
    assert.ok(scoped.regions.every(r=>data.regions.includes(r)));
    assert.ok(scoped.coverage.layoutPending.every(id=>scoped.nodes.some(n=>n.id===id)));
    assert.deepEqual(scoped.coverage.unavailableProjects,[]);
  }
  assert.deepEqual(projectAtlas(data,'missing').coverage.unavailableProjects,['missing']);
  assert.deepEqual(projectAtlas(data,'absent').nodes,[]);
  data.coverage.unavailableProjects=[];data.coverage.layoutPending=[];
  assert.equal(JSON.stringify(data),before);
});
