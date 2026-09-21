import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getStore } from "@/lib/data";
import { ACTIVE_METHODOLOGY_VERSION } from "@/lib/active-methodology";
import { ScoreCell, StatBar, EpistemicTag, StatusTag } from "@/components/score";
import TimelineChart from "@/components/timeline-chart";
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

function Details({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="panel fold" open={open}>
      <summary className="fold-head">{title}</summary>
      <div className="fold-body">{children}</div>
    </details>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = getStore();
  const seed = await store.getProject(slug);
  if (!seed) notFound();
  const [scores, metricRows, availability, methodology] = await Promise.all([
    store.getLatestScores(),
    store.getMetricRows(slug),
    store.getMetricAvailability(),
    store.getMethodology(ACTIVE_METHODOLOGY_VERSION),
  ]);
  const snap = scores[slug] ?? null;

  // Absolute URL for the copy-paste embed snippet (works locally and in prod).
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "prove-it-clock.vercel.app";
  const proto = hdrs.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const embedUrl = `${proto}://${host}/embed/projects/${slug}/timeline`;

  if (!snap) {
    return (
      <>
        <div className="meta-line">
          PROJECT <b>{seed.symbol}</b> · {CATEGORY_LABELS[seed.thesis_category] ?? seed.thesis_category} · METHODOLOGY{" "}
          <b>v{ACTIVE_METHODOLOGY_VERSION}</b>
        </div>
        <h1 className="page-title">{seed.name}</h1>
        <p className="page-sub">{seed.thesis}</p>
        <div className="panel">
          <h2>Not scored under v{ACTIVE_METHODOLOGY_VERSION} <StatusTag status="unavailable" /></h2>
          <p className="panel-sub" style={{ marginBottom: 0 }}>
            v{ACTIVE_METHODOLOGY_VERSION} scores six projects with verified data. {seed.name} is
            outside that set: its scores are <b>unavailable</b> — not estimated, not
            zero-filled, not carried over from the speculative v0.3.0 set. Market data below
            is shown for context only.
          </p>
        </div>
        <div className="panel">
          <h2>Score history</h2>
          <TimelineChart slug={slug} />
        </div>
      </>
    );
  }

  const s = snap.scores;
  const metrics: Record<string, number | null> = {};
  for (const r of metricRows) metrics[r.metricCode] = r.value;
  const gaps = availability.filter((a) => a.projectSlug === slug);

  const realityComps = Object.entries(s.reality?.components ?? {});
  const maxMilestone = Math.max(...seed.milestones.filter((m) => m.achieved).map((m) => m.level), 0);
  const confidence = s.reality?.confidence ?? null;
  const promisesKept = seed.milestones.filter((m) => m.achieved).length;
  const promisesTotal = seed.milestones.length;

  return (
    <>
      {/* Trading card — the verdict at a glance. */}
      <div className="panel card">
        <div className="meta-line">
          PROJECT <b>{seed.symbol}</b> · {CATEGORY_LABELS[seed.thesis_category] ?? seed.thesis_category} · SNAPSHOT{" "}
          <b>{snap.snapshot_date}</b> · METHODOLOGY <b>v{ACTIVE_METHODOLOGY_VERSION}</b>
        </div>
        <h1 className="page-title">{seed.name}</h1>
        <p className="page-sub" style={{ marginBottom: 14 }}>{seed.thesis}</p>
        <div className="stat-bars">
          <StatBar label="Promises kept" value={promisesTotal ? (promisesKept / promisesTotal) * 10 : null} display={`${promisesKept}/${promisesTotal}`} sub="milestones achieved · each dated in the timeline below" />
          <StatBar label="Reality" value={s.reality?.value} sub={`confidence ${confidence ?? "—"}%${s.reality?.status === "provisional" ? " · provisional" : ""}`} />
          <StatBar label="World impact potential" value={s.world_impact_potential?.value} sub="if the thesis succeeds" />
          <StatBar label="Execution evidence" value={s.execution_evidence?.value} sub="evidence, not a probability" />
          <StatBar label="Reflexivity risk" value={s.reflexivity_risk?.value} scale="risk" sub="dependence on belief" />
          <StatBar
            label="Evidence confidence"
            value={confidence == null ? null : confidence / 10}
            display={confidence == null ? undefined : `${confidence}%`}
            sub="missing data reduces confidence — never estimated"
          />
          <StatBar label="Promise gap" value={snap.derived.promise_gap} scale="gap" sub="potential − reality" />
          <StatBar label="Potential outlook" value={snap.derived.potential_outlook} sub="uncalibrated — not a probability" />
        </div>
        <p className="card-foot num">
          Promising for {snap.prove_it_age_years.toFixed(1)}y · launched {seed.launch_date} · milestone Level {maxMilestone} of 5
        </p>
      </div>

      {/* The chart — the product. */}
      <div className="panel">
        <h2>Score history</h2>
        <p className="panel-sub">
          Promises kept plus every scored category over time. Gaps are missing data —
          lines break instead of interpolating. Dashed ticks mark methodology versions.
        </p>
        <TimelineChart slug={slug} />
      </div>

      <Details title="What it claims to become">
        <p className="panel-sub">The project's stated thesis, as assessed for this methodology version. <EpistemicTag kind="modeling" /></p>
        <p style={{ fontSize: 15 }}>{seed.thesis}</p>
        <p style={{ color: "var(--text-dim)" }}>
          <b style={{ color: "var(--text)" }}>Measurable success would look like:</b> {seed.measurable_success}
        </p>
      </Details>

      <Details title="What exists today">
        <p className="panel-sub">Assembled deterministically from measured metrics and assessed milestones. <EpistemicTag kind="mixed" /></p>
        <ul style={{ margin: "0 0 0 18px", padding: 0 }}>
          {todaySummary(seed, snap, metrics).map((l, i) => (
            <li key={i} style={{ marginBottom: 8 }}>{l}</li>
          ))}
        </ul>
      </Details>

      <Details title="Potential outlook — how to read it">
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          Forward-looking, but <b>not</b> a probability and <b>not</b> a price prediction — it is
          uncalibrated until historical backtesting exists. Formula:{" "}
          <span className="num">clamp(max(promise_gap, 0) × (execution_evidence / 10), 0, 10)</span>.
          It reads as: of the promise not yet realized, how much does current execution support
          capturing? A large promise gap with weak execution scores low — the thesis may be real,
          but nothing is moving toward it. <EpistemicTag kind="mixed" />
        </p>
      </Details>

      <Details title="Reality breakdown">
        <p className="panel-sub">
          Weights are category-specific ({seed.thesis_category}); missing inputs redistribute
          weight and reduce confidence. Gates applied:{" "}
          {s.reality?.gates_applied.length ? s.reality.gates_applied.join("; ") : "none"}.{" "}
          <EpistemicTag kind={s.reality?.epistemic ?? "mixed"} />{" "}
          <StatusTag status={s.reality?.status ?? "unavailable"} />
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
      </Details>

      <Details title="Protocol vs token">
        <p className="panel-sub">
          A protocol can be useful while its token captures little value. These are assessed
          separately — never inferred from price. <EpistemicTag kind="modeling" />
        </p>
        <div className="score-grid">
          <StatBar label="Protocol reality" value={s.reality?.value} sub="same as Reality above" />
          <StatBar label="Token necessity" value={s.token_necessity?.value} sub={seed.assessments.token_necessity?.rationale} />
          <StatBar label="Token value capture" value={s.token_value_capture?.value} sub={seed.assessments.token_value_capture?.rationale} />
        </div>
        {s.token_value_capture?.gates_applied.map((g) => (
          <p key={g} style={{ color: "var(--accent)", fontSize: 13 }}>⚠ Gate: {g}</p>
        ))}
      </Details>

      <Details title={`Prove-It timeline — ${seed.events.length} events`}>
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
                <p className="tl-desc">{e.evidence_summary}</p>
              </div>
            ))}
        </div>
      </Details>

      <Details title="Explanation feed">
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
      </Details>

      <Details title="Raw evidence">
        <p className="panel-sub">
          Every measured input behind the scores, with its source. Inspect anything. <EpistemicTag kind="measured" />
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
      </Details>

      <Details title="Embed this timeline">
        <p className="panel-sub">
          Copy-paste snippet. Renders the same score timeline with no JavaScript.
          Swap <span className="num">theme=light</span> for <span className="num">theme=dark</span> to
          match a dark host page.
        </p>
        <pre className="num" style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 12px", fontSize: 12, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}>
{`<iframe src="${embedUrl}?theme=light" width="720" height="340" loading="lazy" title="Prove-It Clock — ${seed.name} score timeline"></iframe>`}
        </pre>
      </Details>
    </>
  );
}
