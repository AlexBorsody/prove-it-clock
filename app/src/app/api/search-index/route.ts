import { createHash } from 'node:crypto';
import { revalidateTag, unstable_cache } from 'next/cache';
import { CASE_STUDY_DOCUMENTS } from '@/lib/case-studies';
import { HEARTS_METHODOLOGY, readHeartRankings } from '@/lib/heart-data';
import { VITALS_REPOS } from '@/lib/vitals';
import { siteSearchPaths } from '@/lib/search-sections';
import { crawlSearchPages, searchOrigin, SEARCH_REVALIDATE_SECONDS, type SearchIndex } from '@/lib/search-crawler';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
type Attempt = {index: SearchIndex | null};
const running = new Map<string,Promise<Attempt>>();

function dailyAttempt(origin:string): Promise<Attempt> {
  return unstable_cache(async()=>{
    const active=running.get(origin);
    if (active) return active;
    const promise=(async():Promise<Attempt>=>{
      try {
        // Include known projects even when local DB configuration is missing,
        // so omitted project pages appear in failed coverage, not as completeness.
        const slugs=Object.keys(VITALS_REPOS);
        const configured=Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));
        if (configured) {
          for(let page=1;page<=10;page++) {
            const result=await readHeartRankings(HEARTS_METHODOLOGY,page,100);
            slugs.push(...(result.projects ?? []).map((p:{slug:string})=>p.slug));
            if (page*100 >= (result.total ?? 0)) break;
          }
        }
        return {index:await crawlSearchPages(origin,siteSearchPaths(slugs,Object.keys(CASE_STUDY_DOCUMENTS)))};
      } catch {return {index:null};}
    })().finally(()=>running.delete(origin));
    running.set(origin,promise);
    return promise;
  },['site-search-attempt-v2',origin],{revalidate:SEARCH_REVALIDATE_SECONDS})();
}

export async function GET() {
  try {
    const origin=searchOrigin();
    // Resolve outside unstable_cache: Next bypasses reads from nested caches.
    // Cache failed attempts too; a visit after 24h starts background refresh.
    const attempt=await dailyAttempt(origin);
    const completeTag=`site-search-complete:${createHash('sha256').update(origin).digest('hex')}`;
    const complete=unstable_cache(async()=>{
      const {index}=attempt;
      if (!index || index.failed.length) throw new Error('Incomplete search refresh');
      return index;
    },['site-search-complete-v1',origin],{revalidate:false,tags:[completeTag]});
    let index:SearchIndex;
    try {
      let saved=await complete();
      if (attempt.index && !attempt.index.failed.length && attempt.index.generated_at > saved.generated_at) {
        // Promote every newer success, even while the previous complete entry
        // is fresh. Never invalidate the fallback for a failed/partial attempt.
        revalidateTag(completeTag);
        saved=await complete();
      }
      index=saved;
    }
    catch {
      // First build can still serve useful documentation with honest coverage.
      if (!attempt.index) throw new Error('Search unavailable');
      index=attempt.index;
    }
    return Response.json(index,{headers:{'Cache-Control':'private, max-age=60'}});
  } catch {
    return Response.json({error:'Search index unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});
  }
}
