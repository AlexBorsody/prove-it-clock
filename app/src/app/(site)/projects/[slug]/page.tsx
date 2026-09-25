import { notFound } from "next/navigation";
import Link from "next/link";
import {
  HEARTS_METHODOLOGY,
  readHeartHistory,
  readHeartRankings,
  readHypeSnapshotsFor,
  latestHypeBySlug,
  hypeBaselineWeeks,
  codeWord,
  useWord,
} from "@/lib/heart-data";
import { verdictFor, type VerdictCategory } from "@/lib/verdict";
import { verdictLine } from "../../../../../data/verdict-lines";
import { fetchVitals, VITALS_REPOS } from "@/lib/vitals";
import HeartMeter from "@/components/heart-meter";
import VerdictBadge from "@/components/verdict-badge";
import DeliveryTimeline from "@/components/delivery-timeline";

export const dynamic = "force-dynamic";

/** Display promise state: Fulfilled (earning hearts), Active (unfulfilled), Abandoned (lapsed/retired). No Overdue. */
function promiseDisplay(pr: any): { label: string; tone: "good" | "dim" | "bad" } {
  const s = pr.state;
  if (s === "lapsed" || s === "retired") return { label: "Abandoned", tone: "bad" };
  if (s === "fulfilled" || (s === "active" && (pr.reward ?? 0) > 0)) return { label: "Fulfilled", tone: "good" };
  return { label: "Active", tone: "dim" };
}

function claimLabel(t: string): string {
  if (t === "milestone") return "One-time";
  if (t === "ongoing") return "Ongoing";
  return t;
}

