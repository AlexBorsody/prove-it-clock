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
import { verdictLine } from "../../../../../data/verdict-lines";
import { potentialRationale } from "../../../../../data/potential";
import { fetchVitals, VITALS_REPOS } from "@/lib/vitals";
import { fetchTeam, teamLine } from "@/lib/team";
import HeartMeter from "@/components/heart-meter";
import ShitcoinMeter from "@/components/shitcoin-meter";
import PromiseStats from "@/components/promise-stats";
import PromiseNews from "@/components/promise-news";
import { promiseAnchor, promiseReferences } from "@/lib/promise-context";
import MarketPanel from "@/components/market-panel";
import CodeRow, { type CodeRowData } from "@/components/code-row";
import { type HypeRow } from "@/components/hype-leaderboard";
import HypeSummaryCard from "@/components/hype-summary-card";
import ButtonLink from "@/components/button-link";
import { CodeActivityChart } from "@/components/delivery-timeline";
import Icon from "@/components/chrome-icons";
import { searchMeta } from "@/lib/search-sections";

export const dynamic = "force-dynamic";

/** Display promise state using the canonical five: open / active / fulfilled / lapsed / retired. Legacy DB values normalize at the boundary. */
function promiseDisplay(pr: any): { label: string; tone: "good" | "dim" | "bad" } {
  let s: string;
  try {
    s = normalizePromiseState(pr.state);
  } catch {
    return { label: "Unknown", tone: "dim" };
  }
  if (s === "fulfilled") return { label: "Fulfilled", tone: "good" };
  if (s === "active") return { label: "Active", tone: "dim" };
  if (s === "open") return { label: "Open", tone: "dim" };
  if (s === "lapsed") return { label: "Lapsed", tone: "bad" };
  return { label: "Retired", tone: "bad" };
}

/** One promise = one heart: the heart this promise earned, is chasing, or lost. */
function promiseHeart(pr: any): { filled: boolean; color: string; label: string } {
  let s: string;
  try {
    s = normalizePromiseState(pr.state);
  } catch {
    return { filled: false, color: "var(--text-faint)", label: "No heart yet" };
  }
  if (s === "fulfilled") return { filled: true, color: "var(--green)", label: "Earned 1 heart" };
  if (s === "lapsed" || s === "retired")
    return { filled: false, color: "var(--red)", label: "Heart lost" };
  return { filled: false, color: "var(--text-faint)", label: "No heart yet" };
}

