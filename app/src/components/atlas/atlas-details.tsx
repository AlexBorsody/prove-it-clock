import Link from 'next/link';
import { categoryLabel } from '../../../data/atlas-taxonomy';
import { STATE_LABELS, type AtlasNode, type AtlasSource } from '@/lib/atlas/types';
import styles from './atlas.module.css';
function SourceList({ sources }: { sources: AtlasSource[] }) {
  return <ul className={styles.sources}>{sources.map((source,i)=><li key={`${source.url}-${i}`}>
    <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title ?? new URL(source.url).hostname} ↗</a>
    {source.locator && <p>{source.locator}</p>}{source.publishedAt && <p>Published: {source.publishedAt}</p>}
    {source.quote && <blockquote>“{source.quote}”</blockquote>}
  </li>)}</ul>;
}
export default function AtlasDetails({ node, close }: { node:AtlasNode; close:()=>void }) {
  return <>
    <div className={styles.detailHeading}><div><span className={styles.eyebrow}>{node.symbol} · Published promise</span><h2 id="atlas-detail-title">{node.projectName}</h2></div><button type="button" aria-label="Close promise details" onClick={close}>✕</button></div>
    <div className={styles.chips}><span>{categoryLabel(node.primaryCategory)}</span>{node.core&&<span>◎ Core promise</span>}</div>
    {node.secondaryCategories.length>0&&<p className={styles.muted}>Also: {node.secondaryCategories.map(categoryLabel).join(' · ')}</p>}
    <h3>{node.claimTextKind==='published-criteria'?'Published fulfillment criteria':'Recorded claim'}</h3>
    <p className={styles.claim}>{node.claimText}</p>
    {node.claimTextKind==='published-criteria'&&<p className={styles.muted}>The published record stores the test for delivery, not a separate original quotation.</p>}
    <div className={styles.status} data-state={node.state}>{STATE_LABELS[node.state]}</div>
    {node.state==='unknown'&&<p className={styles.muted}>Recorded value: {node.originalState}. Its meaning needs methodology review.</p>}
    <p>{node.assessmentExplanation ?? 'No assessment explanation is stored.'}</p>
    <p className={styles.muted}>{node.assessedAt?`Assessed: ${node.assessedAt}`:'Assessment date not separately recorded.'}<br/>Published snapshot: <time dateTime={node.snapshotAsOf}>{node.snapshotAsOf.slice(0,10)}</time></p>
    {node.claimTextKind!=='published-criteria'&&<><h3>Fulfillment test</h3><p>{node.fulfillmentTest ?? 'No explicit fulfillment test is stored in this published record.'}</p></>}
    {!node.fulfillmentTest&&node.claimTextKind==='published-criteria'&&<p>No explicit fulfillment test is stored in this published record.</p>}
    <h3>Original claim source</h3>
    {node.claimSources.length?<SourceList sources={node.claimSources}/>:<p className={styles.warning}>No original claim source is separately identified in this published record.</p>}
    <h3>Outcome evidence</h3>
    {!node.evidenceRolesSeparated&&node.outcomeEvidence.length>0&&<p className={styles.muted}>Published assessment references. Their roles are not separated; they may include claim sources as well as delivery evidence.</p>}
    {node.outcomeEvidence.length?<SourceList sources={node.outcomeEvidence}/>:<p className={styles.warning}>No outcome evidence is linked.</p>}
    <details className={styles.classification}><summary>Why this category?</summary><p>{node.assignmentRationale ?? 'No category assignment yet. This promise remains visible in Unclassified.'}</p><p className={styles.muted}>Assigned by: {node.assignmentAuthor ?? 'Not assigned'}{node.assignmentAuthor==='Codex'?' · not human-reviewed':''}</p>{node.tags.length>0&&<p>Tags: {node.tags.join(', ')}</p>}</details>
    {node.qualityFlags.length>0&&<details className={styles.classification}><summary>Record limitations ({node.qualityFlags.length})</summary><ul>{node.qualityFlags.map(flag=><li key={flag}>{flag}</li>)}</ul></details>}
    <div className={styles.recordLinks}><Link href={node.promiseHref}>Open full promise record ↗</Link><Link href={node.projectHref}>View {node.projectName}</Link></div>
  </>;
}
