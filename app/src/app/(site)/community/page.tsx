import Link from 'next/link';
import CommunityForm from '@/components/community-form';
import CommunityEntry from '@/components/community-entry';
import { contributionProjects, readCommunity } from '@/lib/community/data';
import { CONTRIBUTION_KINDS, type ContributionKind } from '@/lib/community/input';
import styles from '@/components/community.module.css';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Bring the receipts | Bubble or Build',
  description: 'Submit a public promise, add delivery evidence, or challenge an assessment. Help build a sourced record of what crypto projects actually delivered.',
};
export default async function CommunityPage({ searchParams }: {
  searchParams: Promise<{ project?: string; promise?: string; kind?: string; page?: string }>;
}) {
  const query = await searchParams;
  const page = typeof query.page === 'string' && /^\d{1,4}$/.test(query.page) ? Number(query.page) : 0;
  const [board, projects] = await Promise.all([readCommunity(page), contributionProjects().catch(() => null)]);
  const selectedProject = projects?.find(p => p.slug === query.project);
  const selectedPromise = selectedProject?.promises.find(p => p.lineage === query.promise);
  const kind = CONTRIBUTION_KINDS.includes(query.kind as ContributionKind) ? query.kind as ContributionKind : 'promise';
  return <div className={styles.page}>
    <header className={styles.hero}><p className={styles.eyebrow}>Community contributions</p>
      <h1>Bring the receipts.</h1>
      <p>Found a public promise? Evidence of delivery? Something our assessment missed? Help build the record, one source at a time.</p>
    </header>
    <div className={styles.columns}>
      <div>{projects === null && <p className={styles.notice}>Existing promises could not be loaded. You can still submit a new promise with its project name and source.</p>}
        <CommunityForm projects={projects ?? []} available={board.available} initialProject={selectedProject?.slug}
          initialLineage={selectedPromise?.lineage} initialKind={projects === null ? 'promise' : kind} />
      </div>
      <aside className={styles.guide}>
        <h2>How your contribution helps</h2>
        <ol><li><strong>Start with a public source.</strong> Link the original roadmap, announcement, release, data or other checkable evidence.</li>
          <li><strong>Show what can be checked.</strong> Keep the claim's wording, scope and conditions. Explain what the source supports or contradicts.</li>
          <li><strong>Follow the review.</strong> Save your receipt. Accepted sources appear below; any change to a promise outcome goes through the published assessment process.</li></ol>
        <p className={styles.muted}>A project announcement is a claim. Votes and popularity do not establish delivery. Missing evidence stays missing.</p>
      </aside>
    </div>
    <section className={styles.board} aria-labelledby="reviewed-contributions">
      <h2 id="reviewed-contributions">Reviewed community sources</h2>
      <p className={styles.muted}>Accepted contributions and their review notes. These are sources for investigation, not automatic delivery verdicts.</p>
      {!board.available ? <p>The contribution board is temporarily unavailable.</p> : !board.entries.length ? <p>No reviewed sources here yet. Submit the first promise you want checked.</p> :
        <div className={styles.entries}>{board.entries.map(entry => <CommunityEntry key={entry.id} entry={entry} />)}</div>}
      {board.available && <nav className={styles.actions} aria-label="Community pages">
        {page > 0 && <Link href={page === 1 ? '/community' : `/community?page=${page - 1}`}>Newer sources</Link>}
        {board.more && <Link href={`/community?page=${page + 1}`}>Older sources</Link>}
      </nav>}
    </section>
  </div>;
}
