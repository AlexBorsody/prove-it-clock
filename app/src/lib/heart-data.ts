import { createClient } from '@supabase/supabase-js';

/** Separate read client: prefer RLS-protected credentials over the writer key. */
export function heartReadClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Heart database is not configured');
  return createClient(url, key, {auth: {persistSession: false, autoRefreshToken: false}});
}

export async function readHeartRankings(methodology: string, page: number, perPage: number) {
  const db = heartReadClient();
  const {data: run, error: runError} = await db.from('heart_runs')
    .select('id,as_of,recorded_at,methodology').eq('review_status','published').eq('methodology',methodology)
    .order('as_of',{ascending:false}).order('recorded_at',{ascending:false}).order('id',{ascending:false})
    .limit(1).maybeSingle();
  if (runError) throw runError;
  if (!run) return {run:null, projects:[], total:0};
  const {data, error, count} = await db.from('heart_rankings').select('*',{count:'exact'})
    .eq('run_id',run.id).order('market_cap_rank',{ascending:true,nullsFirst:false}).order('slug')
    .range((page-1)*perPage,page*perPage-1);
  if (error) throw error;
  return {run, projects:data, total:count};
}

export async function readHeartHistory(slug: string, methodology: string, page: number, perPage: number) {
  const db = heartReadClient();
  const {data,error,count} = await db.from('heart_rankings').select('*',{count:'exact'})
    .eq('slug',slug).eq('methodology',methodology)
    .order('as_of',{ascending:false}).order('recorded_at',{ascending:false})
    .order('run_id',{ascending:false}).range((page-1)*perPage,page*perPage-1);
  if (error) throw error;
  return {points:data,total:count};
}

export function heartQuery(request: Request) {
  const q = new URL(request.url).searchParams;
  const methodology = q.get('methodology');
  if (!methodology?.trim() || methodology.length > 200) throw new Error('methodology is required');
  function integer(key: string, fallback: number, max: number) {
    const raw = q.get(key) ?? String(fallback);
    if (!/^[1-9]\d*$/.test(raw) || Number(raw) > max) throw new Error(`Invalid ${key}`);
    return Number(raw);
  }
  return {methodology,page:integer('page',1,100000),perPage:integer('per_page',20,100)};
}
