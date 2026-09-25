import { notFound } from "next/navigation";
import { HEARTS_METHODOLOGY, readHeartHistory } from "@/lib/heart-data";
import HeartMeter from "@/components/heart-meter";
import HeartsTimeline from "@/components/hearts-timeline";
import TimelineChart from "@/components/timeline-chart";

export const dynamic = "force-dynamic";

function fmtUsd(v: number | null | undefined): string {
  if (v == null) return "n/a";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function stateTag(state: string): string {
  switch (state) {
    case "fulfilled": return "measured";
    case "active": return "warn";
    case "lapsed":
    case "retired": return "na";
    default: return "bad"; // unfulfilled
  }
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

  return (
    <>
      <div className="meta-line">
        PROJECT <b>{latest.symbol}</b>
        {latest.market_cap_rank ? <> · MCAP RANK <b>#{latest.market_cap_rank}</b></> : null}
        <> · RUN <b>{String(latest.as_of).slice(0, 10)}</b></>
      </div>

      {/* The meter. */}
      <div className="panel card">
        <h1 className="page-title">{latest.name}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <HeartMeter filled={latest.filled} capacity={latest.capacity} size={34} />
          <div className="num" style={{ fontSize: 28, fontWeight: 700 }}>
            {latest.filled}<span style={{ color: "var(--text-faint)", fontSize: 18 }}>/{latest.capacity}</span>
          </div>
        </div>
        <p className="card-foot num" style={{ marginTop: 12 }}>
          {latest.earned} earned + {latest.allowance} allowance · {fmtUsd(latest.price_usd)} · {fmtUsd(latest.market_cap_usd)} mcap
        </p>
        {assessment.rationale && (
          <p className="panel-sub" style={{ marginBottom: 0 }}>{assessment.rationale}</p>
        )}
      </div>

      {/* The graph. */}
      <div className="panel">
        <h2>Heart history</h2>
        <p className="panel-sub">
          One point per published run. A heart stays earned only while its evidence
          condition holds — when evidence changes, the line moves.
        </p>
        <HeartsTimeline points={points.map((p) => ({ as_of: p.as_of, filled: p.filled, capacity: p.capacity }))} />
      </div>

      {/* Legacy v0.2.0 score timeline. */}
      <div className="panel">
        <h2>Legacy score history</h2>
        <p className="panel-sub">
          The old v0.2.0 factor scores, kept for reference. BAT was never scored
          under the legacy model, so its timeline starts with hearts.
        </p>
        <TimelineChart slug={slug} />
      </div>

      {/* The evidence. */}
      <div className="panel">
        <h2>Promises</h2>
        <p className="panel-sub">
          Each promise lineage can earn 0–2 hearts, chosen before fulfillment. Milestones stay
          earned unless retired; ongoing claims count only while active.
        </p>
        {promises.map((pr, i) => (
          <div className="comp-row" key={i}>
            <div className="comp-head">
              <span className="comp-name">
                {pr.lineage}{pr.core ? " · core" : ""} · {pr.reward}♥
              </span>
              <span style={{ display: "flex", gap: 6 }}>
                <span className={`tag ${stateTag(pr.state)}`}>{pr.state}</span>
                <span className="tag na">{pr.claim_type}</span>
              </span>
            </div>
            <p className="comp-desc">{pr.criteria}</p>
            <p className="comp-desc" style={{ color: "var(--text-faint)" }}>{pr.rationale}</p>
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
            <h2 style={{ marginTop: 20 }}>Unearned allowance</h2>
            <p className="panel-sub" style={{ marginBottom: 0 }}>{assessment.allowance_rationale}</p>
          </>
        )}
      </div>
    </>
  );
}
