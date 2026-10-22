import Link from 'next/link';
import { notFound } from 'next/navigation';
import { UUID } from '@/lib/feedback/security';
import { readContributionReceipt } from '@/lib/community/data';
import CommunityEntry from '@/components/community-entry';
import styles from '@/components/community.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contribution receipt | Bubble or Build', robots: { index: false, follow: false } };
export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  let entry;
  try { entry = await readContributionReceipt(id); }
  catch { return <section className={styles.page}><h1>Receipt temporarily unavailable</h1><p>Your submission may still be saved. Keep this link and try again later.</p></section>; }
  if (!entry) notFound();
  return <div className={styles.page}>
    <header className={styles.hero}><p className={styles.eyebrow}>Contribution receipt</p><h1>Follow your source.</h1>
      <p>Keep this link to check the review result. Anyone with this link can view this submission. Pending submissions do not appear on the public board.</p></header>
    <CommunityEntry entry={entry} />
    <div className={styles.actions}><Link href="/community">Back to community contributions</Link></div>
  </div>;
}
