/**
 * Pipeline stage 2: SCORE
 *
 *   normalized metrics + methodology config + seeds
 *     -> component scores -> dimension scores -> gates -> confidence
 *     -> derived gaps -> snapshots + explanations
 *
 * Writes:
 *   data/snapshots/scores_<date>.json        (versioned, append-only)
 *   data/snapshots/explanations_<date>.json  (deterministic contributor lists)
 *
 * Deterministic: same inputs + same methodology version => same outputs.
 * AI's future role (summarizing these explanations) plugs in downstream;
 * it never touches the numbers.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadMethodology,
  loadSeeds,
  scoreProject,
  type MetricGetter,
  type ProjectSnapshot,
} from "../methodology/index.js";
import type { NormalizedMetric } from "../providers/types.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const today = new Date().toISOString().slice(0, 10);
const SNAP_DIR = join(ROOT, "data", "snapshots");
const METHODOLOGY_VERSION = "0.2.0";

function latestMetricsFile(): string {
  const files = readdirSync(SNAP_DIR).filter((f) => f.startsWith("metrics_")).sort();
  if (!files.length) throw new Error("no metrics snapshot found — run pipeline:ingest first");
  return join(SNAP_DIR, files[files.length - 1]);
}

function previousScoresFile(): string | null {
  const files = readdirSync(SNAP_DIR)
    .filter((f) => f.startsWith("scores_") && !f.includes(today))
    .sort();
  return files.length ? join(SNAP_DIR, files[files.length - 1]) : null;
}

async function main() {
  mkdirSync(SNAP_DIR, { recursive: true });
  const cfg = loadMethodology(METHODOLOGY_VERSION);
  const seeds = loadSeeds();
  const metricsDoc = JSON.parse(readFileSync(latestMetricsFile(), "utf-8")) as {
    snapshot_date: string;
    metrics: NormalizedMetric[];
  };
  console.log(`[score] methodology v${cfg.version}, metrics from ${metricsDoc.snapshot_date}`);

  const byProject = new Map<string, NormalizedMetric[]>();
  for (const m of metricsDoc.metrics) {
    if (!byProject.has(m.projectSlug)) byProject.set(m.projectSlug, []);
    byProject.get(m.projectSlug)!.push(m);
  }

  const snapshots: ProjectSnapshot[] = [];
  for (const seed of seeds) {
    const list = byProject.get(seed.slug) ?? [];
    const latest = new Map<string, number | null>();
    const latestDate = new Map<string, string>();
    for (const m of list) {
      // keep the most recent observation per metric code
      if (!latestDate.has(m.metricCode) || m.observedAt >= latestDate.get(m.metricCode)!) {
        latestDate.set(m.metricCode, m.observedAt);
        latest.set(m.metricCode, m.value);
      }
    }
    const get: MetricGetter = (code) => latest.get(code) ?? null;
    snapshots.push(scoreProject(cfg, seed, get, today));
  }

  const scoresOut = join(SNAP_DIR, `scores_${today}.json`);
  writeFileSync(
    scoresOut,
    JSON.stringify(
      { methodology_version: cfg.version, snapshot_date: today, generated_at: new Date().toISOString(), snapshots },
      null,
      2,
    ),
  );
  console.log(`[score] wrote ${scoresOut}`);

  // --- explanations: deterministic contributor lists + deltas vs previous run ---
  const prevFile = previousScoresFile();
  const prevBySlug = new Map<string, ProjectSnapshot>();
  if (prevFile) {
    const prev = JSON.parse(readFileSync(prevFile, "utf-8")) as { snapshots: ProjectSnapshot[] };
    for (const s of prev.snapshots) prevBySlug.set(s.project, s);
  }

  const explanations = snapshots.map((snap) => {
    const prev = prevBySlug.get(snap.project);
    const seed = seeds.find((s) => s.slug === snap.project)!;
    const dims = ["reality", "execution_evidence", "reflexivity_risk", "development"] as const;
    const entries = dims.map((d) => {
      const cur = snap.scores[d];
      const old = prev?.scores[d]?.value ?? null;
      const delta = cur.value != null && old != null ? Math.round((cur.value - old) * 10) / 10 : null;
      const contributors = Object.entries(cur.components)
        .filter(([, c]) => c.available && c.value != null)
        .map(([code, c]) => ({
          component: code,
          contribution: Math.round(c.value! * c.weight_applied * 10) / 10,
          text: `${cfg.components[code]?.name ?? code}: ${c.value}/10 (weight ${(c.weight_applied * 100).toFixed(0)}%)`,
        }));
      const missing = Object.entries(cur.components)
        .filter(([, c]) => !c.available)
        .map(([code]) => code);
      return {
        score: d,
        value: cur.value,
        status: cur.status,
        delta,
        summary:
          delta == null
            ? `First snapshot under methodology v${cfg.version}.`
            : delta > 0
              ? `${seed.name} ${d} +${delta} since last snapshot.`
              : delta < 0
                ? `${seed.name} ${d} ${delta} since last snapshot.`
                : `${seed.name} ${d} unchanged since last snapshot.`,
        contributors,
        missing_components: missing,
        gates_applied: cur.gates_applied,
      };
    });
    return { project: snap.project, snapshot_date: today, methodology_version: cfg.version, entries };
  });
  const explOut = join(SNAP_DIR, `explanations_${today}.json`);
  writeFileSync(explOut, JSON.stringify(explanations, null, 2));
  console.log(`[score] wrote ${explOut}`);

  // --- console summary (the "first calculated results") ---
  console.log("\n=== RESULTS (methodology v0.2.0, unadjusted) ===");
  for (const snap of snapshots) {
    const s = snap.scores;
    const fmt = (v: number | null) => (v == null ? "n/a" : v.toFixed(1));
    console.log(
      `${snap.project.toUpperCase()}  age=${snap.prove_it_age_years}y ` +
        `reality=${fmt(s.reality.value)} exec=${fmt(s.execution_evidence.value)} ` +
        `reflex=${fmt(s.reflexivity_risk.value)} dev=${fmt(s.development.value)} ` +
        `conf=${s.reality.confidence}% pot=${fmt(s.world_impact_potential.value)} ` +
        `tNec=${fmt(s.token_necessity.value)} tCap=${fmt(s.token_value_capture.value)} ` +
        `promiseGap=${fmt(snap.derived.promise_gap)} outlook=${fmt(snap.derived.potential_outlook)} ` +
        `status=${s.reality.status}`,
    );
  }
}

main().catch((e) => {
  console.error("[score] FATAL", e);
  process.exit(1);
});
