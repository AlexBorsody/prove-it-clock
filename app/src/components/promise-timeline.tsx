'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ASSIGNMENT_VERSION } from '../../data/atlas-assignments';
import { evidenceReceipt } from '@/lib/promise-receipts';
import { EVENT_KINDS, EVENT_LABELS, eventDateLabel, type EventKind, type PromiseEvent, type PromiseTimelineData } from '@/lib/promise-timeline';
import styles from './promise-timeline.module.css';

export default function PromiseTimeline({data}:{data:PromiseTimelineData}) {
  const [lineage,setLineage]=useState('');
  const [kind,setKind]=useState<EventKind|''>('');
  const [clock,setClock]=useState<'occurred'|'recorded'>('occurred');
  const [showAll,setShowAll]=useState(false);
  const [expanded,setExpanded]=useState(false);
  const lineages=[...new Set(data.events.map(event=>event.lineage))];
  const date=(event:PromiseEvent)=>clock==='occurred'?event.occurredOn:event.recordedAt.slice(0,10);
  const events=data.events.filter(event=>(!lineage||event.lineage===lineage)&&(!kind||event.kind===kind))
    .toSorted((a,b)=>date(a).localeCompare(date(b))||a.recordedAt.localeCompare(b.recordedAt)||a.id.localeCompare(b.id));
  function reveal(id:string) {
    setKind('');setLineage('');
    requestAnimationFrame(()=>{
      const target=document.getElementById(`timeline-${id}`) as HTMLDetailsElement|null;
      if(target) {target.open=true;target.scrollIntoView({block:'center'});target.querySelector('summary')?.focus();}
    });
  }
  const previous=(event:PromiseEvent)=>event.kind==='assessment'&&event.supersedes?data.events.find(p=>p.id===event.supersedes):undefined;
  if (!expanded) {
    return <button type="button" onClick={() => setExpanded(true)} className={styles.showMore}>
      Show promise timeline ({events.length} events)
    </button>;
  }
  return <>
    <button type="button" onClick={() => setExpanded(false)} className={styles.showMore}>
      Hide promise timeline
    </button>
    <div className={styles.controls}>
      <label title="Gaps mean missing coverage, not proof that nothing happened.">Promise<select value={lineage} onChange={event=>setLineage(event.target.value)}><option value="">All promises</option>{lineages.map(id=><option key={id} value={id}>{id}</option>)}</select></label>
      <label>Event<select value={kind} onChange={event=>setKind(event.target.value as EventKind|'')}><option value="">All events</option>{EVENT_KINDS.map(id=><option key={id} value={id}>{EVENT_LABELS[id]}</option>)}</select></label>
      <label>Date<select value={clock} onChange={event=>setClock(event.target.value as 'occurred'|'recorded')}><option value="occurred">When it happened</option><option value="recorded">When we recorded it</option></select></label>
    </div>
    {events.length===0&&<p>No events match these filters.</p>}
    <ol className={styles.timeline}>
      {events.slice(0, showAll ? events.length : 10).map(event=>{
        const prior=previous(event);
        return <li key={event.id} data-kind={event.kind} data-stance={event.kind==='evidence'?event.stance:undefined}>
          <span className={styles.marker} aria-hidden="true"/>
          <details id={`timeline-${event.id}`}>
            <summary><time dateTime={date(event)}>{eventDateLabel(date(event))}</time>
              <span className={styles.kind}>{EVENT_LABELS[event.kind]}{event.kind==='evidence'&&` · ${event.stance}`}{event.kind==='assessment'&&event.supersedes&&' · corrected'}</span>
              <span className={styles.summary}>{event.summary}</span>
              <span className={styles.lineage}>{event.lineage}</span>
            </summary>
            <div className={styles.evidence}>
              {event.kind==='promise_stated'&&<p>Attributed to {event.speaker} · {event.claimType} promise</p>}
              {event.kind==='promise_repeated'&&<p>Wording: {event.wordingChange}. <a href={`#timeline-${event.originalId}`} onClick={e=>{e.preventDefault();reveal(event.originalId);}}>Original statement</a></p>}
              {event.kind==='evidence'&&<p>Provenance: {event.provenance.join(' · ')}</p>}
              {event.kind==='assessment'&&<>
                <p>Recorded state: {prior?.kind==='assessment'&&<><del>{prior.state}</del> → </>}<b>{event.state}</b></p>
                {event.supersedes&&<p>Correction: {event.correctionReason}. <a href={`#timeline-${event.supersedes}`} onClick={e=>{e.preventDefault();reveal(event.supersedes!);}}>Previous assessment</a></p>}
                {event.note&&<p><strong>Evidence caveat:</strong> {event.note}</p>}
                {event.noteUnavailable&&<p role="status">Evidence caveat unavailable: this record contains an unreadable annotation.</p>}
                <p>Methodology: {event.methodology}</p><p>Published run: {event.runId}</p>
                <p><Link href={`${evidenceReceipt(data.projectSlug,{runId:event.runId,methodology:event.methodology,assignmentVersion:ASSIGNMENT_VERSION})}#receipt-${encodeURIComponent(event.lineage)}`}>Open the published promise record →</Link></p>
              </>}
              <p><a href={event.source.url} target="_blank" rel="noopener noreferrer">{event.source.title} ↗</a>{event.source.locator&&` · ${event.source.locator}`}</p>
              <p>Source published: {eventDateLabel(event.source.publishedOn)}</p>
              {event.source.quote&&<blockquote>{event.source.quote}</blockquote>}
              <p>Event: {eventDateLabel(event.occurredOn)} · Recorded: {eventDateLabel(event.recordedAt.slice(0,10))}</p>
              <p>Recorded by {event.author}</p>
            </div>
          </details>
        </li>;
      })}
    </ol>
    {events.length > 10 && (
      <button type="button" onClick={() => setShowAll(!showAll)} className={styles.showMore}>
        {showAll ? "Show less" : `Show all ${events.length} events`}
      </button>
    )}
    <details className={styles.versions}><summary>History revision and coverage</summary>
      <p>{data.revisionId}</p><p>Ledger run: {data.ledgerRunId}</p>
      <p>Dates retain their recorded precision. Spacing is chronological, not a measure of elapsed time. Assessments appear on their actual publication date.</p>
      <a href={`/projects/${data.projectSlug}?history=${encodeURIComponent(data.revisionId)}#project-${data.projectSlug}-timeline`}>Link to this history revision ↗</a>
    </details>
  </>;
}
