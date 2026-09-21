/**
 * The Prove-It Clock — Scoring Model v0.1 (methodology-driven).
 *
 * RULE: algorithms calculate. Nothing here is tuned per-project; every
 * number comes from (methodology config + observations + analyst seed data).
 * Analyst inputs (theses, milestones, assessments) live in versioned seed
 * files and are labeled MODELING DECISION wherever displayed.
 *
 * NOTE: seeds and methodology config are imported statically so they are
 * bundled into serverless functions at build time (fs reads do not work
 * in the Vercel runtime).
 */
import methodologyV010 from "../../methodology/v0.1.0.json";
import methodologyV020 from "../../methodology/v0.2.0.json";
import methodologyV030 from "../../methodology/v0.3.0.json";
import seedsDoc from "../../data/projects.json";

export interface MethodologyConfig {
  version: string;
  categories: Record<string, { reality_weights: Record<string, number>; description: string }>;
  components: Record<string, ComponentDef>;
  scores: Record<string, ScoreDef>;
  gates: GateDef[];
  confidence: ConfidenceDef;
  derived: Record<string, { available: boolean; formula: string; note: string }>;
}

export interface ComponentDef {
  name: string;
  description: string;
  epistemic: "measured" | "modeling";
  metrics: string[];
  missing: string;
  normalization: Record<string, unknown>;
}

export interface ScoreDef {
  name: string;
  kind: string;
  scale: [number, number];
  description: string;
  epistemic?: string;
  components?: Record<string, number>;
  available_in_v0_1?: boolean;
  unavailable_reason?: string;
}

export interface GateDef {
  id: string;
  when: Record<string, unknown>;
  then: string;
  rationale: string;
  inert_in_v0_1?: boolean;
}

export interface ConfidenceDef {
  method: string;
  dimensions: string[];
  source_quality: Record<string, number>;
  provisional_threshold: number;
  clamp: [number, number];
}

export function loadMethodology(version: string): MethodologyConfig {
  if (version === "0.3.0") return methodologyV030 as unknown as MethodologyConfig;
  if (version === "0.2.0") return methodologyV020 as unknown as MethodologyConfig;
  if (version === "0.1.0") return methodologyV010 as unknown as MethodologyConfig;
  throw new Error(`Unknown methodology version: ${version}`);
}

// ---------------------------------------------------------------------------
// Project seed types (data/projects.json)
// ---------------------------------------------------------------------------

export interface SeedMilestone {
  level: number;
  achieved: boolean;
  achieved_at: string | null;
  evidence_summary: string;
  evidence_url: string | null;
}

export interface SeedEvent {
  date: string;
  type: string;
  title: string;
  evidence_summary: string;
  evidence_url: string | null;
}

export interface SeedProject {
  slug: string;
  name: string;
  symbol: string;
  coingecko_id: string;
  defillama_chain: string | null;
  thesis_category: string;
  launch_date: string;
  thesis: string;
  measurable_success: string;
  assessments: Record<string, { value: number; rationale: string }>;
  milestones: SeedMilestone[];
  events: SeedEvent[];
  /** analyst-flagged provisional seed (thin evidence, awkward category fit) */
  provisional?: boolean;
  provisional_reason?: string;
}

export function loadSeeds(): SeedProject[] {
  return (seedsDoc as { projects: SeedProject[] }).projects;
}

// ---------------------------------------------------------------------------
// Component normalization
// ---------------------------------------------------------------------------

export type MetricGetter = (code: string) => number | null;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const r1 = (v: number) => Math.round(v * 10) / 10;

function yearsBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / (365.25 * 24 * 3600 * 1000);
}

/**
 * Score one component 0..10, or return null when its inputs are unavailable.
 * NEVER invents data: missing measured inputs -> null.
 */
