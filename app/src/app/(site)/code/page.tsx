import { HEARTS_METHODOLOGY, readHeartRankings } from "@/lib/heart-data";
import { fetchVitals, VITALS_REPOS } from "@/lib/vitals";
import { fetchTeam, teamLine } from "@/lib/team";
import Icon from "@/components/chrome-icons";
import type { CodeRowData } from "@/components/code-row";
import CodeRanking from "@/components/code-ranking";
import { searchMeta } from "@/lib/search-sections";

export const dynamic = "force-dynamic";

/** Development context only; sorting never changes the heart score. */
export default async function CodePage() {
  let projects: any[] = [];
  try {
    const rankings = await readHeartRankings(HEARTS_METHODOLOGY, 1, 100);
    projects = rankings.projects;
  } catch {
    // fall through to the empty state below
  }

  const rows: CodeRowData[] = await Promise.all(
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

  return (
    <>
      <div className="search-section" {...searchMeta({ id: "code-overview", title: "CODE activity", kind: "CODE", keywords: "development GitHub commits watchers" })}>
      <h1 className="page-title">CODE</h1>
      <p className="page-sub">
        Who is actually building. Stars, forks, and watchers are current totals;
        commits cover the last 90 days. TEAM reads contributor spread:
        Broad, Concentrated, Thin, or Unknown.
      </p>
      </div>
      <CodeRanking rows={rows} />

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
      ) : null}
    </>
  );
}
