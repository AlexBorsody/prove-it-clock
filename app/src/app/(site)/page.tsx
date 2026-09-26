import {
  HEARTS_METHODOLOGY,
  readHeartRankings,
  readHeartHistory,
  readHypeSnapshots,
  latestHypeBySlug,
  hypeBaselineWeeks,
  codeWord,
  useWord,
  type HypeSnapshot,
} from "@/lib/heart-data";
import { verdictFor } from "@/lib/verdict";
import { fetchVitals } from "@/lib/vitals";
import ScoreboardTable, { type ScoreboardRow } from "@/components/scoreboard-table";
import HypeShareChart from "@/components/hype-share-chart";
import Icon from "@/components/chrome-icons";
import { searchMeta } from "@/lib/search-sections";

export const dynamic = "force-dynamic";

export default async function Home() {
  let projects: any[] = [];
  let hypeSnaps: HypeSnapshot[] = [];
  try {
    const [rankings, hype] = await Promise.all([
      readHeartRankings(HEARTS_METHODOLOGY, 1, 100),
      readHypeSnapshots().catch(() => [] as HypeSnapshot[]),
    ]);
    projects = rankings.projects;
    hypeSnaps = hype;
  } catch {
    // fall through to the empty state below
  }

  const hypeLatest = latestHypeBySlug(hypeSnaps);
  const baselineWeeks = hypeBaselineWeeks(hypeSnaps);
  const names: Record<string, string> = {};

  const rows: ScoreboardRow[] = await Promise.all(
    projects.map(async (p) => {
      names[p.slug] = p.name;
      const [history, vitals] = await Promise.all([
        readHeartHistory(p.slug, HEARTS_METHODOLOGY, 1, 100).catch(() => ({ points: [] as any[] })),
        fetchVitals(p.slug).catch(() => null),
      ]);
      const pts = (history.points ?? []).filter((pt: any) => pt.availability === "available");
      const spark = [...pts]
        .reverse()
        .map((pt: any) => ({ as_of: pt.as_of, filled: pt.earned, capacity: pt.capacity }));
      const promises: any[] = p.assessment?.promises ?? [];
      const latest = hypeLatest[p.slug];
      const filledPct = p.capacity > 0 ? p.earned / p.capacity : 0;
      return {
        slug: p.slug,
        name: p.name,
        symbol: p.symbol,
        rank: 0, // assigned below
        earned: p.earned,
        capacity: p.capacity,
        filledPct,
        verdict: verdictFor(
          promises.map((pr: any) => ({ lineage: pr.lineage, state: pr.state, core: !!pr.core }))
        ).category,
        code: codeWord(vitals ? { commits90d: vitals.commits90d } : null),
        codeCommits: vitals?.commits90d ?? null,
        codeNote:
          vitals == null
            ? "No commit data"
            : vitals.commits90d == null && vitals.partial
              ? "Couldn't reach GitHub"
              : null,
        use: useWord(),
        hypeMentions: latest?.news_mentions_7d ?? null,
        hypeCollecting: baselineWeeks < 8,
        baselineWeeks,
        spark,
        promises: promises.map((pr: any) => ({
          criteria: pr.criteria ?? pr.lineage ?? "Promise",
          state: pr.state ?? "open",
          core: !!pr.core,
          sourceUrl: pr.evidence?.[0]?.url ?? null,
        })),
      };
    })
  );

  rows.sort((a, b) => b.filledPct - a.filledPct || b.earned - a.earned || a.name.localeCompare(b.name));
  rows.forEach((r, i) => { r.rank = i + 1; });

  return (
    <>
      <h1 className="sr-only">Prove Value: did crypto projects actually deliver what they promised?</h1>

      {rows.length === 0 ? (
        <div className="panel search-section" {...searchMeta({ id: "scoreboard-overview", title: "Project scoreboard", kind: "Scoreboard", keywords: "hearts promises rankings" })}>
          <h2>
            <Icon name="inbox" size={18} style={{ marginRight: 10 }} />
            No scores published
          </h2>
          <p className="panel-sub" style={{ marginBottom: 0 }}>
            The heart database is not reachable or no run is published yet.
          </p>
        </div>
      ) : (
        <>
          <ScoreboardTable rows={rows} />
          <div className="panel search-section" {...searchMeta({ id: "scoreboard-hype-share", title: "HYPE share", kind: "Scoreboard", keywords: "attention news mentions history" })} style={{ marginTop: 18 }}>
            <h2>HYPE share</h2>
            <p className="explain">
              Each project's slice of observed attention over time. Attention, not endorsement.
            </p>
            <HypeShareChart snapshots={hypeSnaps} names={names} />
          </div>
        </>
      )}
    </>
  );
}
