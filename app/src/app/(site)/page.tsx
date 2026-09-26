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
import { verdictFor } from "@/lib/verdict";
import { fetchVitals } from "@/lib/vitals";
import ScoreboardTable, { type ScoreboardRow } from "@/components/scoreboard-table";
import { LazyHypeShareChart as HypeShareChart } from "@/components/lazy-charts";
import Icon from "@/components/chrome-icons";
import { searchMeta } from "@/lib/search-sections";

import { adaptAtlas } from '@/lib/atlas/adapter';
import { summarizeDelivery } from '@/lib/promise-verdict';
import { fetchUniverseMarkets, type UniverseRow } from '@/providers/coingecko';
import { marketCapFor } from '@/lib/market-ids';
import type { AtlasDataset } from '@/lib/atlas/types';

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
  const names: Record<string, string> = {};

  const rows: ScoreboardRow[] = await Promise.all(
    projects.map(async (p) => {
      names[p.slug] = p.name;
      const vitals = await fetchVitals(p.slug).catch(() => null);
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
      <p><Link href="/atlas" className="btn">Explore the Promise Atlas ↗</Link></p>
      <h1 className="sr-only">Prove Value: did crypto projects actually deliver what they promised?</h1>

      {rows.length === 0 ? (
        <div className="panel search-section" {...searchMeta({ id: "scoreboard-overview", title: "Project scoreboard", kind: "Scoreboard", keywords: "hearts promises rankings" })}>
          <h2>
            <Icon name="inbox" size={18} style={{ marginRight: 10 }} />
            {loadFailed ? "Promise ledger unavailable" : "No scores published"}
          </h2>
          <p className="panel-sub" style={{ marginBottom: 0 }}>
            {loadFailed ? "The promise ledger could not be loaded." : "No run is published for the active methodology yet."}
          </p>
        </div>
      ) : (
        <>
          <ScoreboardTable rows={rows} asOf={atlas?.asOf} dataRevision={atlas?.dataRevision} />
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
