import Link from "next/link";
import { promiseCounts, promiseFilterHref, type PromiseFilter, type TrackedPromise } from "@/lib/promise-context";
import { searchMeta } from "@/lib/search-sections";
import styles from "./promise-context.module.css";

function date(value?: string | null) {
  return value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }) : "Not recorded";
}

export default function PromiseStats({ slug, name, promises, earned, methodology, asOf, researchAt, available = true, bare = false }: {
  slug: string; name: string; promises: TrackedPromise[]; earned: number; methodology: string;
  asOf: string; researchAt?: string | null; available?: boolean;
  /** Bare: render the facts without the panel wrapper, heading explainer, or
   *  note, for embedding inside a consolidated section. The explainer lines
   *  live in that section's help expander instead. */
  bare?: boolean;
}) {
  const counts = promiseCounts(promises);
  const rows: { label: string; value: number; tone: string; filter: PromiseFilter }[] = [
    { label: "Earned hearts", value: earned, tone: "earned", filter: "kept" },
    { label: "Open hearts", value: counts.open + counts.active, tone: "open", filter: "open" },
    { label: "Lapsed hearts", value: counts.lapsed, tone: "lapsed", filter: "lapsed" },
    ...(counts.retired ? [{ label: "Retired hearts", value: counts.retired, tone: "retired", filter: "retired" as const }] : []),
    ...(counts.unknown ? [{ label: "Unknown state", value: counts.unknown, tone: "open", filter: "unknown" as const }] : []),
    { label: "Promises tracked", value: promises.length, tone: "total", filter: "all" },
  ];
  const version = methodology.match(/\bv\d+(?:\.\d+)*\b/i)?.[0] ?? methodology;
  const facts = <>
    <dl className={styles.facts}>
      {rows.map(row => <div key={row.label}><dt>{row.label}</dt><dd className={styles[row.tone]}>{available ? <Link className={styles.metricLink} href={promiseFilterHref(slug, row.filter)} aria-label={`${row.label}: ${row.value}. View promise evidence`}>{row.value} ↗</Link> : "Unavailable"}</dd></div>)}
      <div><dt>Methodology</dt><dd><Link href="/methodology" title={methodology}>{version || "Not recorded"}</Link></dd></div>
      <div><dt>Last research</dt><dd>{date(researchAt)}</dd></div>
      <div><dt>Assessment as of</dt><dd>{date(asOf)}</dd></div>
    </dl>
  </>;
  if (bare) {
    return <div className={`promise-stats-bare search-section ${styles.stats}`} {...searchMeta({ id: `project-${slug}-stats`, title: `${name} promise stats`, kind: "Promises", project: slug, keywords: "earned open lapsed retired hearts methodology research" })}>
      <h3 className="promise-subhead">Promise stats</h3>
      {facts}
    </div>;
  }
  return <section className={`panel promise-stats-section search-section ${styles.stats}`} {...searchMeta({ id: `project-${slug}-stats`, title: `${name} promise stats`, kind: "Promises", project: slug, keywords: "earned open lapsed retired hearts methodology research" })}>
    <h2>Promise stats</h2>
    <p className={styles.sub}>One promise. One heart. Earned by delivery.</p>
    {facts}
    <p className={styles.note}>Open hearts are still unearned. Retired promises were withdrawn. News matches never change these counts.</p>
  </section>;
}
