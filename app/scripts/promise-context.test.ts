import test from 'node:test';
import assert from 'node:assert/strict';
import { promiseAnchor, promiseReferences, promiseCounts, relatedMentions, matchesPromiseFilter, promiseEvidenceHref } from '../src/lib/promise-context';
import type { NewsMention } from '../src/lib/hype-mentions';
const promises = [
 {lineage:'btc-p09-fixed-supply', criteria:'total supply remains fixed at 21 million',state:'fulfilled'},
 {lineage:'btc-p15-store-of-value',criteria:'a durable store of value through financial stress',state:'unfulfilled'},
 {lineage:'btc-p16-high-volume-payments',criteria:'near instant high volume payments',state:'lapsed'},
];
function article(title: string): NewsMention { return {title,url:'https://example.com/'+encodeURIComponent(title),publisher:'Example',publisher_url:null,published_at:'2026-09-26T00:00:00Z'}; }
test('topic matches name exact promises and explain terms without interpreting fulfillment', () => {
 const refs=promiseReferences('btc',promises);
 const matches=relatedMentions([article('Bitcoin store of value debate continues')],refs,'Bitcoin BTC');
 assert.equal(matches.length,1);
 assert.equal(matches[0].matches[0].promise.label,'P15');
 assert.deepEqual(matches[0].matches[0].terms,['store','value']);
 assert.equal(promises[1].state,'unfulfilled');
});
test('project name and market boilerplate cannot manufacture related events', () => {
 const refs=promiseReferences('btc',promises);
 assert.deepEqual(relatedMentions([article('Bitcoin hits near record high'),article('Bitcoin holdings total 50 million'),article('Bitcoin price rally'),article('Bitcoin store opens today')],refs,'Bitcoin BTC'),[]);
});
test('anchors and labels survive reordered promises and escape without collisions', () => {
 const a=promiseReferences('btc',promises),b=promiseReferences('btc',[...promises].reverse());
 assert.equal(a[0].anchor,b[2].anchor); assert.equal(a[0].label,b[2].label);
 assert.notEqual(promiseAnchor('btc','a_b'),promiseAnchor('btc','a b'));
});
test('stats preserve legacy meanings, separate retired and unknown states', () => {
 const states=['fulfilled','active','unfulfilled','open','lapsed','retired','surprise'];
 const counts=promiseCounts(states.map((state,i)=>({state,lineage:String(i),criteria:'test'})));
 assert.deepEqual(counts,{fulfilled:2,open:2,active:0,lapsed:1,retired:1,unknown:1});
});

test('evidence filters match displayed totals without mixing unknown with open', () => {
 const states=['fulfilled','active','unfulfilled','open','lapsed','retired','surprise'];
 const matching=(filter: Parameters<typeof matchesPromiseFilter>[1])=>states.filter(s=>matchesPromiseFilter(s,filter));
 assert.deepEqual(matching('kept'),['fulfilled','active']);
 assert.deepEqual(matching('failed'),['lapsed','retired']);
 assert.deepEqual(matching('open'),['unfulfilled','open']);
 assert.deepEqual(matching('in-play'),['unfulfilled','open','surprise']);
 assert.deepEqual(matching('lapsed'),['lapsed']);
 assert.deepEqual(matching('retired'),['retired']);
 assert.deepEqual(matching('unknown'),['surprise']);
 assert.deepEqual(matching('all'),states);
});
test('evidence links preserve lineage and target the exact source disclosure', () => {
 const lineage='a_b & c';
 const url=new URL(promiseEvidenceHref('btc',lineage),'https://example.com');
 assert.equal(url.searchParams.get('evidence'),lineage);
 assert.equal(url.hash,`#${promiseAnchor('btc',lineage)}-evidence`);
});
