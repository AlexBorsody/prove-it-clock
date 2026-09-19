import { getStore } from "@/lib/data";
import { EpistemicTag } from "@/components/score";
import disclosuresDoc from "../../../data/disclosures.json";

export const dynamic = "force-dynamic";

interface ObserverEffect {
  statement: string;
  goodharts_law: string;
  safeguards: { id: string; text: string }[];
}

interface Disclosures {
  publisher: string;
  updated: string;
  policy: string;
  status_note: string;
  entries: { symbol: string; name: string; status: string; scored_on_clock: boolean; detail: string }[];
}

function formulaText(code: string, norm: Record<string, unknown>): string {
  switch (norm.type) {
    case "log_scale":
      return `10 × clamp((log10(value) − log10(${norm.floor})) / (log10(${norm.ceiling}) − log10(${norm.floor})), 0, 1)`;
    case "ladder":
      return `10 × (highest achieved level / ${norm.max_level})`;
    case "recent_count":
      return `10 × min(count of achievements in last ${norm.window_years}y / ${norm.cap_count}, 1)`;
    case "event_penalty":
      return `10 − min(setbacks in last ${norm.window_years}y × ${norm.per_event_penalty}, 10)`;
    case "inverse_of":
      return `10 − ${norm.of_component} (analyst assessment)`;
    case "log_ratio_map":
      return `clamp(2 × log10(market_cap / annualized_fees), 0, 10)  — 10×→2, 100×→4, 1k×→6, 10k×→8, 100k×→10`;
    case "ratio_pct_of_fdv":
      return `10 × (FDV − market_cap) / FDV`;
    default:
      return "unavailable in this version";
  }
}

