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
import { getPublishedLedger, getPublishedAtlas } from '@/lib/atlas/data';
import { summarizeDelivery } from '@/lib/promise-verdict';
import { receiptRevision } from '@/lib/promise-receipts';
import DocumentedProblems from "@/components/documented-problems";
import PromiseNews from "@/components/promise-news";
import DeliveryVerdict from "@/components/delivery-verdict";
import { promiseReferences, PROMISE_FILTERS, type PromiseFilter } from "@/lib/promise-context";
import type { CategoryId } from "../../../../../data/atlas-taxonomy";
import PromisesPanel from "@/components/promises-panel";
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
import ProjectTimeline from '@/components/project-timeline';
import ProjectAtlas from "@/components/atlas/project-atlas";
import { searchMeta } from "@/lib/search-sections";
import { projectFlags } from "@/lib/project-policy";
import styles from "./page.module.css";
import seedsDoc from "../../../../../data/projects.json";

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
  // Intake stubs: listed for coverage, not scored. Label them honestly.
  const seed = (seedsDoc as any).projects?.find((p: any) => p.slug === slug);
  const provisionalReason: string | null = seed?.provisional === true
    ? (seed.provisional_reason ?? "Provisional intake stub: research dossier pending.")
    : null;
  const composition = atlas ? summarizeDelivery(atlas,slug) : null;
  const assessment = latest.assessment ?? {};
  const promises: any[] = assessment.promises ?? [];
  const promiseRefs = promiseReferences(slug, promises);
  // Atlas category per promise lineage, so the category dropdown can
  // filter the hearts and the promise list to the same population.
  const categoryByLineage: Record<string, CategoryId | null> = {};
  if (atlas) {
    for (const node of atlas.nodes) {
      if (node.projectSlug === slug) categoryByLineage[String(node.lineageId)] = node.primaryCategory;
    }
  }
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
      <div className="panel card section-hero search-section" {...searchMeta({ id: `project-${slug}-overview`, title: `${latest.name} overview`, kind: "Project", project: slug, keywords: `${latest.symbol} promises potential ranking` })}>
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
        {provisionalReason && <p className="panel-sub"><span className="tag warn">Provisional</span> {provisionalReason}</p>}
        {Number.isFinite(Date.parse(latest.as_of)) && (
          <p className="panel-sub" style={{ marginTop: 10 }}>
            Assessment as of {new Date(latest.as_of).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })}
          </p>
        )}
      </div>

      <span id="hearts" aria-hidden="true" />

      {/* Delivery verdict: three-meter weighted verdict from the same ledger. */}
      <DeliveryVerdict slug={slug} name={latest.name} />

      {/* All promise content lives in one consolidated panel below:
          help expander, delivery health, the promise list, documented
          problems, and the stats. */}
      <div className="panel search-section" data-tour="promises" {...searchMeta({ id: `project-${slug}-promises`, title: `${latest.name} promises`, kind: "Promises", project: slug, keywords: `${latest.symbol} delivery health evidence` })}>
        <span id="promises" aria-hidden="true" />
        <PromisesPanel
          slug={slug}
          name={latest.name}
          promises={promises}
          filter={filter}
          evidence={query.evidence}
          summary={composition}
          revision={atlas ? receiptRevision(atlas) : null}
          categoryByLineage={categoryByLineage}
        />
        <DocumentedProblems slug={slug} name={latest.name} promises={promises} asOf={latest.as_of} available={latest.availability === "available"} />
      </div>

      <Suspense fallback={<section className="panel"><h2>Promise timeline</h2><p role="status">Loading promise history…</p></section>}>
        <ProjectTimeline slug={slug} name={latest.name} revisionId={query.history}/>
      </Suspense>

      <section className={`panel ${styles.promiseUpdates}`} aria-label={`${latest.name} promise news and notifications`}>
        <PromiseNews slug={slug} name={latest.name} symbol={latest.symbol} promises={promiseRefs} />
        <NotifyCard projectSlug={slug} projectName={latest.name} />
      </section>

      <section className="panel atlas-section search-section" {...searchMeta({id:`project-${slug}-atlas`,title:`${latest.name} Promise Atlas`,kind:'Atlas',project:slug,keywords:'promise categories evidence'})}>
        <Suspense fallback={<><h2>{latest.name} Promise Atlas</h2><p role="status">Loading the promise map…</p></>}>
          <ProjectAtlas slug={slug} name={latest.name}/>
        </Suspense>
      </section>

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
