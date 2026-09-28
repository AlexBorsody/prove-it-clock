import Link from 'next/link';
import { CATEGORIES, type CategoryId } from '../../data/atlas-taxonomy';
import { deliveryReceipt, type DeliverySummary } from '@/lib/promise-verdict';
import HeartMeter from './heart-meter';
import styles from './expandable-heart-meter.module.css';

// Categorical hues, not outcome grades. Outcome remains the filled/empty heart.
const COLORS: Record<CategoryId, string> = {
  money: '#91b5ff', payments: '#c4a2ff', platform: '#88c9ed', defi: '#d8b0df',
  privacy: '#b9b3ef', interoperability: '#a8c1dd', governance: '#d9bc9c',
  'real-world': '#bebee9', unclassified: '#a6adbb',
};

export default function ExpandableHeartMeter({slug, name, filled, capacity, summary, size = 22}: {
  slug: string; name: string; filled: number; capacity: number;
  summary: DeliverySummary | null; size?: number;
}) {
  if (!Number.isFinite(filled) || !Number.isFinite(capacity)) return <p className={styles.note}>Published hearts unavailable.</p>;
  const categories = summary ? CATEGORIES.filter(category => summary.categories[category.id].total > 0) : [];
  return <details className={styles.root}>
    <summary className={styles.toggle} aria-label={`${name}: ${filled} of ${capacity} hearts earned. Heart inventory by category`}>
      <HeartMeter filled={filled} capacity={capacity} size={size}/>
      <span className={styles.hint}>By category <span className={styles.chevron} aria-hidden="true">⌄</span></span>
    </summary>
    <div className={styles.body}>
      {summary ? <>
        <p className={styles.note}>Same promises, grouped by subject.</p>
        {categories.length ? <ul className={styles.categories}>
          {categories.map(category => {
            const counts = summary.categories[category.id];
            return <li key={category.id}>
              <Link href={deliveryReceipt(slug, category.id)} className={styles.category}
                aria-label={`${category.label}: ${counts.kept} of ${counts.total} hearts earned${counts.states.unknown ? `, ${counts.states.unknown} unknown` : ''}. View promises on the Atlas`}>
                <span className={styles.label}>{category.label} <span aria-hidden="true">↗</span></span>
                <HeartMeter filled={counts.kept} capacity={counts.total} size={Math.min(size, 20)} color={COLORS[category.id]}/>
              </Link>
            </li>;
          })}
        </ul> : <p className={styles.note}>No categorized promises available.</p>}
      </> : <p className={styles.note}>Category breakdown unavailable.</p>}
    </div>
  </details>;
}
