import { notFound } from "next/navigation";
import { HEARTS_METHODOLOGY, readHeartHistory } from "@/lib/heart-data";
import HeartMeter from "@/components/heart-meter";
import ShitcoinBadge, { shitcoinScore } from "@/components/shitcoin-badge";
import Vitals from "@/components/vitals";
import HeartsTimeline from "@/components/hearts-timeline";
import TimelineChart from "@/components/timeline-chart";

export const dynamic = "force-dynamic";

function fmtUsd(v: number | null | undefined): string {
  if (v == null) return "n/a";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  if (v >= 1) return `$${v.toFixed(2)}`;
  return `$${v.toPrecision(2)}`;
}

function stateTag(state: string): string {
  switch (state) {
    case "fulfilled": return "measured"; // proven: green
    case "active": return "measured"; // earning hearts now: green, not amber
    case "lapsed": return "bad"; // hearts lost: red
    case "retired": return "na"; // ended: neutral
    default: return "bad"; // unfulfilled
  }
}

function stateLabel(state: string): string {
  switch (state) {
    case "fulfilled": return "Proven";
    case "active": return "Active";
    case "lapsed": return "Lapsed";
    case "retired": return "Ended";
    default: return "Not yet proven"; // unfulfilled
  }
}

function claimLabel(t: string): string {
  if (t === "milestone") return "One-time";
  if (t === "ongoing") return "Ongoing";
  return t;
}

function heartLabel(pr: any): string | null {
  if (!pr.reward) return null;
  const n = `${pr.reward} heart${pr.reward > 1 ? "s" : ""}`;
  if (pr.state === "retired" || pr.state === "lapsed") return `${n} earned, then lost`;
  if (pr.state === "fulfilled" || pr.state === "active") return `${n} earned`;
  return null;
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let points: any[] = [];
  try {
    const data = await readHeartHistory(slug, HEARTS_METHODOLOGY, 1, 100);
    points = data.points;
  } catch {
    // fall through to the not-scored state
  }
  if (!points.length) notFound();

  const latest = points[0];
  const assessment = latest.assessment ?? {};
  const promises: any[] = assessment.promises ?? [];
  const available = points.filter((p: any) => p.availability === "available");
  const peak = available.length
    ? Math.max(...available.map((p: any) => p.filled))
    : latest.filled;
  const shitcoin = shitcoinScore({
    promises,
    capacity: latest.capacity,
    filled: latest.filled,
    peak,
  });

  return (
    <>
      <div className="meta-line">
        PROJECT <b>{latest.symbol}</b>
        {latest.market_cap_rank ? <> · MCAP RANK <b>#{latest.market_cap_rank}</b></> : null}
      </div>

      {/* The meter. */}
      <div className="panel card section-hero">
        <h1 className="page-title">{latest.name}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <HeartMeter filled={latest.filled} capacity={latest.capacity} allowance={latest.allowance ?? 0} size={34} />
          <div className="num" style={{ fontSize: 28, fontWeight: 700 }}>
            {latest.filled}<span style={{ color: "var(--text-faint)", fontSize: 18 }}>/{latest.capacity}</span>
          </div>
          <ShitcoinBadge score={shitcoin} capacity={latest.capacity} />
        </div>
        <p className="card-foot num" style={{ marginTop: 12 }}>
          {latest.earned} earned · {latest.allowance} free · {fmtUsd(latest.price_usd)} · {fmtUsd(latest.market_cap_usd)} mcap
        </p>
        {assessment.rationale && (
          <p className="panel-sub" style={{ marginBottom: 0 }}>{assessment.rationale}</p>
        )}
      </div>

      {/* Live ecosystem stats. Display only, never scored. */}
      <Vitals slug={slug} earned={latest.earned} capacity={latest.capacity} />

      {/* The graph. */}
      <div className="panel">
        <h2>Heart history</h2>
        <p className="panel-sub">
          Each dot is a past score. When the evidence changed, the line moved:
          up when the project proved something, down when proof fell apart.
        </p>
        <HeartsTimeline points={points.filter((p) => p.availability === "available").map((p) => ({ as_of: p.as_of, filled: p.filled, capacity: p.capacity }))} />
      </div>

      {/* Legacy v0.2.0 score timeline. */}
      <div className="panel section-alt">
        <h2>Legacy score history</h2>
        <p className="panel-sub">
          Scores from the old system (v0.2.0), kept for reference. Not every project
          was scored under it. An empty timeline means no old data, not a zero.
        </p>
        <TimelineChart slug={slug} />
      </div>

      {/* The evidence. */}
      <div className="panel">
        <h2>Promises</h2>
        <p className="panel-sub">
          What {latest.name} promised, and what actually happened. Each promise is
          scored on its own. The hearts add up to the meter at the top.
        </p>
        {promises.map((pr, i) => (
          <div className="comp-row" key={i}>
            <div className="comp-name">{pr.criteria}</div>
            <div className="comp-tags">
              <span className={`tag ${stateTag(pr.state)}`}>{stateLabel(pr.state)}</span>
              <span className="tag na">{claimLabel(pr.claim_type)}</span>
              {pr.core ? <span className="tag na">Main promise</span> : null}
              {heartLabel(pr) ? <span className="comp-hearts num">{heartLabel(pr)}</span> : null}
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
        ))}
        {assessment.allowance_rationale && (
          <>
            <h2 style={{ marginTop: 20 }}>Free hearts</h2>
            <p className="panel-sub" style={{ marginBottom: 0 }}>{assessment.allowance_rationale}</p>
          </>
        )}
      </div>

      {/* Technical details for the curious. */}
      <details className="panel fold section-alt">
        <summary className="fold-head">
          Look under the hood
        </summary>
        <div className="fold-body">
          <p>
            The technical details behind this score. Scoring method:{" "}
            <span className="num">{latest.methodology}</span>
          </p>
          <table className="spec">
            <tbody>
              <tr><th>Run ID</th><td className="num">{latest.run_id}</td></tr>
              <tr><th>Scored as of</th><td className="num">{String(latest.as_of).slice(0, 10)}</td></tr>
              <tr><th>Capacity</th><td className="num">{latest.capacity}</td></tr>
              <tr><th>Earned hearts</th><td className="num">{latest.earned}</td></tr>
              <tr><th>Free hearts</th><td className="num">{latest.allowance}</td></tr>
              <tr><th>Filled</th><td className="num">min({latest.capacity}, {latest.earned} + {latest.allowance}) = {latest.filled}</td></tr>
              {latest.market_observed_at && (
                <tr><th>Market data</th><td className="num">
                  observed {String(latest.market_observed_at).slice(0, 10)} · {fmtUsd(latest.price_usd)} · {fmtUsd(latest.market_cap_usd)} mcap · {latest.market_source_url}
                </td></tr>
              )}
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
                  <td>{pr.state}</td>
                  <td className="num">{String(pr.effective_at ?? "").slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
