import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchVitals } from '../src/lib/vitals';
import { fetchTeam } from '../src/lib/team';

test('pending GitHub stats return unknown once without hiding available repo totals', async () => {
  const original = globalThis.fetch; const calls: string[] = [];
  globalThis.fetch = async (input, init) => {
    const url=String(input); calls.push(url);
    assert.ok(init?.signal, 'requests must have a timeout signal');
    if(url.includes('/stats/')) return new Response('{}',{status:202});
    if(url.includes('/search/')) return Response.json({total_count:0});
    if(url.includes('/commits?')) return Response.json([{commit:{author:{date:'2026-09-26T00:00:00Z'},message:'Change'}}]);
    return Response.json({stargazers_count:24,forks_count:3,subscribers_count:2,open_issues_count:1,pushed_at:'2026-09-26T00:00:00Z'});
  };
  try {
    const [vitals,team]=await Promise.all([fetchVitals('btc'),fetchTeam('btc')]);
    assert.equal(vitals.stars,24);assert.equal(vitals.commits90d,null);assert.equal(vitals.partial,true);
    assert.equal(team.read,'Unknown');assert.equal(team.active90d,null);
    assert.equal(calls.filter(url=>url.includes('commit_activity')).length,1);
    assert.equal(calls.filter(url=>url.includes('stats/contributors')).length,1);
  } finally { globalThis.fetch=original; }
});
