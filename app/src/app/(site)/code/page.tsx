import Link from "next/link";
import { HEARTS_METHODOLOGY, readHeartRankings } from "@/lib/heart-data";
import { fetchVitals, VITALS_REPOS } from "@/lib/vitals";
import Icon from "@/components/chrome-icons";
import { GithubMark, StarIcon, ForkIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

interface CodeRow {
  slug: string;
  name: string;
  symbol: string;
  commits90d: number | null;
  stars: number | null;
  forks: number | null;
  repoUrl: string;
  failed: boolean;
}

/**
 * CODE ranking: every tracked project ordered by GitHub commits in the
 * last 90 days. Development context only; CODE never moves the heart score.
 * A failed fetch is shown honestly, never as zero.
 */
export default async function CodePage() {
  let projects: any[] = [];
  try {
    const rankings = await readHeartRankings(HEARTS_METHODOLOGY, 1, 100);
    projects = rankings.projects;
  } catch {
    // fall through to the empty state below
  }

  const rows: CodeRow[] = await Promise.all(
    projects.map(async (p) => {
      const meta = VITALS_REPOS[p.slug];
      const vitals = await fetchVitals(p.slug).catch(() => null);
      const failed = vitals == null || (vitals.commits90d == null && vitals.partial);
      return {
        slug: p.slug,
        name: p.name,
        symbol: p.symbol,
        commits90d: vitals?.commits90d ?? null,
        stars: vitals?.stars ?? null,
        forks: vitals?.forks ?? null,
        repoUrl: meta ? `https://github.com/${meta.github}` : "",
        failed,
      };
    })
  );

  rows.sort((a, b) => (b.commits90d ?? -1) - (a.commits90d ?? -1));

  const compactNum = new Intl.NumberFormat("en", { notation: "compact" });
  const compact = (n: number | null) => (n == null ? "-" : compactNum.format(n));

  return (
    <>
      <h1 className="page-title">CODE</h1>
      <p className="page-sub">
        Who is actually building. Commits in the tracked repo over the last 90 days.
      </p>

      {rows.length === 0 ? (
        <div className="panel">
          <h2>
            <Icon name="inbox" size={18} style={{ marginRight: 10 }} />
            No CODE data yet
          </h2>
          <p className="panel-sub" style={{ marginBottom: 0 }}>
            The rankings database is not reachable.
          </p>
        </div>
      ) : (
        <div className="panel" data-tour="code">
          <p className="explain" style={{ marginTop: 0 }}>
            Ranked by commits. CODE is context: it never moves the heart score.
            A failed GitHub fetch is shown as-is, never as zero activity.
          </p>
          <div className="code-rows">
            {rows.map((r, i) => (
              <div key={r.slug} className="code-row">
                <span className="code-rank num">{i + 1}</span>
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
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
