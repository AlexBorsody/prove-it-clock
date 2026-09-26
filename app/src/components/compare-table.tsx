"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ShitcoinMeter from "@/components/shitcoin-meter";
import HeartMeter from "@/components/heart-meter";
import type { VerdictCategory } from "@/lib/verdict";
import type { CodeWord } from "@/lib/heart-data";

export interface CompareProject {
  slug: string;
  name: string;
  symbol: string;
  earned: number;
  capacity: number;
  filledPct: number;
  verdict: VerdictCategory;
  verdictLine: string;
  promiseCounts: { total: number; open: number; active: number; fulfilled: number; lapsed: number; retired: number };
  code: { word: CodeWord; commits90d: number | null; lastCommitAt: string | null; openPRs: number | null; unreachable: boolean };
  use: "coming";
  hype: { mentions: number | null; collecting: boolean; baselineWeeks: number };
}

const MIN_SEL = 2;
const MAX_SEL = 4;

const ROWS: Array<{ key: string; label: string; anchor: string }> = [
  { key: "hearts", label: "Hearts", anchor: "hearts" },
  { key: "verdict", label: "Verdict", anchor: "verdict" },
  { key: "promises", label: "Promises", anchor: "pillars" },
  { key: "code", label: "CODE", anchor: "pillars" },
  { key: "use", label: "USE", anchor: "pillars" },
  { key: "hype", label: "HYPE", anchor: "pillars" },
];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso.slice(0, 10) : d.toISOString().slice(0, 10);
}

function Cell({ row, p }: { row: string; p: CompareProject }) {
  switch (row) {
    case "hearts":
      return (
        <div>
          <HeartMeter filled={p.earned} capacity={p.capacity} size={15} />
          <div className="mini-meter" style={{ marginBottom: 6, marginTop: 8 }}>
            <div className="mini-meter-track">
              <div className="mini-meter-fill" style={{ width: `${Math.round(p.filledPct * 100)}%` }} />
            </div>
            <span className="num mini-meter-val">{p.earned} of {p.capacity} potential</span>
          </div>
          <span className="cell-sub">{Math.round(p.filledPct * 100)}% filled</span>
        </div>
      );
    case "verdict":
      return (
        <div>
          <Link href={`/projects/${p.slug}#verdict`} aria-label={`${p.name} Shitcoin warning breakdown`} className="gauge-btn">
            <ShitcoinMeter category={p.verdict} compact size={38} />
          </Link>
          <p className="verdict-line">{p.verdictLine}</p>
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
            {c.lapsed > 0 ? <span className="tag bad">{c.lapsed} lapsed</span> : null}
            {c.retired > 0 ? <span className="tag bad">{c.retired} retired</span> : null}
          </div>
        </div>
      );
    }
    case "code": {
      if (p.code.unreachable) {
        return <span className="word dim">Couldn&apos;t reach GitHub</span>;
      }
      const word = p.code.word === "Active" ? <span className="word good">Active</span>
        : p.code.word === "Quiet" ? <span className="word dim">Quiet</span>
        : <span className="word dim">-</span>;
      return (
        <div>
          {word}
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
          {p.hype.collecting ? (
            <span className="cell-sub">collecting, week {p.hype.baselineWeeks}/8</span>
          ) : (
            <span className="cell-sub">mentions / 7d</span>
          )}
        </div>
      );
    default:
      return null;
  }
}

export default function CompareTable({ projects }: { projects: CompareProject[] }) {
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

  const cols = selected
    .map((s) => bySlug.get(s))
    .filter((p): p is CompareProject => !!p);

  return (
    <>
      <div className="panel">
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
      </div>
      <div className="table-wrap">
        <table className="board compare">
          <thead>
            <tr>
              <th className="rowhead" />
              {cols.map((p) => (
                <th key={p.slug}>
                  <Link href={`/projects/${p.slug}`}>
                    <img
                      src={`/icons/${p.symbol.toLowerCase()}.svg`}
                      alt=""
                      width={30}
                      height={30}
                      className="coin-icon"
                    />
                    <br />
                    {p.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.key}>
                <th className="rowhead">
                  <Link href={`/methodology#${r.anchor}`}>{r.label}</Link>
                </th>
                {cols.map((p) => (
                  <td key={p.slug}>
                    <Cell row={r.key} p={p} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
