import { heartQuery, readHeartRankings } from '@/lib/heart-data';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  let query;
  try { query = heartQuery(request); } catch (e) {
    return Response.json({error:(e as Error).message},{status:400});
  }
  try {
    const data = await readHeartRankings(query.methodology,query.page,query.perPage);
    return Response.json({...data, page:query.page,per_page:query.perPage,rank_basis:'market_cap_within_run',
      status:data.run ? 'published' : 'no_published_run'});
  } catch {
    return Response.json({error:'Heart database unavailable'},{status:503});
  }
}