export default async function MethodologyPage() {
  const store = getStore();
  const cfg = await store.getMethodology("0.2.0");
  const observer = (cfg as unknown as { observer_effect?: ObserverEffect }).observer_effect;
  const disclosures = disclosuresDoc as unknown as Disclosures;

  const scoreEntries = Object.entries(cfg.scores);
  const catEntries = Object.entries(cfg.categories);

  return (
    <>
      <div className="meta-line">
        METHODOLOGY <b>v{cfg.version}</b> · CREATED <b>{(cfg as { created?: string }).created ?? "n/a"}</b>
      </div>
      <h1 className="page-title">Methodology</h1>
      <p className="page-sub">
        {(cfg as { changelog?: string }).changelog}
      </p>
      <div className="legend">
        <span><EpistemicTag kind="measured" /> observed from data providers</span>
        <span><EpistemicTag kind="modeling" /> analyst judgment, versioned, rationale published</span>
        <span><EpistemicTag kind="mixed" /> combines both</span>
      </div>

      <div className="panel">
        <h2>The pipeline</h2>
        <p className="panel-sub" style={{ marginBottom: 8 }}>
          External API → raw observation (cached) → normalized metric → component score →
          dimension score → snapshot → explanation. Raw observations are stored{" "}
          <i>before</i> scoring, so any snapshot reproduces from (observations + this config).
          History is append-only: methodology changes arrive as new versions, never silent rewrites.
        </p>
        <div className="formula">score = Σ(component_value × renormalized_weight), capped by gates</div>
      </div>

      <div className="panel">
        <h2>Gates &amp; caps — not pure weighted averages</h2>
        <p className="panel-sub">Weights aggregate; gates constrain. Each gate fires only on measured inputs, never on missing data.</p>
        {cfg.gates.map((g) => (
          <div className="gate" key={g.id}>
            <code>{g.id}</code>
            <p style={{ margin: "6px 0" }}>{g.then}</p>
            <p style={{ margin: 0, color: "var(--text-dim)", fontSize: 13 }}>{g.rationale}</p>
            {g.inert_in_v0_1 && <p style={{ color: "var(--text-faint)", fontSize: 12 }}>Configured but inert in v0.1 (awaits Phase 2 data).</p>}
          </div>
        ))}
      </div>

      <div className="panel">
        <h2>Evidence Confidence</h2>
        <p className="panel-sub">{cfg.confidence.method}</p>
        <p className="panel-sub">
          Dimensions: {cfg.confidence.dimensions.join(", ")}. Provisional below{" "}
          {cfg.confidence.provisional_threshold}%. Missing data reduces confidence — it is never
          invented, never zero-filled, never hidden.
        </p>
      </div>

      <h2 style={{ fontSize: 18, margin: "28px 0 12px" }}>Scores &amp; components</h2>
      {scoreEntries.map(([code, def]) => (
        <div className="method-score" key={code}>
          <h3>
            {def.name} <EpistemicTag kind={def.epistemic ?? "mixed"} />{" "}
            <span className="tag">scale {def.scale[0]}–{def.scale[1]}</span>{" "}
            {def.available_in_v0_1 === false && <span className="tag na">unavailable in v0.1</span>}
          </h3>
          <p style={{ color: "var(--text-dim)", margin: "6px 0" }}>{def.description}</p>
          {def.unavailable_reason && (
            <p style={{ color: "var(--text-faint)", fontSize: 13 }}>{def.unavailable_reason}</p>
          )}
          {def.components && Object.keys(def.components).length > 0 && (
            <table className="spec">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Weight</th>
                  <th>Formula</th>
                  <th>Inputs</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(def.components).map(([ccode, w]) => {
                  const c = cfg.components[ccode];
                  if (!c) return null;
                  return (
                    <tr key={ccode}>
                      <td><b>{c.name}</b><br /><span style={{ color: "var(--text-faint)" }}>{c.description}</span></td>
                      <td className="num">{(w * 100).toFixed(0)}%*</td>
                      <td><div className="formula" style={{ margin: 0 }}>{formulaText(ccode, c.normalization)}</div></td>
                      <td className="num" style={{ fontSize: 12 }}>{c.metrics.length ? c.metrics.join(", ") : "analyst seed"}</td>
                      <td><EpistemicTag kind={c.epistemic} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {code === "reality" && (
            <p style={{ color: "var(--text-faint)", fontSize: 12.5, marginTop: 8 }}>
              *Reality weights are per thesis category; weights of unavailable components redistribute
              proportionally (confidence records the gap).
            </p>
          )}
        </div>
      ))}

      <h2 style={{ fontSize: 18, margin: "28px 0 12px" }}>Category-specific Reality weights</h2>
      <div className="panel">
        {catEntries.map(([ccode, cat]) => (
          <div key={ccode} style={{ marginBottom: 14 }}>
            <b style={{ textTransform: "capitalize" }}>{ccode}</b>
            <span style={{ color: "var(--text-dim)", fontSize: 13 }}> — {cat.description}</span>
            <div className="num" style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 4 }}>
              {Object.entries(cat.reality_weights).map(([k, w]) => `${k} ${(w * 100).toFixed(0)}%`).join(" · ")}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 18, margin: "28px 0 12px" }}>Derived gaps</h2>
      <div className="panel">
        {Object.entries(cfg.derived).map(([k, d]) => (
          <div key={k} style={{ marginBottom: 10 }}>
            <code className="num" style={{ color: "var(--accent)" }}>{k}</code>
            <span className="num" style={{ color: "var(--text-dim)", fontSize: 13 }}> = {d.formula}</span>
            <p style={{ margin: "4px 0 0", color: "var(--text-faint)", fontSize: 13 }}>
              {d.available ? d.note : `Unavailable in v0.1 — ${d.note}`}
            </p>
          </div>
        ))}
      </div>

      {observer && (
        <>
          <h2 style={{ fontSize: 18, margin: "28px 0 12px" }}>The observer effect — this site can move markets</h2>
          <div className="panel">
            <p className="panel-sub" style={{ marginBottom: 8 }}>{observer.statement}</p>
            {observer.safeguards.map((s) => (
              <div className="gate" key={s.id}>
                <code>{s.id}</code>
                <p style={{ margin: "6px 0 0", color: "var(--text-dim)", fontSize: 13 }}>{s.text}</p>
              </div>
            ))}
            <p style={{ margin: "12px 0 0", color: "var(--text-faint)", fontSize: 13, fontStyle: "italic" }}>
              {observer.goodharts_law}
            </p>
          </div>

          <h2 style={{ fontSize: 18, margin: "28px 0 12px" }}>Publisher disclosures</h2>
          <div className="panel">
            <p className="panel-sub" style={{ marginBottom: 4 }}>
              {disclosures.publisher} · updated {disclosures.updated}
            </p>
            <p className="panel-sub" style={{ marginBottom: 8 }}>{disclosures.policy}</p>
            <p style={{ color: "var(--accent)", fontSize: 13, marginBottom: 12 }}>{disclosures.status_note}</p>
            <table className="spec">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Status</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {disclosures.entries.map((e) => (
                  <tr key={e.symbol}>
                    <td><b className="num">{e.symbol}</b> <span style={{ color: "var(--text-faint)" }}>{e.name}</span>{e.scored_on_clock && <span className="tag" style={{ marginLeft: 6 }}>scored on the Clock</span>}</td>
                    <td><span className="tag na">{e.status}</span></td>
                    <td style={{ color: "var(--text-dim)", fontSize: 13 }}>{e.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
