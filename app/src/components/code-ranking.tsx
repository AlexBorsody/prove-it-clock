"use client";

import { useSearchParams } from "next/navigation";
import CodeRow, { type CodeRowData } from "@/components/code-row";
import { CODE_SORTS, CODE_SORT_LABELS, parseCodeSort, sortCodeRows } from "@/lib/code-ranking";
import { searchMeta } from "@/lib/search-sections";

export default function CodeRanking({ rows }: { rows: CodeRowData[] }) {
  const searchParams = useSearchParams();
  const sort = parseCodeSort(searchParams.get("sort"));
  const sorted = sortCodeRows(rows, sort);
  return <>
    <div className="code-sort-heading"><span>Sort by</span><span>Highest first</span></div>
    <nav className="sort-seg" aria-label="Sort CODE ranking">
      {CODE_SORTS.map(key => {
        const href = key === "stars" ? "/code" : `/code?sort=${key}`;
        return <a key={key} href={href} className={sort === key ? "active" : undefined}
          aria-current={sort === key ? "true" : undefined}
          onClick={event => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            if (sort !== key) window.history.pushState(null, "", href);
          }}>
          {CODE_SORT_LABELS[key]}{sort === key && <span aria-hidden="true"> ↓</span>}
        </a>;
      })}
    </nav>
    {rows.length > 0 && <div className="panel search-section" data-tour="code" {...searchMeta({ id: "code-ranking", title: "CODE ranking", kind: "CODE", keywords: "development GitHub commits watchers" })}>
      <p className="explain" style={{ marginTop: 0 }} aria-live="polite">
        Ranked by {CODE_SORT_LABELS[sort].toLowerCase()}{sort === "commits" ? " over 90 days" : ""}, highest first. Missing data appears last.
      </p>
      <div className="code-rows">{sorted.map((row, i) => <CodeRow key={row.slug} row={row} rank={i + 1} showWatchers search={{ id: `code-project-${row.slug}`, title: `${row.name} CODE activity` }} />)}</div>
    </div>}
  </>;
}
