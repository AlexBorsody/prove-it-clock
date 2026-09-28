"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORIES } from "../../data/atlas-taxonomy";
import { deliveryReceipt, type DeliverySummary } from "@/lib/promise-verdict";
import { projectFlags } from "@/lib/project-policy";
import { BOARD_SORTS, BOARD_SORT_LABELS, parseBoardSort, sortScoreboard, type BoardSort } from "@/lib/scoreboard-ranking";
import styles from "./scoreboard-table.module.css";
import HeartMeter from "@/components/heart-meter";
import ViewToggle, { type BoardView } from "@/components/view-toggle";
import CompareTable, { type CompareProject } from "@/components/compare-table";
import CompareMode, { CompareCheckbox, useCompareSelection } from "@/components/compare-mode";
import Icon from "@/components/chrome-icons";
import { GithubMark } from "@/components/icons";
import PromiseRows, { type PromiseBrief } from "@/components/promise-rows";
import type { CodeWord } from "@/lib/heart-data";
import { searchMeta } from "@/lib/search-sections";

export interface ScoreboardRow {
  slug: string;
  name: string;
  symbol: string;
  rank: number;
  earned: number;
  capacity: number;
  filledPct: number;
  code: CodeWord;
  /** Honest CODE failure text ("Couldn't reach GitHub" / "No commit data"), or null when fine. */
  codeNote: string | null;
  codeCommits: number | null;
  codeStars: number | null;
  marketCap: number | null;
  delivery: DeliverySummary | null;
  use: "coming";
  hypeMentions: number | null;
  hypeCollecting: boolean;
  baselineWeeks: number;
  promises: PromiseBrief[];
}

const HEADERS: Array<{ key: BoardSort | null; label: string }> = [
  { key: "rank", label: "#" },
  { key: "coin", label: "Coin" },
  { key: "hearts", label: "Hearts" },
  { key: "commits", label: "Code" },
  { key: null, label: "Usage" },
  { key: "hype", label: "Hype" },
  { key: "market-cap", label: "Market cap" },
];

function CodeWordCell({ code, note }: { code: CodeWord; note?: string | null }) {
  if (note) return <span className="word dim">{note}</span>;
  if (code === "Active") return null;
  if (code === "Quiet") return <span className="word dim">Quiet</span>;
  return <span className="word dim">-</span>;
}

const compactNum = new Intl.NumberFormat("en", { notation: "compact" });

/** Homepage CODE sub-line: stars plus 90-day commits, omitting unknowns. */
function codeSub(row: ScoreboardRow): string | null {
  const parts: string[] = [];
  if (row.codeStars != null) parts.push(`★ ${compactNum.format(row.codeStars)}`);
  if (row.codeCommits != null) parts.push(`${row.codeCommits.toLocaleString()} commits / 90d`);
  return parts.length ? parts.join(" · ") : null;
}

function HypeCell({ mentions, collecting }: { mentions: number | null; collecting: boolean }) {
  if (mentions == null) return <span style={{ color: "var(--text-faint)" }}>-</span>;
  return (
    <span>
      {mentions.toLocaleString()}
      <span className="cell-sub">{collecting ? "collecting" : "mentions / 7d"}</span>
    </span>
  );
}

const BOARD_VIEW_KEY = "pv-board-view";

function defaultBoardView(): BoardView {
  if (typeof window === "undefined") return "list";
  try {
    const saved = window.localStorage.getItem(BOARD_VIEW_KEY);
    if (saved === "cards" || saved === "list") return saved;
  } catch {}
  return window.matchMedia("(max-width: 640px)").matches ? "cards" : "list";
}

