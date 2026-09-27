import { heartReadClient } from './heart-data';
import { parseTimelineRow, type TimelineResult } from './promise-timeline';

/** Read-only, one immutable history revision; no legacy date or state reconstruction. */
export async function readPromiseTimeline(slug:string,revisionId?:string):Promise<TimelineResult> {
  try {
    let query=heartReadClient().from('promise_history_revisions')
      .select('id,project_slug,ledger_run_id,recorded_at,events').eq('project_slug',slug);
    if(revisionId)query=query.eq('id',revisionId);
    const {data,error}=await query.order('recorded_at',{ascending:false}).order('id',{ascending:false}).limit(1).maybeSingle();
    if(error)throw error;
    if(!data)return {status:revisionId?'unavailable':'empty'};
    const timeline=parseTimelineRow(data);
    if(timeline.projectSlug!==slug||(revisionId&&timeline.revisionId!==revisionId))throw new Error('Timeline selection mismatch');
    return {status:'available',data:timeline};
  } catch {return {status:'unavailable'};}
}
