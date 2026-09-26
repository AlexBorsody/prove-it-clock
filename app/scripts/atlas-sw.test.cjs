const test=require('node:test');const assert=require('node:assert/strict');const fs=require('fs');const vm=require('vm');const path=require('path');
test('service worker only caches immutable assets; RSC and API data reach network',async()=>{
  const listeners={},cache=new Map();let fetches=0;
  const source=fs.readFileSync(path.join(__dirname,'generate-sw.js'),'utf8');
  vm.runInNewContext(source,{require:n=>n==='fs'?{unlinkSync(){},writeFileSync(_p,sw){vm.runInNewContext(sw,{URL,self:{location:{origin:'https://local.test'},addEventListener:(name,fn)=>listeners[name]=fn},caches:{match:async r=>cache.get(r.url),open:async()=>({put:async(r,v)=>cache.set(r.url,v)})},fetch:async()=>new Response(String(++fetches))});}}:require(n),__dirname:'/tmp',console:{log(){}}});
  async function read(url,headers={}){const request=new Request(url,{headers});let response;listeners.fetch({request,respondWith:p=>response=p});return response?(await response).text():'network';}
  assert.equal(await read('https://local.test/atlas?_rsc=123',{RSC:'1'}),'network');
  assert.equal(await read('https://local.test/api/hearts'),'network');
  assert.equal(await read('https://local.test/_next/static/a.js'),'1');assert.equal(await read('https://local.test/_next/static/a.js'),'1');assert.equal(fetches,1);
});