export default function ScoreboardTable({ rows, compareProjects = [] }: { rows: ScoreboardRow[]; asOf?: string; compareProjects?: CompareProject[] }) {
  const params = useSearchParams();
  const sortKey = parseBoardSort(params.get("sort"));
  const headers = HEADERS.filter(header => header.key !== 'rank');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [view, setView] = useState<BoardView>("list");
  useEffect(() => { setView(defaultBoardView()); }, []);
  function changeView(v: BoardView) {
    setView(v);
    try { window.localStorage.setItem(BOARD_VIEW_KEY, v); } catch {}
  }
  const sorted = sortScoreboard(rows, sortKey, "");
  const { selected, toggle: toggleCompare, clear, canSelect } = useCompareSelection(compareProjects.map(project => project.slug));
  const selectedProjects = selected.flatMap(slug => compareProjects.filter(project => project.slug === slug));

  function navigate(changes: Record<string,string>) {
    const url = new URL(window.location.href);
    for (const [key,value] of Object.entries(changes)) {
      if (value) url.searchParams.set(key,value); else url.searchParams.delete(key);
    }
    window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }
  function toggle(key: BoardSort) { navigate({sort:key === 'rank' ? '' : key}); }
  function categorySummary(row: ScoreboardRow) {
    if (!row.delivery) return null;
    return <div className={styles.categories} aria-label="Promise category">
      {CATEGORIES.filter(c => row.delivery!.categories[c.id]?.total).map(c => <Link key={c.id} href={deliveryReceipt(row.slug,c.id)}>{c.label}</Link>)}
    </div>;
  }

  function toggleExpand(slug: string) {
    setExpanded((e) => (e === slug ? null : slug));
  }

  return (
    <div className="search-section" {...searchMeta({ id: "scoreboard-overview", title: "Project scoreboard", kind: "Scoreboard", keywords: "hearts promises rankings" })}>
      <h2>Browse projects</h2>
      <p className={styles.note}>Explore promises by subject and inspect the evidence behind their recorded outcomes.</p>
      <div className={styles.controls}>
        <label htmlFor="scoreboard-sort">Sort by<select id="scoreboard-sort" value={sortKey} onChange={e => toggle(parseBoardSort(e.target.value))}>
          {BOARD_SORTS.filter(key => key !== 'use' && key !== 'rank').map(key => <option key={key} value={key}>{BOARD_SORT_LABELS[key]}{!['rank','coin'].includes(key) ? ' · highest first' : ''}</option>)}
        </select></label>
        <div className={styles.viewToggle}><ViewToggle value={view} onChange={changeView} label="Scoreboard layout" /></div>
      </div>
      {view === "list" ? <div className={`table-wrap ${styles.tableWrap}`} tabIndex={0} aria-label="Project scoreboard">
        <table className={`board ${styles.table}`} role="table">
          <colgroup>
            <col className={styles.coinColumn} /><col className={styles.heartsColumn} />
            <col className={styles.codeColumn} /><col className={styles.usageColumn} />
            <col className={styles.hypeColumn} /><col className={styles.marketColumn} />
          </colgroup>
          <thead role="rowgroup">
            <tr role="row">
              {headers.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  role="columnheader"
                  aria-sort={h.key === sortKey ? (["rank","coin"].includes(sortKey) ? "ascending" : "descending") : undefined}
                >
                  {h.label}{h.key === sortKey ? (['rank','coin'].includes(sortKey) ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">
            {sorted.map((r) => (
              <Fragment key={r.slug}>
                <tr role="row" className={`search-section ${styles.listRow}${projectFlags(r.slug).genesis ? ` ${styles.genesisRow}` : ''}`} {...searchMeta({ id: `scoreboard-project-${r.slug}`, title: `${r.name} scoreboard`, kind: "Scoreboard", project: r.slug, keywords: `${r.symbol} hearts code hype ranking` })} data-search-href={`/projects/${r.slug}#project-${r.slug}-overview`}>
                  <td role="cell">
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
                        {projectFlags(r.slug).genesis && <span className={styles.genesisBadge}>Genesis asset</span>}
                      </span>
                    </Link>
                    {categorySummary(r)}
                    <div className={styles.rowActions}>
                      <CompareCheckbox name={r.name} checked={selected.includes(r.slug)} disabled={!canSelect(r.slug)} onChange={() => toggleCompare(r.slug)} />
                      <button type="button" className={`expand-btn${expanded === r.slug ? " open" : ""}`}
                        onClick={() => toggleExpand(r.slug)} aria-expanded={expanded === r.slug}
                        aria-label={`${expanded === r.slug ? "Hide" : "Show"} promises for ${r.name}`}>
                        {expanded === r.slug ? "▲" : "▼"}
                      </button>
                    </div>
                  </td>
                  <td role="cell" data-label="Hearts" className={styles.labeledCell}>
                    {!r.delivery ? <span className="word dim">Assessment unavailable</span> : <button
                      type="button"
                      className={`hearts-cell-toggle ${styles.heartButton}`}
                      onClick={() => toggleExpand(r.slug)}
                      aria-expanded={expanded === r.slug}
                      aria-label={`${expanded === r.slug ? "Hide" : "Show"} promises for ${r.name}`}
                      title="Show what earned these hearts"
                    >
                      <HeartMeter filled={r.earned} capacity={r.capacity} size={18} genesis={projectFlags(r.slug).genesis} />
                      <span className={`num ${styles.heartCount}`}>{r.earned} of {r.capacity} potential</span>
                    </button>}
                  </td>
                  <td role="cell" data-label="Code" className={styles.labeledCell}>
                    <Link href="/code" className="cell-link metric-btn" aria-label={`Code activity for ${r.name}`} title="See CODE activity ranking">
                      <GithubMark />
                      <CodeWordCell code={r.code} note={r.codeNote} />
                    </Link>
                    {codeSub(r) ? <span className="cell-sub">{codeSub(r)}</span> : null}
                  </td>
                  <td role="cell" data-label="Usage" className={styles.labeledCell}><span className="word dim">coming</span></td>
                  <td role="cell" data-label="Hype" className={`num ${styles.labeledCell}`}>
                    <Link href="/hype" className="cell-link metric-btn" title="See HYPE ranking">
                      <Icon name="megaphone" size={14} />
                      <HypeCell mentions={r.hypeMentions} collecting={r.hypeCollecting} />
                    </Link>
                  </td>
                  <td role="cell" data-label="Market cap" className={`num ${styles.labeledCell}`}>{r.marketCap == null ? "Unavailable" : `$${compactNum.format(r.marketCap)}`}</td>
                </tr>
                {expanded === r.slug ? (
                  <tr role="row" key={`${r.slug}-promises`} className={`expand-row ${styles.expandedRow}`}>
                    <td role="cell" colSpan={headers.length}>
                      <div className="expand-promises">
                        <div className="expand-promises-head">
                          All {r.name} promises ({r.promises.length})
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
      </div> : <div className={styles.cards} data-search-ignore="true">
        {sorted.map((r) => {
          const open = expanded === r.slug;
          return (
            <div key={r.slug} className={`mcard project-card${projectFlags(r.slug).genesis ? ` ${styles.genesisCard}` : ''}`} id={`scoreboard-mobile-project-${r.slug}`}>
              <Link href={`/projects/${r.slug}`} className="mcard-head project-card-link">
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
              <CompareCheckbox name={r.name} checked={selected.includes(r.slug)} disabled={!canSelect(r.slug)} onChange={() => toggleCompare(r.slug)} />
              <div className="mcard-hearts">
                {!r.delivery ? <span className="word dim">Assessment unavailable</span> : <button
                  type="button"
                  className="mcard-hearts-toggle"
                  onClick={() => toggleExpand(r.slug)}
                  aria-expanded={open}
                  aria-label={`${open ? "Hide" : "Show"} promises for ${r.name}`}
                  title="Show what earned these hearts"
                >
                  <HeartMeter filled={r.earned} capacity={r.capacity} size={18} genesis={projectFlags(r.slug).genesis} />
                  <span className={`num mcard-count ${styles.heartCount}`}>{r.earned}/{r.capacity}</span>
                </button>}
              </div>
              {projectFlags(r.slug).genesis && <p className={styles.genesisBadge}>Genesis asset</p>}
              <section className={styles.context} aria-label={`${r.name} supporting context`}>
              <h3>Supporting context</h3>
              <div className="mcard-stats">
                <Link href="/code" className="mcard-stat metric-btn">
                  <GithubMark />
                  {r.codeNote ? r.codeNote : r.code === "Active" ? "Code" : `Code ${r.code}`}
                  {!r.codeNote && codeSub(r) ? ` · ${codeSub(r)}` : null}
                </Link>
                <Link href="/hype" className="mcard-stat metric-btn num">
                  <Icon name="megaphone" size={14} />
                  Hype · {r.hypeMentions == null ? "-" : `${r.hypeMentions.toLocaleString()} mentions / 7d`}
                </Link>
                <span className="mcard-stat num">Market cap · {r.marketCap == null ? "Unavailable" : `$${compactNum.format(r.marketCap)}`}</span>
              </div>
              </section>
              <button
                className={`mcard-promises-toggle${open ? " open" : ""}`}
                onClick={() => toggleExpand(r.slug)}
                aria-expanded={open}
              >
                All promises · {r.promises.length} {open ? "▲" : "▼"}
              </button>
              {open ? (
                <div className="mcard-promises">
                  {categorySummary(r)}
                  <PromiseRows slug={r.slug} promises={r.promises} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>}
      <CompareMode selectedLabels={selectedProjects.map(project => project.name)} onClear={clear}>
        <CompareTable projects={selectedProjects} showPicker={false} />
      </CompareMode>
    </div>
  );
}
