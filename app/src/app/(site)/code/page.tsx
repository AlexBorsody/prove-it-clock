import Link from "next/link";
import { HEARTS_METHODOLOGY, readHeartRankings } from "@/lib/heart-data";
import { fetchVitals, VITALS_REPOS } from "@/lib/vitals";
import { fetchTeam, teamLine } from "@/lib/team";
import Icon from "@/components/chrome-icons";
import CodeRow from "@/components/code-row";
import { searchMeta } from "@/lib/search-sections";

export const dynamic = "force-dynamic";

interface CodeRow {
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

/**
 * CODE ranking: every tracked project, sortable by stars, forks, follows, or commits
 * in the last 90 days. Stars sort by default. Development context only;
 * CODE never moves the heart score. A failed fetch is shown honestly,
 * never as zero.
 */
type SortKey = "stars" | "forks" | "watchers" | "commits";
const SORTS: SortKey[] = ["stars", "forks", "watchers", "commits"];

export default async function CodePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const sp = await searchParams;
  const sort: SortKey =
    sp.sort === "forks"
      ? "forks"
      : sp.sort === "watchers"
        ? "watchers"
        : sp.sort === "commits"
          ? "commits"
          : "stars";
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
      const [vitals, team] = await Promise.all([
        fetchVitals(p.slug).catch(() => null),
        fetchTeam(p.slug).catch(() => null),
      ]);
      const failed = vitals == null || (vitals.commits90d == null && vitals.partial);
      return {
        slug: p.slug,
        name: p.name,
        symbol: p.symbol,
        commits90d: vitals?.commits90d ?? null,
        stars: vitals?.stars ?? null,
        forks: vitals?.forks ?? null,
        watchers: vitals?.watchers ?? null,
        repoUrl: meta ? `https://github.com/${meta.github}` : "",
        teamLine: team ? teamLine(team) : "TEAM: Unknown · couldn't reach GitHub",
        failed,
      };
    })
  );

  const sortVal = (r: CodeRow) =>
    sort === "stars"
      ? r.stars
      : sort === "forks"
        ? r.forks
        : sort === "watchers"
          ? r.watchers
          : r.commits90d;
  rows.sort((a, b) => (sortVal(b) ?? -1) - (sortVal(a) ?? -1));

  const sortLabel =
    sort === "commits"
      ? "commits in the last 90 days"
      : sort === "watchers"
        ? "GitHub follows"
        : `GitHub ${sort}`;

  return (
    <>
      <div className="search-section" {...searchMeta({ id: "code-overview", title: "CODE activity", kind: "CODE", keywords: "development GitHub commits follows" })}>
      <h1 className="page-title">CODE</h1>
      <p className="page-sub">
        Who is actually building. Stars, forks, and follows are all-time;
        commits cover the last 90 days. TEAM reads contributor spread:
        Broad, Concentrated, Thin, or Unknown.
      </p>
      </div>
      <div className="sort-seg" role="group" aria-label="Sort CODE ranking">
        {SORTS.map((k) => (
          <Link
            key={k}
            href={k === "stars" ? "/code" : `/code?sort=${k}`}
            className={sort === k ? "active" : undefined}
            aria-current={sort === k ? "true" : undefined}
          >
            {k === "stars" ? "Stars" : k === "forks" ? "Forks" : k === "watchers" ? "Follows" : "Commits"}
          </Link>
        ))}
      </div>

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
        <div className="panel search-section" data-tour="code" {...searchMeta({ id: "code-ranking", title: "CODE ranking", kind: "CODE", keywords: "development GitHub commits follows" })}>
          <p className="explain" style={{ marginTop: 0 }}>
            Ranked by {sortLabel}. CODE is context: it never moves the heart score.
            A failed GitHub fetch is shown as-is, never as zero activity.
          </p>
          <div className="code-rows">
            {rows.map((r, i) => (
              <CodeRow
                key={r.slug}
                row={r}
                rank={i + 1}
                search={{ id: `code-project-${r.slug}`, title: `${r.name} CODE activity` }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
