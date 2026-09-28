'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, type CategoryId } from '../../data/atlas-taxonomy';
import { COMPOSITION_GROUPS, GROUP_LABELS, compositionCounts, evidenceReceipt, type ReceiptRevision } from '@/lib/promise-receipts';
import type { DeliverySummary } from '@/lib/promise-verdict';
import InfoTip from "@/components/info-tip";
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
    {/* Composition band meter removed 2026-09-27 per Alex: it was added without approval. Do not re-add a meter here. */}
    <div className={styles.legend} aria-label="Promise counts and evidence">
      {COMPOSITION_GROUPS.map(group=>{
        const label=<><i data-group={group}/>{counts[group]} {GROUP_LABELS[group]}</>;
        return counts[group]>0 ? <Link key={group} href={evidenceReceipt(slug,revision,{category:category||undefined,group})}>{label} ↗</Link> : <span key={group}>{label}</span>;
      })}
      <InfoTip text="Each promise counts once. Select a count to inspect its published evidence." />
    </div>
  </div>;
}
