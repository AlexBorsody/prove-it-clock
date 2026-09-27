'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, type CategoryId } from '../../data/atlas-taxonomy';
import { DELIVERY_GROUPS, GROUP_LABELS, verdictReceipt, type ReceiptRevision } from '@/lib/delivery-calculation';
import type { DeliverySummary } from '@/lib/promise-verdict';
import styles from './delivery-verdict.module.css';

const percent = (value:number) => new Intl.NumberFormat('en',{style:'percent',maximumFractionDigits:1}).format(value);
export default function DeliveryComposition({slug,summary,revision,initialCategory='',receiptView=false}:{slug:string;summary:DeliverySummary;revision:ReceiptRevision;initialCategory?:CategoryId|'';receiptView?:boolean}) {
  const [category,setCategory] = useState<CategoryId|''>(initialCategory);
  const scope = category ? summary.categories[category] : summary;
  const calculation = scope.calculation!;
  const weighted = calculation.totalWeight !== null;
  const total = weighted ? calculation.totalWeight! : scope.total;
  const core = summary.core;
  const coreOutside = category && core?.category !== category;
  const label = category ? CATEGORIES.find(c => c.id === category)!.label : 'All tracked promises';
  return <div className={styles.composition}>
    <div className={styles.finding} data-outcome={core?.outcome ?? 'unknown'}>
      {summary.genesis ? 'Genesis asset' : core?.recordId ? <Link href={verdictReceipt(slug,revision,{promise:core.recordId})}>{core.label} ↗</Link> : 'Core assessment unavailable'}
      {summary.genesis && <small>Historical promise inventory, outside comparative delivery verdicts.</small>}
      {coreOutside && <small>Project-wide finding; the core is outside this subject.</small>}
    </div>
    <label className={styles.subject}>Promise category<select value={category} onChange={event => {
      const selected=event.target.value as CategoryId|'';
      if(receiptView) window.location.assign(verdictReceipt(slug,revision,{category:selected||undefined}));
      else setCategory(selected);
    }}>
      <option value="">All tracked promises</option>
      {CATEGORIES.filter(c => summary.categories[c.id].total > 0).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
    </select></label>
    <div aria-live="polite" className={styles.measures}>
      {weighted ? <>
        <div><span>Proven delivery</span><strong>{calculation.provenShare === null ? 'No resolved outcomes' : percent(calculation.provenShare)}</strong></div>
        <div><span>Outcome coverage</span><strong>{percent(calculation.outcomeCoverage!)}</strong></div>
      </> : <div><span>Promises kept</span><strong>{scope.kept} of {scope.total}</strong><small>{summary.weightedMethodology && !summary.genesis ? calculation.reason : 'Published inventory · each promise counts equally'}</small></div>}
    </div>
    {total > 0 && <div className={styles.band} aria-label={`${label}: ${weighted ? 'reviewed importance' : 'unweighted promise count'}`}>
      {DELIVERY_GROUPS.map(group => {
        const part = calculation.groups[group], amount = weighted ? part.weight! : part.count;
        return amount > 0 && <Link key={group} data-group={group} style={{flexBasis:`${amount/total*100}%`}}
          href={verdictReceipt(slug,revision,{category:category || undefined,group})}
          aria-label={`${GROUP_LABELS[group]}: ${part.count} ${part.count===1?'promise':'promises'}${weighted ? `, weight ${amount} of ${total}` : ''}. View evidence`}>
          <span aria-hidden="true">{amount/total >= .12 ? part.count : ''}</span>
        </Link>;
      })}
    </div>}
    <div className={styles.legend} aria-label="Delivery breakdown and evidence">
      {DELIVERY_GROUPS.map(group => {
        const part = calculation.groups[group];
        const content = <><i data-group={group}/><span>{part.count} {group === 'unkept' && !summary.weightedMethodology ? 'lapsed / retired' : GROUP_LABELS[group].toLowerCase()}</span>{weighted && <small>weight {part.weight}</small>}</>;
        return part.count ? <Link key={group} href={verdictReceipt(slug,revision,{category:category || undefined,group})}>{content} ↗</Link> : <span key={group} className={styles.zero}>{content}</span>;
      })}
    </div>
    <p className={styles.note}>{weighted ? 'Band width shows reviewed importance. Open and unknown promises are not failures.' : 'Band width counts promises equally. This is the published inventory, not a weighted rating.'}</p>
    <details className={styles.revision}><summary>How this is calculated</summary>
      {weighted ? <>
        <p>Kept weight {calculation.groups.kept.weight} / total weight {total}. Resolved weight {calculation.resolvedWeight} / total weight {total}.</p>
        <p>Kept among resolved: {calculation.resolvedShare === null ? 'Unavailable' : percent(calculation.resolvedShare)}. Pending and unknown outcomes are excluded only from this resolved share.</p>
      </> : <p>{calculation.reason}{!summary.genesis && ' No weights have been assumed.'}</p>}
      <p>Categories use primary membership only. Unclassified promises still count.{!summary.genesis && ' Core findings describe the whole project.'}</p>
      <Link href={verdictReceipt(slug,revision,{category:category || undefined})}>Inspect this calculation and every source ↗</Link>
    </details>
  </div>;
}
