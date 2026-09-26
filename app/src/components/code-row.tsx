/**
 * CodeRow: one project's CODE row. Shared between the /code ranking list
 * and the project detail page's CODE section. One component, two surfaces:
 * never duplicate this markup.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { GithubMark, StarIcon, ForkIcon, CommitIcon } from "@/components/icons";
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

function MetricLink({ href, label, children }: { href?: string; label: string; children: ReactNode }) {
  return href ? (
    <a className="code-metric" href={href} target="_blank" rel="noreferrer" aria-label={label}>
      {children}
    </a>
  ) : <div className="code-metric">{children}</div>;
}

export default function CodeRow({
  row,
  rank,
  search,
  showWatchers = false,
}: {
  row: CodeRowData;
  /** Rank number; omitted on the project detail page. */
  rank?: number;
  showWatchers?: boolean;
  search: { id: string; title: string };
}) {
  const r = row;
  return (
    <article
      className={`code-row search-section${rank == null ? " code-row-unranked" : ""}`}
      {...searchMeta({
        id: search.id,
        title: search.title,
        kind: "CODE",
        project: r.slug,
        keywords: `${r.symbol} GitHub commits stars forks follows`,
      })}
    >
      {rank != null ? <span className="code-rank num">{rank}</span> : null}
      <Link href={`/projects/${r.slug}`} className="code-coin-link">
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
        <MetricLink href={r.repoUrl ? `${r.repoUrl}/stargazers` : undefined} label={`${r.name} stars on GitHub`}>
          <span className="code-metric-label"><StarIcon /> Stars</span>
          <span className="code-metric-value num">{compact(r.stars)}</span>
        </MetricLink>
        <MetricLink href={r.repoUrl ? `${r.repoUrl}/forks` : undefined} label={`${r.name} forks on GitHub`}>
          <span className="code-metric-label"><ForkIcon /> Forks</span>
          <span className="code-metric-value num">{compact(r.forks)}</span>
        </MetricLink>
        {showWatchers && <MetricLink href={r.repoUrl ? `${r.repoUrl}/watchers` : undefined} label={`${r.name} watchers on GitHub`}>
          <span className="code-metric-label">Watchers</span>
          <span className="code-metric-value num">{compact(r.watchers)}</span>
        </MetricLink>}
        <MetricLink href={r.repoUrl ? `${r.repoUrl}/commits` : undefined} label={`${r.name} commit history on GitHub`}>
          <span className="code-metric-label"><CommitIcon /> Commits</span>
          <span className="code-metric-value num">
            {r.failed || r.commits90d == null ? "—" : r.commits90d.toLocaleString()}
          </span>
          <span className="code-metric-period">{r.failed ? "Unavailable" : "90 days"}</span>
        </MetricLink>
      </div>
      {r.repoUrl ? (
        <a className="code-team" href={`${r.repoUrl}/graphs/contributors`} target="_blank" rel="noreferrer">
          <span>{r.teamLine}</span><span className="code-team-action">View contributors ↗</span>
        </a>
      ) : <p className="code-team">{r.teamLine}</p>}

    </article>
  );
}
