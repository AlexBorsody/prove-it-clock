"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CodeRow, { type CodeRowData } from "@/components/code-row";
import { CODE_SORTS, CODE_SORT_LABELS, parseCodeSort, sortCodeRows } from "@/lib/code-ranking";
import { searchMeta } from "@/lib/search-sections";

export default function CodeRanking({ rows }: { rows: CodeRowData[] }) {
  const searchParams = useSearchParams();
  const urlSort = parseCodeSort(searchParams.get("sort"));
  const [sort, setSort] = useState(urlSort);
  // Apply selection immediately; URL synchronization also supports Back/Forward.
  useEffect(() => setSort(urlSort), [urlSort]);
  const sorted = sortCodeRows(rows, sort);

  return <>
    <form action="/code" method="get" className="code-sort-control">
      <label htmlFor="code-sort">Sort by</label>
      <select id="code-sort" name="sort" value={sort} onChange={event => {
        const next = parseCodeSort(event.target.value);
        setSort(next);
        const url = new URL(window.location.href);
        if (next === "stars") url.searchParams.delete("sort");
        else url.searchParams.set("sort", next);
        window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
      }}>
        {CODE_SORTS.map(key => <option key={key} value={key}>{CODE_SORT_LABELS[key]} — highest first</option>)}
      </select>
      <noscript><button type="submit">Sort</button></noscript>
    </form>
    {rows.length > 0 && <div className="panel search-section" data-tour="code" {...searchMeta({ id: "code-ranking", title: "CODE ranking", kind: "CODE", keywords: "development GitHub commits watchers" })}>
      <p className="explain" style={{ marginTop: 0 }} aria-live="polite">
        Ranked by {CODE_SORT_LABELS[sort].toLowerCase()}{sort === "commits" ? " over 90 days" : ""}, highest first. Missing data appears last.
      </p>
      <div className="code-rows">{sorted.map((row, i) => <CodeRow key={row.slug} row={row} rank={i + 1} showWatchers activeSort={sort} search={{ id: `code-project-${row.slug}`, title: `${row.name} CODE activity` }} />)}</div>
    </div>}
  </>;
}
