import Link from 'next/link';
import { matchesPromiseFilter, promiseDisplay, promiseEvidenceHref } from '@/lib/promise-context';
import { searchMeta } from '@/lib/search-sections';
import styles from './documented-problems.module.css';

interface ProblemRecord { lineage: string; criteria?: string; state: string; rationale?: string }

/** An index of published records, without a project-level rating or inferred event date. */
export default function DocumentedProblems({slug,name,promises,asOf,available}:{
  slug:string;name:string;promises:ProblemRecord[];asOf?:string;available:boolean;
}) {
  const problems=promises.filter(pr=>matchesPromiseFilter(pr.state,'failed'));
  return <section className={`search-section ${styles.section}`} data-tour="problems" {...searchMeta({
    id:`project-${slug}-problems`,title:`${name} documented problems`,kind:'Evidence',project:slug,keywords:'lapsed retired assessments sources',
  })}>
    <span id="verdict" aria-hidden="true" />
    <details>
      <summary>Documented problems{available ? ` · ${problems.length}` : ''}</summary>
      {!available ? <p>The published assessment is unavailable.</p> : <>
        {asOf && <p className={styles.date}>Assessment as of <time dateTime={asOf}>{asOf.slice(0,10)}</time></p>}
        {problems.length ? <ul className={styles.list}>{problems.map(pr=><li key={pr.lineage}>
          <Link href={promiseEvidenceHref(slug,pr.lineage)}>{pr.criteria ?? pr.lineage} ↗</Link>
          <p className={styles.state}>{promiseDisplay(pr).label}</p>
          {pr.rationale && <p>{pr.rationale}</p>}
        </li>)}</ul> : <p>No promises are marked lapsed or retired in this published assessment.</p>}
      </>}
    </details>
  </section>;
}
