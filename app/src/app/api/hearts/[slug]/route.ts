import { heartQuery, readHeartHistory } from '@/lib/heart-data';
export const dynamic = 'force-dynamic';
export async function GET(request: Request, context: {params:Promise<{slug:string}>}) {
  let query;
  try { query = heartQuery(request); } catch (e) {
    return Response.json({error:(e as Error).message},{status:400});
  }
  const {slug} = await context.params;
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return Response.json({error:'Invalid slug'},{status:400});
  try {
    return Response.json({...await readHeartHistory(slug,query.methodology,query.page,query.perPage),
      page:query.page,per_page:query.perPage});
  } catch {
    return Response.json({error:'Heart database unavailable'},{status:503});
  }
}
