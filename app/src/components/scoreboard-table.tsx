"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORIES } from "../../data/atlas-taxonomy";
import { deliveryReceipt, type DeliverySummary } from "@/lib/promise-verdict";
import { BOARD_SORTS, BOARD_SORT_LABELS, parseBoardCategory, parseBoardSort, sortScoreboard, categoryRanks, type BoardSort } from "@/lib/scoreboard-ranking";
import styles from "./scoreboard-table.module.css";
import HeartMeter, { CompactHearts } from "@/components/heart-meter";
import ShitcoinMeter from "@/components/shitcoin-meter";
import Icon from "@/components/chrome-icons";
import { GithubMark } from "@/components/icons";
import PromiseRows, { type PromiseBrief } from "@/components/promise-rows";
import type { VerdictCategory } from "@/lib/verdict";
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
  verdict: VerdictCategory;
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
  { key: "verdict", label: "Shitcoin warning" },
  { key: "commits", label: "Code" },
  { key: null, label: "Usage" },
  { key: "hype", label: "Hype" },
  { key: "market-cap", label: "Market cap" },
  { key: null, label: "" },
];

function CodeWordCell({ code, note }: { code: CodeWord; note?: string | null }) {
  if (note) return <span className="word dim">{note}</span>;
  if (code === "Active") return <span className="word good">Active</span>;
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

export default function ScoreboardTable({ rows, asOf, dataRevision }: { rows: ScoreboardRow[]; asOf?: string; dataRevision?: string }) {
  const params = useSearchParams();
  const category = parseBoardCategory(params.get("category"));
  const sortKey = parseBoardSort(params.get("sort"));
  const categoryLabel = CATEGORIES.find(c => c.id === category)?.short ?? "Overall";
  const [expanded, setExpanded] = useState<string | null>(null);
  const sorted = sortScoreboard(rows, sortKey, category);
  const ranks = categoryRanks(rows, category);
  const unclassified = rows.reduce((sum,r) => sum + (r.delivery?.categories.unclassified.total ?? 0), 0);
  const unknown = rows.reduce((sum,r) => sum + (r.delivery?.states.unknown ?? 0), 0);

  function navigate(changes: Record<string,string>) {
    const url = new URL(window.location.href);
    for (const [key,value] of Object.entries(changes)) {
      if (value) url.searchParams.set(key,value); else url.searchParams.delete(key);
    }
    window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }
  function toggle(key: BoardSort) { navigate({sort:key === 'rank' ? '' : key}); }
  function categoryCell(row: ScoreboardRow) {
    if (!row.delivery) return <span className="word dim">Assessment unavailable</span>;
    if (!category) return null;
    const counts = row.delivery.categories[category];
    if (!counts.total) return <span className="word dim">Unranked<span className="cell-sub">No promises in {categoryLabel}</span></span>;
    return <Link className={styles.receipt} href={deliveryReceipt(row.slug,category)}>
      <strong>{counts.kept}/{counts.total} kept in {categoryLabel} ↗</strong>
      <span>{Math.round(counts.kept/counts.total*100)}% kept{counts.states.unknown ? ` · ${counts.states.unknown} unknown` : ''}</span>
    </Link>;
  }

  function toggleExpand(slug: string) {
    setExpanded((e) => (e === slug ? null : slug));
  }

  return (
    <div className="search-section" {...searchMeta({ id: "scoreboard-overview", title: "Project scoreboard", kind: "Scoreboard", keywords: "hearts promises rankings" })}>
      <div className={styles.controls}>
        <label>Promise category<select value={category} onChange={e => navigate({category:e.target.value,sort:e.target.value ? 'hearts' : ''})}>
          <option value="">Overall</option>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select></label>
        <label>Sort by<select value={sortKey} onChange={e => toggle(parseBoardSort(e.target.value))}>
          {BOARD_SORTS.filter(key => key !== 'use').map(key => <option key={key} value={key}>{key === 'rank' && category ? 'Category rank' : BOARD_SORT_LABELS[key]}{!['rank','coin'].includes(key) ? ' · highest first' : ''}</option>)}
        </select></label>
      </div>
      {category && <p className={styles.note} role="status">{categoryLabel}: primary assignments only. Equal kept shares tie; projects without promises in this category are unranked.</p>}
      <details className={styles.coverage}><summary>Published ledger{asOf ? ` · ${asOf.slice(0,10)}` : ''}</summary>
        <p>{unclassified} unclassified promises. {unknown} unknown states. Missing context metrics are shown as unavailable and sort last.</p>
        <p>Data revision: {dataRevision ?? 'unavailable'}. Categories describe subject matter; kept share does not measure the scale or difficulty of a promise.</p>
      </details>
      <div className="table-wrap board-desktop">
        <table className="board">
          <thead>
            <tr>
              {HEADERS.map((h, i) => (
                <th
                  key={i}
                  className={h.key ? "sortable" : undefined}
                  aria-sort={h.key === sortKey ? (["rank","coin"].includes(sortKey) ? "ascending" : "descending") : undefined}
                >
                  {h.key ? <button className={styles.heading} onClick={() => toggle(h.key!)}>{h.key === 'hearts' && category ? 'Category delivery' : h.label}{h.key === sortKey ? (['rank','coin'].includes(sortKey) ? ' ↑' : ' ↓') : ''}</button> : h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <Fragment key={r.slug}>
                <tr className="search-section" {...searchMeta({ id: `scoreboard-project-${r.slug}`, title: `${r.name} scoreboard`, kind: "Scoreboard", project: r.slug, keywords: `${r.symbol} hearts code hype ranking` })} data-search-href={`/projects/${r.slug}#project-${r.slug}-overview`}>
                  <td className="num" style={{ color: "var(--text-faint)" }}>{r.delivery ? (ranks.get(r.slug) ?? "Unranked") : "Unavailable"}</td>
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
                    {category || !r.delivery ? categoryCell(r) : <button
                      type="button"
                      className="hearts-cell-toggle"
                      onClick={() => toggleExpand(r.slug)}
                      aria-expanded={expanded === r.slug}
                      aria-label={`${expanded === r.slug ? "Hide" : "Show"} promises for ${r.name}`}
                      title="Show what earned these hearts"
                    >
                      <HeartMeter filled={r.earned} capacity={r.capacity} size={16} />
                      {" "}
                      <span className="num">{r.earned} of {r.capacity} potential</span>
                    </button>}
                  </td>
                  <td>
                    {r.delivery ? <Link href={`/projects/${r.slug}#verdict`} aria-label={`${r.name} Shitcoin warning breakdown`} className="gauge-btn">
                      <ShitcoinMeter category={r.verdict} compact />
                    </Link> : <span className="word dim">Unavailable</span>}
                  </td>
                  <td>
                    <Link href="/code" className="cell-link metric-btn" title="See CODE activity ranking">
                      <GithubMark />
                      <CodeWordCell code={r.code} note={r.codeNote} />
                    </Link>
                    {codeSub(r) ? <span className="cell-sub">{codeSub(r)}</span> : null}
                  </td>
                  <td><span className="word dim">coming</span></td>
                  <td className="num">
                    <Link href="/hype" className="cell-link metric-btn" title="See HYPE ranking">
                      <Icon name="megaphone" size={14} />
                      <HypeCell mentions={r.hypeMentions} collecting={r.hypeCollecting} />
                    </Link>
                  </td>
                  <td className="num">{r.marketCap == null ? "Unavailable" : `$${compactNum.format(r.marketCap)}`}</td>
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
      </div>
      <div className={`board-cards ${styles.cards}`} data-search-ignore="true">
        {sorted.map((r) => {
          const open = expanded === r.slug;
          return (
            <div key={r.slug} className="mcard project-card" id={`scoreboard-mobile-project-${r.slug}`}>
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
              <p className={styles.rank}>{r.delivery ? (ranks.has(r.slug) ? `${category ? categoryLabel : "Overall"} rank ${ranks.get(r.slug)}` : "Unranked") : "Assessment unavailable"}</p>
              <div className="mcard-hearts">
                {category || !r.delivery ? categoryCell(r) : <button
                  type="button"
                  className="mcard-hearts-toggle"
                  onClick={() => toggleExpand(r.slug)}
                  aria-expanded={open}
                  aria-label={`${open ? "Hide" : "Show"} promises for ${r.name}`}
                  title="Show what earned these hearts"
                >
                  <CompactHearts earned={r.earned} capacity={r.capacity} />
                  <span className="num mcard-count">{r.earned}/{r.capacity}</span>
                </button>}
              </div>
              <div className="mcard-warning">
                {r.delivery ? <Link className="mcard-gauge gauge-btn" href={`/projects/${r.slug}#verdict`} aria-label={`${r.name} Shitcoin warning breakdown`}>
                  <ShitcoinMeter category={r.verdict} compact size={32} />
                </Link> : <span className="word dim">Warning unavailable</span>}
              </div>
              <div className="mcard-stats">
                <Link href="/code" className="mcard-stat metric-btn">
                  <GithubMark />
                  {r.codeNote ? r.codeNote : `CODE ${r.code}`}
                  {!r.codeNote && codeSub(r) ? ` · ${codeSub(r)}` : null}
                </Link>
                <Link href="/hype" className="mcard-stat metric-btn num">
                  <Icon name="megaphone" size={14} />
                  HYPE · {r.hypeMentions == null ? "-" : `${r.hypeMentions.toLocaleString()} mentions / 7d`}
                </Link>
                <span className="mcard-stat num">Market cap · {r.marketCap == null ? "Unavailable" : `$${compactNum.format(r.marketCap)}`}</span>
              </div>
              <button
                className={`mcard-promises-toggle${open ? " open" : ""}`}
                onClick={() => toggleExpand(r.slug)}
                aria-expanded={open}
              >
                All promises · {r.promises.length} {open ? "▲" : "▼"}
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
