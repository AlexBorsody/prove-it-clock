import { notFound } from "next/navigation";
import Link from "next/link";
import {
  HEARTS_METHODOLOGY,
  readHeartHistory,
  readHeartRankings,
  readHypeSnapshotsFor,
  latestHypeBySlug,
  hypeBaselineWeeks,
} from "@/lib/heart-data";
import { verdictFor, type VerdictCategory } from "@/lib/verdict";
import { normalizePromiseState } from "@/lib/hearts";
import { fetchVitals, VITALS_REPOS } from "@/lib/vitals";
import { fetchTeam, teamLine } from "@/lib/team";
import HeartMeter from "@/components/heart-meter";
import ShitcoinMeter from "@/components/shitcoin-meter";
import PromiseStats from "@/components/promise-stats";
import PromiseNews from "@/components/promise-news";
import { promiseReferences, promiseFilterHref, promiseEvidenceHref, matchesPromiseFilter, promiseDisplay, PROMISE_FILTERS, type PromiseFilter } from "@/lib/promise-context";
import MarketPanel from "@/components/market-panel";
import CodeRow, { type CodeRowData } from "@/components/code-row";
import { type HypeRow } from "@/components/hype-leaderboard";
import HypeSummaryCard from "@/components/hype-summary-card";
import ButtonLink from "@/components/button-link";
import { CodeActivityChart } from "@/components/delivery-timeline";
import Icon from "@/components/chrome-icons";
import PromiseList from "@/components/promise-list";
import { searchMeta } from "@/lib/search-sections";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ promises?: string; evidence?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const filter: PromiseFilter = PROMISE_FILTERS.includes(query.promises as PromiseFilter) ? query.promises as PromiseFilter : "all";

  const [historyData, rankings, vitals, team, hypeSnaps] = await Promise.all([
    readHeartHistory(slug, HEARTS_METHODOLOGY, 1, 100).catch(() => ({ points: [] as any[] })),
    readHeartRankings(HEARTS_METHODOLOGY, 1, 100).catch(() => ({ projects: [] as any[] })),
    fetchVitals(slug).catch(() => null),
    fetchTeam(slug).catch(() => null),
    readHypeSnapshotsFor(slug).catch(() => [] as any[]),
  ]);

  const points: any[] = historyData.points ?? [];
  if (!points.length) notFound();

  const latest = points[0];
  const assessment = latest.assessment ?? {};
  const promises: any[] = assessment.promises ?? [];
  const promiseRefs = promiseReferences(slug, promises);
  const filledPct = latest.capacity > 0 ? latest.earned / latest.capacity : 0;

  // Rank across all published projects by hearts filled %, same tiebreak
  // as the scoreboard (earned desc, then name).
  const ranked = [...(rankings.projects ?? [])].sort((a, b) => {
    const pa = a.capacity > 0 ? a.earned / a.capacity : 0;
    const pb = b.capacity > 0 ? b.earned / b.capacity : 0;
    return pb - pa || b.earned - a.earned || a.name.localeCompare(b.name);
  });
  const rank = ranked.findIndex((p: any) => p.slug === slug) + 1;

  const verdictResult = verdictFor(
    promises.map((pr: any) => {
      let state = "open";
      try {
        state = normalizePromiseState(pr.state);
      } catch {
        /* unknown -> open; never a silent pass */
      }
      return { lineage: pr.lineage, state, core: !!pr.core };
    })
  );
  const verdict: VerdictCategory = verdictResult.category;
  // The exact promises feeding the meter: tap the meter, see the inputs.
  const verdictInputs = verdictResult.failedLineages.map((lineage) => {
    const pr = promises.find((p: any) => p.lineage === lineage);
    return {
      criteria: pr?.criteria ?? pr?.lineage ?? lineage,
      state: (() => {
        try {
          return normalizePromiseState(pr?.state ?? "open");
        } catch {
          return "open";
        }
      })(),
      core: !!pr?.core,
      evidenceHref: pr ? promiseEvidenceHref(slug, String(pr.lineage)) : undefined,
    };
  });
  const verdictEmptyText =
    verdict === "Watch"
      ? "A promise is overdue and under review. The meter sits at 4 until the review resolves."
      : "No failed promises in the record. The meter sits at 1.";

  // Delivery health: kept vs in play vs failed promises, shown as a bar.
  const health = { kept: 0, inPlay: 0, failed: 0 };
  for (const pr of promises) {
    const tone = promiseDisplay(pr).tone;
    if (tone === "good") health.kept++;
    else if (tone === "bad") health.failed++;
    else health.inPlay++;
  }
  const healthTotal = health.kept + health.inPlay + health.failed;

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
    verdict,
    mentions: hypeMentions,
    baselineWeeks,
    sources: hypeLatest?.sources_ok ?? [],
  };

  // Power-grid denominators: CODE and HYPE bars scale to the current
  // leader across tracked projects. Vitals are cached upstream (6h), the
  return (
    <>
      {/* 1. Header: icon, name, rank, big hearts, Shitcoin warning, one-liner. */}
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
          {rank > 0 ? <span className="rank-chip num">#{rank}</span> : null}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <HeartMeter filled={latest.earned} capacity={latest.capacity} size={34} />
        </div>
      </div>

      <span id="hearts" aria-hidden="true" />

      {/* All promise content lives in one consolidated panel below:
          help expander, delivery health, the promise list, the delivery
          verdict meter, and the stats. */}
      <div className="panel search-section" data-tour="promises" {...searchMeta({ id: `project-${slug}-promises`, title: `${latest.name} promises`, kind: "Promises", project: slug, keywords: `${latest.symbol} delivery health evidence` })}>
        <span id="promises" aria-hidden="true" />
        <h2 className="with-tip"><span>Promises</span> <Icon name="info" size={15} title={`What ${latest.name} promised, and what actually happened. One promise, one heart: earned by delivery. Open hearts are still unearned.`} /></h2>
        {healthTotal > 0 ? (
          <div className="promise-health">
            <h3 className="promise-subhead">Delivery health</h3>
            <div
              className="ph-track"
              role="group"
              aria-label={`Delivery health: ${health.kept} kept, ${health.inPlay} in play, ${health.failed} failed`}
            >
              <Link href={promiseFilterHref(slug, "kept")} className="ph-seg kept" aria-label={`Evidence for ${health.kept} kept promises`} style={{ width: `${(health.kept / healthTotal) * 100}%` }} tabIndex={-1} />
              <Link href={promiseFilterHref(slug, "in-play")} className="ph-seg inplay" aria-label={`Evidence for ${health.inPlay} in play promises`} style={{ width: `${(health.inPlay / healthTotal) * 100}%` }} tabIndex={-1} />
              <Link href={promiseFilterHref(slug, "failed")} className="ph-seg failed" aria-label={`Evidence for ${health.failed} failed promises`} style={{ width: `${(health.failed / healthTotal) * 100}%` }} tabIndex={-1} />
            </div>
            <div className="ph-legend" role="group" aria-label="Show promise evidence by delivery state">
              {([
                { key: "kept", label: "kept", count: health.kept },
                { key: "in-play", label: "in play", count: health.inPlay },
                { key: "failed", label: "failed", count: health.failed },
              ] as const).map((b) => {
                const active = filter === b.key;
                if (b.count === 0) {
                  return (
                    <span key={b.key} className={`ph-btn ${b.key} disabled`} aria-disabled="true">
                      <span className="num">{b.count}</span> {b.label}
                    </span>
                  );
                }
                return (
                  <Link
                    key={b.key}
                    className={`ph-btn ${b.key}${active ? " active" : ""}`}
                    href={promiseFilterHref(slug, active ? "all" : b.key)}
                    aria-pressed={active}
                    aria-label={active ? `Show all promises` : `Show evidence for ${b.count} ${b.label} promises`}
                  >
                    <span className="num">{b.count}</span> {b.label} {active ? "✓" : "↗"}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
        {filter !== "all" && (
          <p className="promise-filter-status" role="status">
            {(() => {
              const n = promises.filter((pr) => matchesPromiseFilter(pr.state, filter)).length;
              const label = filter.replace("-", " ");
              const showAll = <Link href={promiseFilterHref(slug, "all")}>Show all promises</Link>;
              return n === 0
                ? <>No {label} promises yet. {showAll}</>
                : <>Showing {n} {label} promise{n === 1 ? "" : "s"}. {showAll}</>;
            })()}
          </p>
        )}
        <PromiseList key={filter} slug={slug} name={latest.name} promises={promises} filter={filter} evidence={query.evidence} />
        <div className="search-section" {...searchMeta({ id: `project-${slug}-verdict`, title: `${latest.name} Shitcoin warning`, kind: "Verdict", project: slug, keywords: `${latest.symbol} failed promises warning` })} data-tour="shitcoin">
          <span id="verdict" aria-hidden="true" />
          <ShitcoinMeter category={verdict} inputs={verdictInputs} emptyText={verdictEmptyText} />
        </div>
        <PromiseStats slug={slug} name={latest.name} promises={promises} earned={latest.earned} methodology={latest.methodology} asOf={latest.as_of} available={latest.availability === "available"} bare />
      </div>

      <PromiseNews slug={slug} name={latest.name} symbol={latest.symbol} promises={promiseRefs} />

      {/* Supporting metrics: CODE, HYPE, then Market. */}
      <section className="panel section-alt code-section search-section" data-tour="code" {...searchMeta({ id: `project-${slug}-code`, title: `${latest.name} CODE`, kind: "CODE", project: slug, keywords: `${latest.symbol} GitHub commits development` })}>
        <h2>CODE <Icon name="info" size={14} title={`Who is actually working on ${latest.name}.`} /></h2>
        <div className="code-rows">
          <CodeRow
            row={codeRowData}
            search={{ id: `project-${slug}-code-row`, title: `${latest.name} CODE activity` }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <CodeActivityChart codeWeeks={codeWeeks} />
        </div>
        <p className="panel-sub" style={{ marginBottom: 0, marginTop: 12 }}>
          <ButtonLink href="/code">See the CODE ranking</ButtonLink>
        </p>
      </section>

      {/* HYPE: shared summary, directly after CODE. */}
      <section className="panel section-alt hype-section search-section" {...searchMeta({ id: `project-${slug}-hype`, title: `${latest.name} HYPE`, kind: "HYPE", project: slug, keywords: `${latest.symbol} attention mentions baseline` })}>
        <h2>HYPE</h2>
        <p className="panel-sub">
          How much attention {latest.name} is getting. Attention, not endorsement: HYPE never improves the score.
        </p>
        <HypeSummaryCard row={hypeRow} />
        <p className="panel-sub" style={{ marginBottom: 0, marginTop: 12 }}>
          <ButtonLink href="/hype">See the HYPE leaderboard</ButtonLink>
        </p>
      </section>

      <MarketPanel slug={slug} name={latest.name} symbol={latest.symbol} />
    </>
  );
}
