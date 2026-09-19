/**
 * Pipeline stage 1: INGEST
 *
 *   providers -> validate -> cache raw responses -> normalized metrics
 *
 * Writes:
 *   data/raw/<date>/<provider>__<slug>.json   (untouched vendor payloads)
 *   data/snapshots/metrics_<date>.json        (normalized internal metrics)
 *
 * Same-day cache is reused so a daily run never hammers upstream.
 * The frontend NEVER calls providers; it only reads snapshots.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ingestCoinGecko } from "../providers/coingecko/index.js";
import { ingestDefiLlama } from "../providers/defillama/index.js";
import { ingestBitcoinFees } from "../providers/bitcoin/index.js";
import type { NormalizedMetric, ProjectIngest, RawFetch } from "../providers/types.js";
import { loadSeeds } from "../methodology/index.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const today = new Date().toISOString().slice(0, 10);
const RAW_DIR = join(ROOT, "data", "raw", today);
const SNAP_DIR = join(ROOT, "data", "snapshots");

const safe = (s: string) => s.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);

function cacheFetch(projectSlug: string, f: RawFetch): void {
  const p = join(RAW_DIR, `${f.provider}__${projectSlug}__${safe(f.endpoint)}.json`);
  writeFileSync(p, JSON.stringify(f, null, 2));
}

function cachedFetches(): Map<string, RawFetch[]> {
  // Reuse today's cache if present (keyed by project slug).
  const map = new Map<string, RawFetch[]>();
  if (!existsSync(RAW_DIR)) return map;
  for (const file of readdirSync(RAW_DIR)) {
    const m = file.match(/^([a-z]+)__([a-z0-9]+)__.+\.json$/);
    if (!m) continue;
    const [, , slug] = m;
    const f = JSON.parse(readFileSync(join(RAW_DIR, file), "utf-8")) as RawFetch;
    if (!map.has(slug)) map.set(slug, []);
    map.get(slug)!.push(f);
  }
  return map;
}

async function main() {
  mkdirSync(RAW_DIR, { recursive: true });
  mkdirSync(SNAP_DIR, { recursive: true });

  const seeds = loadSeeds();
  const cache = cachedFetches();
  const useCache = [...cache.values()].some((v) => v.length > 0);
  if (useCache) console.log(`[ingest] reusing ${cache.size} project(s) from today's raw cache`);

  // Merge helper: combine per-provider ProjectIngest into one per slug.
  const merged = new Map<string, ProjectIngest>();
  const merge = (ings: ProjectIngest[]) => {
    for (const ing of ings) {
      if (!merged.has(ing.slug)) merged.set(ing.slug, { slug: ing.slug, rawFetches: [], metrics: [], unavailable: [] });
      const m = merged.get(ing.slug)!;
      m.rawFetches.push(...ing.rawFetches);
      m.metrics.push(...ing.metrics);
      m.unavailable.push(...ing.unavailable);
    }
  };

  if (!useCache) {
    console.log("[ingest] CoinGecko…");
    const cg = await ingestCoinGecko(seeds.map((s) => ({ slug: s.slug, coingeckoId: s.coingecko_id })));
    merge(cg);
    console.log("[ingest] DefiLlama…");
    merge(await ingestDefiLlama(seeds.map((s) => s.slug)));
    console.log("[ingest] Bitcoin on-chain fees (blockchain.info)…");
    merge([await ingestBitcoinFees()]);
    for (const ing of merged.values()) {
      for (const f of ing.rawFetches) cacheFetch(ing.slug, f);
    }
  } else {
    // Rebuild normalized metrics from cached raw payloads is not possible
    // without re-running normalization; instead we re-run adapters in
    // "offline" mode is overkill — simplest correct behavior: if cache
    // exists we still normalize from a fresh adapter run ONLY when the
    // user forces it. For now: cache hit means skip (metrics snapshot
    // from the earlier run today is authoritative).
    console.log("[ingest] cache hit — skipping upstream calls. Delete data/raw/<today> to force refetch.");
    return;
  }

  // --- validation: every metric value must be finite or null ---
  const metrics: NormalizedMetric[] = [];
  const unavailable: { projectSlug: string; metricCode: string; reason: string; provider: string }[] = [];
  for (const ing of merged.values()) {
    for (const mt of ing.metrics) {
      if (mt.value !== null && !Number.isFinite(mt.value)) {
        throw new Error(`non-finite metric ${ing.slug}/${mt.metricCode}: ${mt.value}`);
      }
      metrics.push(mt);
    }
    for (const u of ing.unavailable) {
      unavailable.push({ projectSlug: ing.slug, metricCode: u.metricCode as string, reason: u.reason, provider: "adapter" });
    }
  }

  const snapshot = {
    snapshot_date: today,
    generated_at: new Date().toISOString(),
    project_count: merged.size,
    metric_count: metrics.length,
    unavailable_count: unavailable.length,
    metrics,
    unavailable,
  };
  const out = join(SNAP_DIR, `metrics_${today}.json`);
  writeFileSync(out, JSON.stringify(snapshot, null, 2));
  console.log(`[ingest] wrote ${out}: ${metrics.length} metrics, ${unavailable.length} unavailable markers`);

  // availability summary per project
  for (const ing of merged.values()) {
    const avail = ing.metrics.filter((m) => m.value !== null).length;
    console.log(`[ingest]   ${ing.slug}: ${avail}/${ing.metrics.length} metrics with values, ${ing.unavailable.length} unavailable`);
  }
}

main().catch((e) => {
  console.error("[ingest] FATAL", e);
  process.exit(1);
});
