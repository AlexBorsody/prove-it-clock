import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readPublishedPromiseLedger } from '@/lib/heart-data';
import { adaptAtlas } from '@/lib/atlas/adapter';
import { summarizeDelivery } from '@/lib/promise-verdict';
import { GROUP_LABELS, evidenceReceipt, parseReceiptQuery, receiptNodes, receiptRevision } from '@/lib/promise-receipts';
import { STATE_LABELS, type AtlasSource } from '@/lib/atlas/types';
import { categoryLabel } from '../../../../../../data/atlas-taxonomy';

export const dynamic = 'force-dynamic';
export const metadata = {title:'Promise evidence | Prove Value'};
function Sources({sources}:{sources:AtlasSource[]}) {
  return <ul>{sources.map((source,index)=><li key={`${source.url}-${index}`}>
    <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title ?? source.url} ↗</a>
    {source.publishedAt && <span> · {source.publishedAt}</span>}
    {source.locator && <span> · {source.locator}</span>}
    {source.quote && <blockquote>{source.quote}</blockquote>}
  </li>)}</ul>;
}
export default async function EvidenceReceiptPage({params,searchParams}:{
  params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>;
}) {
  const [{slug},query] = await Promise.all([params,searchParams]);
  const input = new URLSearchParams();
  for (const [key,value] of Object.entries(query)) for (const item of Array.isArray(value) ? value : value ? [value] : []) input.append(key,item);
  let selection;
  try { selection=parseReceiptQuery(input); }
  catch { return <section className="panel"><h1>Invalid evidence link</h1><p>A published run and its methodology are required.</p><Link href={`/projects/${encodeURIComponent(slug)}`}>Open the current project record</Link></section>; }
  let data;
  try { data=adaptAtlas(await readPublishedPromiseLedger(selection)); }
  catch { return <section className="panel"><h1>Promise evidence</h1><p role="alert">The published record could not be loaded. Reload to retry.</p></section>; }
  if (!data) notFound();
  const summary=summarizeDelivery(data,slug);
  if (!summary) return <section className="panel"><h1>Assessment unavailable</h1><p>This project has no available assessment in the selected published run.</p></section>;
  let nodes;
  try { nodes=receiptNodes(data,slug,selection); }
  catch { return <section className="panel"><h1>Category revision unavailable</h1><p>This deployment cannot reproduce the category membership in this link.</p></section>; }
  const revision=receiptRevision(data);
  const name=data.nodes.find(node=>node.projectSlug===slug)!.projectName;
  return <>
    <section className="panel" style={{overflowWrap:'anywhere'}}>
      <Link href={`/projects/${slug}`}>← {name}</Link>
      <h1>Promise evidence</h1>
      <p>Published snapshot: <time dateTime={data.asOf}>{data.asOf.slice(0,10)}</time>. This receipt stays on this run.</p>
      <details><summary>Record versions</summary>
        <p>Run: {data.dataRevision}</p><p>Methodology: {data.methodologyVersion}</p>
        <p>Categories: {data.assignmentVersion}. Classification is versioned separately from the stored assessment.</p>
        {selection.assignmentVersion!==data.assignmentVersion && <p>Category labels have changed since this link was created. The promise records below still come from the requested run.</p>}
      </details>
    </section>
    <section className="panel" aria-labelledby="receipt-records" style={{overflowWrap:'anywhere'}}>
      <h2 id="receipt-records">{selection.group ? GROUP_LABELS[selection.group] : 'Published'} promises{selection.category ? `: ${categoryLabel(selection.category)}` : ''}</h2>
      <p>{nodes.length} {nodes.length===1 ? 'record' : 'records'}. <Link href={evidenceReceipt(slug,revision)}>View all promises in this run</Link></p>
      {!nodes.length && <p>No promises match this receipt.</p>}
      {nodes.map(node=><article key={node.id} id={`receipt-${encodeURIComponent(node.lineageId)}`} style={{borderTop:'1px solid var(--border)',paddingBlock:20}}>
        <h3>{node.claimText}</h3>
        <p>{STATE_LABELS[node.state]} · {categoryLabel(node.primaryCategory)}{node.core && ' · Core promise'}</p>
        <p>{node.assessmentExplanation ?? 'Assessment explanation not recorded.'}</p>
        <p><b>Fulfillment test:</b> {node.fulfillmentTest ?? 'Not recorded.'}</p>
        <p>Assessment date: {node.assessedAt ?? 'Not separately recorded'}. The snapshot date does not establish when delivery or lapse happened.</p>
        <h4>Original claim sources</h4>
        {node.claimSources.length ? <Sources sources={node.claimSources}/> : <p>Original claim provenance is not separately recorded.</p>}
        <h4>{node.evidenceRolesSeparated ? 'Outcome evidence' : 'Published assessment references'}</h4>
        {node.outcomeEvidence.length ? <Sources sources={node.outcomeEvidence}/> : <p>No outcome evidence is linked.</p>}
        {node.qualityFlags.length>0 && <details><summary>Record limitations</summary><ul>{node.qualityFlags.map(flag=><li key={flag}>{flag}</li>)}</ul></details>}
      </article>)}
    </section>
  </>;
}
