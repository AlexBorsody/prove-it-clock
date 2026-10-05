import Link from "next/link";
import {
  readPublishedPromiseLedger,
  readHypeSnapshots,
  latestHypeBySlug,
  hypeBaselineWeeks,
  codeWord,
  useWord,
  type HypeSnapshot,
} from "@/lib/heart-data";
import { fetchVitals } from "@/lib/vitals";
import type { CompareProject } from "@/components/compare-table";
import ScoreboardTable, { type ScoreboardRow } from "@/components/scoreboard-table";
import Icon from "@/components/chrome-icons";
import { searchMeta } from "@/lib/search-sections";

import { adaptAtlas } from '@/lib/atlas/adapter';
import { summarizeDelivery } from '@/lib/promise-verdict';
import { fetchUniverseMarkets, type UniverseRow } from '@/providers/coingecko';
import { marketCapFor } from '@/lib/market-ids';
import type { AtlasDataset } from '@/lib/atlas/types';
import projectsDoc from '../../../data/projects.json';

export const dynamic = "force-dynamic";

export default async function Home() {
  let projects: any[] = [];
  let hypeSnaps: HypeSnapshot[] = [];
  let atlas: AtlasDataset | null = null;
  let markets: UniverseRow[] = [];
  let loadFailed=false;
  try {
    const [ledger, hype, marketRows] = await Promise.all([
      readPublishedPromiseLedger(),
      readHypeSnapshots().catch(() => [] as HypeSnapshot[]),
      fetchUniverseMarkets(20).catch(() => [] as UniverseRow[]),
    ]);
    projects = ledger.projects;
    atlas = adaptAtlas(ledger);
    markets = marketRows;
    hypeSnaps = hype;
  } catch {
    loadFailed=true;
  }

  const hypeLatest = latestHypeBySlug(hypeSnaps);
  const baselineWeeks = hypeBaselineWeeks(hypeSnaps);

  // Merge Supabase scored projects with projects.json intake (263 total)
  const scoredBySlug = new Map(projects.map((p: any) => [p.slug, p]));
  const allProjects = (projectsDoc.projects as any[]).map((jp: any) => {
    const scored = scoredBySlug.get(jp.slug);
    if (scored) return scored;
    // Unscored intake project: basic row without hearts
    return {
      slug: jp.slug,
      name: jp.name,
      symbol: jp.symbol,
      earned: 0,
      capacity: 0,
      assessment: { promises: [] },
    };
  });

  const items = await Promise.all(
    allProjects.map(async (p) => {
      const vitals = await fetchVitals(p.slug).catch(() => null);
      const promises: any[] = p.assessment?.promises ?? [];
      const nodes = atlas?.nodes.filter(node => node.projectSlug === p.slug) ?? [];
      const categoryByLineage = new Map(nodes.map(node => [node.lineageId, node.primaryCategory]));
      const latest = hypeLatest[p.slug];
      const filledPct = p.capacity > 0 ? p.earned / p.capacity : 0;
      const row: ScoreboardRow = {
        slug: p.slug,
        name: p.name,
        symbol: p.symbol,
        rank: 0, // assigned below
        earned: p.earned,
        capacity: p.capacity,
        filledPct,
        code: codeWord(vitals ? { commits90d: vitals.commits90d } : null),
        codeCommits: vitals?.commits90d ?? null,
        codeStars: vitals?.stars ?? null,
        marketCap: marketCapFor(p.slug,markets),
        delivery: atlas ? summarizeDelivery(atlas,p.slug) : null,
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
        promises: promises.map((pr: any) => ({
          lineage: String(pr.lineage),
          category: categoryByLineage.get(String(pr.lineage)) ?? null,
          criteria: pr.criteria ?? pr.lineage ?? "Promise",
          state: pr.state ?? "open",
          core: !!pr.core,
          sourceUrl: pr.evidence?.[0]?.url ?? null,
        })),
      };
      const count = (state: string) => nodes.filter(node => node.state === state).length;
      const comparison: CompareProject = {
        slug: row.slug, name: row.name, symbol: row.symbol,
        earned: row.earned, capacity: row.capacity, filledPct: row.filledPct, assessmentAvailable: row.delivery != null,
        promiseCounts: { total: nodes.length, fulfilled: count("kept"), active: count("in_progress"), open: count("open"), lapsed: count("lapsed"), retired: count("retired"), unknown: count("unknown") },
        code: { word: row.code, stars: row.codeStars, commits90d: row.codeCommits, lastCommitAt: vitals?.lastCommitAt ?? null, openPRs: vitals?.openPRs ?? null, unreachable: vitals != null && vitals.commits90d == null && vitals.partial },
        use: row.use, hype: { mentions: row.hypeMentions, collecting: row.hypeCollecting, baselineWeeks },
      };
      return { row, comparison };
    })
  );
  const rows = items.map(item => item.row);

  rows.sort((a, b) => b.filledPct - a.filledPct || b.earned - a.earned || a.name.localeCompare(b.name));
  rows.forEach((r, i) => { r.rank = i + 1; });

  return (
    <>
      <p><Link href="/atlas" className="btn">Explore the Promise Atlas ↗</Link></p>
      <h1 className="sr-only">Prove Value: did crypto projects actually deliver what they promised?</h1>

      {rows.length === 0 ? (
        <div className="panel search-section" {...searchMeta({ id: "scoreboard-overview", title: "Project scoreboard", kind: "Scoreboard", keywords: "promises rankings" })}>
          <h2>
            <Icon name="inbox" size={18} style={{ marginRight: 10 }} />
            {loadFailed ? "Promise ledger unavailable" : "No scores published"}
          </h2>
          <p className="panel-sub" style={{ marginBottom: 0 }}>
            {loadFailed ? "The promise ledger could not be loaded." : "No run is published for the active methodology yet."}
          </p>
        </div>
      ) : (
        <ScoreboardTable rows={rows} compareProjects={items.map(item => item.comparison)} />
      )}
    </>
  );
}