/** Delivery-health gauge: hearts-filled percentage as a semicircle arc. Never sentiment. */
function DeliveryGauge({ pct }: { pct: number }) {
  const R = 80;
  const L = Math.PI * R;
  const frac = Math.max(0, Math.min(1, pct));
  return (
    <svg viewBox="0 0 200 112" className="gauge" role="img" aria-label={`Delivery health ${Math.round(frac * 100)} percent`}>
      <path d="M 20,100 A 80,80 0 0 1 180,100" fill="none" stroke="var(--bg-raised)" strokeWidth={14} strokeLinecap="round" />
      <path
        d="M 20,100 A 80,80 0 0 1 180,100"
        fill="none"
        stroke="var(--green)"
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray={`${(frac * L).toFixed(1)} ${L.toFixed(1)}`}
      />
      <text x={100} y={88} textAnchor="middle" className="gauge-num num">{Math.round(frac * 100)}%</text>
    </svg>
  );
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

  const verdict: VerdictCategory = verdictFor(
    promises.map((pr: any) => ({ lineage: pr.lineage, state: pr.state, core: !!pr.core }))
  ).category;
  const oneLiner = verdictLine(slug);

  const hypeLatest = latestHypeBySlug(hypeSnaps)[slug];
  const baselineWeeks = hypeBaselineWeeks(hypeSnaps);
  const code = codeWord(vitals ? { commits90d: vitals.commits90d } : null);
  const repo = VITALS_REPOS[slug];

  const heartPoints = available.map((p: any) => ({ as_of: p.as_of, filled: p.earned, capacity: p.capacity }));
  const codeWeeks = vitals?.weeks?.map((w: any) => ({ week: w.week, total: w.total })) ?? null;
  const hypePoints = hypeSnaps
    .filter((s: any) => s.news_mentions_7d != null)
    .map((s: any) => ({ as_of: s.as_of, mentions: s.news_mentions_7d as number }));

  return (
    <>
      <div className="meta-line">
        PROJECT <b>{latest.symbol}</b>
        {rank > 0 ? <> · RANK <b className="num">#{rank}</b></> : null}
      </div>

      {/* Header: icon, name, rank, big hearts, verdict. */}
      <div className="panel card section-hero">
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src={`/icons/${latest.symbol.toLowerCase()}.svg`}
            alt=""
            width={44}
            height={44}
            className="coin-icon"
          />
          {latest.name}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <HeartMeter filled={latest.earned} capacity={latest.capacity} allowance={0} size={34} />
          <div className="num" style={{ fontSize: 28, fontWeight: 700 }}>
            {latest.earned}<span style={{ color: "var(--text-faint)", fontSize: 18 }}>/{latest.capacity}</span>
          </div>
          <VerdictBadge category={verdict} />
        </div>
        {oneLiner ? (
          <p className="panel-sub" style={{ marginBottom: 0, marginTop: 12 }}>{oneLiner}</p>
        ) : null}
      </div>

      {/* Stat strip: PROMISES / CODE / USE / HYPE. */}
      <div className="stat-strip">
        <div className="stat-cell">
          <span className="stat-label">Promises</span>
          <span className="stat-val num">{latest.earned}/{latest.capacity}</span>
          <span className="cell-sub">{Math.round(filledPct * 100)}% hearts earned</span>
        </div>
        <div className="stat-cell">
          <span className="stat-label">Code</span>
          <span className="stat-val">
            {code === "Active" ? <span className="word good">Active</span>
              : code === "Quiet" ? <span className="word dim">Quiet</span>
              : <span className="word dim">-</span>}
          </span>
          <span className="cell-sub">
            {vitals?.commits90d != null ? `${vitals.commits90d} commits / 90d` : "activity unknown"}
          </span>
        </div>
        <div className="stat-cell">
          <span className="stat-label">Use</span>
          <span className="stat-val"><span className="word dim">{useWord()}</span></span>
          <span className="cell-sub">intended-use metrics</span>
        </div>
        <div className="stat-cell">
          <span className="stat-label">Hype</span>
          <span className="stat-val num">
            {hypeLatest?.news_mentions_7d != null ? hypeLatest.news_mentions_7d.toLocaleString() : "-"}
          </span>
          <span className="cell-sub">
            {hypeLatest?.news_mentions_7d != null
              ? baselineWeeks < 8
                ? `collecting, week ${baselineWeeks}/8`
                : "mentions / 7d"
              : "no data"}
          </span>
        </div>
      </div>

      {/* Delivery health + timeline. */}
      <div className="panel">
        <h2>Delivery timeline</h2>
        <div className="delivery-head">
          <div>
            <div className="stat-label" style={{ marginBottom: 4 }}>Delivery health</div>
            <DeliveryGauge pct={filledPct} />
          </div>
          <p className="panel-sub delivery-note">
            Share of hearts earned. Delivery health is the meter, not a
            sentiment reading. Rises and falls on the graph are the product:
            when the evidence changed, the line moved.
          </p>
        </div>
        <DeliveryTimeline hearts={heartPoints} codeWeeks={codeWeeks} hypePoints={hypePoints} />
      </div>

      {/* Promises with evidence. */}
      <div className="panel">
        <h2>Promises</h2>
        <p className="panel-sub">
          What {latest.name} promised, and what actually happened. The hearts
          add up to the meter at the top.
        </p>
        {promises.map((pr, i) => {
          const d = promiseDisplay(pr);
          return (
            <div className="comp-row" key={i}>
              <div className="comp-name">{pr.criteria}</div>
              <div className="comp-tags">
                <span className={`tag ${d.tone === "good" ? "measured" : d.tone === "bad" ? "bad" : "na"}`}>{d.label}</span>
                <span className="tag na">{claimLabel(pr.claim_type)}</span>
                {pr.core ? <span className="tag na">Main promise</span> : null}
                {pr.reward ? <span className="comp-hearts num">{pr.reward} heart{pr.reward > 1 ? "s" : ""}</span> : null}
              </div>
              <p className="comp-desc">{pr.rationale}</p>
              {pr.evidence?.length > 0 && (
                <div className="comp-meta">
                  evidence:{" "}
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
      </div>

      {/* Evidence / methodology: visible by default, no collapsible. */}
      <div className="panel section-alt">
        <h2>Evidence and methodology</h2>
        <p className="panel-sub">
          Evidence links sit with each promise above. Everything below is how
          this page was scored.
        </p>
        <table className="spec">
          <tbody>
            <tr><th>Methodology</th><td className="num">{latest.methodology}</td></tr>
            <tr><th>Run ID</th><td className="num">{latest.run_id}</td></tr>
            <tr><th>Capacity</th><td className="num">{latest.capacity} hearts</td></tr>
            <tr><th>Earned</th><td className="num">{latest.earned} hearts</td></tr>
            {repo ? (
              <tr>
                <th>Repository</th>
                <td>
                  <a href={`https://github.com/${repo.github}`} target="_blank" rel="noreferrer">
                    {repo.github}
                  </a>{" "}
                  <span style={{ color: "var(--text-faint)" }}>({repo.label})</span>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <h3 style={{ marginTop: 18 }}>Promise lineages</h3>
        <table className="spec">
          <thead>
            <tr><th>Lineage</th><th>Type</th><th>Reward</th><th>State</th><th>Effective</th></tr>
          </thead>
          <tbody>
            {promises.map((pr: any, i: number) => (
              <tr key={i}>
                <td className="num">{pr.lineage}{pr.core ? " (main)" : ""}</td>
                <td>{pr.claim_type}</td>
                <td className="num">{pr.reward}</td>
                <td>{promiseDisplay(pr).label}</td>
                <td className="num">{String(pr.effective_at ?? "").slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="panel-sub" style={{ marginTop: 14, marginBottom: 0 }}>
          <Link href="/methodology">How the scoring works</Link>
        </p>
      </div>
    </>
  );
}
