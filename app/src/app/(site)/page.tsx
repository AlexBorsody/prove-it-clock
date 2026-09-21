import { getStore } from "@/lib/data";
import { ACTIVE_METHODOLOGY_VERSION } from "@/lib/active-methodology";
import LeaderboardTable, { type BoardRow } from "@/components/leaderboard-table";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  monetary: "Monetary Asset",
  execution: "Smart Contract / Execution",
  payments: "Settlement / Payments",
  oracle: "Oracle / Data",
};

export default async function Home() {
  const store = getStore();
  const [projects, scores, metrics, snapshotDate] = await Promise.all([
    store.listProjects(),
    store.getLatestScores(),
    store.getLatestMetrics(),
    store.getLatestSnapshotDate(),
  ]);

  // Reality trend needs history; compute per project from snapshot history.
  const rows: BoardRow[] = await Promise.all(
    projects.map(async (p) => {
      const s = scores[p.slug];
      const hist = await store.getSnapshotHistory(p.slug);
      const prev = hist.length >= 2 ? hist[hist.length - 2] : null;
      const cur = s?.scores.reality?.value ?? null;
      const old = prev?.scores.reality?.value ?? null;
      return {
        slug: p.slug,
        name: p.name,
        symbol: p.symbol,
        category: CATEGORY_LABELS[p.thesis_category] ?? p.thesis_category,
        reality: cur,
        potential: s?.scores.world_impact_potential?.value ?? null,
        execution: s?.scores.execution_evidence?.value ?? null,
        reflexivity: s?.scores.reflexivity_risk?.value ?? null,
        confidence: s?.scores.reality?.confidence ?? null,
        age: s?.prove_it_age_years ?? 0,
        trend: cur != null && old != null ? Math.round((cur - old) * 10) / 10 : null,
        marketCap: metrics[p.slug]?.market_cap_usd ?? null,
        development: s?.scores.development?.value ?? null,
        promiseGap: s?.derived.promise_gap ?? null,
        potentialOutlook: s?.derived.potential_outlook ?? null,
        status: s?.scores.reality?.status ?? "unavailable",
      };
    }),
  );

  const provisional = rows.filter((r) => r.status === "provisional").length;
  const scored = rows.filter((r) => r.reality != null).length;
  const methodologyVersion = ACTIVE_METHODOLOGY_VERSION;

  return (
    <>
      <div className="meta-line">
        SNAPSHOT <b>{snapshotDate}</b> · METHODOLOGY <b>v{methodologyVersion}</b> · {rows.length} PROJECTS ·{" "}
        {scored} SCORED · {provisional} PROVISIONAL
      </div>
      <h1 className="page-title">Leaderboard</h1>
      <p className="page-sub">
        Four questions, answered with evidence: what is real today, how consequential the
        thesis could be, whether progress is measurable, and how dependent current value
        is on continued belief. Market cap is shown for context — it is never a score
        input. Click a project for the full evidence trail.
      </p>
      <div className="legend">
        <span><span className="dot" style={{ background: "var(--green)" }} /> Strong (7+)</span>
        <span><span className="dot" style={{ background: "var(--accent)" }} /> Mixed (4–7)</span>
        <span><span className="dot" style={{ background: "var(--red)" }} /> Weak (&lt;4)</span>
        <span><span className="tag warn">Provisional</span> low data coverage — treat as directional</span>
      </div>
      <LeaderboardTable rows={rows} />
      <div className="panel" style={{ marginTop: 18 }}>
        <h2>Reading this table</h2>
        <p className="panel-sub" style={{ marginBottom: 0 }}>
          <b>Reality</b> measures demonstrated utility, not price. <b>Reflexivity risk</b> is
          high when value depends on belief continuing. <b>Promise gap</b> (potential −
          reality) is the distance between the story and what exists. Scores marked{" "}
          <span className="tag warn">Provisional</span> are missing key inputs — the
          methodology page shows exactly which.
        </p>
      </div>
    </>
  );
}
