import Link from "next/link";
import { promiseCounts, type TrackedPromise } from "@/lib/promise-context";
import { searchMeta } from "@/lib/search-sections";
import styles from "./promise-context.module.css";

function date(value?: string | null) {
  return value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }) : "Not recorded";
}

export default function PromiseStats({ slug, name, promises, earned, methodology, asOf, researchAt, available = true }: {
  slug: string; name: string; promises: TrackedPromise[]; earned: number; methodology: string;
  asOf: string; researchAt?: string | null; available?: boolean;
}) {
  const counts = promiseCounts(promises);
  const rows = [
    { label: "Earned hearts", value: earned, tone: "earned" },
    { label: "Open hearts", value: counts.open + counts.active, tone: "open" },
    { label: "Lapsed hearts", value: counts.lapsed, tone: "lapsed" },
    ...(counts.retired ? [{ label: "Retired hearts", value: counts.retired, tone: "retired" }] : []),
    ...(counts.unknown ? [{ label: "Unknown state", value: counts.unknown, tone: "open" }] : []),
    { label: "Promises tracked", value: promises.length, tone: "" },
  ];
  const version = methodology.match(/\bv\d+(?:\.\d+)*\b/i)?.[0] ?? methodology;
  return <section className={`panel promise-stats-section search-section ${styles.stats}`} {...searchMeta({ id: `project-${slug}-stats`, title: `${name} promise stats`, kind: "Promises", project: slug, keywords: "earned open lapsed retired hearts methodology research" })}>
    <h2>Promise stats</h2>
    <p className={styles.sub}>One promise. One heart. Earned by delivery.</p>
    <dl className={styles.facts}>
      {rows.map(row => <div key={row.label}><dt>{row.label}</dt><dd className={styles[row.tone]}>{available ? row.value : "Unavailable"}</dd></div>)}
      <div><dt>Methodology</dt><dd><Link href="/methodology" title={methodology}>{version || "Not recorded"}</Link></dd></div>
      <div><dt>Last research</dt><dd>{date(researchAt)}</dd></div>
      <div><dt>Assessment as of</dt><dd>{date(asOf)}</dd></div>
    </dl>
    <p className={styles.note}>Open hearts are still unearned. Retired promises were withdrawn. News matches never change these counts.</p>
    <Link className={styles.textLink} href={`#project-${slug}-promises`}>Inspect the promises ↗</Link>
  </section>;
}
