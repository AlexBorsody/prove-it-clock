import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import {
  readHypeSnapshots,
  readHypeSnapshotsFor,
  latestHypeBySlug,
  hypeBaselineWeeks,
} from "@/lib/heart-data";
import { fetchVitals, VITALS_REPOS } from "@/lib/vitals";
import { sortCodeRows } from "@/lib/code-ranking";
import { fetchTeam, teamLine } from "@/lib/team";
import ExpandableHeartMeter from "@/components/expandable-heart-meter";
import { getPublishedLedger, getPublishedAtlas } from '@/lib/atlas/data';
import { summarizeDelivery } from '@/lib/promise-verdict';
import { receiptRevision } from '@/lib/promise-receipts';
import DeliveryComposition from '@/components/delivery-composition';
import DocumentedProblems from "@/components/documented-problems";
import PromiseNews from "@/components/promise-news";
import { promiseReferences, promiseFilterHref, matchesPromiseFilter, PROMISE_FILTERS, type PromiseFilter } from "@/lib/promise-context";
import MarketPanel from "@/components/market-panel";
import CodeRow, { type CodeRowData } from "@/components/code-row";
import { type HypeRow } from "@/components/hype-leaderboard";
import HypeSummaryCard from "@/components/hype-summary-card";
import ContextRankBadge from "@/components/context-rank-badge";
import ButtonLink from "@/components/button-link";
import { LazyCodeActivityChart as CodeActivityChart } from "@/components/lazy-charts";
import Icon from "@/components/chrome-icons";
import InfoTip from "@/components/info-tip";
import NotifyCard from "@/components/notify-card";
import PromiseList from "@/components/promise-list";
import ProjectTimeline from '@/components/project-timeline';
import ProjectAtlas from "@/components/atlas/project-atlas";
import { searchMeta } from "@/lib/search-sections";
import { projectFlags } from "@/lib/project-policy";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ promises?: string; evidence?: string; history?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const { genesis } = projectFlags(slug);
  const filter: PromiseFilter = PROMISE_FILTERS.includes(query.promises as PromiseFilter) ? query.promises as PromiseFilter : "all";

  const [ledger, atlas, vitals, team, hypeSnaps, allHypeSnaps] = await Promise.all([
    getPublishedLedger().catch(() => null),
    getPublishedAtlas().catch(() => null),
    fetchVitals(slug).catch(() => null),
    fetchTeam(slug).catch(() => null),
    readHypeSnapshotsFor(slug).catch(() => [] as any[]),
    readHypeSnapshots().catch(() => [] as any[]),
  ]);

  if (!ledger) return <section className="panel"><h1>Project record unavailable</h1><p role="alert">The promise ledger could not be loaded.</p></section>;
  const latest = (ledger.projects as any[]).find(project=>project.slug===slug);
  if (!latest) notFound();
  const composition = atlas ? summarizeDelivery(atlas,slug) : null;
  const assessment = latest.assessment ?? {};
  const promises: any[] = assessment.promises ?? [];
  const promiseRefs = promiseReferences(slug, promises);
  const filledPct = latest.capacity > 0 ? latest.earned / latest.capacity : 0;

  // Supporting-context ranks: where this project stands among all tracked
  // projects, using the exact default sort of the destination pages.
  // Context only: these never change promise states.
  const codeRankRows = await Promise.all(
    (ledger.projects as any[]).map(async (p: any) => {
      const v = p.slug === slug ? vitals : await fetchVitals(p.slug).catch(() => null);
      return {
        slug: p.slug,
        name: p.name,
        stars: v?.stars ?? null,
        forks: v?.forks ?? null,
        watchers: v?.watchers ?? null,
        commits90d: v?.commits90d ?? null,
        failed: v == null,
      };
    })
  );
  const codeOrder = sortCodeRows(codeRankRows, "stars");
  const codeRank = codeOrder.findIndex((r) => r.slug === slug) + 1;
  const codeTotal = codeOrder.length;

  const hypeBySlug = latestHypeBySlug(allHypeSnaps);
  const hypeOrder = Object.keys(hypeBySlug)
    .map((s) => ({ slug: s, mentions: hypeBySlug[s]?.news_mentions_7d ?? null }))
    .sort((a, b) => (b.mentions ?? -1) - (a.mentions ?? -1));
  const hypeRank = hypeOrder.findIndex((r) => r.slug === slug) + 1;
  const hypeTotal = hypeOrder.length;

  const hypeLatest = latestHypeBySlug(hypeSnaps)[slug];
  const baselineWeeks = hypeBaselineWeeks(hypeSnaps);

  const codeWeeks = vitals?.weeks?.map((w: any) => ({ week: w.week, total: w.total })) ?? null;
  const hypeMentions: number | null = hypeLatest?.news_mentions_7d ?? null;

  // Shared row components: the project page renders the same CodeRow and
  // HypeRowCard as the /code and /hype list views. One component, two
  // surfaces; never duplicate the markup.
  const meta = VITALS_REPOS[slug];
  const codeFailed = vitals == null || (vitals.commits90d == null && vitals.partial);
  const codeRowData: CodeRowData = {
    slug,
    name: latest.name,
    symbol: latest.symbol,
    commits90d: vitals?.commits90d ?? null,
    stars: vitals?.stars ?? null,
    forks: vitals?.forks ?? null,
    watchers: vitals?.watchers ?? null,
    repoUrl: meta ? `https://github.com/${meta.github}` : "",
    teamLine: team ? teamLine(team) : "TEAM: Unknown · couldn't reach GitHub",
    failed: codeFailed,
  };

  // HypeRowCard on this page shares its row type with the /hype list view.
  const hypeRow: HypeRow = {
    slug,
    name: latest.name,
    symbol: latest.symbol,
    earned: latest.earned,
    capacity: latest.capacity,
    filledPct,
    mentions: hypeMentions,
    baselineWeeks,
    sources: hypeLatest?.sources_ok ?? [],
  };

  // Power-grid denominators: Code and Hype bars scale to the current
  // leader across tracked projects. Vitals are cached upstream (6h), the
  return (
    <>
      {/* 1. Header: project identity and published hearts. */}
      <div className="panel card section-hero search-section" {...searchMeta({ id: `project-${slug}-overview`, title: `${latest.name} overview`, kind: "Project", project: slug, keywords: `${latest.symbol} hearts potential ranking` })}>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <img
            src={`/icons/${latest.symbol.toLowerCase()}.svg`}
            alt=""
            width={44}
            height={44}
            className="coin-icon"
          />
          {latest.name}
          <span className="coin-symbol">{latest.symbol}</span>
        </h1>
        {genesis && <p className="panel-sub"><Link href="/methodology#evolution" className="tag na">Genesis asset</Link> Bitcoin&apos;s historical promise inventory.</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <ExpandableHeartMeter slug={slug} name={latest.name} filled={latest.earned} capacity={latest.capacity} summary={composition} size={34} />
        </div>
        {Number.isFinite(Date.parse(latest.as_of)) && (
          <p className="panel-sub" style={{ marginTop: 10 }}>
            Assessment as of {new Date(latest.as_of).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })}
          </p>
        )}
      </div>

      {/* 1b. Promise notifications: its own card with two alert tiers. */}
      <NotifyCard projectSlug={slug} projectName={latest.name} />

      <span id="hearts" aria-hidden="true" />

      {/* All promise content lives in one consolidated panel below:
          help expander, delivery health, the promise list, documented
          problems, and the stats. */}
      <div className="panel search-section" data-tour="promises" {...searchMeta({ id: `project-${slug}-promises`, title: `${latest.name} promises`, kind: "Promises", project: slug, keywords: `${latest.symbol} delivery health evidence` })}>
        <span id="promises" aria-hidden="true" />
        <h2><span>Promises</span> <InfoTip text={`What ${latest.name} promised, and what actually happened. One promise, one heart: earned by delivery. Open hearts are still unearned.`} /></h2>
        {atlas && composition && <DeliveryComposition slug={slug} summary={composition} revision={receiptRevision(atlas)}/>}
        {filter !== "all" && (
          <p className="promise-filter-status" role="status">
            {(() => {
              const n = promises.filter((pr) => matchesPromiseFilter(pr.state, filter)).length;
              const label = filter === "in-play" ? "active" : filter.replace("-", " ");
              const showAll = <Link href={promiseFilterHref(slug, "all")}>Show all promises</Link>;
              return n === 0
                ? <>No {label} promises yet. {showAll}</>
                : showAll;
            })()}
          </p>
        )}
        <PromiseList key={filter} slug={slug} name={latest.name} promises={promises} filter={filter} evidence={query.evidence} />
        <DocumentedProblems slug={slug} name={latest.name} promises={promises} asOf={latest.as_of} available={latest.availability === "available"} />
      </div>

      <Suspense fallback={<section className="panel"><h2>Promise timeline</h2><p role="status">Loading promise history…</p></section>}>
        <ProjectTimeline slug={slug} name={latest.name} revisionId={query.history}/>
      </Suspense>

      <section className="panel atlas-section search-section" {...searchMeta({id:`project-${slug}-atlas`,title:`${latest.name} Promise Atlas`,kind:'Atlas',project:slug,keywords:'promise categories evidence'})}>
        <Suspense fallback={<><h2>{latest.name} Promise Atlas</h2><p role="status">Loading the promise map…</p></>}>
          <ProjectAtlas slug={slug} name={latest.name}/>
        </Suspense>
      </section>

      <PromiseNews slug={slug} name={latest.name} symbol={latest.symbol} promises={promiseRefs} />

      <section aria-labelledby={`project-${slug}-context-heading`}>
      <header className="supporting-context-heading">
        <h2 id={`project-${slug}-context-heading`}>Supporting context</h2>
        <p className="panel-sub">Development, attention and market data. These do not add ranking points.</p>
      </header>
      <section className="panel section-alt code-section search-section" data-tour="code" {...searchMeta({ id: `project-${slug}-code`, title: `${latest.name} Code`, kind: "Code", project: slug, keywords: `${latest.symbol} GitHub commits development` })}>
        <h2>Code <InfoTip text={`Who is actually working on ${latest.name}.`} /></h2>
        <ContextRankBadge rank={codeRank} total={codeTotal} kind="Code" href="/code" basis="stars" />
        <div className="code-rows">
          <CodeRow
            row={codeRowData}
            search={{ id: `project-${slug}-code-row`, title: `${latest.name} Code activity` }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <CodeActivityChart codeWeeks={codeWeeks} />
        </div>
        <p className="panel-sub" style={{ marginBottom: 0, marginTop: 12 }}>
          <ButtonLink href="/code">See the Code ranking</ButtonLink>
        </p>
      </section>

      {/* Hype: shared summary, directly after Code. */}
      <section className="panel section-alt hype-section search-section" {...searchMeta({ id: `project-${slug}-hype`, title: `${latest.name} Hype`, kind: "Hype", project: slug, keywords: `${latest.symbol} attention mentions baseline` })}>
        <h2>Hype</h2>
        <p className="panel-sub">
          Observed attention for {latest.name}.
        </p>
        <ContextRankBadge rank={hypeRank} total={hypeTotal} kind="Hype" href="/hype" basis="7d mentions" />
        <HypeSummaryCard row={hypeRow} />
        <p className="panel-sub" style={{ marginBottom: 0, marginTop: 12 }}>
          <ButtonLink href="/hype">See the Hype leaderboard</ButtonLink>
        </p>
      </section>

      <MarketPanel slug={slug} name={latest.name} symbol={latest.symbol} />
      </section>
    </>
  );
}
