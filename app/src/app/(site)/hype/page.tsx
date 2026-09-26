import {
  HEARTS_METHODOLOGY,
  readHeartRankings,
  readHypeSnapshots,
  latestHypeBySlug,
  hypeBaselineWeeks,
  type HypeSnapshot,
} from "@/lib/heart-data";
import { verdictFor } from "@/lib/verdict";
import HypeLeaderboard, { type HypeRow } from "@/components/hype-leaderboard";
import HypeBubbles from "@/components/hype-bubbles";
import Icon from "@/components/chrome-icons";
import { searchMeta } from "@/lib/search-sections";

export const dynamic = "force-dynamic";

export default async function HypePage() {
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

  const rows: HypeRow[] = projects.map((p) => {
    const promises: any[] = p.assessment?.promises ?? [];
    const latest = hypeLatest[p.slug];
    return {
      slug: p.slug,
      name: p.name,
      symbol: p.symbol,
      earned: p.earned,
      capacity: p.capacity,
      filledPct: p.capacity > 0 ? p.earned / p.capacity : 0,
      verdict: verdictFor(
        promises.map((pr: any) => ({ lineage: pr.lineage, state: pr.state, core: !!pr.core }))
      ).category,
      mentions: latest?.news_mentions_7d ?? null,
      baselineWeeks,
      sources: latest?.sources_ok ?? [],
    };
  });

  const bubbleRows = rows
    .filter((r) => r.mentions != null)
    .map((r) => ({ slug: r.slug, symbol: r.symbol, mentions: r.mentions as number, filledPct: r.filledPct }));

  return (
    <>
      <div className="search-section" {...searchMeta({ id: "hype-overview", title: "HYPE attention", kind: "HYPE", keywords: "news social mentions" })}>
      <h1 className="page-title">HYPE</h1>
      <p className="page-sub">
        Observed attention. Never proof of support or delivery.
      </p>
      </div>

      {rows.length === 0 ? (
        <div className="panel">
          <h2>
            <Icon name="inbox" size={18} style={{ marginRight: 10 }} />
            No HYPE data yet
          </h2>
          <p className="panel-sub" style={{ marginBottom: 0 }}>
            The social pipeline has not collected snapshots yet.
          </p>
        </div>
      ) : (
        <>
          <div className="panel search-section" {...searchMeta({ id: "hype-bubbles", title: "Hype bubbles", kind: "HYPE", keywords: "attention news mentions baseline" })} style={{ marginBottom: 18 }}>
            <h2>Hype bubbles</h2>
            <p className="explain">
              HYPE is attention, not quality: bigger bubble means more crypto news mentions this week.
              "Collecting, week N/8" means the baseline is still being built. It never changes the heart score.
            </p>
            <p className="panel-sub">
              Bubble size is absolute 7-day news mentions. The green fill is
              hearts earned, the substance behind the noise.
            </p>
            <HypeBubbles rows={bubbleRows} />
          </div>
          <HypeLeaderboard rows={rows} />
        </>
      )}
    </>
  );
}