function claimLabel(t: string): string {
  if (t === "milestone") return "One-time";
  if (t === "ongoing") return "Ongoing";
  return t;
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

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
    };
  });
  const verdictEmptyText =
    verdict === "Watch"
      ? "A promise is overdue and under review. The meter sits at 4 until the review resolves."
      : "No failed promises in the record. The meter sits at 1.";
  const oneLiner = verdictLine(slug);
  const rationale = potentialRationale(slug);

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
  const repo = VITALS_REPOS[slug];

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
          <div className="num" style={{ fontSize: 28, fontWeight: 700 }}>
            {latest.earned}<span style={{ color: "var(--text-faint)", fontSize: 20 }}> of {latest.capacity} potential</span>
          </div>
        </div>
        {rationale ? <p className="potential-line">{rationale}</p> : null}
        <div className="search-section" {...searchMeta({ id: `project-${slug}-verdict`, title: `${latest.name} Shitcoin warning`, kind: "Verdict", project: slug, keywords: `${latest.symbol} failed promises warning` })} data-tour="shitcoin">
          <span id="verdict" aria-hidden="true" />
          <ShitcoinMeter category={verdict} inputs={verdictInputs} emptyText={verdictEmptyText} />
        </div>
        {oneLiner ? (
          <p className="panel-sub" style={{ marginBottom: 0, marginTop: 12 }}>{oneLiner}</p>
        ) : null}
      </div>

      <span id="hearts" aria-hidden="true" />
      <PromiseStats slug={slug} name={latest.name} promises={promises} earned={latest.earned} methodology={latest.methodology} asOf={latest.as_of} available={latest.availability === "available"} />
      <PromiseNews slug={slug} name={latest.name} symbol={latest.symbol} promises={promiseRefs} />

      <MarketPanel slug={slug} name={latest.name} symbol={latest.symbol} />

      {/* 2. CODE: the row component from the /code ranking, plus the activity chart. */}
      <section className="panel code-section search-section" {...searchMeta({ id: `project-${slug}-code`, title: `${latest.name} CODE`, kind: "CODE", project: slug, keywords: `${latest.symbol} GitHub commits development` })}>
        <h2>CODE</h2>
        <p className="panel-sub">
          Who is actually building {latest.name}. Development context only: CODE never moves the heart score.
        </p>
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

      {/* 4. Promises, with machinery hidden under the hood. */}
      <div className="panel search-section" {...searchMeta({ id: `project-${slug}-promises`, title: `${latest.name} promises`, kind: "Promises", project: slug, keywords: `${latest.symbol} delivery health evidence` })}>
        <span id="promises" aria-hidden="true" />
        <h2>Promises</h2>
        <p className="panel-sub">
          What {latest.name} promised, and what actually happened. One promise, one heart.
        </p>
        {healthTotal > 0 ? (
          <div className="promise-health">
            <div className="promise-health-label">Delivery health</div>
            <div
              className="ph-track"
              role="img"
              aria-label={`Delivery health: ${health.kept} kept, ${health.inPlay} in play, ${health.failed} failed`}
            >
              <span className="ph-seg kept" style={{ width: `${(health.kept / healthTotal) * 100}%` }} />
              <span className="ph-seg inplay" style={{ width: `${(health.inPlay / healthTotal) * 100}%` }} />
              <span className="ph-seg failed" style={{ width: `${(health.failed / healthTotal) * 100}%` }} />
            </div>
            <div className="ph-legend">
              <span className="tag measured">{health.kept} kept</span>
              <span className="tag na">{health.inPlay} in play</span>
              <span className="tag bad">{health.failed} failed</span>
            </div>
          </div>
        ) : null}
        {promises.map((pr, i) => {
          const d = promiseDisplay(pr);
          const h = promiseHeart(pr);
          // Escape every non-ID character (including underscores) without
          // collapsing distinct lineage names onto the same anchor.
          const anchor = promiseAnchor(slug, String(pr.lineage ?? i));
          const label = promiseRefs[i].label;
          return (
            <div className="comp-row search-section" key={pr.lineage ?? i} {...searchMeta({ id: anchor, title: `${latest.name}: ${pr.criteria ?? pr.lineage ?? "Promise"}`, kind: "Promise", project: slug, keywords: `${latest.symbol} ${pr.lineage ?? ""} ${pr.claim_type ?? ""} ${d.label}` })}>
              <div className="promise-head">
                <Icon name="heart" size={20} filled={h.filled} title={h.label} style={{ color: h.color }} />
                <div className="comp-name">{pr.criteria}</div>
              </div>
              <div className="comp-tags">
                <span className="tag na">{label}</span>
                <span className={`tag ${d.tone === "good" ? "measured" : d.tone === "bad" ? "bad" : "na"}`}>{d.label}</span>
                {pr.core ? <span className="tag na">Main promise</span> : null}
              </div>
              <p className="comp-desc">{pr.rationale}</p>
              {pr.evidence?.length > 0 && (
                <details className="comp-sources">
                  <summary>Sources ({pr.evidence.length})</summary>
                  <ul>
                    {pr.evidence.map((e: any, j: number) => (
                      <li key={j}>
                        <a href={e.url} target="_blank" rel="noreferrer">{e.summary ?? e.url}</a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          );
        })}
        <details className="panel fold search-section" {...searchMeta({ id: `project-${slug}-promise-rules`, title: `${latest.name} promise rules`, kind: "Methodology", project: slug, keywords: `${latest.symbol} lineage rewards states` })} style={{ marginTop: 18 }}>
          <summary>Under the hood</summary>
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Promise rules">
          <table className="spec">
            <thead>
              <tr><th>Lineage</th><th>Type</th><th>State</th></tr>
            </thead>
            <tbody>
              {promises.map((pr: any, i: number) => (
                <tr key={i}>
                  <td className="num">{pr.lineage}</td>
                  <td>{claimLabel(pr.claim_type)}</td>
                  <td>{promiseDisplay(pr).label}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </details>
      </div>

      {/* 5. HYPE: the summary card (full row lives on /hype). */}
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

      {/* 6. Evidence and methodology. */}
      <div className="panel search-section" {...searchMeta({ id: `project-${slug}-evidence`, title: `${latest.name} evidence and methodology`, kind: "Evidence", project: slug, keywords: `${latest.symbol} sources scoring history` })}>
        <h2>Evidence and methodology</h2>
        <p className="panel-sub">
          Every promise above was checked against public evidence: code,
          docs, announcements, and independent reporting.
        </p>
        <p className="panel-sub">
          Methodology {latest.methodology} scored {latest.earned} of{" "}
          {latest.capacity} hearts. No free hearts: history recalculated.
        </p>
        <p className="panel-sub">
          Run ID <span className="mono-wrap">{latest.run_id}</span>
          {repo ? (
            <> · <a href={`https://github.com/${repo.github}`} target="_blank" rel="noreferrer">{repo.github}</a></>
          ) : null}
        </p>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          <Link href="/methodology">How the scoring works</Link>
        </p>
      </div>
    </>
  );
}
