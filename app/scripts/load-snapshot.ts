/**
 * Append one pipeline score snapshot to Supabase.
 *
 * Usage: npm run snapshot:load -- [YYYY-MM-DD] [--dry-run]
 *
 * The loader is deliberately narrow: it accepts only the active methodology,
 * resolves all foreign keys from the database, and uses conflict-ignore
 * inserts. Existing history is never updated or deleted.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ACTIVE_METHODOLOGY_VERSION } from "../src/lib/active-methodology.js";
import type { ProjectSnapshot } from "../src/methodology/index.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT_DIR = join(ROOT, "data", "snapshots");
const VALID_STATUSES = new Set(["final", "provisional", "unavailable"]);

interface ScoresDocument {
  methodology_version: string;
  snapshot_date: string;
  snapshots: ProjectSnapshot[];
}

interface ExplanationEntry {
  score: string;
  delta: number | null;
  summary: string;
  contributors: unknown[];
  missing_components: string[];
  gates_applied: string[];
}

interface ExplanationDocument {
  project: string;
  snapshot_date: string;
  methodology_version: string;
  entries: ExplanationEntry[];
}

interface ScoreRow {
  project_id: string;
  methodology_version_id: string;
  snapshot_date: string;
  score_code: string;
  value: number | null;
  confidence: number | null;
  status: string;
  unavailable_reason: string | null;
}

function loadLocalEnv(): void {
  const path = join(ROOT, ".env.local");
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function readJson<T>(path: string): T {
  if (!existsSync(path)) throw new Error(`snapshot artifact not found: ${path}`);
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function validateDocument(doc: ScoresDocument, requestedDate: string): void {
  if (doc.methodology_version !== ACTIVE_METHODOLOGY_VERSION) {
    throw new Error(
      `refusing methodology v${doc.methodology_version}; active methodology is v${ACTIVE_METHODOLOGY_VERSION}`,
    );
  }
  if (doc.snapshot_date !== requestedDate) {
    throw new Error(`snapshot date ${doc.snapshot_date} does not match requested date ${requestedDate}`);
  }
  if (!doc.snapshots.length) throw new Error("score snapshot contains no projects");
  for (const snapshot of doc.snapshots) {
    if (snapshot.methodology_version !== doc.methodology_version) {
      throw new Error(`methodology mismatch in project ${snapshot.project}`);
    }
    if (snapshot.snapshot_date !== doc.snapshot_date) {
      throw new Error(`date mismatch in project ${snapshot.project}`);
    }
    for (const [code, score] of Object.entries(snapshot.scores)) {
      if (!VALID_STATUSES.has(score.status)) throw new Error(`invalid status for ${snapshot.project}/${code}`);
      if (score.status === "unavailable" && score.value !== null) {
        throw new Error(`unavailable score has a value for ${snapshot.project}/${code}`);
      }
    }
  }
}

function requireCredentials(): { url: string; key: string } {
  loadLocalEnv();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in app/.env.local or the environment");
  }
  return { url, key };
}

async function resolveIds(client: SupabaseClient, doc: ScoresDocument) {
  const { data: methodology, error: methodologyError } = await client
    .from("methodology_versions")
    .select("id,version")
    .eq("version", ACTIVE_METHODOLOGY_VERSION)
    .maybeSingle();
  if (methodologyError) throw methodologyError;
  if (!methodology) throw new Error(`methodology v${ACTIVE_METHODOLOGY_VERSION} is missing from Supabase`);

  const slugs = [...new Set(doc.snapshots.map((snapshot) => snapshot.project))];
  const { data: projects, error: projectsError } = await client.from("projects").select("id,slug").in("slug", slugs);
  if (projectsError) throw projectsError;
  const projectIds = new Map<string, string>(
    (projects ?? []).map((project: { id: string; slug: string }) => [project.slug, project.id]),
  );
  const missing = slugs.filter((slug) => !projectIds.has(slug));
  if (missing.length) throw new Error(`projects missing from Supabase: ${missing.join(", ")}`);
  return { methodologyId: methodology.id as string, projectIds };
}

function buildScoreRows(doc: ScoresDocument, methodologyId: string, projectIds: Map<string, string>): ScoreRow[] {
  const rows: ScoreRow[] = [];
  for (const snapshot of doc.snapshots) {
    const base = {
      project_id: projectIds.get(snapshot.project)!,
      methodology_version_id: methodologyId,
      snapshot_date: snapshot.snapshot_date,
    };
    for (const [scoreCode, score] of Object.entries(snapshot.scores)) {
      rows.push({
        ...base,
        score_code: scoreCode,
        value: score.value,
        confidence: score.confidence,
        status: score.status,
        unavailable_reason: score.unavailable_reason ?? null,
      });
    }
    for (const [scoreCode, value] of Object.entries(snapshot.derived)) {
      rows.push({
        ...base,
        score_code: scoreCode,
        value,
        confidence: null,
        status: value == null ? "unavailable" : "provisional",
        unavailable_reason: value == null ? "Not computed in this snapshot." : null,
      });
    }
  }
  return rows;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const date = args.find((arg) => !arg.startsWith("--")) ?? new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`invalid snapshot date: ${date}`);

  const scoresPath = join(SNAPSHOT_DIR, `scores_${date}.json`);
  const explanationsPath = join(SNAPSHOT_DIR, `explanations_${date}.json`);
  const scores = readJson<ScoresDocument>(scoresPath);
  const explanations = readJson<ExplanationDocument[]>(explanationsPath);
  validateDocument(scores, date);
  if (explanations.some((item) => item.methodology_version !== ACTIVE_METHODOLOGY_VERSION || item.snapshot_date !== date)) {
    throw new Error("explanation artifact does not match the active methodology and requested date");
  }

  if (dryRun) {
    const scoreCount = scores.snapshots.reduce(
      (count, snapshot) => count + Object.keys(snapshot.scores).length + Object.keys(snapshot.derived).length,
      0,
    );
    const explanationCount = explanations.reduce((count, item) => count + item.entries.length, 0);
    console.log(`[load-snapshot] dry run: ${scores.snapshots.length} projects, ${scoreCount} scores, ${explanationCount} explanations`);
    return;
  }

  const { url, key } = requireCredentials();
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { methodologyId, projectIds } = await resolveIds(client, scores);
  const scoreRows = buildScoreRows(scores, methodologyId, projectIds);

  const { error: scoreError } = await client
    .from("score_snapshots")
    .upsert(scoreRows, {
      onConflict: "project_id,methodology_version_id,snapshot_date,score_code",
      ignoreDuplicates: true,
    });
  if (scoreError) throw scoreError;

  const explanationRows = explanations.flatMap((document) =>
    document.entries.map((entry) => ({
      project_id: projectIds.get(document.project)!,
      methodology_version_id: methodologyId,
      snapshot_date: document.snapshot_date,
      score_code: entry.score,
      delta: entry.delta,
      summary: entry.summary,
      contributors_json: {
        contributors: entry.contributors,
        missing_components: entry.missing_components,
        gates_applied: entry.gates_applied,
      },
    })),
  );
  const { error: explanationError } = await client
    .from("explanations")
    .upsert(explanationRows, {
      onConflict: "project_id,methodology_version_id,snapshot_date,score_code",
      ignoreDuplicates: true,
    });
  if (explanationError) throw explanationError;

  const { count, error: verifyError } = await client
    .from("score_snapshots")
    .select("id", { count: "exact", head: true })
    .eq("methodology_version_id", methodologyId)
    .eq("snapshot_date", date);
  if (verifyError) throw verifyError;
  if (count !== scoreRows.length) {
    throw new Error(`verification failed: expected ${scoreRows.length} score rows for ${date}, found ${count ?? 0}`);
  }
  console.log(`[load-snapshot] verified ${count} score rows and ${explanationRows.length} explanations for ${date}`);
}

main().catch((error) => {
  console.error(`[load-snapshot] FATAL: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
