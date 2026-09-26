/**
 * CodeRow: one project's CODE row. Shared between the /code ranking list
 * and the project detail page's CODE section. One component, two surfaces:
 * never duplicate this markup.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { GithubMark, StarIcon, ForkIcon, CommitIcon } from "@/components/icons";
import type { CodeSort } from "@/lib/code-ranking";
import { searchMeta } from "@/lib/search-sections";

export interface CodeRowData {
  slug: string;
  name: string;
  symbol: string;
  commits90d: number | null;
  stars: number | null;
  forks: number | null;
  watchers: number | null;
  repoUrl: string;
  teamLine: string;
  failed: boolean;
}

const compactNum = new Intl.NumberFormat("en", { notation: "compact" });
const compact = (n: number | null) => (n == null ? "-" : compactNum.format(n));

function MetricLink({ href, label, active, children }: { href: string; label: string; active?: boolean; children: ReactNode }) {
  return (
    <Link href={href} className={`code-metric${active ? " active" : ""}`} aria-label={label}>
      {children}
    </Link>
  );
}

export default function CodeRow({
  row,
  rank,
  search,
  showWatchers = false,
  activeSort,
}: {
  row: CodeRowData;
  /** Rank number; omitted on the project detail page. */
  rank?: number;
  showWatchers?: boolean;
  /** Highlights the metric the ranking is sorted by. Unset on the detail page. */
  activeSort?: CodeSort;
  search: { id: string; title: string };
}) {
  const r = row;
  return (
    <article
      className={`code-row project-card search-section${rank == null ? " code-row-unranked" : ""}`}
      {...searchMeta({
        id: search.id,
        title: search.title,
        kind: "CODE",
        project: r.slug,
        keywords: `${r.symbol} GitHub commits stars forks follows`,
      })}
    >
      {rank != null ? <span className="code-rank num">{rank}</span> : null}
      <Link href={`/projects/${r.slug}`} className="code-coin-link project-card-link">
        <img
          src={`/icons/${r.symbol.toLowerCase()}.svg`}
          alt=""
          width={32}
          height={32}
          className="coin-icon"
        />
        <span className="code-name">{r.name}</span>
      </Link>
      {r.repoUrl ? (
        <a
          href={r.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="github-btn"
          aria-label={`${r.name} repo on GitHub`}
        >
          <GithubMark className="github-btn-icon" />
        </a>
      ) : null}
      <div className={`code-metrics${showWatchers ? " code-metrics-four" : ""}`}>
        <MetricLink href={`/projects/${r.slug}#project-${r.slug}-code`} label={`${r.name} CODE details`} active={activeSort === "stars"}>
          <span className="code-metric-label"><StarIcon /> Stars</span>
          <span className="code-metric-value num">{compact(r.stars)}</span>
        </MetricLink>
        <MetricLink href={`/projects/${r.slug}#project-${r.slug}-code`} label={`${r.name} CODE details`} active={activeSort === "forks"}>
          <span className="code-metric-label"><ForkIcon /> Forks</span>
          <span className="code-metric-value num">{compact(r.forks)}</span>
        </MetricLink>
        {showWatchers && <MetricLink href={`/projects/${r.slug}#project-${r.slug}-code`} label={`${r.name} CODE details`} active={activeSort === "watchers"}>
          <span className="code-metric-label">Watchers</span>
          <span className="code-metric-value num">{compact(r.watchers)}</span>
        </MetricLink>}
        <MetricLink href={`/projects/${r.slug}#project-${r.slug}-code`} label={`${r.name} CODE details`} active={activeSort === "commits"}>
          <span className="code-metric-label"><CommitIcon /> Commits</span>
          <span className="code-metric-value num">
            {r.failed || r.commits90d == null ? "—" : r.commits90d.toLocaleString()}
          </span>
          <span className="code-metric-period">{r.failed ? "Unavailable" : "90 days"}</span>
        </MetricLink>
      </div>
      <Link className="code-team" href={`/projects/${r.slug}#project-${r.slug}-code`}>
        <span>{r.teamLine}</span><span className="code-team-action">View details →</span>
      </Link>

    </article>
  );
}
