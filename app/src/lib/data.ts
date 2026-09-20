/**
 * Data-access layer: one interface, two implementations.
 *
 *  - JsonFileStore  — reads the pipeline's JSON snapshots, imported
 *                      statically so they bundle into serverless functions
 *                      at build time. Works now, no database needed.
 *  - SupabaseStore  — reads the same shape from Postgres (schema in
 *                      db/migrations/001_initial.sql). Activates when
 *                      SUPABASE_URL and SUPABASE_ANON_KEY are set.
 *
 * The frontend never touches providers or vendor APIs — only snapshots.
 */
import {
  loadMethodology,
  loadSeeds,
  type MethodologyConfig,
  type ProjectSnapshot,
  type SeedProject,
} from "@/methodology/index";
import scoresDocJson from "../../data/snapshots/scores_2026-09-20.json";
import metricsDocJson from "../../data/snapshots/metrics_2026-09-20.json";

export interface ProjectMeta {
  slug: string;
  name: string;
  symbol: string;
  thesis_category: string;
  launch_date: string;
  thesis: string;
}

export interface DataStore {
  listProjects(): Promise<ProjectMeta[]>;
  getProject(slug: string): Promise<SeedProject | null>;
  /** latest score snapshot per project slug */
  getLatestScores(): Promise<Record<string, ProjectSnapshot>>;
  /** full snapshot history for one project, oldest first */
  getSnapshotHistory(slug: string): Promise<ProjectSnapshot[]>;
  getMethodology(version: string): Promise<MethodologyConfig>;
  getLatestSnapshotDate(): Promise<string>;
  getMetricAvailability(): Promise<
    { projectSlug: string; metricCode: string; reason: string }[]
  >;
  /** latest normalized metric values per project (for display columns like market cap) */
  getLatestMetrics(): Promise<Record<string, Record<string, number | null>>>;
  /** full metric rows with provenance for the raw-evidence view */
  getMetricRows(
    slug: string,
  ): Promise<{ metricCode: string; value: number | null; observedAt: string; provider: string; endpoint: string }[]>;
}

// ---------------------------------------------------------------------------
// JSON snapshot files (works today)
// ---------------------------------------------------------------------------

interface SnapshotMetricRow {
  projectSlug: string;
  metricCode: string;
  value: number | null;
  observedAt: string;
  source: { provider: string; endpoint: string };
}

// Static snapshot imports — bundled at build time, no fs reads at runtime.
const SCORES: ProjectSnapshot[] = (
  scoresDocJson as { snapshots: ProjectSnapshot[] }
).snapshots;
const SNAPSHOT_DATE: string = (scoresDocJson as { snapshot_date: string })
  .snapshot_date;
const METRICS_DOC = metricsDocJson as {
  metrics: SnapshotMetricRow[];
  unavailable: { projectSlug: string; metricCode: string; reason: string }[];
};

// Score codes computed from other scores, not measured directly.
// Mirrors the `derived` section of the methodology config (v0.3.0.json)
// and the kind='derived' rows in score_definitions.
const DERIVED_SCORE_CODES = new Set([
  "promise_gap",
  "build_gap",
  "hype_gap",
  "belief_gap",
  "potential_outlook",
]);

class JsonFileStore implements DataStore {
  private seeds(): SeedProject[] {
    return loadSeeds();
  }

  async listProjects(): Promise<ProjectMeta[]> {
    return this.seeds().map((s) => ({
      slug: s.slug,
      name: s.name,
      symbol: s.symbol,
      thesis_category: s.thesis_category,
      launch_date: s.launch_date,
      thesis: s.thesis,
    }));
  }

  async getProject(slug: string): Promise<SeedProject | null> {
    return this.seeds().find((s) => s.slug === slug) ?? null;
  }

  async getLatestScores(): Promise<Record<string, ProjectSnapshot>> {
    const out: Record<string, ProjectSnapshot> = {};
    for (const s of SCORES) out[s.project] = s;
    return out;
  }

