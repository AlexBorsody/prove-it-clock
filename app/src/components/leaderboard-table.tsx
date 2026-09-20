"use client";

import { useMemo, useState } from "react";
import { ScoreCell } from "./score";

export interface BoardRow {
  slug: string;
  name: string;
  symbol: string;
  category: string;
  reality: number | null;
  potential: number | null;
  execution: number | null;
  reflexivity: number | null;
  confidence: number | null;
  age: number;
  trend: number | null;
  marketCap: number | null;
  development: number | null;
  promiseGap: number | null;
  potentialOutlook: number | null;
  status: string;
}

type Key = keyof BoardRow;

const COLUMNS: { key: Key; label: string; hint?: string }[] = [
  { key: "name", label: "Project" },
  { key: "reality", label: "Reality", hint: "Genuine utility demonstrated today (0–10)" },
  { key: "potential", label: "Potential", hint: "World-impact potential if the thesis succeeds (0–10)" },
  { key: "execution", label: "Execution", hint: "Evidence of movement toward potential (0–10)" },
  { key: "reflexivity", label: "Reflexivity risk", hint: "Dependence on continued speculation (0–10, high = riskier)" },
  { key: "confidence", label: "Confidence", hint: "Evidence confidence (0–100%)" },
  { key: "age", label: "Prove-It age", hint: "Years since launch — not a countdown" },
  { key: "trend", label: "Reality trend", hint: "Change since previous snapshot" },
  { key: "marketCap", label: "Market cap", hint: "For context only — never a score input" },
  { key: "promiseGap", label: "Promise gap", hint: "Potential − Reality" },
  { key: "potentialOutlook", label: "Potential outlook", hint: "Of the unrealized promise, how much current execution supports capturing (0–10). NOT a probability, NOT a price prediction." },
];

function fmtMcap(v: number | null): string {
  if (v == null) return "—";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  return `$${(v / 1e6).toFixed(0)}M`;
}

export default function LeaderboardTable({ rows }: { rows: BoardRow[] }) {
  const [sortKey, setSortKey] = useState<Key>("reality");
  const [dir, setDir] = useState<1 | -1>(-1);

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string") return dir * av.localeCompare(bv as string);
      return dir * ((av as number) - (bv as number));
    });
    return arr;
  }, [rows, sortKey, dir]);

  const toggle = (k: Key) => {
    if (k === sortKey) setDir(dir === 1 ? -1 : 1);
    else {
      setSortKey(k);
      setDir(k === "name" ? 1 : -1);
    }
  };

  return (
    <div className="table-wrap">
      <table className="board">
        <thead>
          <tr>
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                className="sortable"
                title={c.hint}
                onClick={() => toggle(c.key)}
              >
                {c.label}
                {sortKey === c.key && (dir === -1 ? " ▼" : " ▲")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.slug}>
              <td>
                <a href={`/projects/${r.slug}`} className="proj-cell" style={{ textDecoration: "none" }}>
                  <span className="proj-sym">{r.symbol.slice(0, 4)}</span>
                  <span>
                    <span className="proj-name" style={{ color: "var(--text)" }}>{r.name}</span>
                    <br />
                    <span className="proj-cat">{r.category}</span>
                  </span>
                </a>
              </td>
              <td><ScoreCell value={r.reality} /></td>
              <td><ScoreCell value={r.potential} /></td>
              <td><ScoreCell value={r.execution} /></td>
              <td><ScoreCell value={r.reflexivity} scale="risk" /></td>
              <td>
                {r.confidence == null ? (
                  <span className="score-na">—</span>
                ) : (
                  <span className="num" style={{ fontWeight: 700 }}>{r.confidence}%</span>
                )}
              </td>
              <td><span className="num">{r.age.toFixed(1)}y</span></td>
              <td>
                {r.trend == null ? (
                  <span className="score-na">—</span>
                ) : (
                  <span className={r.trend > 0 ? "expl-delta-up" : r.trend < 0 ? "expl-delta-dn" : "expl-delta-flat"}>
                    {r.trend > 0 ? `+${r.trend.toFixed(1)}` : r.trend.toFixed(1)}
                  </span>
                )}
              </td>
              <td><span className="num" style={{ color: "var(--text-dim)" }}>{fmtMcap(r.marketCap)}</span></td>
              <td><ScoreCell value={r.promiseGap} scale="gap" /></td>
              <td><ScoreCell value={r.potentialOutlook} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
