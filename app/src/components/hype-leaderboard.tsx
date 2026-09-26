"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ShitcoinMeter from "@/components/shitcoin-meter";
import { RedditIcon, TelegramIcon, MegaphoneIcon } from "@/components/icons";
import type { VerdictCategory } from "@/lib/verdict";
import { searchMeta } from "@/lib/search-sections";

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
  sources: string[];
}

export function SourceIcons({ sources }: { sources: string[] }) {
  const items = [
    { key: "reddit", label: "Reddit audience size", Icon: RedditIcon },
    { key: "telegram", label: "Telegram audience size", Icon: TelegramIcon },
    { key: "news", label: "News articles", Icon: MegaphoneIcon },
  ];
  return (
    <span className="hype-sources" title="Collected metrics: news articles and community sizes">
      {items.map(({ key, label, Icon }) => (
        <span
          key={key}
          className={`hype-source${sources.includes(key) ? " on" : ""}`}
          title={`${label}${sources.includes(key) ? "" : " (no data)"}`}
        >
          <Icon className="hype-source-icon" />
        </span>
      ))}
    </span>
  );
}

type SortKey = "mentions" | "hearts";

export function HypeRowCard({ row: r }: { row: HypeRow }) {
  return (
    <article className="hype-row project-card search-section" {...searchMeta({ id: `hype-project-${r.slug}`, title: `${r.name} HYPE ranking`, kind: "HYPE", project: r.slug, keywords: `${r.symbol} mentions attention news Reddit Telegram` })}>
      <Link href={`/projects/${r.slug}`} className="hype-coin project-card-link">
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
        <span className="hype-val">{r.earned} of {r.capacity}</span>
        <span className="cell-sub">potential hearts</span>
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
        <Link href={`/projects/${r.slug}#verdict`} aria-label={`${r.name} Shitcoin warning breakdown`} className="gauge-btn">
          <ShitcoinMeter category={r.verdict} compact size={38} />
        </Link>
        <SourceIcons sources={r.sources} />
      </div>
    </article>
  );
}

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
    <div className="panel search-section" {...searchMeta({ id: "hype-leaderboard", title: "HYPE leaderboard", kind: "HYPE", keywords: "attention mentions hearts" })}>
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
          <HypeRowCard key={r.slug} row={r} />
        ))}
      </div>
    </div>
  );
}
