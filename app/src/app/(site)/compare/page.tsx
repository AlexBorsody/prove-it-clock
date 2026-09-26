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
import { normalizePromiseState } from "@/lib/hearts";
import { verdictLine } from "../../../../data/verdict-lines";
import { fetchVitals } from "@/lib/vitals";
import CompareTable, { type CompareProject } from "@/components/compare-table";
import { searchMeta } from "@/lib/search-sections";

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
      const states = promises.map((pr: any) => {
        try {
          return normalizePromiseState(pr.state);
        } catch {
          return "open" as const;
        }
      });
      const count = (s: string) => states.filter((x) => x === s).length;
      const verdict = verdictFor(
        promises.map((pr: any, i: number) => ({ lineage: pr.lineage, state: states[i], core: !!pr.core }))
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
        promiseCounts: {
          total: promises.length,
          open: count("open"),
          active: count("active"),
          fulfilled: count("fulfilled"),
          lapsed: count("lapsed"),
          retired: count("retired"),
        },
        code: {
          word: codeWord(vitals ? { commits90d: vitals.commits90d } : null),
          stars: vitals?.stars ?? null,
          commits90d: vitals?.commits90d ?? null,
          lastCommitAt: vitals?.lastCommitAt ?? null,
          openPRs: vitals?.openPRs ?? null,
          unreachable: vitals != null && vitals.commits90d == null && vitals.partial,
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
      <div className="search-section" {...searchMeta({ id: "compare-overview", title: "Compare projects", kind: "Compare", keywords: "hearts promises code hype side by side" })}>
      <h1 className="page-title">Compare</h1>
      <p className="page-sub">
        Pick two to four projects. Same metrics, side by side.
      </p>
      </div>
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
