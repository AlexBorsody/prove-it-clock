import Link from 'next/link';
import { getPublishedAtlas } from '@/lib/atlas/data';
import { summarizeDelivery, deliveryReceipt } from '@/lib/promise-verdict';
import { CATEGORIES } from '../../data/atlas-taxonomy';
import { STATE_LABELS } from '@/lib/atlas/types';
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
    <h2>Delivery verdict</h2>
    <DeliveryComposition slug={slug} summary={summary} revision={revisionFor(data)} />
    <div className={styles.total} aria-label="Unweighted promise inventory"><Link href={verdictReceipt(slug,revisionFor(data),{group:'kept'})} aria-label={`${summary.kept} kept promises. View evidence`}>{summary.kept}</Link><span>of</span><Link href={verdictReceipt(slug,revisionFor(data))} aria-label={`${summary.total} scored promises. View evidence`}>{summary.total}</Link><span>promises kept</span></div>
    <div className={styles.states}>{(['open','in_progress','lapsed','retired','missed','unknown'] as const).filter(state=>summary.states[state]>0).map(state=><Link key={state} href={deliveryReceipt(slug,undefined,state)} data-state={state}>{summary.states[state]} {STATE_LABELS[state].toLowerCase()} ↗</Link>)}</div>
    <p className={styles.note}>Recent lapse timing unavailable.</p>
    <h3>Delivery by subject</h3>
    <div className={styles.categories}>{CATEGORIES.filter(category=>summary.categories[category.id].total>0).map(category=>{
      const count=summary.categories[category.id];
      return <Link key={category.id} href={verdictReceipt(slug,revisionFor(data),{category:category.id})} className={styles.category}>
        <span>{category.label}</span><strong>{count.kept}/{count.total} kept ↗</strong>
        <span className={styles.track} aria-hidden="true"><i style={{width:`${count.kept/count.total*100}%`}}/></span>
        {count.states.unknown>0&&<small>{count.states.unknown} unknown</small>}
      </Link>;
    })}</div>
    <p className={styles.note}>Primary categories only. Unclassified promises still count.</p>
    <details className={styles.revision}><summary>As of <time dateTime={data.asOf}>{data.asOf.slice(0,10)}</time></summary><p>Published data revision: {data.dataRevision}</p><p>{data.methodologyVersion}</p><p>Last research date not separately recorded. A snapshot date does not establish when a promise lapsed.</p></details>
  </section>;
}
