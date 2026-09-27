'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, type CategoryId } from '../../data/atlas-taxonomy';
import { COMPOSITION_GROUPS, GROUP_LABELS, compositionCounts, evidenceReceipt, type ReceiptRevision } from '@/lib/promise-receipts';
import type { DeliverySummary } from '@/lib/promise-verdict';
import styles from './delivery-composition.module.css';

export default function DeliveryComposition({slug,summary,revision,initialCategory=''}:{
  slug:string;summary:DeliverySummary;revision:ReceiptRevision;initialCategory?:CategoryId|'';
}) {
  const [category,setCategory] = useState<CategoryId|''>(initialCategory);
  const scope = category ? summary.categories[category] : summary;
  const counts = compositionCounts(scope);
  return <div className={styles.composition}>
    <label className={styles.subject}>Promise category
      <select value={category} onChange={event=>setCategory(event.target.value as CategoryId|'')}>
        <option value="">All subjects</option>
        {CATEGORIES.filter(c=>summary.categories[c.id].total>0).map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
    </label>
    <p aria-live="polite">{scope.total} promises in this published record</p>
    {scope.total>0 && <div className={styles.band} aria-label="Promise composition by count">
      {COMPOSITION_GROUPS.map(group=>counts[group]>0 && <Link key={group} data-group={group}
        style={{flexBasis:`${counts[group]/scope.total*100}%`}}
        href={evidenceReceipt(slug,revision,{category:category||undefined,group})}
        aria-label={`${counts[group]} ${GROUP_LABELS[group].toLowerCase()} promises. View evidence`}>
        <span aria-hidden="true">{counts[group]/scope.total>=.12 ? counts[group] : ''}</span>
      </Link>)}
    </div>}
    <div className={styles.legend} aria-label="Promise counts and evidence">
      {COMPOSITION_GROUPS.map(group=>{
        const label=<><i data-group={group}/>{counts[group]} {GROUP_LABELS[group]}</>;
        return counts[group]>0 ? <Link key={group} href={evidenceReceipt(slug,revision,{category:category||undefined,group})}>{label} ↗</Link> : <span key={group}>{label}</span>;
      })}
    </div>
    <p className={styles.note}>Each promise counts once. Select a count to inspect its published evidence.</p>
  </div>;
}
