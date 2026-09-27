import Link from 'next/link';
import { getPublishedAtlas } from '@/lib/atlas/data';
import { summarizeDelivery } from '@/lib/promise-verdict';
import { searchMeta } from '@/lib/search-sections';
import styles from './delivery-verdict.module.css';
import DeliveryComposition from './delivery-composition';
import { revisionFor } from '@/lib/verdict-query';
import { verdictReceipt } from '@/lib/delivery-calculation';

export default async function DeliveryVerdict({slug,name}:{slug:string;name:string}) {
  let data;
  try { data=await getPublishedAtlas(); }
  catch { return <section className="panel"><h2>Delivery verdict</h2><p role="alert">The promise ledger could not be loaded.</p></section>; }
  const summary=data?summarizeDelivery(data,slug):null;
  if(!data||!summary) return <section className="panel"><h2>Delivery verdict</h2><p>No current published assessment is available for {name}.</p></section>;
  return <section className={`panel delivery-verdict-section ${styles.card}`} {...searchMeta({id:`project-${slug}-delivery`,title:`${name} delivery verdict`,kind:'Verdict',project:slug,keywords:'kept open lapsed retired categories evidence'})}>
    <h2>{summary.genesis ? 'Promise inventory' : 'Delivery verdict'}</h2>
    <DeliveryComposition slug={slug} summary={summary} revision={revisionFor(data)} />
    {summary.weightedMethodology && <p className={styles.note}>Promises kept: <Link href={verdictReceipt(slug,revisionFor(data))}>{summary.kept} of {summary.total} ↗</Link>. This inventory counts each promise equally.</p>}
    <details className={styles.revision}><summary>Published <time dateTime={data.asOf}>{data.asOf.slice(0,10)}</time></summary><p>Data revision: {data.dataRevision}</p><p>{data.methodologyVersion}</p><p>{summary.weightedMethodology ? 'Observation and assessment dates appear on each evidence receipt.' : 'Last research date is not separately recorded. A snapshot date does not establish when a promise lapsed.'}</p></details>
  </section>;
}