export function scoreComponent(
  code: string,
  def: ComponentDef,
  get: MetricGetter,
  seed: SeedProject,
  snapshotDate: string,
): number | null {
  const n = def.normalization;
  switch (n.type) {
    case "log_scale": {
      const v = get(def.metrics[0]);
      if (v == null || v <= 0) return null;
      const floor = n.floor as number;
      const ceiling = n.ceiling as number;
      return r1(clamp((Math.log10(v) - Math.log10(floor)) / (Math.log10(ceiling) - Math.log10(floor)), 0, 1) * 10);
    }
    case "ladder": {
      const achieved = seed.milestones.filter((m) => m.achieved).map((m) => m.level);
      if (!achieved.length) return 0;
      return r1((Math.max(...achieved) / (n.max_level as number)) * 10);
    }
    case "recent_count": {
      const windowYears = n.window_years as number;
      const count = seed.milestones.filter(
        (m) => m.achieved && m.achieved_at && yearsBetween(m.achieved_at, snapshotDate) <= windowYears,
      ).length;
      return r1(clamp(count / (n.cap_count as number), 0, 1) * 10);
    }
    case "event_penalty": {
      const windowYears = n.window_years as number;
      const count = seed.events.filter(
        (e) => e.type === "setback" && yearsBetween(e.date, snapshotDate) <= windowYears,
      ).length;
      return r1(10 - Math.min(count * (n.per_event_penalty as number), 10));
    }
    case "inverse_of": {
      const a = seed.assessments[n.of_component as string];
      if (!a) return null;
      return r1(10 - a.value);
    }
    case "log_ratio_map": {
      const mcap = get("market_cap_usd");
      const fees = get("fees_annualized_usd");
      if (mcap == null || fees == null || fees <= 0 || mcap <= 0) return null;
      // 2 * log10(ratio): 10x -> 2, 100x -> 4, 1,000x -> 6, 10,000x -> 8, 100,000x -> 10
      return r1(clamp(2 * Math.log10(mcap / fees), 0, 10));
    }
    case "ratio_pct_of_fdv": {
      const fdv = get("fdv_usd");
      const mcap = get("market_cap_usd");
      if (fdv == null || mcap == null || fdv <= 0) return null;
      return r1(clamp(((fdv - mcap) / fdv) * 10, 0, 10));
    }
    case "unavailable":
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Project scoring
// ---------------------------------------------------------------------------

export interface ComponentResult {
  value: number | null;
  weight: number; // configured weight (before renormalization)
  weight_applied: number; // renormalized weight actually applied
  metrics: string[];
  epistemic: "measured" | "modeling";
  available: boolean;
  missing_note?: string;
}

export interface ScoreResult {
  value: number | null;
  status: "final" | "provisional" | "unavailable";
  confidence: number | null;
  components: Record<string, ComponentResult>;
  gates_applied: string[];
  unavailable_reason?: string;
  epistemic: string;
}

export interface ProjectSnapshot {
  project: string;
  methodology_version: string;
  snapshot_date: string;
  scores: Record<string, ScoreResult>;
  derived: Record<string, number | null>;
  prove_it_age_years: number;
}

function componentWeights(
  cfg: MethodologyConfig,
  scoreCode: string,
  seed: SeedProject,
): Record<string, number> {
  if (scoreCode === "reality") {
    const cat = cfg.categories[seed.thesis_category];
    if (!cat) throw new Error(`unknown thesis category ${seed.thesis_category}`);
    return cat.reality_weights;
  }
  return cfg.scores[scoreCode].components ?? {};
}

export function scoreProject(
  cfg: MethodologyConfig,
  seed: SeedProject,
  get: MetricGetter,
  snapshotDate: string,
): ProjectSnapshot {
  const scores: Record<string, ScoreResult> = {};
  const gatesApplied: string[] = [];

  // --- computed dimension/supporting scores ---
  for (const [code, def] of Object.entries(cfg.scores)) {
    if (def.available_in_v0_1 === false) {
      scores[code] = {
        value: null,
        status: "unavailable",
        confidence: null,
        components: {},
        gates_applied: [],
        unavailable_reason: def.unavailable_reason,
        epistemic: def.epistemic ?? "measured",
      };
      continue;
    }
    if (code === "world_impact_potential" || code === "token_necessity" || code === "token_value_capture") {
      continue; // analyst-direct, handled below
    }
    if (code === "evidence_confidence" || code === "prove_it_age_years") continue;

    const weights = componentWeights(cfg, code, seed);
    const components: Record<string, ComponentResult> = {};
    for (const [compCode, w] of Object.entries(weights)) {
      const compDef = cfg.components[compCode];
      const value = scoreComponent(compCode, compDef, get, seed, snapshotDate);
      components[compCode] = {
        value,
        weight: w,
        weight_applied: 0, // filled after renormalization
        metrics: compDef.metrics,
        epistemic: compDef.epistemic,
        available: value != null,
        missing_note: value == null ? compDef.missing : undefined,
      };
    }
    const availW = Object.values(components).filter((c) => c.available).reduce((a, c) => a + c.weight, 0);
    const totalW = Object.values(components).reduce((a, c) => a + c.weight, 0);
    let value: number | null = null;
    let status: ScoreResult["status"] = "final";
    if (availW > 0) {
      let acc = 0;
      for (const c of Object.values(components)) {
        if (!c.available) continue;
        c.weight_applied = r1(c.weight / availW);
        acc += c.value! * (c.weight / availW);
      }
      value = r1(acc);
      if (availW < totalW) status = "provisional"; // some inputs missing
    } else {
      status = "unavailable";
    }
    scores[code] = {
      value,
      status,
      confidence: null, // filled after global confidence pass
      components,
      gates_applied: [],
      unavailable_reason: status === "unavailable" ? "no component inputs available" : undefined,
      epistemic: def.epistemic ?? "mixed",
    };
  }

  // --- analyst-direct scores (MODELING DECISIONS, versioned in seed) ---
  for (const code of ["world_impact_potential", "token_necessity", "token_value_capture"]) {
    const a = seed.assessments[code];
    scores[code] = {
      value: a ? r1(a.value) : null,
      status: a ? "final" : "unavailable",
      confidence: null,
      components: {},
      gates_applied: [],
      unavailable_reason: a ? undefined : "no analyst assessment in seed",
      epistemic: "modeling",
    };
  }

  // --- gates ---
  const reality = scores["reality"];
  if (reality?.value != null) {
    const et = reality.components["economic_throughput"];
    if (et?.available && et.value! < 2) {
      reality.value = Math.min(reality.value, 4);
      reality.gates_applied.push("economic_demand_floor: capped at 4.0 (economic_throughput < 2)");
      gatesApplied.push("economic_demand_floor");
    }
  }
  const tvc = scores["token_value_capture"];
  const tn = scores["token_necessity"];
  if (tvc?.value != null && tn?.value != null && tn.value < 3) {
    tvc.value = Math.min(tvc.value, 4);
    tvc.gates_applied.push("token_necessity_gate: capped at 4.0 (token_necessity < 3)");
    gatesApplied.push("token_necessity_gate");
  }

  // --- evidence confidence ---
  const conf = computeConfidence(cfg, scores);
  for (const s of Object.values(scores)) {
    if (s.status !== "unavailable") s.confidence = conf;
  }
  if (conf < cfg.confidence.provisional_threshold) {
    for (const s of Object.values(scores)) {
      if (s.status === "final") {
        s.status = "provisional";
        s.gates_applied.push(`provisional_flag: confidence ${conf}% < 40%`);
      }
    }
    gatesApplied.push("provisional_flag");
  }

  // --- derived gaps ---
  const derived: Record<string, number | null> = {};
  const rv = reality?.value, pv = scores["world_impact_potential"]?.value, dv = scores["development"]?.value;
  const ev = scores["execution_evidence"]?.value;
  derived["promise_gap"] = rv != null && pv != null ? r1(pv - rv) : null;
  derived["build_gap"] = rv != null && dv != null ? r1(dv - rv) : null;
  derived["hype_gap"] = null; // attention unavailable in v0.1
  derived["belief_gap"] = null; // no community layer in v0.1
  // v0.2.0: Potential Outlook — of the promise not yet realized, how much does
  // current execution support capturing? NOT a probability, NOT a price
  // prediction; uncalibrated until historical backtesting exists. Floored at 0:
  // a negative promise gap means the thesis is already exceeded, leaving no
  // unrealized promise to capture.
  derived["potential_outlook"] =
    derived["promise_gap"] != null && ev != null
      ? r1(clamp(Math.max(0, derived["promise_gap"]!) * (ev / 10), 0, 10))
      : null;

  return {
    project: seed.slug,
    methodology_version: cfg.version,
    snapshot_date: snapshotDate,
    scores,
    derived,
    prove_it_age_years: r1(yearsBetween(seed.launch_date, snapshotDate)),
  };
}

function computeConfidence(cfg: MethodologyConfig, scores: Record<string, ScoreResult>): number {
  const dims = cfg.confidence.dimensions;
  const qs = cfg.confidence.source_quality;
  let acc = 0;
  let n = 0;
  for (const d of dims) {
    const s = scores[d];
    if (!s || s.status === "unavailable") continue;
    const comps = Object.values(s.components);
    const totalW = comps.reduce((a, c) => a + c.weight, 0);
    if (totalW <= 0) continue;
    let availW = 0;
    let qsum = 0;
    for (const c of comps) {
      if (!c.available) continue;
      availW += c.weight;
      qsum += c.weight * (qs[c.epistemic] ?? 0.75);
    }
    const availFrac = availW / totalW;
    const quality = availW > 0 ? qsum / availW : 0;
    acc += availFrac * quality;
    n++;
  }
  if (!n) return cfg.confidence.clamp[0];
  const [lo, hi] = cfg.confidence.clamp;
  return Math.round(clamp((acc / n) * 100, lo, hi));
}
