import {
  HEARTS_METHODOLOGY,
  readHeartRankings,
  readHypeSnapshots,
  latestHypeBySlug,
  hypeBaselineWeeks,
  codeWord,
  useWord,
  type HypeSnapshot,
} from "@/lib/heart-data";
import { verdictFor, type VerdictCategory } from "@/lib/verdict";
import { verdictLine } from "../../../../data/verdict-lines";
import { fetchVitals } from "@/lib/vitals";
import CompareTable, { type CompareProject } from "@/components/compare-table";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
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

  const items: CompareProject[] = await Promise.all(
    projects.map(async (p) => {
      const vitals = await fetchVitals(p.slug).catch(() => null);
      const promises: any[] = p.assessment?.promises ?? [];
      const abandoned = promises.filter((pr) =>
        pr.lineage === "lapsed" || pr.lineage === "retired"
      ).length;
      const fulfilled = promises.filter(
        (pr) => pr.state === "fulfilled" && pr.lineage !== "lapsed" && pr.lineage !== "retired"
      ).length;
      const active = promises.length - abandoned - fulfilled;
      const verdict = verdictFor(
        promises.map((pr: any) => ({ lineage: pr.lineage, state: pr.state, core: !!pr.core }))
      ).category as VerdictCategory;
      const latest = hypeLatest[p.slug];
      return {
        slug: p.slug,
        name: p.name,
        symbol: p.symbol,
        earned: p.earned,
        capacity: p.capacity,
        filledPct: p.capacity > 0 ? p.earned / p.capacity : 0,
        verdict,
        verdictLine: verdictLine(p.slug) ?? "",
        promiseCounts: { total: promises.length, active, fulfilled, abandoned },
        code: {
          word: codeWord(vitals ? { commits90d: vitals.commits90d } : null),
          commits90d: vitals?.commits90d ?? null,
          lastCommitAt: vitals?.lastCommitAt ?? null,
          openPRs: vitals?.openPRs ?? null,
        },
        use: useWord(),
        hype: {
          mentions: latest?.news_mentions_7d ?? null,
          collecting: baselineWeeks < 8,
          baselineWeeks,
        },
      };
    })
  );

  items.sort((a, b) => b.filledPct - a.filledPct || b.earned - a.earned || a.name.localeCompare(b.name));

  return (
    <>
      <h1 className="page-title">Compare</h1>
      <p className="page-sub">
        Pick two to four projects. Same metrics, side by side.
      </p>
      {items.length === 0 ? (
        <div className="panel">
          <p className="panel-sub" style={{ marginBottom: 0 }}>
            No scores published yet.
          </p>
        </div>
      ) : (
        <CompareTable projects={items} />
      )}
    </>
  );
}
