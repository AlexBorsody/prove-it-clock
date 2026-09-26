import { notFound } from "next/navigation";
import Link from "next/link";
import {
  HEARTS_METHODOLOGY,
  readHeartHistory,
  readHeartRankings,
  readHypeSnapshotsFor,
  readHypeSnapshots,
  latestHypeBySlug,
  hypeBaselineWeeks,
} from "@/lib/heart-data";
import { verdictFor, type VerdictCategory } from "@/lib/verdict";
import { normalizePromiseState } from "@/lib/hearts";
import { verdictLine } from "../../../../../data/verdict-lines";
import { potentialRationale } from "../../../../../data/potential";
import { fetchVitals, VITALS_REPOS } from "@/lib/vitals";
import HeartMeter from "@/components/heart-meter";
import ShitcoinMeter from "@/components/shitcoin-meter";
import DeliveryTimeline from "@/components/delivery-timeline";
import Icon from "@/components/chrome-icons";
import { GithubMark } from "@/components/icons";

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

  const [historyData, rankings, vitals, hypeSnaps] = await Promise.all([
    readHeartHistory(slug, HEARTS_METHODOLOGY, 1, 100).catch(() => ({ points: [] as any[] })),
    readHeartRankings(HEARTS_METHODOLOGY, 1, 100).catch(() => ({ projects: [] as any[] })),
    fetchVitals(slug).catch(() => null),
    readHypeSnapshotsFor(slug).catch(() => [] as any[]),
  ]);

  const points: any[] = historyData.points ?? [];
  if (!points.length) notFound();

  const latest = points[0];
  const assessment = latest.assessment ?? {};
  const promises: any[] = assessment.promises ?? [];
  const available = points.filter((p: any) => p.availability === "available");
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

  const heartPoints = available.map((p: any) => ({ as_of: p.as_of, filled: p.earned, capacity: p.capacity }));
  const codeWeeks = vitals?.weeks?.map((w: any) => ({ week: w.week, total: w.total })) ?? null;
  const hypePoints = hypeSnaps
    .filter((s: any) => s.news_mentions_7d != null)
    .map((s: any) => ({ as_of: s.as_of, mentions: s.news_mentions_7d as number }));

  const hypeMentions: number | null = hypeLatest?.news_mentions_7d ?? null;
  const hypeCollecting = baselineWeeks < 8;

  // Power-grid denominators: CODE and HYPE bars scale to the current
  // leader across tracked projects. Vitals are cached upstream (6h), the
  // same fetch pattern /code uses.
  const peerVitals = await Promise.all(
    Object.keys(VITALS_REPOS).map((ps) =>
      ps === slug ? Promise.resolve(vitals) : fetchVitals(ps).catch(() => null)
    )
  );
  const maxCommits = Math.max(1, ...peerVitals.map((v) => v?.commits90d ?? 0));
  const allHypeSnaps = await readHypeSnapshots().catch(() => [] as any[]);
  const hypeLeaders = latestHypeBySlug(allHypeSnaps);
  const maxMentions = Math.max(
    1,
    ...Object.values(hypeLeaders).map((sn: any) => sn.news_mentions_7d ?? 0)
  );

  return (
    <>
      {/* 1. Header: icon, name, rank, big hearts, Shitcoin warning, one-liner. */}
      <div className="panel card section-hero">
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
        <div id="verdict" data-tour="shitcoin">
          <ShitcoinMeter category={verdict} inputs={verdictInputs} emptyText={verdictEmptyText} />
        </div>
        {oneLiner ? (
          <p className="panel-sub" style={{ marginBottom: 0, marginTop: 12 }}>{oneLiner}</p>
        ) : null}
      </div>

      {/* 2. Power grid: Marvel-card meters for PROMISES / CODE / USE / HYPE. */}
      <div className="panel">
        <h2>Power grid</h2>
        <div className="power-grid">
          <a href="#promises" className="power-row power-link">
            <span className="power-head">
              <span className="power-label"><Icon name="promise" size={14} /> Promises</span>
              <span className="power-val num">{latest.earned} of {latest.capacity}</span>
            </span>
            <span className="power-bar" role="img" aria-label={`${Math.round(filledPct * 100)} percent of potential earned`}>
              <span className="power-fill good" style={{ width: `${Math.round(filledPct * 100)}%` }} />
            </span>
            <span className="cell-sub">{Math.round(filledPct * 100)}% earned</span>
          </a>
          <Link href="/code" className="power-row power-link" aria-label="CODE ranking">
            <span className="power-head">
              <span className="power-label"><Icon name="code" size={14} /> Code</span>
              <span className="power-val num">
                {vitals?.commits90d != null ? vitals.commits90d.toLocaleString() : "-"}
              </span>
            </span>
            <span className="power-bar" role="img" aria-label="Commits versus the most active project">
              <span
                className="power-fill code"
                style={{ width: `${vitals?.commits90d != null ? Math.round((vitals.commits90d / maxCommits) * 100) : 0}%` }}
              />
            </span>
            <span className="cell-sub">
              {vitals?.commits90d != null
                ? "commits / 90d · bar scales to the leader"
                : vitals != null && vitals.partial
                  ? "Couldn't reach GitHub"
                  : "No commit data"}
            </span>
          </Link>
          <div className="power-row power-off">
            <span className="power-head">
              <span className="power-label"><Icon name="use" size={14} /> Use</span>
              <span className="power-val"><span className="word dim">coming</span></span>
            </span>
            <span className="power-bar" aria-hidden="true"><span className="power-fill" style={{ width: "0%" }} /></span>
            <span className="cell-sub">intended-use metrics</span>
          </div>
          <Link href="/hype" className="power-row power-link" aria-label="HYPE ranking">
            <span className="power-head">
              <span className="power-label"><Icon name="hype" size={14} /> Hype</span>
              <span className="power-val num">
                {hypeMentions != null ? hypeMentions.toLocaleString() : "-"}
              </span>
            </span>
            <span className="power-bar" role="img" aria-label="Mentions versus the most hyped project">
              <span
                className="power-fill hype"
                style={{ width: `${hypeMentions != null ? Math.round((hypeMentions / maxMentions) * 100) : 0}%` }}
              />
            </span>
            <span className="cell-sub">
              {hypeMentions != null
                ? hypeCollecting
                  ? `mentions / 7d · collecting, week ${baselineWeeks}/8`
                  : "mentions / 7d · bar scales to the leader"
                : "no data"}
            </span>
          </Link>
        </div>
        <p className="panel-sub" style={{ marginBottom: 0, marginTop: 12 }}>
          Hearts measure promises kept. CODE, USE and HYPE add context; only hearts move the meter.
        </p>
      </div>

      {/* 3. Delivery timeline. */}
      <div className="panel section-alt" data-tour="timeline">
        <h2>Delivery timeline</h2>
        <p className="panel-sub">
          Hearts earned over time. Rises and falls are the story: when the evidence changed, the line moved.
        </p>
        <DeliveryTimeline hearts={heartPoints} codeWeeks={codeWeeks} hypePoints={hypePoints} />
      </div>

      {/* 4. Promises, with machinery hidden under the hood. */}
      <div className="panel" id="promises">
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
          return (
            <div className="comp-row" key={i}>
              <div className="promise-head">
                <Icon name="heart" size={20} filled={h.filled} title={h.label} style={{ color: h.color }} />
                <div className="comp-name">{pr.criteria}</div>
              </div>
              <div className="comp-tags">
                <span className={`tag ${d.tone === "good" ? "measured" : d.tone === "bad" ? "bad" : "na"}`}>{d.label}</span>
                {pr.core ? <span className="tag na">Main promise</span> : null}
              </div>
              <p className="comp-desc">{pr.rationale}</p>
              {pr.evidence?.length > 0 && (
                <div className="comp-meta">
                  {pr.evidence.map((e: any, j: number) => (
                    <span key={j}>
                      {j > 0 && " · "}
                      <a href={e.url} target="_blank" rel="noreferrer">{e.summary ?? e.url}</a>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <details className="panel fold" style={{ marginTop: 18 }}>
          <summary>Under the hood</summary>
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
        </details>
      </div>

      {/* 5. HYPE. */}
      <div className="panel section-alt">
        <h2>HYPE</h2>
        <p className="panel-sub">
          How much attention {latest.name} is getting. Attention, not endorsement: HYPE never improves the score.
        </p>
        <div className="num" style={{ fontSize: 34, fontWeight: 700 }}>
          {hypeMentions != null ? hypeMentions.toLocaleString() : "-"}
        </div>
        <div style={{ marginTop: 8 }}>
          {hypeMentions != null && hypeCollecting ? (
            <span className="tag na">collecting, week {baselineWeeks}/8</span>
          ) : hypeMentions != null ? (
            <span className="tag na">mentions / 7d</span>
          ) : (
            <span className="tag na">no data yet</span>
          )}
        </div>
        <p className="panel-sub" style={{ marginBottom: 0, marginTop: 12 }}>
          <Link href="/hype">See the HYPE leaderboard</Link>
        </p>
      </div>

      {/* 6. Evidence and methodology. */}
      <div className="panel">
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
