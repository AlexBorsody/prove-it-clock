"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import VerdictBadge from "@/components/verdict-badge";
import type { VerdictCategory } from "@/lib/verdict";

export interface HypeRow {
  slug: string;
  name: string;
  symbol: string;
  earned: number;
  capacity: number;
  filledPct: number;
  verdict: VerdictCategory;
  mentions: number | null;
  baselineWeeks: number;
}

type SortKey = "mentions" | "hearts";

export default function HypeLeaderboard({ rows }: { rows: HypeRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("mentions");

  const sorted = useMemo(() => {
    const copy = [...rows];
    if (sortKey === "mentions") {
      copy.sort((a, b) => (b.mentions ?? -1) - (a.mentions ?? -1));
    } else {
      copy.sort((a, b) => b.filledPct - a.filledPct);
    }
    return copy;
  }, [rows, sortKey]);

  return (
    <div className="panel">
      <div className="sort-toggle" role="group" aria-label="Sort HYPE leaderboard">
        <span>Sort</span>
        <button
          className={sortKey === "mentions" ? "active" : undefined}
          onClick={() => setSortKey("mentions")}
        >
          Mentions
        </button>
        <button
          className={sortKey === "hearts" ? "active" : undefined}
          onClick={() => setSortKey("hearts")}
        >
          Hearts
        </button>
      </div>
      <div className="hype-rows">
        {sorted.map((r) => (
          <div key={r.slug} className="hype-row">
            <Link href={`/projects/${r.slug}`} className="hype-coin">
              <img
                src={`/icons/${r.symbol.toLowerCase()}.svg`}
                alt=""
                width={34}
                height={34}
                className="coin-icon"
              />
              <span>
                <span className="proj-name" style={{ color: "var(--text)" }}>{r.name}</span>
                <br />
                <span className="proj-cat num">{r.symbol}</span>
              </span>
            </Link>
            <div className="hype-hearts num">
              <span className="hype-val">{r.earned}/{r.capacity}</span>
              <span className="cell-sub">hearts</span>
            </div>
            <div className="hype-mentions num">
              {r.mentions == null ? (
                <span style={{ color: "var(--text-faint)" }}>-</span>
              ) : (
                <>
                  <span className="hype-val">{r.mentions.toLocaleString()}</span>
                  {r.baselineWeeks < 8 ? (
                    <span className="cell-sub">
                      collecting, week {r.baselineWeeks}/8
                    </span>
                  ) : (
                    <span className="cell-sub">mentions / 7d</span>
                  )}
                </>
              )}
            </div>
            <div className="hype-verdict">
              <VerdictBadge category={r.verdict} compact />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
