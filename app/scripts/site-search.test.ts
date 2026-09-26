import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { extractSearchSections, searchSections, searchSnippet } from '../src/lib/site-search';
import { searchMeta, siteSearchPaths } from '../src/lib/search-sections';
import { crawlSearchPages, searchOrigin } from '../src/lib/search-crawler';

function documentFor(body:string) {return parseHTML(`<html><body><main>${body}</main></body></html>`).document as unknown as Document;}
const html=`<div id="project-xrp-promises" data-search="section" data-search-title="XRP promises" data-search-kind="Promises" data-search-project="xrp">
<p>Delivery health</p><section id="project-xrp-promise-moneygram" data-search="section" data-search-title="XRP MoneyGram payments" data-search-kind="Promise" data-search-project="xrp" data-search-keywords="ripple banking">
<h2>MoneyGram</h2><p>Payments corridor retired after the partnership ended.</p><script>secret script content</script><span aria-hidden="true">decorative icon</span></section></div>
<details id="methodology-hearts" data-search="section" data-search-title="Hearts are earned" data-search-kind="Methodology"><summary>Hearts</summary><p>Milestones are permanent. Ongoing evidence is revalidated.</p></details>`;

test('indexes actual container body, separates children, ignores scripts and decoration',()=>{
  const doc=documentFor(html);const records=extractSearchSections(doc,'/projects/xrp');
  assert.equal(records.length,3);assert.equal(records[0].text,'Delivery health');
  assert.match(records[1].text,/Payments corridor/);assert.doesNotMatch(records[1].text,/secret|decorative/);
  assert.equal(records[1].href,'/projects/xrp#project-xrp-promise-moneygram');
  for(const r of records) assert.ok(doc.getElementById(decodeURIComponent(r.href.split('#')[1])));
  assert.match(records[2].text,/revalidated/);
  const ignored=documentFor(`<aside data-search-ignore>${html}</aside>${html}`);
  assert.equal(extractSearchSections(ignored,'/').length,3);
});
test('requires unique anchors and supports canonical responsive row destinations',()=>{
  assert.throws(()=>extractSearchSections(documentFor(html+html),'/'),/Duplicate/);
  const row='<div id="scoreboard-xrp" data-search="section" data-search-title="XRP" data-search-href="/projects/xrp#project-xrp-overview">Score</div>';
  assert.equal(extractSearchSections(documentFor(row),'/')[0].href,'/projects/xrp#project-xrp-overview');
  const hostile=row.replace('/projects/xrp#project-xrp-overview','https://example.org#x');
  assert.equal(extractSearchSections(documentFor(hostile),'/')[0].href,'/#scoreboard-xrp');
});
test('matches title, metadata and body across words; returns all matches with useful snippets',()=>{
  const records=extractSearchSections(documentFor(html),'/');
  assert.equal(searchSections(records,'xrp corridor')[0].title,'XRP MoneyGram payments');
  assert.equal(searchSections(records,'revalidated')[0].title,'Hearts are earned');
  assert.equal(searchSections(records,'zzzzzzzzzz').length,0);
  assert.match(searchSnippet(records[1],'corridor'),/corridor/);
  const many=Array.from({length:24},(_,i)=>({...records[1],id:`id-${i}`}));
  assert.equal(searchSections(many,'payments').length,24);
});
test('route inventory is deduplicated and excludes arbitrary URLs and traversal',()=>{
  const paths=siteSearchPaths(['xrp','xrp','../secret','https://bad'],['overview','bat','review']);
  assert.equal(paths.filter(p=>p==='/projects/xrp').length,1);assert.ok(paths.includes('/case-studies/bat'));
  assert.ok(!paths.some(p=>p.includes('secret')||p.includes('https:')));
  assert.equal(searchMeta({id:'project-bat-promises',title:'BAT promises',kind:'Promises'}).id,'project-bat-promises');
});
test('crawler uses only allowlisted HTML and reports failed coverage',async()=>{
  const visited:string[]=[];
  const mock:typeof fetch=async(input,init)=>{
    visited.push(String(input));assert.equal(init?.redirect,'error');
    if(String(input).endsWith('/bad'))return new Response('unavailable',{status:503});
    return new Response(`<html><body><main>${html}</main></body></html>`,{headers:{'content-type':'text/html'}});
  };
  const result=await crawlSearchPages('https://example.org',['/good','/bad','https://evil.org','//evil.org'],mock);
  assert.equal(result.total,2);assert.deepEqual(result.failed,['/bad']);assert.equal(result.sections.length,3);
  assert.deepEqual(visited.sort(),['https://example.org/bad','https://example.org/good']);
  await assert.rejects(crawlSearchPages('https://example.org',['/bad'],mock),/No searchable/);
});
test('crawler origin comes only from deployment configuration',()=>{
  assert.equal(searchOrigin({VERCEL_URL:'preview.example.org'}),'https://preview.example.org');
  assert.equal(searchOrigin({SEARCH_SITE_URL:'http://127.0.0.1:3101'}),'http://127.0.0.1:3101');
  assert.throws(()=>searchOrigin({}),/SEARCH_SITE_URL/);
  assert.throws(()=>searchOrigin({SEARCH_SITE_URL:'https://user:password@example.org'}));
  assert.throws(()=>searchOrigin({SEARCH_SITE_URL:'https://example.org/path'}));
});
