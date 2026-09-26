import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { adaptAtlas } from '../src/lib/atlas/adapter';
import { ATLAS_STATES, type PublishedHeartDataset } from '../src/lib/atlas/types';
import { CATEGORIES } from '../data/atlas-taxonomy';
import { deliveryReceipt, summarizeDelivery } from '../src/lib/promise-verdict';
import { matchesAtlas, parseAtlasQuery } from '../src/lib/atlas/filters';
import { sortScoreboard, categoryRanks, parseBoardSort, parseBoardCategory } from '../src/lib/scoreboard-ranking';
import { marketCapFor } from '../src/lib/market-ids';
const artifact=JSON.parse(readFileSync(new URL('../../db/seed/heart-runs/hearts-promise-2026-09-26.json',import.meta.url),'utf8'));
function fixture():PublishedHeartDataset {
  return {run:{id:'published-one',as_of:artifact.as_of,methodology:artifact.methodology,review_status:'published'},projects:artifact.projects.map((p:any)=>({...structuredClone(p),run_id:'published-one',methodology:artifact.methodology,name:p.slug,symbol:p.slug.toUpperCase()}))};
}
test('every project verdict matches published hearts and all receipt populations exactly',()=>{
  const input=fixture(),before=JSON.stringify(input),data=adaptAtlas(input)!;
  let totals=0,kept=0;
  for(const project of input.projects as any[]) {
    const summary=summarizeDelivery(data,project.slug)!;
    assert.equal(summary.total,project.assessment.capacity);
    assert.equal(summary.kept,project.assessment.promises.filter((p:any)=>p.state === "fulfilled").length);
    assert.equal(Object.values(summary.states).reduce((a,b)=>a+b,0),summary.total);
    assert.equal(Object.values(summary.categories).reduce((a,b)=>a+b.total,0),summary.total);
    const receiptCount=(category?:any,state?:any)=>{
      const url=new URL(deliveryReceipt(project.slug,category,state),'https://example.org');
      return data.nodes.filter(node=>matchesAtlas(node,parseAtlasQuery(url.searchParams,data.nodes))).length;
    };
    assert.equal(receiptCount(),summary.total);
    for(const state of ATLAS_STATES) assert.equal(receiptCount(undefined,state),summary.states[state]);
    for(const category of CATEGORIES) {
      assert.equal(receiptCount(category.id),summary.categories[category.id].total);
      assert.equal(receiptCount(category.id,'kept'),summary.categories[category.id].kept);
    }
    totals+=summary.total;kept+=summary.kept;
  }
  assert.equal(totals,115);assert.equal(kept,72);assert.equal(JSON.stringify(input),before);
});
test('unknown, unclassified and unavailable are preserved; next run recomputes from records',()=>{
  const input=fixture();const p=input.projects[0] as any;p.assessment.promises[0].state='active';
  const data=adaptAtlas(input,{})!, summary=summarizeDelivery(data,p.slug)!;
  assert.equal(summary.states.unknown,1);assert.equal(summary.categories.unclassified.total,summary.total);
  p.availability='unavailable';assert.equal(summarizeDelivery(adaptAtlas(input)!,p.slug),null);
  assert.equal(summarizeDelivery(data,'not-published'),null);
  const next=fixture();next.run!.id='published-two';next.projects.forEach((p:any)=>p.run_id='published-two');
  const n=next.projects[0] as any;const wasKept=n.assessment.promises[0].state==='fulfilled';n.assessment.promises[0].state='retired';
  const old=summarizeDelivery(adaptAtlas(fixture())!,n.slug)!,current=summarizeDelivery(adaptAtlas(next)!,n.slug)!;
  assert.equal(current.kept,old.kept-(wasKept?1:0));assert.equal(current.total,old.total);
});
function rows() {
  const summary=summarizeDelivery(adaptAtlas(fixture())!,'btc')!;
  return [
    {slug:'a',name:'Alpha',rank:1,filledPct:.5,verdict:'Not a shitcoin',code:'Active',codeStars:5,codeCommits:10,hypeMentions:3,marketCap:20,delivery:structuredClone(summary)},
    {slug:'b',name:'Beta',rank:2,filledPct:1,verdict:'Shitcoin',code:'Quiet',codeStars:50,codeCommits:2,hypeMentions:9,marketCap:10,delivery:structuredClone(summary)},
    {slug:'c',name:'Gamma',rank:3,filledPct:0,verdict:'Watch',code:'Unknown',codeStars:0,codeCommits:0,hypeMentions:0,marketCap:0,delivery:structuredClone(summary)},
    {slug:'d',name:'Delta',rank:4,filledPct:0,verdict:'Unknown',code:'Unknown',codeStars:null,codeCommits:null,hypeMentions:null,marketCap:null,delivery:null},
  ];
}
test('context sorts are numeric descending, zero precedes null, ties are deterministic',()=>{
  const data=rows(),before=JSON.stringify(data);
  for(const [sort,order] of [['stars','bacd'],['commits','abcd'],['hype','bacd'],['market-cap','abcd'],['hearts','bacd'],['rank','abcd']] as const) {
    assert.equal(sortScoreboard(data,sort,'').map(r=>r.slug).join(''),order);
  }
  assert.equal(JSON.stringify(data),before);
  data[0].codeStars=50;assert.equal(sortScoreboard([...data].reverse(),'stars','')[0].name,'Alpha');
  data[0].marketCap=NaN;assert.equal(sortScoreboard(data,'market-cap','').at(-1)?.slug,'d');
  assert.equal(parseBoardSort('bogus'),'rank');assert.equal(parseBoardCategory('bogus'),'');
});
test('category ranks tie equal shares, keep denominators, and do not rank nonmembers as zero',()=>{
  const data=rows();
  data[0].delivery!.categories.payments={total:2,kept:1,states:{kept:1,open:1,in_progress:0,lapsed:0,retired:0,unknown:0}};
  data[1].delivery!.categories.payments={total:10,kept:5,states:{kept:5,open:5,in_progress:0,lapsed:0,retired:0,unknown:0}};
  data[2].delivery!.categories.payments={total:1,kept:0,states:{kept:0,open:1,in_progress:0,lapsed:0,retired:0,unknown:0}};
  assert.deepEqual([...categoryRanks(data,'payments')],[['a',1],['b',1],['c',3]]);
  data[2].delivery!.categories.payments.total=0;
  assert.equal(categoryRanks(data,'payments').has('c'),false);
  assert.equal(sortScoreboard(data,'hearts','payments').map(r=>r.slug).join(''),'abdc');
});
test('market cap joins by known provider ID; missing observations never become zero',()=>{
  assert.equal(marketCapFor('btc',[{id:'bitcoin',market_cap:50}]),50);
  assert.equal(marketCapFor('btc',[{id:'btc',market_cap:99}]),null);
  assert.equal(marketCapFor('bat',[]),null);
  for(const value of [null,NaN,Infinity,-1]) assert.equal(marketCapFor('btc',[{id:'bitcoin',market_cap:value}]),null);
  assert.equal(marketCapFor('btc',[{id:'bitcoin',market_cap:0}]),0);
});
