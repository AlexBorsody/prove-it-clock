import {
  readHypeSnapshots,
  latestHypeBySlug,
  hypeBaselineWeeks,
  codeWord,
  useWord,
  type HypeSnapshot,
} from "@/lib/heart-data";
import { getPublishedLedger, getPublishedAtlas } from '@/lib/atlas/data';
import { summarizeDelivery } from '@/lib/promise-verdict';
import type { AtlasDataset } from '@/lib/atlas/types';
import { normalizePromiseState } from "@/lib/hearts";
import { fetchVitals } from "@/lib/vitals";
import CompareTable, { type CompareProject } from "@/components/compare-table";
import ButtonLink from "@/components/button-link";
import { searchMeta } from "@/lib/search-sections";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  let projects: any[] = [];
  let atlas: AtlasDataset | null = null;
  let hypeSnaps: HypeSnapshot[] = [];
  try {
    const [rankings, hype, publishedAtlas] = await Promise.all([
      getPublishedLedger(),
      readHypeSnapshots().catch(() => [] as HypeSnapshot[]),
      getPublishedAtlas().catch(() => null),
    ]);
    atlas = publishedAtlas;
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
      const latest = hypeLatest[p.slug];
      return {
        slug: p.slug,
        name: p.name,
        symbol: p.symbol,
        delivery: atlas ? summarizeDelivery(atlas, p.slug) : null,
        earned: p.earned,
        capacity: p.capacity,
        filledPct: p.capacity > 0 ? p.earned / p.capacity : 0,
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
      <div className="search-section" {...searchMeta({ id: "compare-stocks", title: "Speculative Tech", kind: "Stocks", keywords: "stocks management promises fundamentals expectation gap" })}>
        <h2 className="page-title" style={{ fontSize: 22 }}>Speculative Tech</h2>
        <p className="page-sub">
          The same promise ledger, for high-expectation companies: what management told the world
          would happen, every revision they made, what actually happened, and how much of the
          valuation still depends on outcomes that have not happened yet. Tesla is the reference case.
        </p>
        <p>
          <ButtonLink href="/stocks" variant="primary">Open the stock ledger</ButtonLink>
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
