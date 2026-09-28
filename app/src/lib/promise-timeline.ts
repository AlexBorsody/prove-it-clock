/** Source events and published assessments are different records; neither re-grades a promise. */
export const EVENT_KINDS = ['promise_stated','promise_repeated','evidence','assessment'] as const;
export type EventKind = typeof EVENT_KINDS[number];
export const EVENT_LABELS: Record<EventKind,string> = {
  promise_stated:'Promise stated',promise_repeated:'Promise repeated',evidence:'Evidence',assessment:'Assessment published',
};
export interface TimelineSource {url:string;title:string;publishedOn:string;locator?:string;quote?:string}
interface EventBase {
  id:string;lineage:string;occurredOn:string;recordedAt:string;summary:string;author:string;source:TimelineSource;
}
export type PromiseEvent = EventBase & (
  | {kind:'promise_stated';speaker:string;claimType:'milestone'|'ongoing'}
  | {kind:'promise_repeated';originalId:string;wordingChange:'same'|'narrowed'|'expanded'}
  | {kind:'evidence';stance:'supports'|'refutes'|'context';provenance:string[]}
  | {kind:'assessment';runId:string;methodology:string;state:string;supersedes:string|null;correctionReason?:string;note?:string;noteUnavailable?:boolean}
);
export interface PromiseTimelineData {
  revisionId:string;projectSlug:string;ledgerRunId:string;recordedAt:string;events:PromiseEvent[];
}
export type TimelineResult = {status:'available';data:PromiseTimelineData} | {status:'empty'|'unavailable'};
export function validEventDate(value:unknown): value is string {
  if(typeof value!=='string' || !/^\d{4}(-\d{2}){0,2}$/.test(value))return false;
  const expanded=value+(value.length===4?'-01-01':value.length===7?'-01':'');
  const date=new Date(`${expanded}T00:00:00Z`);
  return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===expanded;
}
export function eventDateLabel(value:string):string {
  if(!validEventDate(value))return 'Date unavailable';
  if(value.length===4)return value;
  return new Intl.DateTimeFormat('en',{timeZone:'UTC',year:'numeric',month:'short',...(value.length===10?{day:'numeric' as const}:{})})
    .format(new Date(`${value.length===7?`${value}-01`:value}T00:00:00Z`));
}
function nonempty(value:unknown):value is string {return typeof value==='string'&&value.trim().length>0;}
function safeUrl(value:unknown):boolean {
  if(typeof value!=='string')return false;
  try {const url=new URL(value);return ['http:','https:'].includes(url.protocol)&&!url.username&&!url.password;}catch{return false;}
}
/** Required history fields fail closed; an unreadable optional caveat stays visibly flagged. */
export function parseTimelineRow(row:unknown):PromiseTimelineData {
  if(!row || typeof row!=='object')throw new Error('Invalid timeline revision');
  const r=row as Record<string,unknown>;
  if(!nonempty(r.id)||!nonempty(r.project_slug)||!nonempty(r.ledger_run_id)||!nonempty(r.recorded_at)||!Array.isArray(r.events))throw new Error('Incomplete timeline revision');
  const ids=new Set<string>(); const events:PromiseEvent[]=[];
  for(const item of r.events) {
    const e=item as PromiseEvent;
    if(!e || !nonempty(e.id)||ids.has(e.id)||!nonempty(e.lineage)||!nonempty(e.summary)||!nonempty(e.author)||
      !validEventDate(e.occurredOn)||!nonempty(e.recordedAt)||!Number.isFinite(Date.parse(e.recordedAt))||
      !e.source||(e.source.quote!==undefined&&typeof e.source.quote!=='string')||(e.source.locator!==undefined&&typeof e.source.locator!=='string')||!safeUrl(e.source.url)||!nonempty(e.source.title)||!validEventDate(e.source.publishedOn)||!EVENT_KINDS.includes(e.kind))throw new Error('Invalid timeline event');
    if(e.kind==='promise_stated'&&(!nonempty(e.speaker)||!['milestone','ongoing'].includes(e.claimType)||events.some(p=>p.kind==='promise_stated'&&p.lineage===e.lineage)))throw new Error('Invalid original statement');
    if(e.kind==='promise_repeated'&&(!['same','narrowed','expanded'].includes(e.wordingChange)||!events.some(p=>p.id===e.originalId&&p.lineage===e.lineage&&p.kind==='promise_stated')))throw new Error('Invalid repeated statement');
    if(e.kind==='evidence'&&(!['supports','refutes','context'].includes(e.stance)||!Array.isArray(e.provenance)||!e.provenance.length||!e.provenance.every(nonempty)))throw new Error('Invalid evidence provenance');
    if(e.kind==='assessment') {
      if(!nonempty(e.runId)||!nonempty(e.methodology)||!['open','fulfilled','lapsed','retired'].includes(e.state)||!(e.supersedes===null||nonempty(e.supersedes)))throw new Error('Invalid assessment');
      if(e.supersedes&&(!nonempty(e.correctionReason)||!events.some(p=>p.id===e.supersedes&&p.lineage===e.lineage&&p.kind==='assessment')||events.some(p=>p.kind==='assessment'&&p.supersedes===e.supersedes)))throw new Error('Invalid correction chain');
    }
    ids.add(e.id);
    // 007 permits extra event metadata. A malformed optional annotation must not
    // hide its otherwise valid history, or be passed to React as an object.
    events.push(e.kind==='assessment'?{...e,
      note:nonempty(e.note)?e.note:undefined,
      noteUnavailable:e.note!==undefined&&!nonempty(e.note),
    }:e);
  }
  return {revisionId:r.id,projectSlug:r.project_slug,ledgerRunId:r.ledger_run_id,recordedAt:r.recorded_at,events};
}
