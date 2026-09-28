"use client";

import { useState } from "react";
import CodeRow, { type CodeRowData } from "@/components/code-row";
import HypeExplorer from "@/components/hype-explorer";
import { SOCIAL_SOURCES } from "@/lib/social";
import { searchMeta } from "@/lib/search-sections";
import styles from "./overview-context.module.css";

export interface OverviewContextRecord {
  code: CodeRowData;
  hypeMentions: number | null;
  hypeCollecting: boolean;
  marketCap: number | null;
}

const compact = new Intl.NumberFormat("en", { notation: "compact" });
const number = (value: number | null) => value == null ? "Unavailable" : compact.format(value);

/** Existing project context, with no cross-project aggregation or extra fetch on mount. */
export default function OverviewContext({ records }: { records: OverviewContextRecord[] }) {
  const [slug, setSlug] = useState(records[0]?.code.slug ?? "");
  const [open, setOpen] = useState(false);
  const selected = records.find(record => record.code.slug === slug) ?? records[0];
  if (!selected) return null;
  const { code } = selected;
  return <section className={`panel ${styles.context}`} {...searchMeta({ id: "overview-context", title: "Supporting context", kind: "Context", keywords: "code hype market cap" })}>
    <div className={styles.header}>
      <h2>Supporting context</h2>
      <label><span className="sr-only">Project</span><select value={code.slug} onChange={event => setSlug(event.target.value)}>
        {records.map(({ code: project }) => <option key={project.slug} value={project.slug}>{project.name}</option>)}
      </select></label>
    </div>
    <dl className={styles.stats}>
      <div><dt>Stars</dt><dd>{number(code.stars)}</dd></div>
      <div><dt>Commits / 90d</dt><dd>{number(code.commits90d)}</dd></div>
      <div><dt>Hype</dt><dd>{number(selected.hypeMentions)}</dd>{selected.hypeMentions != null && <span>{selected.hypeCollecting ? "collecting" : "mentions / 7d"}</span>}</div>
      <div><dt>Market cap</dt><dd>{selected.marketCap == null ? "Unavailable" : `$${compact.format(selected.marketCap)}`}</dd></div>
    </dl>
    <details className={styles.details} onToggle={event => setOpen(event.currentTarget.open)}>
      <summary>Code / Hype</summary>
      {open && <div key={code.slug}>
        <CodeRow row={code} showWatchers search={{ id: `overview-code-${code.slug}`, title: `${code.name} Code` }} />
        {Object.hasOwn(SOCIAL_SOURCES, code.slug) && <HypeExplorer projectSlug={code.slug} projectName={code.name} />}
      </div>}
    </details>
  </section>;
}
