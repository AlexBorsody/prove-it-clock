import { HEARTS_METHODOLOGY, readHeartRankings } from "@/lib/heart-data";
import { fetchVitals, VITALS_REPOS } from "@/lib/vitals";
import { fetchTeam, teamLine } from "@/lib/team";
import Icon from "@/components/chrome-icons";
import type { CodeRowData } from "@/components/code-row";
import CodeRanking, { CodeRowResult } from "@/components/code-ranking";
import CodeSortControl from "@/components/code-sort-control";
import CodeSkeleton, { CodeRowSkeleton } from "@/components/code-skeleton";
import { Suspense } from "react";
import { searchMeta } from "@/lib/search-sections";

export const dynamic = "force-dynamic";

async function projectCodeRow(p: {slug:string; name:string; symbol:string}): Promise<CodeRowData> {
  const meta = VITALS_REPOS[p.slug];
  const [vitals, team] = await Promise.all([
    fetchVitals(p.slug).catch(() => null), fetchTeam(p.slug).catch(() => null),
  ]);
  return {
    slug:p.slug, name:p.name, symbol:p.symbol,
    commits90d:vitals?.commits90d ?? null, stars:vitals?.stars ?? null,
    forks:vitals?.forks ?? null, watchers:vitals?.watchers ?? null,
    repoUrl:meta ? `https://github.com/${meta.github}` : '',
    teamLine:team ? teamLine(team) : "TEAM: Unknown · couldn't reach GitHub",
    failed:vitals == null || (vitals.commits90d == null && vitals.partial),
  };
}
async function ProjectCodeResult({project}:{project:{slug:string;name:string;symbol:string}}) {
  return <CodeRowResult row={await projectCodeRow(project)}/>;
}
async function CodeRows() {
  let projects: any[];
  try { projects = (await readHeartRankings(HEARTS_METHODOLOGY,1,100)).projects; }
  catch { return <div className="panel" role="alert"><h2>CODE data unavailable</h2><p>The rankings database is not reachable.</p></div>; }
  if (!projects.length) return <div className="panel"><h2><Icon name="inbox" size={18}/> No CODE data yet</h2><p>No projects are published yet.</p></div>;
  const rows: CodeRowData[] = projects.map(p => ({slug:p.slug,name:p.name,symbol:p.symbol,commits90d:null,stars:null,forks:null,watchers:null,repoUrl:'',teamLine:'',failed:false}));
  return <CodeRanking rows={rows}>
    {projects.map(p => <Suspense key={p.slug} fallback={<CodeRowSkeleton name={p.name}/>}><ProjectCodeResult project={p}/></Suspense>)}
  </CodeRanking>;
}
/** Render navigation and controls before any database or GitHub wait. */
export default function CodePage() {
  return <>
    <div className="search-section" {...searchMeta({id:'code-overview',title:'CODE activity',kind:'CODE',keywords:'development GitHub commits watchers'})}>
      <h1 className="page-title">CODE</h1>
      <p className="page-sub">Who is actually building. Stars, forks, and watchers are current totals; commits cover the last 90 days. TEAM reads contributor spread: Broad, Concentrated, Thin, or Unknown.</p>
    </div>
    <CodeSortControl/>
    <Suspense fallback={<CodeSkeleton/>}><CodeRows/></Suspense>
  </>;
}
