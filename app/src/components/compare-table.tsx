"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import HeartMeter from "@/components/heart-meter";
import type { CodeWord } from "@/lib/heart-data";
import { searchMeta } from "@/lib/search-sections";
import { projectFlags } from "@/lib/project-policy";
import { promiseFilterHref } from "@/lib/promise-context";

export interface CompareProject {
  slug: string;
  name: string;
  symbol: string;
  earned: number;
  capacity: number;
  filledPct: number;
  assessmentAvailable?: boolean;
  promiseCounts: { total: number; open: number; active: number; fulfilled: number; lapsed: number; retired: number; unknown?: number };
  code: { word: CodeWord; stars: number | null; commits90d: number | null; lastCommitAt: string | null; openPRs: number | null; unreachable: boolean };
  use: "coming";
  hype: { mentions: number | null; collecting: boolean; baselineWeeks: number };
}

const MIN_SEL = 2;
const MAX_SEL = 4;

export interface ComparisonColumn { key: string; header: ReactNode }
export interface ComparisonGroup {
  label: string;
  rows: Array<{ key: string; label: ReactNode; title: string; cells: ReactNode[] }>;
}

/** Shared table presentation; each market supplies its own rows and values. */
export function ComparisonGrid({ columns, groups, id = "compare-metrics", rowIdPrefix = "compare", title = "Project comparison", keywords = "promises code use hype" }: {
  columns: ComparisonColumn[];
  groups: ComparisonGroup[];
  id?: string;
  rowIdPrefix?: string;
  title?: string;
  keywords?: string;
}) {
  return <div className="table-wrap search-section" {...searchMeta({ id, title, kind: "Compare", keywords })}>
    <table className="board compare">
      <thead><tr>
        <th className="rowhead" />
        {columns.map(column => <th key={column.key} scope="col">{column.header}</th>)}
      </tr></thead>
      {groups.map(group => <tbody key={group.label}>
        <tr className="compare-group"><th colSpan={columns.length + 1} scope="rowgroup">{group.label}</th></tr>
        {group.rows.map(row => <tr key={row.key} className="search-section" {...searchMeta({ id: `${rowIdPrefix}-${row.key}`, title: row.title, kind: "Compare", keywords: row.key })}>
          <th className="rowhead" scope="row">{row.label}</th>
          {columns.map((column, index) => <td key={column.key}>{row.cells[index]}</td>)}
        </tr>)}
      </tbody>)}
    </table>
  </div>;
}

const ROW_GROUPS: Array<{ label: string; rows: Array<{ key: string; label: string; anchor: string }> }> = [
  { label: "Promise delivery", rows: [
    { key: "hearts", label: "Promises", anchor: "hearts" },
    { key: "promises", label: "Promises", anchor: "pillars" },
  ] },
  { label: "Supporting context", rows: [
    { key: "code", label: "Code", anchor: "pillars" },
    { key: "use", label: "USAGE", anchor: "pillars" },
    { key: "hype", label: "Hype", anchor: "pillars" },
  ] },
];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso.slice(0, 10) : d.toISOString().slice(0, 10);
}

const compactNum = new Intl.NumberFormat("en", { notation: "compact" });
const compact = (n: number | null) => (n == null ? "-" : compactNum.format(n));

