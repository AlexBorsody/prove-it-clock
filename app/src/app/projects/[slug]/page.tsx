import { notFound } from "next/navigation";
import { getStore } from "@/lib/data";
import { ScoreCard, ScoreCell, EpistemicTag, StatusTag } from "@/components/score";
import type { ProjectSnapshot, SeedProject } from "@/methodology/index";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  monetary: "Monetary Asset / Store of Value",
  execution: "Smart Contract / Execution",
  payments: "Settlement / Payments",
  oracle: "Oracle / Data Infrastructure",
};

function fmtUsd(v: number | null): string {
  if (v == null) return "n/a";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

/** Deterministic evidence summary — assembled from snapshot + seed, never AI-written. */
function todaySummary(seed: SeedProject, snap: ProjectSnapshot, metrics: Record<string, number | null>): string[] {
  const lines: string[] = [];
  const achieved = seed.milestones.filter((m) => m.achieved);
  const maxLevel = achieved.length ? Math.max(...achieved.map((m) => m.level)) : 0;
  const top = achieved.find((m) => m.level === maxLevel);
  lines.push(
    `Highest demonstrated thesis milestone: Level ${maxLevel} of 5${top ? ` — ${top.evidence_summary}` : "."}`,
  );
  const fees = metrics.fees_annualized_usd;
  if (fees != null) {
    lines.push(`Users paid ${fmtUsd(fees)} in annualized protocol fees — the hardest evidence of willingness to pay.`);
  }
  const tvl = metrics.tvl_usd;
  if (tvl != null) lines.push(`${fmtUsd(tvl)} of capital is currently committed onchain (TVL).`);
  const missing = Object.entries(snap.scores.reality?.components ?? {})
    .filter(([, c]) => !c.available)
    .map(([code]) => code);
  if (missing.length) {
    lines.push(`Not yet measurable: ${missing.join(", ")} — these reduce confidence rather than being estimated.`);
  }
  return lines;
}

function HistoryChart({ history }: { history: ProjectSnapshot[] }) {
  const pts = history
    .map((h) => ({ d: h.snapshot_date, v: h.scores.reality?.value ?? null }))
    .filter((p) => p.v != null) as { d: string; v: number }[];
  if (pts.length < 2) {
    return (
      <p className="panel-sub" style={{ margin: 0 }}>
        History begins with the first snapshot ({history[0]?.snapshot_date ?? "n/a"}). Each daily
        pipeline run appends a point; trend, trajectory, and backtesting build from here.
      </p>
    );
  }
  const W = 560, H = 140, PAD = 28;
  const vs = pts.map((p) => p.v);
  const lo = Math.max(0, Math.min(...vs) - 1), hi = Math.min(10, Math.max(...vs) + 1);
  const X = (i: number) => PAD + (i / (pts.length - 1)) * (W - 2 * PAD);
  const Y = (v: number) => H - PAD - ((v - lo) / (hi - lo || 1)) * (H - 2 * PAD);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(p.v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 640 }}>
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
      {pts.map((p, i) => (
        <g key={p.d}>
          <circle cx={X(i)} cy={Y(p.v)} r="4" fill="var(--accent)" />
          <text x={X(i)} y={H - 8} fontSize="10" fill="var(--text-faint)" textAnchor="middle" fontFamily="monospace">
            {p.d.slice(5)}
          </text>
          <text x={X(i)} y={Y(p.v) - 10} fontSize="11" fill="var(--text)" textAnchor="middle" fontFamily="monospace" fontWeight="700">
            {p.v.toFixed(1)}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = getStore();
  const seed = await store.getProject(slug);
  if (!seed) notFound();
  const [scores, history, metricRows, availability, methodology] = await Promise.all([
    store.getLatestScores(),
    store.getSnapshotHistory(slug),
    store.getMetricRows(slug),
    store.getMetricAvailability(),
    store.getMethodology("0.2.0"),
  ]);
  const snap = scores[slug];
  if (!snap) notFound();
  const s = snap.scores;
  const metrics: Record<string, number | null> = {};
  for (const r of metricRows) metrics[r.metricCode] = r.value;
  const gaps = availability.filter((a) => a.projectSlug === slug);

  const realityComps = Object.entries(s.reality?.components ?? {});
  const maxMilestone = Math.max(...seed.milestones.filter((m) => m.achieved).map((m) => m.level), 0);

  return (
    <>
      <div className="meta-line">
        PROJECT <b>{seed.symbol}</b> · {CATEGORY_LABELS[seed.thesis_category] ?? seed.thesis_category} · SNAPSHOT{" "}
        <b>{snap.snapshot_date}</b> · METHODOLOGY <b>v{snap.methodology_version}</b>
      </div>
      <h1 className="page-title">{seed.name}</h1>
      <p className="page-sub">{seed.thesis}</p>

      <div className="score-grid" style={{ marginBottom: 18 }}>
        <ScoreCard label="Reality" value={s.reality?.value} sub={`confidence ${s.reality?.confidence ?? "—"}%`} status={s.reality?.status} />
        <ScoreCard label="World impact potential" value={s.world_impact_potential?.value} sub="if the thesis succeeds" />
        <ScoreCard label="Execution evidence" value={s.execution_evidence?.value} sub="evidence score, not a probability" status={s.execution_evidence?.status} />
        <ScoreCard label="Reflexivity risk" value={s.reflexivity_risk?.value} scale="risk" sub="dependence on belief" status={s.reflexivity_risk?.status} />
        <ScoreCard label="Promise gap" value={snap.derived.promise_gap} scale="gap" sub="potential − reality" />
        <ScoreCard label="Potential outlook" value={snap.derived.potential_outlook} sub="speculative, uncalibrated — not a probability" />
        <ScoreCard label="Prove-It age" value={snap.prove_it_age_years} sub={`launched ${seed.launch_date}`} />
      </div>

      <div className="panel">
        <h2>Potential outlook <EpistemicTag kind="mixed" /></h2>
        <p className="panel-sub">
          Forward-looking, but <b>not</b> a probability and <b>not</b> a price prediction — it is
          uncalibrated until historical backtesting exists. Formula:{" "}
          <span className="num">clamp(max(promise_gap, 0) × (execution_evidence / 10), 0, 10)</span>.
          It reads as: of the promise not yet realized, how much does current execution support
          capturing? A large promise gap with weak execution scores low — the thesis may be real,
          but nothing is moving toward it. This is the closest the Clock comes to “potential,”
          and it is deliberately built from evidence, not from narrative heat.
        </p>
      </div>

      <div className="panel">
        <h2>What it claims to become <EpistemicTag kind="modeling" /></h2>
        <p className="panel-sub">The project's stated thesis, as assessed for this methodology version.</p>
        <p style={{ fontSize: 15 }}>{seed.thesis}</p>
        <p style={{ color: "var(--text-dim)" }}>
          <b style={{ color: "var(--text)" }}>Measurable success would look like:</b> {seed.measurable_success}
        </p>
      </div>

      <div className="panel">
        <h2>What exists today <EpistemicTag kind="mixed" /></h2>
        <p className="panel-sub">Assembled deterministically from measured metrics and assessed milestones.</p>
        <ul style={{ margin: "0 0 0 18px", padding: 0 }}>
          {todaySummary(seed, snap, metrics).map((l, i) => (
            <li key={i} style={{ marginBottom: 8 }}>{l}</li>
          ))}
        </ul>
      </div>

      <div className="panel">
        <h2>
          Reality breakdown <EpistemicTag kind={s.reality?.epistemic ?? "mixed"} />{" "}
          <StatusTag status={s.reality?.status ?? "unavailable"} />
        </h2>
        <p className="panel-sub">
          Weights are category-specific ({seed.thesis_category}); missing inputs redistribute
          weight and reduce confidence. Gates applied:{" "}
          {s.reality?.gates_applied.length ? s.reality.gates_applied.join("; ") : "none"}.
        </p>
        {realityComps.map(([code, c]) => {
          const def = methodology.components[code];
          return (
            <div className="comp-row" key={code}>
              <div className="comp-head">
                <span className="comp-name">{def?.name ?? code}</span>
                <ScoreCell value={c.value} />
              </div>
              <p className="comp-desc">{def?.description}</p>
              <div className="comp-meta">
                weight {(c.weight * 100).toFixed(0)}%{c.available ? ` → applied ${(c.weight_applied * 100).toFixed(0)}%` : " → unavailable, redistributed"} ·{" "}
                {def?.metrics.length ? `metrics: ${def.metrics.join(", ")}` : "analyst-assessed"} ·{" "}
                <EpistemicTag kind={c.epistemic} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel">
        <h2>Protocol vs token <EpistemicTag kind="modeling" /></h2>
        <p className="panel-sub">
          A protocol can be useful while its token captures little value. These are assessed
          separately — never inferred from price.
        </p>
        <div className="score-grid">
          <ScoreCard label="Protocol reality" value={s.reality?.value} sub="same as Reality above" />
          <ScoreCard label="Token necessity" value={s.token_necessity?.value} sub={seed.assessments.token_necessity?.rationale} />
          <ScoreCard label="Token value capture" value={s.token_value_capture?.value} sub={seed.assessments.token_value_capture?.rationale} />
        </div>
        {s.token_value_capture?.gates_applied.map((g) => (
          <p key={g} style={{ color: "var(--accent)", fontSize: 13 }}>⚠ Gate: {g}</p>
        ))}
      </div>

      <div className="panel">
        <h2>Prove-It timeline</h2>
        <p className="panel-sub">
          {snap.prove_it_age_years.toFixed(1)} years since launch. The question: after{" "}
          {snap.prove_it_age_years.toFixed(1)} years, how much closer is the thesis to fulfilled?
          Currently at milestone Level {maxMilestone} of 5.
        </p>
        <div className="timeline">
          {[...seed.events]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((e, i) => (
              <div className={`tl-event t-${e.type}`} key={i}>
                <div className="tl-date num">{e.date} · {e.type.replace("_", " ")}</div>
                <div className="tl-title">{e.title}</div>
                <p className="tl-desc">{e.description}</p>
              </div>
            ))}
        </div>
      </div>

      <div className="panel">
        <h2>Historical Reality</h2>
        <HistoryChart history={history} />
      </div>

      <div className="panel">
        <h2>Explanation feed</h2>
        <p className="panel-sub">
          Deterministic contributor lists computed by the pipeline. (Future: AI summarizes
          these; it never touches the numbers.)
        </p>
        {(["reality", "execution_evidence", "reflexivity_risk"] as const).map((d) => {
          const sc = s[d];
          if (!sc) return null;
          const comps = Object.entries(sc.components).filter(([, c]) => c.available);
          return (
            <div className="expl" key={d}>
              <div className="expl-head">
                <b style={{ textTransform: "capitalize" }}>{d.replace(/_/g, " ")}</b>
                <ScoreCell value={sc.value} />
                <StatusTag status={sc.status} />
              </div>
              <ul>
                {comps.map(([code, c]) => (
                  <li key={code}>
                    {(methodology.components[code]?.name ?? code)}: {c.value?.toFixed(1)}/10 —{" "}
                    {methodology.components[code]?.description}
                  </li>
                ))}
                {sc.gates_applied.map((g) => (
                  <li key={g} style={{ color: "var(--accent)" }}>Gate: {g}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="panel">
        <h2>Raw evidence <EpistemicTag kind="measured" /></h2>
        <p className="panel-sub">
          Every measured input behind the scores, with its source. Inspect anything.
        </p>
        <div className="table-wrap">
          <table className="board" style={{ minWidth: 0 }}>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Observed</th>
                <th>Provider</th>
              </tr>
            </thead>
            <tbody>
              {metricRows.map((r, i) => (
                <tr key={i}>
                  <td className="num">{r.metricCode}</td>
                  <td className="num">{r.value == null ? "n/a" : r.value.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                  <td className="num" style={{ color: "var(--text-dim)" }}>{r.observedAt}</td>
                  <td style={{ color: "var(--text-dim)", fontSize: 12 }}>{r.provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {gaps.length > 0 && (
          <>
            <h2 style={{ marginTop: 20 }}>Known data gaps</h2>
            <p className="panel-sub">Explicitly unavailable — never estimated, never zero-filled.</p>
            <ul style={{ margin: "0 0 0 18px", padding: 0, color: "var(--text-dim)", fontSize: 13 }}>
              {gaps.map((g, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  <span className="num">{g.metricCode}</span> — {g.reason}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