  async getSnapshotHistory(slug: string): Promise<ProjectSnapshot[]> {
    return SCORES.filter((x) => x.project === slug);
  }

  async getMethodology(version: string): Promise<MethodologyConfig> {
    return loadMethodology(version);
  }

  async getLatestSnapshotDate(): Promise<string> {
    return SNAPSHOT_DATE;
  }

  async getMetricAvailability() {
    return METRICS_DOC.unavailable;
  }

  async getLatestMetrics(): Promise<Record<string, Record<string, number | null>>> {
    const out: Record<string, Record<string, number | null>> = {};
    for (const m of METRICS_DOC.metrics) {
      if (!out[m.projectSlug]) out[m.projectSlug] = {};
      out[m.projectSlug][m.metricCode] = m.value;
    }
    return out;
  }

  async getMetricRows(slug: string) {
    return METRICS_DOC.metrics
      .filter((m) => m.projectSlug === slug)
      .map((m) => ({
        metricCode: m.metricCode,
        value: m.value,
        observedAt: m.observedAt,
        provider: m.source.provider,
        endpoint: m.source.endpoint,
      }));
  }
}

// ---------------------------------------------------------------------------
// Supabase / Postgres (activates when env vars are present)
// ---------------------------------------------------------------------------

class SupabaseStore implements DataStore {
  private client: unknown = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async db(): Promise<any> {
    if (!this.client) {
      const { createClient } = await import("@supabase/supabase-js");
      this.client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
    }
    return this.client;
  }

  private async currentVersionId(sb: any): Promise<string> {
    const { data } = await sb.from("methodology_versions").select("id").eq("is_current", true).single();
    return data.id;
  }

  async listProjects(): Promise<ProjectMeta[]> {
    const sb = await this.db();
    const { data } = await sb
      .from("projects")
      .select("slug,name,symbol,launch_date,thesis_category_id,thesis_categories(code)")
      .order("slug");
    return (data ?? []).map((p: Record<string, unknown>) => ({
      slug: p.slug,
      name: p.name,
      symbol: p.symbol,
      thesis_category: (p.thesis_categories as { code: string })?.code ?? "?",
      launch_date: p.launch_date,
      thesis: "",
    }));
  }

  async getProject(slug: string): Promise<SeedProject | null> {
    // Seeds remain the analyst-input source of truth until the Phase 3
    // community layer; Supabase mode still reads them from disk.
    return new JsonFileStore().getProject(slug);
  }