function Cell({ row, p }: { row: string; p: CompareProject }) {
  if ((row === "hearts" || row === "promises") && p.assessmentAvailable === false) return <span className="word dim">Assessment unavailable</span>;
  switch (row) {
    case "hearts":
      return (
        <div>
          <HeartMeter filled={p.earned} capacity={p.capacity} size={15} genesis={projectFlags(p.slug).genesis} />
          <div className="mini-meter" style={{ marginBottom: 6, marginTop: 8 }}>
            <div className="mini-meter-track">
              <div className="mini-meter-fill" style={{ width: `${Math.round(p.filledPct * 100)}%` }} />
            </div>
            <span className="num mini-meter-val">{p.earned} of {p.capacity} potential</span>
          </div>
          <span className="cell-sub">{Math.round(p.filledPct * 100)}% filled</span>
        </div>
      );
    case "promises": {
      const c = p.promiseCounts;
      return (
        <div className="num" style={{ fontSize: 14 }}>
          <div><b>{c.total}</b> tracked</div>
          <div className="mini-tags">
            {c.fulfilled > 0 ? <span className="tag measured">{c.fulfilled} fulfilled</span> : null}
            {c.active > 0 ? <span className="tag na">{c.active} active</span> : null}
            {c.open > 0 ? <span className="tag na">{c.open} open</span> : null}
            {(c.unknown ?? 0) > 0 ? <span className="tag na">{c.unknown} unknown</span> : null}
            {c.lapsed > 0 ? <Link className="tag bad" href={promiseFilterHref(p.slug,'lapsed')}>{c.lapsed} lapsed ↗</Link> : null}
            {c.retired > 0 ? <Link className="tag bad" href={promiseFilterHref(p.slug,'retired')}>{c.retired} retired ↗</Link> : null}
          </div>
        </div>
      );
    }
    case "code": {
      if (p.code.unreachable) {
        return <span className="word dim">Couldn&apos;t reach GitHub</span>;
      }
      const word = p.code.word === "Active" ? null
        : p.code.word === "Quiet" ? <span className="word dim">Quiet</span>
        : <span className="word dim">-</span>;
      return (
        <div>
          {word}
          <span className="cell-sub">
            {p.code.stars != null ? `${compact(p.code.stars)} stars` : "No star data"}
          </span>
          <span className="cell-sub">
            {p.code.commits90d != null ? `${p.code.commits90d} commits / 90d` : "No commit data"}
          </span>
          <span className="cell-sub">
            {p.code.lastCommitAt ? `last commit ${fmtDate(p.code.lastCommitAt)}` : "last commit unknown"}
            {p.code.openPRs != null ? ` · ${p.code.openPRs} open PRs` : ""}
          </span>
        </div>
      );
    }
    case "use":
      return <span className="word dim">coming</span>;
    case "hype":
      return p.hype.mentions == null ? (
        <span style={{ color: "var(--text-faint)" }}>-</span>
      ) : (
        <div className="num">
          <b>{p.hype.mentions.toLocaleString()}</b>
          <span className="cell-sub">news mentions · last 7 days</span>
          {p.hype.collecting ? (
            <span className="cell-sub">baseline collecting · week {p.hype.baselineWeeks} of 8</span>
          ) : null}
        </div>
      );
    default:
      return null;
  }
}

export default function CompareTable({ projects, showPicker = true }: { projects: CompareProject[]; showPicker?: boolean }) {
  const [selected, setSelected] = useState<string[]>(
    projects.slice(0, MAX_SEL).map((p) => p.slug)
  );

  const bySlug = useMemo(() => {
    const m = new Map<string, CompareProject>();
    for (const p of projects) m.set(p.slug, p);
    return m;
  }, [projects]);

  function toggle(slug: string) {
    setSelected((sel) => {
      if (sel.includes(slug)) {
        return sel.length > MIN_SEL ? sel.filter((s) => s !== slug) : sel;
      }
      return sel.length < MAX_SEL ? [...sel, slug] : sel;
    });
  }

  const cols = showPicker ? selected
    .map((s) => bySlug.get(s))
    .filter((p): p is CompareProject => !!p) : projects;

  return (
    <>
      {showPicker && <div className="panel search-section" {...searchMeta({ id: "compare-project-picker", title: "Choose projects to compare", kind: "Compare", keywords: "projects side by side" })}>
        <div className="compare-picker" role="group" aria-label="Choose projects to compare">
        {projects.map((p) => {
          const on = selected.includes(p.slug);
          const disabled = !on && selected.length >= MAX_SEL;
          return (
            <button
              key={p.slug}
              onClick={() => toggle(p.slug)}
              disabled={disabled}
              aria-pressed={on}
              className={on ? "active" : undefined}
              title={disabled ? `Compare up to ${MAX_SEL} projects` : p.name}
            >
              <img src={`/icons/${p.symbol.toLowerCase()}.svg`} alt="" width={20} height={20} className="coin-icon" />
              {p.symbol}
            </button>
          );
        })}
        </div>
      </div>}
      <ComparisonGrid columns={cols.map(p => ({ key: p.slug, header: <Link href={`/projects/${p.slug}`}>
        <img src={`/icons/${p.symbol.toLowerCase()}.svg`} alt="" width={30} height={30} className="coin-icon" />
        <br />{p.name}{projectFlags(p.slug).genesis && <span className="cell-sub">Genesis asset</span>}
      </Link> }))} groups={ROW_GROUPS.map(group => ({ label: group.label, rows: group.rows.map(row => ({
        key: row.key,
        label: <Link href={`/methodology#${row.anchor}`}>{row.label}</Link>,
        title: `Compare ${row.label}`,
        cells: cols.map(p => <Cell key={p.slug} row={row.key} p={p} />),
      })) }))} />
    </>
  );
}
