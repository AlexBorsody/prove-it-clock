/**
 * Prove-It Clock — seed SQL generator.
 *
 * Reads the pipeline's local JSON snapshots + the frozen methodology config
 * and emits INSERT-only seed files (seed-01.sql, seed-02.sql, …) that can be
 * pasted into Supabase's SQL editor (runs as postgres, bypasses RLS).
 *
 *   cd ~/workspace/proveit-clock/app && npx tsx ../db/seed/generate-seed.ts
 *
 * Design rules:
 *  - Every row is faithful to the source JSON. Nothing is invented.
 *  - Deterministic UUIDv5 literals (namespace "proveit-clock-seed-v1") for
 *    every PK, so FK references are stable and auditable. No gen_random_uuid()
 *    and no subselect lookups.
 *  - String escaping: single quotes are doubled (''). JSONB values are
 *    single-quoted JSON with '' escaping, cast ::jsonb.
 *  - The script validates itself: row counts per table vs the source JSON,
 *    and every FK literal referenced must exist in the generated id sets.
 *    It exits non-zero on any mismatch.
 *
 * Deliberate mapping choices (documented, not invented):
 *  - methodology_weights is left EMPTY. The table's
 *    UNIQUE(methodology_version_id, component_id) allows exactly one weight
 *    per component, but v0.1.0 defines per-score AND per-category weights
 *    (24 distinct weight facts for 10 components). Any single number would
 *    misrepresent the methodology. Weights remain authoritative in
 *    methodology_versions.config_json (the full frozen config).
 *  - score_components gets one row per (score, component) usage (12 rows),
 *    because components are shared across scores and UNIQUE(score_id, code)
 *    is per-score.
 *  - project_assessments.assessed_at / project_milestones.assessed_at are
 *    NOT NULL in the schema but absent from the seed JSON; they are set to
 *    the snapshot date (2026-09-20), when the seed was snapshotted.
 *  - metric_observations: 75 rows from the metrics list (is_available =
 *    value !== null) + 27 rows from the explicit unavailable markers
 *    (is_available = false, source 'adapter'). notes carries the provider
 *    endpoint for valued rows (SupabaseStore.getMetricRows displays notes
 *    as the endpoint) and the reason for unavailable rows
 *    (getMetricAvailability maps notes -> reason). value_json carries the
 *    small `meta` object when present; raw_payload_json is always NULL —
 *    the multi-MB raw files under data/raw/ are never embedded.
 *  - Derived gaps (promise_gap/build_gap/…) and prove_it_age_years are NOT
 *    inserted as score rows: they are fully reconstructible from the stored
 *    score rows (and launch_date + snapshot_date), and the source snapshots
 *    do not list them under `scores`.
 *  - explanations.contributors_json = {"contributors": [...],
 *    "missing_components": [...], "gates_applied": [...]} verbatim from the
 *    source entry (the schema comment's envisioned shape differs; the source
 *    shape is preserved).
 *  - data_sources / metric_definitions / thesis_categories display metadata
 *    (names, urls, descriptions) is curated reference text, not scored data.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadMethodology,
  loadSeeds,
  type MethodologyConfig,
  type SeedProject,
} from "../../app/src/methodology/index.js";

// ---------------------------------------------------------------------------
// paths
// ---------------------------------------------------------------------------

const HERE = join(dirname(fileURLToPath(import.meta.url)), "v030");
const APP = join(HERE, "..", "..", "..", "app"); // db/seed/v030/ -> repo root -> app/
const DATA = join(APP, "data");
const SNAPSHOT_DATE = "2026-09-20";
const METHODOLOGY_VERSION = "0.3.0";
const MAX_FILE_BYTES = 150_000;

// ---------------------------------------------------------------------------
// deterministic UUIDs (v5-style, SHA-1; no external deps)
// ---------------------------------------------------------------------------

const UUID_NAMESPACE = "proveit-clock-seed-v1";

function uuid(name: string): string {
  const h = createHash("sha1").update(UUID_NAMESPACE + "" + name).digest();
  h[6] = (h[6] & 0x0f) | 0x50; // version 5
  h[8] = (h[8] & 0x3f) | 0x80; // variant 10
  const x = h.subarray(0, 16).toString("hex");
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20, 32)}`;
}

// ---------------------------------------------------------------------------
// SQL literal helpers
// ---------------------------------------------------------------------------

function sq(v: string | null | undefined): string {
  if (v === null || v === undefined) return "NULL";
  return "'" + v.replace(/'/g, "''") + "'";
}
function num(v: number | null | undefined): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v !== "number" || !Number.isFinite(v)) throw new Error(`non-finite number: ${String(v)}`);
  return String(v);
}
function bool(v: boolean): string {
  return v ? "TRUE" : "FALSE";
}
function jsonb(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  return "'" + JSON.stringify(v).replace(/'/g, "''") + "'::jsonb";
}
function textArray(arr: string[]): string {
  return "ARRAY[" + arr.map((s) => "'" + s.replace(/'/g, "''") + "'").join(",") + "]::text[]";
}
function litUuid(id: string): string {
  return "'" + id + "'";
}

// ---------------------------------------------------------------------------
// source loading (methodology config comes from src/methodology/index.ts)
// ---------------------------------------------------------------------------

const cfg: MethodologyConfig = loadMethodology(METHODOLOGY_VERSION);
const seeds: SeedProject[] = loadSeeds();

const projectsDoc = JSON.parse(readFileSync(join(DATA, "projects.json"), "utf-8")) as {
  methodology_version: string;
  milestone_ladders: Record<string, { level: number; title: string; evidence_requirements: string }[]>;
};
if (projectsDoc.methodology_version !== METHODOLOGY_VERSION) {
  throw new Error(`projects.json methodology_version ${projectsDoc.methodology_version} != ${METHODOLOGY_VERSION}`);
}

interface ScoreComponentJson {
  value: number | null;
  weight: number;
  weight_applied: number;
  metrics: string[];
  epistemic: string;
  available: boolean;
  missing_note?: string;
}
interface ScoreJson {
  value: number | null;
  status: string;
  confidence: number | null;
  components: Record<string, ScoreComponentJson>;
  gates_applied: string[];
  unavailable_reason?: string;
  epistemic: string;
}
interface SnapshotJson {
  project: string;
  methodology_version: string;
  snapshot_date: string;
  scores: Record<string, ScoreJson>;
  derived: Record<string, number | null>;
  prove_it_age_years: number;
}
const scoresDoc = JSON.parse(readFileSync(join(DATA, "snapshots", `scores_${SNAPSHOT_DATE}.json`), "utf-8")) as {
  methodology_version: string;
  snapshot_date: string;
  snapshots: SnapshotJson[];
};
if (scoresDoc.snapshot_date !== SNAPSHOT_DATE || scoresDoc.methodology_version !== METHODOLOGY_VERSION) {
  throw new Error("scores snapshot date/version mismatch");
}

interface MetricJson {
  projectSlug: string;
  metricCode: string;
  observedAt: string;
  value: number | null;
  meta?: Record<string, unknown>;
  source: { provider: string; endpoint: string; fetchedAt: string };
}
const metricsDoc = JSON.parse(readFileSync(join(DATA, "snapshots", `metrics_${SNAPSHOT_DATE}.json`), "utf-8")) as {
  snapshot_date: string;
  metrics: MetricJson[];
  unavailable: { projectSlug: string; metricCode: string; reason: string; provider: string }[];
};
if (metricsDoc.snapshot_date !== SNAPSHOT_DATE) throw new Error("metrics snapshot date mismatch");

interface ExplanationEntryJson {
  score: string;
  value: number | null;
  status: string;
  delta: number | null;
  summary: string;
  contributors: { component: string; contribution: number; text: string }[];
  missing_components: string[];
  gates_applied: string[];
}
const explanationsDoc = JSON.parse(
  readFileSync(join(DATA, "snapshots", `explanations_${SNAPSHOT_DATE}.json`), "utf-8"),
) as { project: string; snapshot_date: string; methodology_version: string; entries: ExplanationEntryJson[] }[];
for (const e of explanationsDoc) {
  if (e.snapshot_date !== SNAPSHOT_DATE || e.methodology_version !== METHODOLOGY_VERSION) {
    throw new Error(`explanation ${e.project} date/version mismatch`);
  }
}

// ---------------------------------------------------------------------------
// id registries (for FK validation)
// ---------------------------------------------------------------------------

const ids: Record<string, Set<string>> = {};
function reg(table: string, id: string): string {
  (ids[table] ??= new Set()).add(id);
  return id;
}
function ref(table: string, id: string, ctx: string): string {
  if (!ids[table]?.has(id)) throw new Error(`FK violation: ${ctx} references missing ${table} id ${id}`);
  return id;
}

// ---------------------------------------------------------------------------
// curated reference metadata (display-only; not scored data)
// ---------------------------------------------------------------------------

// Display names as used by the app (src/app/page.tsx CATEGORY_LABELS).
const CATEGORY_LABELS: Record<string, string> = {
  monetary: "Monetary Asset",
  execution: "Smart Contract / Execution",
  payments: "Settlement / Payments",
  oracle: "Oracle / Data",
  other: "Other (Provisional)",
};

const DATA_SOURCES: { code: string; name: string; url: string | null; requires_key: boolean; notes: string }[] = [
  {
    code: "coingecko",
    name: "CoinGecko",
    url: "https://www.coingecko.com",
    requires_key: false,
    notes: "Market data (/coins/markets) and developer_data via /coins/{id}; keyless endpoints used.",
  },
  {
    code: "defillama",
    name: "DefiLlama",
    url: "https://defillama.com",
    requires_key: false,
    notes: "TVL and protocol/chain fee series; has no Bitcoin miner-fee series (covered by blockchain.info).",
  },
  {
    code: "bitcoin",
    name: "blockchain.info (Bitcoin on-chain)",
    url: "https://api.blockchain.info",
    requires_key: false,
    notes: "Bitcoin 30-day transaction-fee series + USD ticker; fills the DefiLlama fee gap for BTC.",
  },
  {
    code: "adapter",
    name: "Pipeline adapter (internal marker)",
    url: null,
    requires_key: false,
    notes:
      "Not an upstream source: marks a metric the adapter attempted but the provider had no data for.",
  },
];

const METRIC_DEFS: Record<string, { name: string; description: string; unit: string | null; category: string }> = {
  price_usd: { name: "Price (USD)", description: "Spot price in US dollars (CoinGecko /coins/markets).", unit: "USD", category: "market" },
  market_cap_usd: { name: "Market capitalization (USD)", description: "Circulating supply x price, in USD (CoinGecko).", unit: "USD", category: "market" },
  fdv_usd: { name: "Fully diluted valuation (USD)", description: "Max/total supply x price, in USD (CoinGecko).", unit: "USD", category: "market" },
  volume_24h_usd: { name: "24h trading volume (USD)", description: "Reported 24-hour trading volume, in USD (CoinGecko).", unit: "USD", category: "market" },
  circulating_supply: { name: "Circulating supply", description: "Tokens currently circulating (CoinGecko).", unit: "tokens", category: "market" },
  total_supply: { name: "Total supply", description: "Total tokens in existence (CoinGecko).", unit: "tokens", category: "market" },
  max_supply: { name: "Max supply", description: "Maximum tokens that will ever exist, if the supply is capped (CoinGecko).", unit: "tokens", category: "market" },
  price_change_30d_pct: { name: "30-day price change (%)", description: "Price change over the trailing 30 days, in percent (CoinGecko).", unit: "percent", category: "market" },
  tvl_usd: { name: "Total value locked (USD)", description: "TVL across the project's DeFi ecosystem, in USD (DefiLlama).", unit: "USD", category: "chain" },
  fees_30d_usd: { name: "30-day fees (USD)", description: "Protocol/chain fees over the trailing 30 days, in USD (DefiLlama; blockchain.info for BTC).", unit: "USD", category: "chain" },
  fees_annualized_usd: { name: "Annualized fees (USD)", description: "30-day fees annualized (x365/30), in USD (DefiLlama; blockchain.info for BTC).", unit: "USD", category: "chain" },
  dev_commits_4w: { name: "Developer commits (4w)", description: "Commits in the last 4 weeks (CoinGecko developer_data; direct GitHub adapter is Phase 2).", unit: "commits", category: "development" },
  dev_stars: { name: "Developer stars", description: "Repository stars via CoinGecko developer_data (Phase 2: direct GitHub adapter).", unit: "count", category: "development" },
  dev_forks: { name: "Developer forks", description: "Repository forks via CoinGecko developer_data (Phase 2: direct GitHub adapter).", unit: "count", category: "development" },
  launch_date: { name: "Launch date", description: "Analyst-seeded network launch date (project fact; feeds Prove-It Age).", unit: null, category: "facts" },
};

// ---------------------------------------------------------------------------
// statement builders, in dependency order
// ---------------------------------------------------------------------------

const stmts: { table: string; sql: string }[] = [];
// Preamble (safe on empty or seeded DBs): only one methodology version may be current.
stmts.push({ table: "methodology_versions",
  sql: "-- preamble: retire the current methodology version (partial unique index allows exactly one)\nUPDATE methodology_versions SET is_current = FALSE WHERE is_current = TRUE;" });
function ins(table: string, columns: string[], values: string): void {
  stmts.push({ table, sql: `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values}) ON CONFLICT (id) DO NOTHING;` });
}

// --- 1. thesis_categories ---
const categoryCodes = Object.keys(cfg.categories).sort();
for (const code of categoryCodes) {
  const id = reg("thesis_categories", uuid(`thesis_category:${code}`));
  const label = CATEGORY_LABELS[code];
  if (!label) throw new Error(`no display label for thesis category ${code}`);
  ins("thesis_categories", ["id", "code", "name", "description"],
    [litUuid(id), sq(code), sq(label), sq(cfg.categories[code].description)].join(", "));
}

// --- 2. data_sources ---
const sourceIds: Record<string, string> = {};
for (const s of DATA_SOURCES) {
  const id = reg("data_sources", uuid(`data_source:${s.code}`));
  sourceIds[s.code] = id;
  ins("data_sources", ["id", "code", "name", "url", "requires_key", "notes"],
    [litUuid(id), sq(s.code), sq(s.name), sq(s.url), bool(s.requires_key), sq(s.notes)].join(", "));
}

// --- 3. methodology_versions ---
const versionId = reg("methodology_versions", uuid(`methodology_version:${METHODOLOGY_VERSION}`));
const fullConfig = JSON.parse(readFileSync(join(APP, "methodology", `v${METHODOLOGY_VERSION}.json`), "utf-8"));
ins("methodology_versions", ["id", "version", "changelog", "config_json", "is_current"],
  [litUuid(versionId), sq(METHODOLOGY_VERSION), sq(cfg.changelog), jsonb(fullConfig), bool(true)].join(", "));

// --- 4. metric_definitions ---
const metricIds: Record<string, string> = {};
const metricCodes = Object.keys(METRIC_DEFS).sort();
for (const code of metricCodes) {
  const d = METRIC_DEFS[code];
  const id = reg("metric_definitions", uuid(`metric:${code}`));
  metricIds[code] = id;
  ins("metric_definitions", ["id", "code", "name", "description", "unit", "category", "higher_is_better"],
    [litUuid(id), sq(code), sq(d.name), sq(d.description), sq(d.unit), sq(d.category), bool(true)].join(", "));
}

// --- 5. score_definitions ---
const scoreIds: Record<string, string> = {};
const scoreCodes = Object.keys(cfg.scores).sort();
for (const code of scoreCodes) {
  const s = cfg.scores[code];
  const id = reg("score_definitions", uuid(`score:${code}`));
  scoreIds[code] = id;
  ins("score_definitions", ["id", "code", "name", "description", "scale_min", "scale_max", "kind"],
    [litUuid(id), sq(code), sq(s.name), sq(s.description), num(s.scale[0]), num(s.scale[1]), sq(s.kind)].join(", "));
}

// --- 6. score_components (one row per score x component usage) ---
const componentIds: Record<string, string> = {}; // key: `${scoreCode}:${compCode}`
function realityComponents(): string[] {
  const sets = Object.values(cfg.categories).map((c) => Object.keys(c.reality_weights).sort().join(","));
  if (!new Set(sets).size || new Set(sets).size !== 1) throw new Error("reality component sets differ across categories");
  return Object.keys(cfg.categories[categoryCodes[0]].reality_weights).sort();
}
const scoreComponentCodes: Record<string, string[]> = {};
for (const code of scoreCodes) {
  const def = cfg.scores[code];
  scoreComponentCodes[code] = code === "reality" ? realityComponents() : Object.keys(def.components ?? {}).sort();
}
for (const scoreCode of scoreCodes) {
  for (const compCode of scoreComponentCodes[scoreCode]) {
    const def = cfg.components[compCode];
    if (!def) throw new Error(`component ${compCode} referenced by score ${scoreCode} missing from config`);
    const id = reg("score_components", uuid(`score_component:${scoreCode}:${compCode}`));
    componentIds[`${scoreCode}:${compCode}`] = id;
    ins("score_components", ["id", "score_id", "code", "name", "description"],
      [litUuid(id), litUuid(ref("score_definitions", scoreIds[scoreCode], `score_components ${scoreCode}/${compCode}`)), sq(compCode), sq(def.name), sq(def.description)].join(", "));
  }
}

// --- 7. projects ---
function categoryIdFor(code: string): string {
  const id = uuid(`thesis_category:${code}`);
  return ref("thesis_categories", id, `projects category ${code}`);
}
const projectIds: Record<string, string> = {};
const seedBySlug: Record<string, SeedProject> = {};
for (const seed of seeds) {
  if (seedBySlug[seed.slug]) throw new Error(`duplicate seed slug ${seed.slug}`);
  seedBySlug[seed.slug] = seed;
  const id = reg("projects", uuid(`project:${seed.slug}`));
  projectIds[seed.slug] = id;
  ins("projects", ["id", "slug", "name", "symbol", "coingecko_id", "defillama_slug", "thesis_category_id", "launch_date", "launch_notes", "status"],
    [
      litUuid(id), sq(seed.slug), sq(seed.name), sq(seed.symbol), sq(seed.coingecko_id),
      sq(seed.defillama_chain),
      litUuid(categoryIdFor(seed.thesis_category)),
      sq(seed.launch_date), sq((seed as unknown as { launch_notes?: string }).launch_notes ?? null), sq("active"),
    ].join(", "));
}

// --- 8. project_theses ---
for (const seed of seeds) {
  const id = reg("project_theses", uuid(`project_thesis:${seed.slug}:${METHODOLOGY_VERSION}`));
  ins("project_theses", ["id", "project_id", "methodology_version_id", "thesis_text", "measurable_success", "evidence_url"],
    [
      litUuid(id),
      litUuid(ref("projects", projectIds[seed.slug], `project_theses ${seed.slug}`)),
      litUuid(ref("methodology_versions", versionId, `project_theses ${seed.slug}`)),
      sq(seed.thesis), sq(seed.measurable_success), sq(null),
    ].join(", "));
}

// --- 9. project_assessments ---
for (const seed of seeds) {
  for (const key of Object.keys(seed.assessments).sort()) {
    const a = seed.assessments[key];
    if (typeof a.value !== "number" || !Number.isFinite(a.value)) throw new Error(`bad assessment value ${seed.slug}/${key}`);
    if (!a.rationale) throw new Error(`missing rationale ${seed.slug}/${key}`);
    const id = reg("project_assessments", uuid(`project_assessment:${seed.slug}:${METHODOLOGY_VERSION}:${key}`));
    ins("project_assessments", ["id", "project_id", "methodology_version_id", "key", "value", "rationale", "evidence_url", "assessed_at"],
      [
        litUuid(id),
        litUuid(ref("projects", projectIds[seed.slug], `project_assessments ${seed.slug}/${key}`)),
        litUuid(ref("methodology_versions", versionId, `project_assessments ${seed.slug}/${key}`)),
        sq(key), num(a.value), sq(a.rationale), sq(null), sq(SNAPSHOT_DATE),
      ].join(", "));
  }
}

// --- 10. milestone_definitions ---
const milestoneDefIds: Record<string, string> = {}; // key `${category}:${level}`
for (const code of categoryCodes) {
  const ladder = projectsDoc.milestone_ladders[code];
  if (!ladder || ladder.length !== 6) throw new Error(`milestone ladder for ${code} must have 6 rungs`);
  for (const rung of ladder) {
    if (rung.level < 0 || rung.level > 5) throw new Error(`bad level ${rung.level} in ${code} ladder`);
    const id = reg("milestone_definitions", uuid(`milestone_def:${METHODOLOGY_VERSION}:${code}:${rung.level}`));
    milestoneDefIds[`${code}:${rung.level}`] = id;
    ins("milestone_definitions", ["id", "methodology_version_id", "thesis_category_id", "level", "title", "evidence_requirements"],
      [
        litUuid(id),
        litUuid(ref("methodology_versions", versionId, `milestone_definitions ${code}/${rung.level}`)),
        litUuid(categoryIdFor(code)),
        String(rung.level), sq(rung.title), sq(rung.evidence_requirements),
      ].join(", "));
  }
}

// --- 11. project_milestones ---
for (const seed of seeds) {
  const levels = seed.milestones.map((m) => m.level).sort((a, b) => a - b);
  if (levels.join(",") !== "0,1,2,3,4,5") throw new Error(`project ${seed.slug} must have milestone levels 0-5`);
  for (const m of seed.milestones) {
    const id = reg("project_milestones", uuid(`project_milestone:${seed.slug}:${m.level}`));
    const defId = milestoneDefIds[`${seed.thesis_category}:${m.level}`];
    if (!defId) throw new Error(`no milestone definition for ${seed.thesis_category} level ${m.level}`);
    ins("project_milestones",
      ["id", "project_id", "milestone_definition_id", "achieved", "achieved_at", "evidence_url", "evidence_summary", "assessed_at"],
      [
        litUuid(id),
        litUuid(ref("projects", projectIds[seed.slug], `project_milestones ${seed.slug}/${m.level}`)),
        litUuid(ref("milestone_definitions", defId, `project_milestones ${seed.slug}/${m.level}`)),
        bool(m.achieved), sq(m.achieved_at), sq(m.evidence_url), sq(m.evidence_summary), sq(SNAPSHOT_DATE),
      ].join(", "));
  }
}

// --- 12. project_events ---
for (const seed of seeds) {
  seed.events.forEach((e, i) => {
    if (!e.date || !e.type || !e.title) throw new Error(`bad event #${i} for ${seed.slug}`);
    const id = reg("project_events", uuid(`project_event:${seed.slug}:${i}:${e.date}:${e.title}`));
    ins("project_events", ["id", "project_id", "event_date", "event_type", "title", "description", "evidence_url"],
      [
        litUuid(id),
        litUuid(ref("projects", projectIds[seed.slug], `project_events ${seed.slug}#${i}`)),
        sq(e.date), sq(e.type), sq(e.title), sq(e.description ?? null), sq(e.evidence_url ?? null),
      ].join(", "));
  });
}

// --- 13. metric_observations ---
function checkMetricCode(code: string): string {
  const id = metricIds[code];
  if (!id) throw new Error(`metric_observations references unknown metric code ${code}`);
  return id;
}
function checkSource(provider: string): string {
  const id = sourceIds[provider];
  if (!id) throw new Error(`metric_observations references unknown provider ${provider}`);
  return id;
}
function checkProject(slug: string, ctx: string): string {
  const id = projectIds[slug];
  if (!id) throw new Error(`metric_observations references unknown project ${slug} (${ctx})`);
  return id;
}
metricsDoc.metrics.forEach((m, i) => {
  const id = reg("metric_observations", uuid(`metric_observation:metrics:${i}`));
  const isAvailable = m.value !== null;
  const notes = isAvailable ? m.source.endpoint : ((m.meta?.["note"] as string | undefined) ?? m.source.endpoint);
  ins("metric_observations",
    ["id", "project_id", "metric_id", "source_id", "observed_at", "value_numeric", "value_json", "raw_payload_json", "is_available", "notes"],
    [
      litUuid(id),
      litUuid(checkProject(m.projectSlug, `metrics#${i}`)),
      litUuid(checkMetricCode(m.metricCode)),
      litUuid(checkSource(m.source.provider)),
      sq(m.observedAt), num(m.value), jsonb(m.meta ?? null), jsonb(null), bool(isAvailable), sq(notes),
    ].join(", "));
});
metricsDoc.unavailable.forEach((u, i) => {
  const id = reg("metric_observations", uuid(`metric_observation:unavailable:${i}`));
  ins("metric_observations",
    ["id", "project_id", "metric_id", "source_id", "observed_at", "value_numeric", "value_json", "raw_payload_json", "is_available", "notes"],
    [
      litUuid(id),
      litUuid(checkProject(u.projectSlug, `unavailable#${i}`)),
      litUuid(checkMetricCode(u.metricCode)),
      litUuid(checkSource(u.provider)),
      sq(SNAPSHOT_DATE), num(null), jsonb(null), jsonb(null), bool(false), sq(u.reason),
    ].join(", "));
});

// --- 14. score_snapshots ---
const VALID_STATUSES = new Set(["final", "provisional", "unavailable"]);
for (const snap of scoresDoc.snapshots) {
  if (!projectIds[snap.project]) throw new Error(`score snapshot for unknown project ${snap.project}`);
  if (snap.snapshot_date !== SNAPSHOT_DATE) throw new Error(`snapshot date mismatch for ${snap.project}`);
  for (const code of Object.keys(snap.scores).sort()) {
    const s = snap.scores[code];
    if (!scoreIds[code]) throw new Error(`score snapshot references unknown score code ${code}`);
    if (!VALID_STATUSES.has(s.status)) throw new Error(`bad status ${s.status} for ${snap.project}/${code}`);
    if (s.status === "unavailable" && !s.unavailable_reason) {
      throw new Error(`unavailable score ${snap.project}/${code} has no unavailable_reason`);
    }
    const id = reg("score_snapshots", uuid(`score_snapshot:${snap.project}:${METHODOLOGY_VERSION}:${snap.snapshot_date}:${code}`));
    ins("score_snapshots",
      ["id", "project_id", "methodology_version_id", "snapshot_date", "score_code", "value", "confidence", "status", "unavailable_reason"],
      [
        litUuid(id),
        litUuid(ref("projects", projectIds[snap.project], `score_snapshots ${snap.project}/${code}`)),
        litUuid(ref("methodology_versions", versionId, `score_snapshots ${snap.project}/${code}`)),
        sq(snap.snapshot_date), sq(code), num(s.value), num(s.confidence), sq(s.status), sq(s.unavailable_reason ?? null),
      ].join(", "));
  }
}

// --- 15. score_component_values ---
for (const snap of scoresDoc.snapshots) {
  for (const scoreCode of Object.keys(snap.scores).sort()) {
    const s = snap.scores[scoreCode];
    for (const compCode of Object.keys(s.components)) {
      const c = s.components[compCode];
      const id = reg("score_component_values",
        uuid(`score_component_value:${snap.project}:${METHODOLOGY_VERSION}:${snap.snapshot_date}:${scoreCode}:${compCode}`));
      ins("score_component_values",
        ["id", "project_id", "methodology_version_id", "snapshot_date", "score_code", "component_code",
          "value", "weight_applied", "metric_codes", "is_available", "notes"],
        [
          litUuid(id),
          litUuid(ref("projects", projectIds[snap.project], `score_component_values ${snap.project}/${scoreCode}/${compCode}`)),
          litUuid(ref("methodology_versions", versionId, `score_component_values ${snap.project}/${scoreCode}/${compCode}`)),
          sq(snap.snapshot_date), sq(scoreCode), sq(compCode),
          num(c.value), num(c.weight_applied), textArray(c.metrics ?? []), bool(c.available), sq(c.missing_note ?? null),
        ].join(", "));
    }
  }
}

// --- 16. explanations ---
for (const doc of explanationsDoc) {
  for (const e of doc.entries) {
    if (!scoreIds[e.score]) throw new Error(`explanation references unknown score ${e.score}`);
    const id = reg("explanations",
      uuid(`explanation:${doc.project}:${METHODOLOGY_VERSION}:${doc.snapshot_date}:${e.score}`));
    const payload = {
      contributors: e.contributors,
      missing_components: e.missing_components,
      gates_applied: e.gates_applied,
    };
    ins("explanations",
      ["id", "project_id", "methodology_version_id", "snapshot_date", "score_code", "delta", "summary", "contributors_json"],
      [
        litUuid(id),
        litUuid(ref("projects", projectIds[doc.project], `explanations ${doc.project}/${e.score}`)),
        litUuid(ref("methodology_versions", versionId, `explanations ${doc.project}/${e.score}`)),
        sq(doc.snapshot_date), sq(e.score), num(e.delta), sq(e.summary), jsonb(payload),
      ].join(", "));
  }
}

// methodology_weights: intentionally not populated (see header comment).
stmts.push({
  table: "methodology_weights",
  sql: `-- methodology_weights intentionally left empty: v${METHODOLOGY_VERSION} defines per-score and per-category weights, which the table's UNIQUE(methodology_version_id, component_id) cannot represent. Weights are authoritative in methodology_versions.config_json.`,
});

// ---------------------------------------------------------------------------
// validation: counts + FK integrity + SQL sanity
// ---------------------------------------------------------------------------

const expected: Record<string, number> = {
  thesis_categories: categoryCodes.length,
  data_sources: DATA_SOURCES.length,
  methodology_versions: 1,
  metric_definitions: metricCodes.length,
  score_definitions: scoreCodes.length,
  score_components: Object.values(scoreComponentCodes).reduce((a, v) => a + v.length, 0),
  projects: seeds.length,
  project_theses: seeds.length,
  project_assessments: seeds.reduce((a, s) => a + Object.keys(s.assessments).length, 0),
  milestone_definitions: categoryCodes.length * 6,
  project_milestones: seeds.reduce((a, s) => a + s.milestones.length, 0),
  project_events: seeds.reduce((a, s) => a + s.events.length, 0),
  metric_observations: metricsDoc.metrics.length + metricsDoc.unavailable.length,
  score_snapshots: scoresDoc.snapshots.reduce((a, s) => a + Object.keys(s.scores).length, 0),
  score_component_values: scoresDoc.snapshots.reduce(
    (a, s) => a + Object.values(s.scores).reduce((b, sc) => b + Object.keys(sc.components).length, 0), 0),
  explanations: explanationsDoc.reduce((a, d) => a + d.entries.length, 0),
  methodology_weights: 0,
};

let failed = false;
const actual: Record<string, number> = {};
for (const s of stmts) {
  if (s.sql.startsWith("--")) continue;
  actual[s.table] = (actual[s.table] ?? 0) + 1;
}

console.log("\n=== row counts (expected vs generated) ===");
for (const table of Object.keys(expected)) {
  const e = expected[table];
  const a = actual[table] ?? 0;
  const ok = e === a ? "OK " : "FAIL";
  if (e !== a) failed = true;
  console.log(`${ok}  ${table.padEnd(24)} expected ${String(e).padStart(4)}  generated ${String(a).padStart(4)}`);
}
const extraTables = Object.keys(actual).filter((t) => !(t in expected));
if (extraTables.length) {
  failed = true;
  console.log(`FAIL unexpected tables with statements: ${extraTables.join(", ")}`);
}

// FK integrity: every ref() call above already threw on violation; double-check
// id-set sizes match row counts for PK tables.
for (const [table, set] of Object.entries(ids)) {
  const rows = actual[table] ?? 0;
  if (set.size !== rows) {
    failed = true;
    console.log(`FAIL ${table}: ${set.size} unique ids but ${rows} rows`);
  }
}

// SQL sanity: balanced quotes per statement, ends with ';'.
for (const s of stmts) {
  if (s.sql.startsWith("--")) continue;
  const noEscaped = s.sql.replace(/''/g, "");
  const quotes = (noEscaped.match(/'/g) || []).length;
  if (quotes % 2 !== 0) {
    failed = true;
    console.log(`FAIL unbalanced quotes in ${s.table}: ${s.sql.slice(0, 120)}...`);
    break;
  }
  if (!s.sql.trimEnd().endsWith(";")) {
    failed = true;
    console.log(`FAIL statement does not end with ';' in ${s.table}`);
    break;
  }
}

if (failed) {
  console.error("\nVALIDATION FAILED — no files written.");
  process.exit(1);
}
console.log("FK integrity: all references resolve. SQL sanity: quotes balanced.");

// ---------------------------------------------------------------------------
// emit: pack statements into <=150KB files, dependency order preserved
// ---------------------------------------------------------------------------

mkdirSync(HERE, { recursive: true });

const HEADER = (n: number, total: number) => `-- ============================================================================
-- The Prove-It Clock — seed data (methodology v${METHODOLOGY_VERSION}, snapshot ${SNAPSHOT_DATE})
-- File ${n} of ${total}: apply ALL seed files in numeric order (seed-01.sql, seed-02.sql, ...).
-- Each file is wrapped in its own transaction. Safe to re-run on an empty DB;
-- on a DB that already has seed rows, INSERTs will conflict (no upsert).
-- Generated by db/seed/generate-seed.ts — do not hand-edit.
-- ============================================================================
`;

interface FileChunk { stmts: string[]; bytes: number }
const chunks: FileChunk[] = [{ stmts: [], bytes: 0 }];
for (const s of stmts) {
  const line = s.sql + "\n";
  const cur = chunks[chunks.length - 1];
  if (cur.stmts.length > 0 && cur.bytes + line.length > MAX_FILE_BYTES) {
    chunks.push({ stmts: [], bytes: 0 });
  }
  const target = chunks[chunks.length - 1];
  target.stmts.push(line);
  target.bytes += line.length;
}

const total = chunks.length;
chunks.forEach((c, i) => {
  const n = i + 1;
  const name = `seed-${String(n).padStart(2, "0")}.sql`;
  const body = `BEGIN;\n\n${c.stmts.join("")}\nCOMMIT;\n`;
  writeFileSync(join(HERE, name), HEADER(n, total) + body);
  console.log(`wrote ${name} (${(HEADER(n, total).length + body.length / 1024).toFixed(0)} bytes header+body, body ${(body.length / 1024).toFixed(1)} KB, ${c.stmts.length} statements)`);
});

console.log(`\ndone: ${total} file(s), ${stmts.length} statements total.`);
