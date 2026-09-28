import Link from 'next/link';
import SupportFeedback from '@/components/support-feedback';
import { readFeedbackBoard } from '@/lib/feedback/data';
import styles from '@/components/support-feedback.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Ideas | Prove Value' };
export default async function SupportPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const query = await searchParams;
  const page = typeof query.page === 'string' && /^\d{1,4}$/.test(query.page) ? Number(query.page) : 0;
  const board = await readFeedbackBoard(page);
  return <div className={styles.page}>
    <h1>Help shape Prove Value</h1>
    <p className={styles.intro}>Got an idea? Post it. See what others want to build.</p>
    <SupportFeedback requests={board.requests} available={board.available} />
    {board.available && <nav className={styles.pagination} aria-label="More ideas">
      {page > 0 && <Link href={page === 1 ? '/support' : `/support?page=${page - 1}`}>Newer ideas</Link>}
      {board.more && <Link href={`/support?page=${page + 1}`}>Older ideas</Link>}
    </nav>}
  </div>;
}
