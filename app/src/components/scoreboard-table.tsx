"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import HeartMeter from "@/components/heart-meter";
import { HeartSparkline, type HeartPoint } from "@/components/hearts-timeline";
import VerdictBadge, { VERDICT_SEVERITY } from "@/components/verdict-badge";
import type { VerdictCategory } from "@/lib/verdict";
import type { CodeWord } from "@/lib/heart-data";

export interface ScoreboardRow {
  slug: string;
  name: string;
  symbol: string;
  rank: number;
  earned: number;
  capacity: number;
  filledPct: number;
  verdict: VerdictCategory;
  code: CodeWord;
  /** Honest CODE failure text ("Couldn't reach GitHub" / "No commit data"), or null when fine. */
  codeNote: string | null;
  use: "coming";
  hypeMentions: number | null;
  hypeCollecting: boolean;
  baselineWeeks: number;
  spark: HeartPoint[];
}

type SortKey = "rank" | "coin" | "hearts" | "verdict" | "code" | "use" | "hype";

const HEADERS: Array<{ key: SortKey | null; label: string }> = [
  { key: "rank", label: "#" },
  { key: "coin", label: "Coin" },
  { key: "hearts", label: "Hearts" },
  { key: "verdict", label: "Verdict" },
  { key: "code", label: "Code" },
  { key: "use", label: "Use" },
  { key: "hype", label: "Hype" },
  { key: null, label: "Last 90 days" },
];

function sortVal(row: ScoreboardRow, key: SortKey): number | string {
  switch (key) {
    case "rank": return row.rank;
    case "coin": return row.name;
    case "hearts": return row.filledPct;
    case "verdict": return VERDICT_SEVERITY[row.verdict];
    case "code": return row.code === "Active" ? 0 : row.code === "Quiet" ? 1 : 2;
    case "use": return 0; // every row is "coming" until USE metrics exist
    case "hype": return row.hypeMentions ?? -1;
  }
}

function CodeWordCell({ code, note }: { code: CodeWord; note?: string | null }) {
  if (note) return <span className="word dim">{note}</span>;
  if (code === "Active") return <span className="word good">Active</span>;
  if (code === "Quiet") return <span className="word dim">Quiet</span>;
  return <span className="word dim">-</span>;
}

export default function ScoreboardTable({ rows }: { rows: ScoreboardRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [dir, setDir] = useState<1 | -1>(1);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = sortVal(a, sortKey);
      const vb = sortVal(b, sortKey);
      const cmp = typeof va === "string" ? va.localeCompare(vb as string) : va - (vb as number);
      return cmp * dir;
    });
    return copy;
  }, [rows, sortKey, dir]);

  function toggle(key: SortKey) {
    if (key === sortKey) setDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(key); setDir(1); }
  }

  return (
    <>
      <p className="explain">
        Hearts are earned by keeping promises. More hearts filled means more promises kept.
      </p>
      <div className="table-wrap board-desktop">
        <table className="board">
          <thead>
            <tr>
              {HEADERS.map((h, i) => (
                <th
                  key={i}
                  className={h.key ? "sortable" : undefined}
                  onClick={h.key ? () => toggle(h.key as SortKey) : undefined}
                  aria-sort={h.key === sortKey ? (dir === 1 ? "ascending" : "descending") : undefined}
                >
                  {h.label}
                  {h.key === sortKey ? (dir === 1 ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.slug}>
                <td className="num" style={{ color: "var(--text-faint)" }}>{r.rank}</td>
                <td>
                  <Link href={`/projects/${r.slug}`} className="proj-cell" style={{ fontWeight: 400 }}>
                    <img
                      src={`/icons/${r.symbol.toLowerCase()}.svg`}
                      alt=""
                      width={30}
                      height={30}
                      className="coin-icon"
                    />
                    <span>
                      <span className="proj-name" style={{ color: "var(--text)" }}>{r.name}</span>
                      <br />
                      <span className="proj-cat num">{r.symbol}</span>
                    </span>
                  </Link>
                </td>
                <td>
                  <HeartMeter filled={r.earned} capacity={r.capacity} allowance={0} size={16} />
                  {" "}
                  <span className="num">{r.earned} of {r.capacity} potential</span>
                </td>
                <td><VerdictBadge category={r.verdict} compact /></td>
                <td><CodeWordCell code={r.code} note={r.codeNote} /></td>
                <td><span className="word dim">coming</span></td>
                <td className="num">
                  {r.hypeMentions == null ? (
                    <span style={{ color: "var(--text-faint)" }}>-</span>
                  ) : (
                    <span>
                      {r.hypeMentions.toLocaleString()}
                      {r.hypeCollecting ? (
                        <span className="cell-sub">collecting</span>
                      ) : null}
                    </span>
                  )}
                </td>
                <td>
                  {r.spark.length >= 2 ? (
                    <HeartSparkline points={r.spark} />
                  ) : (
                    <span style={{ color: "var(--text-faint)" }}>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="board-cards">
        {sorted.map((r) => (
          <Link key={r.slug} href={`/projects/${r.slug}`} className="board-card">
            <span className="board-card-row board-card-head">
              <span className="board-card-rank num">{r.rank}</span>
              <img
                src={`/icons/${r.symbol.toLowerCase()}.svg`}
                alt=""
                width={28}
                height={28}
                className="coin-icon"
              />
              <span className="board-card-name">{r.name}</span>
              <span className="board-card-symbol num">{r.symbol}</span>
            </span>
            <span className="board-card-row board-card-hearts">
              <HeartMeter filled={r.earned} capacity={r.capacity} allowance={0} size={18} />
              <span className="num">{r.earned} of {r.capacity} potential hearts</span>
            </span>
            <span className="board-card-row board-card-meta">
              <VerdictBadge category={r.verdict} compact />
              <CodeWordCell code={r.code} note={r.codeNote} />
              <span className="num">
                {r.hypeMentions == null ? (
                  <span style={{ color: "var(--text-faint)" }}>-</span>
                ) : (
                  r.hypeMentions.toLocaleString()
                )}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
