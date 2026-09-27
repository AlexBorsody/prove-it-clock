import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeliveryComposition from '@/components/delivery-composition';
import { readPublishedPromiseLedger } from '@/lib/heart-data';
import { adaptAtlas } from '@/lib/atlas/adapter';
import { summarizeDelivery } from '@/lib/promise-verdict';
import { deliveryOutcome, GROUP_LABELS, verdictReceipt } from '@/lib/delivery-calculation';
import { parseVerdictQuery, revisionFor } from '@/lib/verdict-query';
import { STATE_LABELS } from '@/lib/atlas/types';
import { categoryLabel } from '../../../../../../data/atlas-taxonomy';

export const dynamic = 'force-dynamic';
export const metadata = {title:'Verdict evidence | Prove Value'};
export default async function VerdictReceiptPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const [{slug},query] = await Promise.all([params,searchParams]);
  const input = new URLSearchParams();
  for (const [key,value] of Object.entries(query)) for (const item of Array.isArray(value) ? value : value ? [value] : []) input.append(key,item);
  let selection;
  try {selection=parseVerdictQuery(input);} catch {return <section className="panel"><h1>Invalid evidence link</h1><p>The run or calculation scope is not valid.</p></section>;}
  if (!selection.runId) return <section className="panel"><h1>Published run required</h1><p><Link href={`/projects/${slug}`}>Open the current verdict to select its evidence.</Link></p></section>;
  let data;
  try {data=adaptAtlas(await readPublishedPromiseLedger(selection));} catch {return <section className="panel"><h1>Verdict evidence</h1><p role="alert">The published record could not be loaded. Reload to retry.</p></section>;}
  if (!data) notFound();
  const summary = summarizeDelivery(data,slug);
  if (!summary) return <section className="panel"><h1>Assessment unavailable</h1><p>This project has no available assessment in the selected published run.</p></section>;
  const projectNodes = data.nodes.filter(n => n.projectSlug === slug);
  const nodes = projectNodes.filter(n => (!selection.category || (n.primaryCategory ?? 'unclassified') === selection.category) &&
    (!selection.group || deliveryOutcome(n) === selection.group) && (!selection.promise || n.id === selection.promise));
  const revision = revisionFor(data);
  return <>
    <section className="panel" style={{overflowWrap:'anywhere'}}>
      <p><Link href={`/projects/${slug}`}>← {projectNodes[0].projectName}</Link></p>
      <h1>Verdict evidence</h1>
      <p>Published snapshot: <time dateTime={data.asOf}>{data.asOf.slice(0,10)}</time>. This receipt stays on the selected run.</p>
      <DeliveryComposition slug={slug} summary={summary} revision={revision} initialCategory={selection.category}/>
      <details><summary>Calculation versions</summary><p>Run: {data.dataRevision}</p><p>{data.methodologyVersion}</p>
        <p>Assignments: {data.assignmentVersion}</p>{data.verdictVersions && <p>Policy: {data.verdictVersions.policy}; importance: {data.verdictVersions.importance}; admission: {data.verdictVersions.admission}.</p>}
        {!data.verdictVersions && <p>Legacy subject assignments: {data.assignmentVersion}. Subject classification is application-versioned; the promise assessment below is pinned to this published run.</p>}
      </details>
    </section>
    <section className="panel" aria-labelledby="receipt-records">
      <h2 id="receipt-records">{selection.group ? GROUP_LABELS[selection.group] : 'Contributing'} promises{selection.category ? `: ${categoryLabel(selection.category)}` : ''}</h2>
      <p>{nodes.length} records. <Link href={verdictReceipt(slug,revision)}>Show the complete calculation</Link></p>
      {!nodes.length && <p>No promises match this receipt scope.</p>}
      {nodes.map(node => <article key={node.id} id={`receipt-${encodeURIComponent(node.lineageId)}`} style={{borderTop:'1px solid var(--border)',paddingBlock:20,overflowWrap:'anywhere'}}>
        <h3>{node.core ? 'Core · ' : ''}{node.claimText}</h3>
        <p>{STATE_LABELS[node.state]} · {categoryLabel(node.primaryCategory)}{node.reviewed ? ` · ${node.reviewed.lifecycle}` : ''}</p>
        <p>{node.assessmentExplanation ?? 'Assessment explanation unavailable.'}</p>
        <p><b>Fulfillment test:</b> {node.fulfillmentTest ?? 'Not recorded.'}</p>
        {node.reviewed?.importance ? <p><b>Weight {node.reviewed.importance.weight} ({node.reviewed.importance.tier}):</b> {node.reviewed.importance.rationale} Author: {node.reviewed.importance.author}.</p> : <p>Reviewed importance not recorded.</p>}
        <p>Assessment date: {node.assessedAt ?? 'Not separately recorded'}. {node.reviewed?.observed_at && `Evidence observed: ${node.reviewed.observed_at}.`}</p>
        <h4>Original claim sources</h4>
        {node.claimSources.length ? <ul>{node.claimSources.map((s,i) => <li key={`${s.url}-${i}`}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title ?? s.url} ↗</a>{s.locator && ` · ${s.locator}`}{s.quote && <blockquote>{s.quote}</blockquote>}</li>)}</ul> : <p>Original claim provenance is not separately recorded.</p>}
        <h4>{node.evidenceRolesSeparated ? 'Outcome evidence' : 'Published assessment references'}</h4>
        {node.outcomeEvidence.length ? <ul>{node.outcomeEvidence.map((s,i) => <li key={`${s.url}-${i}`}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title ?? s.url} ↗</a>{s.locator && ` · ${s.locator}`}</li>)}</ul> : <p>No outcome evidence is recorded.</p>}
        {node.qualityFlags.length > 0 && <details><summary>Record limitations</summary><ul>{node.qualityFlags.map(flag => <li key={flag}>{flag}</li>)}</ul></details>}
      </article>)}
    </section>
  </>;
}