  private async snapshotsFor(sb: any, versionId: string, slug?: string) {
    interface Row {
      snapshot_date: string;
      score_code: string;
      value: number | null;
      confidence: number | null;
      status: string;
      unavailable_reason: string | null;
      projects: { slug: string };
    }
    const { data } = await sb
      .from("score_snapshots")
      .select("snapshot_date,score_code,value,confidence,status,unavailable_reason,projects!inner(slug)")
      .eq("methodology_version_id", versionId)
      .order("snapshot_date", { ascending: true });
    const rows = (data ?? []) as Row[];
    const byKey = new Map<string, ProjectSnapshot>();
    for (const r of rows) {
      if (slug && r.projects.slug !== slug) continue;
      const key = `${r.projects.slug}|${r.snapshot_date}`;
      if (!byKey.has(key)) {
        byKey.set(key, {
          project: r.projects.slug,
          methodology_version: "",
          snapshot_date: r.snapshot_date,
          scores: {},
          derived: {},
          prove_it_age_years: 0,
        });
      }
      const snap = byKey.get(key)!;
      if (DERIVED_SCORE_CODES.has(r.score_code)) {
        snap.derived[r.score_code] = r.value;
        continue;
      }
      snap.scores[r.score_code] = {
        value: r.value,
        status: r.status as ProjectSnapshot["scores"][string]["status"],
        confidence: r.confidence,
        components: {},
        gates_applied: [],
        unavailable_reason: r.unavailable_reason ?? undefined,
        epistemic: "mixed",
      };
    }
    // NOTE: component drill-downs live in score_component_values; the
    // leaderboard/detail pages fetch them per project when needed.
    return [...byKey.values()].sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date));
  }

  async getLatestScores(): Promise<Record<string, ProjectSnapshot>> {
    const sb = await this.db();
    const versionId = await this.currentVersionId(sb);
    const snaps = await this.snapshotsFor(sb, versionId);
    const out: Record<string, ProjectSnapshot> = {};
    for (const s of snaps) out[s.project] = s; // last wins = latest
    for (const s of Object.values(out)) {
      const v = (await sb.from("methodology_versions").select("version").eq("id", versionId).single()).data;
      s.methodology_version = v?.version ?? "";
    }
    return out;
  }

  async getSnapshotHistory(slug: string): Promise<ProjectSnapshot[]> {
    const sb = await this.db();
    const versionId = await this.currentVersionId(sb);
    return this.snapshotsFor(sb, versionId, slug);
  }

  async getMethodology(version: string): Promise<MethodologyConfig> {
    const sb = await this.db();
    const { data } = await sb.from("methodology_versions").select("config_json").eq("version", version).single();
    if (!data) return loadMethodology(version);
    return data.config_json as MethodologyConfig;
  }

  async getLatestSnapshotDate(): Promise<string> {
    const sb = await this.db();
    const versionId = await this.currentVersionId(sb);
    const { data } = await sb
      .from("score_snapshots")
      .select("snapshot_date")
      .eq("methodology_version_id", versionId)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .single();
    return data?.snapshot_date ?? "n/a";
  }

  async getMetricAvailability() {
    // metric_observations with is_available=false
    const sb = await this.db();
    const { data } = await sb
      .from("metric_observations")
      .select("notes,projects!inner(slug),metric_definitions!inner(code)")
      .eq("is_available", false)
      .order("ingested_at", { ascending: false })
      .limit(500);
    return (data ?? []).map((r: Record<string, unknown>) => ({
      projectSlug: (r.projects as { slug: string }).slug,
      metricCode: (r.metric_definitions as { code: string }).code,
      reason: (r.notes as string) ?? "unavailable",
    }));
  }

  async getLatestMetrics(): Promise<Record<string, Record<string, number | null>>> {
    const sb = await this.db();
    // latest observation per (project, metric): use a window via ordering + client-side dedupe
    const { data } = await sb
      .from("metric_observations")
      .select("value_numeric,observed_at,projects!inner(slug),metric_definitions!inner(code)")
      .order("observed_at", { ascending: false })
      .limit(2000);
    const out: Record<string, Record<string, number | null>> = {};
    for (const r of (data ?? []) as Record<string, unknown>[]) {
      const slug = (r.projects as { slug: string }).slug;
      const code = (r.metric_definitions as { code: string }).code;
      if (!out[slug]) out[slug] = {};
      if (!(code in out[slug])) out[slug][code] = (r.value_numeric as number | null) ?? null;
    }
    return out;
  }

  async getMetricRows(slug: string) {
    const sb = await this.db();
    const { data } = await sb
      .from("metric_observations")
      .select(
        "value_numeric,observed_at,notes,metric_definitions!inner(code),data_sources!inner(code),projects!inner(slug)",
      )
      .eq("projects.slug", slug)
      .order("observed_at", { ascending: false })
      .limit(200);
    return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
      metricCode: (r.metric_definitions as { code: string }).code,
      value: (r.value_numeric as number | null) ?? null,
      observedAt: r.observed_at as string,
      provider: (r.data_sources as { code: string }).code,
      endpoint: (r.notes as string) ?? "",
    }));
  }
}

export function getStore(): DataStore {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    return new SupabaseStore();
  }
  return new JsonFileStore();
}
