/**
 * CodeRow: one project's CODE row. Shared between the /code ranking list
 * and the project detail page's CODE section. One component, two surfaces:
 * never duplicate this markup.
 */
import Link from "next/link";
import { GithubMark, StarIcon, ForkIcon } from "@/components/icons";
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

export default function CodeRow({
  row,
  rank,
  search,
}: {
  row: CodeRowData;
  /** Rank number; omitted on the project detail page. */
  rank?: number;
  search: { id: string; title: string };
}) {
  const r = row;
  return (
    <article
      className="code-row search-section"
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
      <span className="code-social">
        <span className="code-social-row" title="Stars">
          <StarIcon className="code-social-icon" />
          <span className="num">{compact(r.stars)}</span>
        </span>
        <span className="code-social-row" title="Forks">
          <ForkIcon className="code-social-icon" />
          <span className="num">{compact(r.forks)}</span>
        </span>
      </span>
      <span className="code-commits">
        <span className="code-commits-num num">
          {r.failed ? "-" : (r.commits90d ?? 0).toLocaleString()}
        </span>
        <span className="cell-sub">
          {r.failed ? "Couldn't reach GitHub" : "commits / 90d"}
        </span>
        <span className="cell-sub">{r.teamLine}</span>
      </span>
    </article>
  );
}
