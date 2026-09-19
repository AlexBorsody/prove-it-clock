/**
 * Data-access layer: one interface, two implementations.
 *
 *  - JsonFileStore  — reads the pipeline's JSON snapshots from disk.
 *                      Works now, no database needed. Used for the demo.
 *  - SupabaseStore  — reads the same shape from Postgres (schema in
 *                      db/migrations/001_initial.sql). Activates when
 *                      SUPABASE_URL and SUPABASE_ANON_KEY are set.
 *
 * The frontend never touches providers or vendor APIs — only snapshots.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadMethodology,
  loadSeeds,
  type MethodologyConfig,
  type ProjectSnapshot,
  type SeedProject,
} from "@/methodology/index";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SNAP_DIR = join(ROOT, "data", "snapshots");

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

  private scoresFiles(): string[] {
    if (!existsSync(SNAP_DIR)) return [];
    return readdirSync(SNAP_DIR).filter((f) => f.startsWith("scores_")).sort();
  }

  private readScores(file: string): ProjectSnapshot[] {
    const doc = JSON.parse(readFileSync(join(SNAP_DIR, file), "utf-8")) as {
      snapshots: ProjectSnapshot[];
    };
    return doc.snapshots;
  }

  async getLatestScores(): Promise<Record<string, ProjectSnapshot>> {
    const files = this.scoresFiles();
    if (!files.length) return {};
    const out: Record<string, ProjectSnapshot> = {};
    for (const s of this.readScores(files[files.length - 1])) out[s.project] = s;
    return out;
  }

  async getSnapshotHistory(slug: string): Promise<ProjectSnapshot[]> {
    const out: ProjectSnapshot[] = [];
    for (const f of this.scoresFiles()) {
      const s = this.readScores(f).find((x) => x.project === slug);
      if (s) out.push(s);
    }
    return out;
  }

  async getMethodology(version: string): Promise<MethodologyConfig> {
    return loadMethodology(version);
  }

  async getLatestSnapshotDate(): Promise<string> {
    const files = this.scoresFiles();
    if (!files.length) return "n/a";
    const m = files[files.length - 1].match(/scores_(\d{4}-\d{2}-\d{2})\.json/);
    return m ? m[1] : "n/a";
  }

  async getMetricAvailability() {
    const files = readdirSync(SNAP_DIR).filter((f) => f.startsWith("metrics_")).sort();
    if (!files.length) return [];
    const doc = JSON.parse(readFileSync(join(SNAP_DIR, files[files.length - 1]), "utf-8")) as {
      unavailable: { projectSlug: string; metricCode: string; reason: string }[];
    };
    return doc.unavailable;
  }

  async getLatestMetrics(): Promise<Record<string, Record<string, number | null>>> {
    const files = readdirSync(SNAP_DIR).filter((f) => f.startsWith("metrics_")).sort();
    if (!files.length) return {};
    const doc = JSON.parse(readFileSync(join(SNAP_DIR, files[files.length - 1]), "utf-8")) as {
      metrics: { projectSlug: string; metricCode: string; value: number | null }[];
    };
    const out: Record<string, Record<string, number | null>> = {};
    for (const m of doc.metrics) {
      if (!out[m.projectSlug]) out[m.projectSlug] = {};
      out[m.projectSlug][m.metricCode] = m.value;
    }
    return out;
  }

  async getMetricRows(slug: string) {
    const files = readdirSync(SNAP_DIR).filter((f) => f.startsWith("metrics_")).sort();
    if (!files.length) return [];
    const doc = JSON.parse(readFileSync(join(SNAP_DIR, files[files.length - 1]), "utf-8")) as {
      metrics: {
        projectSlug: string;
        metricCode: string;
        value: number | null;
        observedAt: string;
        source: { provider: string; endpoint: string };
      }[];
    };
    return doc.metrics
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
