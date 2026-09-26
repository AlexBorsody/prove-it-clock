// Exercise the installed Next cache implementation: a mock would miss nested-cache
// bypass and end-of-request tag invalidation. No network or database access.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
global.AsyncLocalStorage = require('node:async_hooks').AsyncLocalStorage;
const app = path.resolve(__dirname, '..');
const appRequire = createRequire(path.join(app, 'package.json'));
const ts = appRequire('typescript');
const nextCache = appRequire('next/cache');
const { IncrementalCache } = appRequire('next/dist/server/lib/incremental-cache');
const { workAsyncStorage } = appRequire('next/dist/server/app-render/work-async-storage.external');
const { workUnitAsyncStorage } = appRequire('next/dist/server/app-render/work-unit-async-storage.external');
const { executeRevalidates } = appRequire('next/dist/server/revalidation-utils');
const entries = new Map();
class MemoryHandler {
  async get(key) { return entries.get(key) ?? null; }
  async set(key, value, ctx) { entries.set(key, {value, tags:ctx.tags || [], lastModified:Date.now()}); }
  async revalidateTag(tags) {
    for (const [key, row] of entries) if (row.tags.some(tag => tags.includes(tag))) entries.delete(key);
  }
}
const incrementalCache = new IncrementalCache({
  dev:false, requestHeaders:{}, CurCacheHandler:MemoryHandler,
  getPrerenderManifest:()=>({version:4,routes:{},dynamicRoutes:{},notFoundRoutes:[],preview:{previewModeId:'fixture'}}),
});
let crawlCount=0;
let nextIndex;
const makeIndex = (date, failed=[])=>({generated_at:date,sections:[{id:'fixture'}],total:1,failed});
const fixtureRequire = name => {
  if (name === 'next/cache') return nextCache;
  if (name === '@/lib/case-studies') return {CASE_STUDY_DOCUMENTS:{overview:{}}};
  if (name === '@/lib/heart-data') return {HEARTS_METHODOLOGY:'fixture',readHeartRankings:async()=>({projects:[],total:0})};
  if (name === '@/lib/vitals') return {VITALS_REPOS:{}};
  if (name === '@/lib/search-sections') return {siteSearchPaths:()=>['/fixture']};
  if (name === '@/lib/search-crawler') return {
    SEARCH_REVALIDATE_SECONDS:86400,searchOrigin:()=> 'https://fixture.example',
    crawlSearchPages:async()=>{crawlCount++; if (!nextIndex) throw new Error('fixture outage'); return nextIndex;},
  };
  return appRequire(name);
};
const file = path.join(app,'src/app/api/search-index/route.ts');
const source = ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const compiled = {exports:{}};
new Function('require','module','exports',source)(fixtureRequire,compiled,compiled.exports);
async function request() {
  const work={incrementalCache,route:'/api/search-index',isStaticGeneration:false};
  const unit={type:'request',phase:'action',url:{pathname:'/api/search-index',search:''},implicitTags:{tags:[]}};
  const response = await workAsyncStorage.run(work,()=>workUnitAsyncStorage.run(unit,compiled.exports.GET));
  await executeRevalidates(work);
  return {status:response.status,body:await response.json()};
}
function expireAttempt() {
  for (const row of entries.values()) if (row.value.revalidate === 86400) row.lastModified -= 86401 * 1000;
}
(async()=>{
  const A=makeIndex('2026-09-25T12:00:00.000Z');
  const B=makeIndex('2026-09-26T12:01:00.000Z');
  nextIndex=A;
  assert.equal((await request()).body.generated_at,A.generated_at);
  assert.equal((await request()).body.generated_at,A.generated_at);
  assert.equal(crawlCount,1,'fresh requests do not recrawl');
  nextIndex=B;expireAttempt();
  assert.equal((await request()).body.generated_at,A.generated_at,'stale daily attempt serves while refresh completes');
  assert.equal(crawlCount,2);
  assert.equal((await request()).body.generated_at,B.generated_at,'new complete result promoted despite fresh saved entry');
  nextIndex=null;expireAttempt();
  assert.equal((await request()).body.generated_at,B.generated_at);
  assert.equal((await request()).body.generated_at,B.generated_at,'failure preserves newest good fallback');
  const afterFailure=crawlCount;
  assert.equal((await request()).body.generated_at,B.generated_at);
  assert.equal(crawlCount,afterFailure,'failed attempt is cached');
  nextIndex=makeIndex('2026-09-27T12:00:00.000Z',['/fixture']);expireAttempt();
  await request();
  assert.equal((await request()).body.generated_at,B.generated_at,'partial attempt preserves complete fallback');
  entries.clear();
  assert.deepEqual((await request()).body.failed,['/fixture'],'cold partial coverage still served');
  entries.clear();nextIndex=null;
  assert.equal((await request()).status,503,'cold total outage returns503');
  const coldFailure=crawlCount;
  assert.equal((await request()).status,503);
  assert.equal(crawlCount,coldFailure,'cold failure does not recrawl');
  console.log('PASS: real Next cache route regression — fresh reuse, rolling refresh, promotion, newest fallback, partial and failed attempts.');
})().catch(error=>{console.error(error);process.exitCode=1;});
