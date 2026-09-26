"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import CodeRow, { type CodeRowData } from "@/components/code-row";
import { parseCodeSort, sortCodeRows } from "@/lib/code-ranking";
import { searchMeta } from "@/lib/search-sections";

const CodeResults = createContext<{ publish: (row: CodeRowData) => void; ready: boolean }>({publish:()=>{},ready:false});
/** Stream real HTML immediately, then hand sorting to the hydrated parent. */
export function CodeRowResult({ row }: { row: CodeRowData }) {
  const {publish,ready} = useContext(CodeResults);
  useEffect(() => publish(row), [row, publish]);
  return ready ? null : <CodeRow row={row} showWatchers search={{id:`code-project-${row.slug}`,title:`${row.name} CODE activity`}}/>;
}
export default function CodeRanking({ rows, children }: { rows: CodeRowData[]; children?: ReactNode }) {
  const searchParams = useSearchParams();
  const sort = parseCodeSort(searchParams.get("sort"));
  const [results, setResults] = useState<Record<string, CodeRowData>>({});
  const publish = useCallback((row: CodeRowData) => setResults(previous => ({ ...previous, [row.slug]: row })), []);
  const sorted = sortCodeRows(rows.map(row => results[row.slug] ?? row), sort);
  const pending = children ? rows.filter(row => !results[row.slug]).length : 0;
  const ready = pending === 0;

  return <CodeResults.Provider value={{publish,ready}}>
    {rows.length > 0 && <div className="panel search-section" {...searchMeta({ id: "code-ranking", title: "CODE ranking", kind: "CODE", keywords: "development GitHub commits watchers" })}>
      {pending > 0 && <p role="status">Loading GitHub data for {pending} projects. Ranking appears when results finish.</p>}
      <div className="code-rows">
        {children}
        {ready && sorted.map((row, i) => <CodeRow key={row.slug} row={row} rank={i+1} showWatchers activeSort={sort} search={{id:`code-project-${row.slug}`,title:`${row.name} CODE activity`}}/>)}
      </div>
    </div>}
  </CodeResults.Provider>;
}
