import Link from 'next/link';
import { STATUS_LABELS } from '@/lib/community/input';
import type { Contribution } from '@/lib/community/data';
import styles from './community.module.css';

export default function CommunityEntry({ entry }: { entry: Contribution }) {
  const context = new URLSearchParams({ project: entry.project_slug, promise: entry.lineage, kind: 'challenge' });
  return <article className={styles.entry}>
    <div className={styles.entryHeader}><span className={styles.eyebrow}>{entry.kind === 'promise' ? 'Submitted promise' : entry.kind === 'evidence' ? 'Community evidence' : 'Assessment challenge'}</span>
      <span className={styles.status}>{STATUS_LABELS[entry.status] ?? 'Awaiting review'}</span></div>
    <h3>{entry.project_name}</h3>
    <blockquote className={styles.claim}>{entry.claim}</blockquote>
    <p>{entry.detail}</p>
    <p><a href={entry.source_url} target="_blank" rel="noopener noreferrer nofollow ugc">Open submitted source ↗</a>
      {entry.source_date && <span className={styles.muted}> · Source dated {entry.source_date}</span>}</p>
    {entry.deadline && <p><strong>Stated deadline:</strong> {entry.deadline}</p>}
    {entry.review_note && <p><strong>Review note:</strong> {entry.review_note}</p>}
    <p className={styles.muted}>Submitted {new Date(entry.created_at).toLocaleDateString('en-US', { dateStyle: 'medium', timeZone: 'UTC' })}.
      {' '}{entry.status === 'accepted' ? 'Source review does not by itself change the published promise outcome.' : 'This submission has not been accepted into the public contribution board.'}</p>
    {entry.project_slug && <div className={styles.actions}>
      <Link href={`/projects/${encodeURIComponent(entry.project_slug)}`}>View project record</Link>
      {entry.lineage && <Link href={`/community?${context}`}>Add another source or challenge</Link>}
    </div>}
  </article>;
}
