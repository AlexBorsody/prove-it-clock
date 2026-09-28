import { getSupabase } from '../supabase';
export interface PublicFeature { id:string;title:string;body:string;why:string;status:string;upvotes:number }
export function feedbackEnabled():boolean {
  return process.env.FEEDBACK_ENABLED==='true' && (process.env.FEEDBACK_TOKEN_SECRET?.length??0)>=32
    && !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}
export async function readFeedbackBoard(page=0):Promise<{requests:PublicFeature[];available:boolean;more:boolean}> {
  if(!feedbackEnabled()) return {requests:[],available:false,more:false};
  try {
    const {data,error}=await getSupabase().from('feature_requests_public')
      .select('id,title,body,why,status,upvotes').order('created_at',{ascending:false}).order('id').range(page*50,page*50+50);
    if(error) throw error;
    return {requests:(data??[]).slice(0,50),available:true,more:(data?.length??0)>50};
  } catch { return {requests:[],available:false,more:false}; }
}
