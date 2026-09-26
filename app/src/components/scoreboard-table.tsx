"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import HeartMeter, { CompactHearts } from "@/components/heart-meter";
import { HeartSparkline, type HeartPoint } from "@/components/hearts-timeline";
import ShitcoinMeter from "@/components/shitcoin-meter";
import Icon from "@/components/chrome-icons";
import { GithubMark } from "@/components/icons";
import PromiseRows, { type PromiseBrief } from "@/components/promise-rows";
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
  codeCommits: number | null;
  use: "coming";
  hypeMentions: number | null;
  hypeCollecting: boolean;
  baselineWeeks: number;
  spark: HeartPoint[];
  promises: PromiseBrief[];
}

type SortKey = "rank" | "coin" | "hearts" | "verdict" | "code" | "use" | "hype";

const HEADERS: Array<{ key: SortKey | null; label: string }> = [
  { key: "rank", label: "#" },
  { key: "coin", label: "Coin" },
  { key: "hearts", label: "Hearts" },
  { key: "verdict", label: "Shitcoin warning" },
  { key: "code", label: "Code" },
  { key: "use", label: "Use" },
  { key: "hype", label: "Hype" },
  { key: null, label: "Proof history" },
  { key: null, label: "" },
];

function sortVal(row: ScoreboardRow, key: SortKey): number | string {
  switch (key) {
    case "rank": return row.rank;
    case "coin": return row.name;
    case "hearts": return row.filledPct;
    case "verdict": return row.verdict;
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

function HypeCell({ mentions, collecting }: { mentions: number | null; collecting: boolean }) {
  if (mentions == null) return <span style={{ color: "var(--text-faint)" }}>-</span>;
  return (
    <span>
      {mentions.toLocaleString()}
      {collecting ? <span className="cell-sub">collecting</span> : null}
    </span>
  );
}

export default function ScoreboardTable({ rows }: { rows: ScoreboardRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [dir, setDir] = useState<1 | -1>(1);
  const [expanded, setExpanded] = useState<string | null>(null);

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

  function toggleExpand(slug: string) {
    setExpanded((e) => (e === slug ? null : slug));
  }

  return (
    <div data-tour="hearts">
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
              <Fragment key={r.slug}>
                <tr>
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
                    <button
                      type="button"
                      className="hearts-cell-toggle"
                      onClick={() => toggleExpand(r.slug)}
                      aria-expanded={expanded === r.slug}
                      aria-label={`${expanded === r.slug ? "Hide" : "Show"} promises for ${r.name}`}
                      title="Show what earned these hearts"
                    >
                      <HeartMeter filled={r.earned} capacity={r.capacity} allowance={0} size={16} />
                      {" "}
                      <span className="num">{r.earned} of {r.capacity} potential</span>
                    </button>
                  </td>
                  <td>
                    <Link href={`/projects/${r.slug}#verdict`} aria-label={`${r.name} Shitcoin warning breakdown`} className="gauge-btn">
                      <ShitcoinMeter category={r.verdict} compact />
                    </Link>
                  </td>
                  <td>
                    <Link href="/code" className="cell-link metric-btn" title="See CODE activity ranking">
                      <GithubMark />
                      <CodeWordCell code={r.code} note={r.codeNote} />
                    </Link>
                  </td>
                  <td><span className="word dim">coming</span></td>
                  <td className="num">
                    <Link href="/hype" className="cell-link metric-btn" title="See HYPE ranking">
                      <Icon name="megaphone" size={14} />
                      <HypeCell mentions={r.hypeMentions} collecting={r.hypeCollecting} />
                    </Link>
                  </td>
                  <td>
                    {r.spark.length >= 2 ? (
                      <HeartSparkline points={r.spark} />
                    ) : (
                      <span style={{ color: "var(--text-faint)" }}>-</span>
                    )}
                  </td>
                  <td>
                    <button
                      className={`expand-btn${expanded === r.slug ? " open" : ""}`}
                      onClick={() => toggleExpand(r.slug)}
                      aria-expanded={expanded === r.slug}
                      aria-label={`${expanded === r.slug ? "Hide" : "Show"} promises for ${r.name}`}
                    >
                      {expanded === r.slug ? "▲" : "▼"}
                    </button>
                  </td>
                </tr>
                {expanded === r.slug ? (
                  <tr key={`${r.slug}-promises`} className="expand-row">
                    <td colSpan={9}>
                      <div className="expand-promises">
                        <div className="expand-promises-head">
                          {r.name} promises ({r.promises.length})
                        </div>
                        <PromiseRows slug={r.slug} promises={r.promises} />
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="board-cards">
        {sorted.map((r) => {
          const open = expanded === r.slug;
          return (
            <div key={r.slug} className="mcard">
              <Link href={`/projects/${r.slug}`} className="mcard-head">
                <img
                  src={`/icons/${r.symbol.toLowerCase()}.svg`}
                  alt=""
                  width={30}
                  height={30}
                  className="coin-icon"
                />
                <span className="mcard-name">{r.name}</span>
                <span className="mcard-ticker num">{r.symbol}</span>
              </Link>
              <div className="mcard-hearts">
                <button
                  type="button"
                  className="mcard-hearts-toggle"
                  onClick={() => toggleExpand(r.slug)}
                  aria-expanded={open}
                  aria-label={`${open ? "Hide" : "Show"} promises for ${r.name}`}
                  title="Show what earned these hearts"
                >
                  <CompactHearts earned={r.earned} capacity={r.capacity} />
                  <span className="num mcard-count">{r.earned}/{r.capacity}</span>
                </button>
                <Link className="mcard-gauge gauge-btn" href={`/projects/${r.slug}#verdict`} aria-label={`${r.name} Shitcoin warning breakdown`}>
                  <ShitcoinMeter category={r.verdict} compact size={32} />
                </Link>
              </div>
              <div className="mcard-stats">
                <Link href="/code" className="mcard-stat metric-btn">
                  <GithubMark />
                  {r.codeNote ? r.codeNote : `CODE ${r.code}`}
                  {r.codeNote || r.codeCommits == null ? null : ` · ${r.codeCommits.toLocaleString()} commits`}
                </Link>
                <Link href="/hype" className="mcard-stat metric-btn num">
                  <Icon name="megaphone" size={14} />
                  HYPE · {r.hypeMentions == null ? "-" : `${r.hypeMentions.toLocaleString()} mentions`}
                </Link>
              </div>
              <button
                className={`mcard-promises-toggle${open ? " open" : ""}`}
                onClick={() => toggleExpand(r.slug)}
                aria-expanded={open}
              >
                Promises · {r.promises.length} {open ? "▲" : "▼"}
              </button>
              {open ? (
                <div className="mcard-promises">
                  <PromiseRows slug={r.slug} promises={r.promises} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
