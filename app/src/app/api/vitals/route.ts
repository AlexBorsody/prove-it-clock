import { fetchVitals } from "@/lib/vitals";
import { codeWord } from "@/lib/heart-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/vitals?slugs=btc,eth,sol
 * Returns GitHub vitals for the requested slugs (lazy-loaded client-side).
 *
 * Primary source is app/data/vitals-cache.json, refreshed daily by the
 * vitals-refresh GitHub Action (automatic token). This keeps production off
 * the anonymous GitHub rate limit with no Vercel env var to manage. Slugs
 * missing from the cache, or a cache older than 72h, fall back to a live
 * fetch (which itself honors GITHUB_TOKEN when set).
 */

interface CachedVital { stars: number | null; commits90d: number | null; partial?: boolean }
// Static import: bundled at build time. The vitals-refresh Action commits a
// fresh file daily, which triggers a Vercel rebuild, so the bundle stays current.
// (Relative path: this file is app/src/app/api/vitals/route.ts, cache is app/data/.)
import vitalsCacheJson from "../../../../data/vitals-cache.json";
const cache = vitalsCacheJson as { updatedAt: string; vitals: Record<string, CachedVital> } | null;

function cacheFresh(): boolean {
  if (!cache?.updatedAt) return false;
  return Date.now() - new Date(cache.updatedAt).getTime() < 72 * 60 * 60 * 1000;
}

async function vitalsFor(slug: string) {
  const hit = cacheFresh() ? cache!.vitals[slug] : undefined;
  if (hit && hit.commits90d != null) {
    return {
      slug,
      code: codeWord({ commits90d: hit.commits90d }),
      commits: hit.commits90d,
      stars: hit.stars,
      note: null as string | null,
    };
  }
  try {
    const vitals = await fetchVitals(slug);
    return {
      slug,
      code: vitals ? codeWord({ commits90d: vitals.commits90d }) : null,
      commits: vitals?.commits90d ?? null,
      stars: vitals?.stars ?? null,
      note: vitals == null
        ? "No commit data"
        : vitals.commits90d == null && vitals.partial
          ? "Couldn't reach GitHub"
          : null,
    };
  } catch {
    return { slug, code: null, commits: null, stars: null, note: "No commit data" };
  }
}
export async function GET(req: Request) {
  const url = new URL(req.url);
  const slugsParam = url.searchParams.get("slugs") || "";
  const slugs = slugsParam.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  
  if (!slugs.length) {
    return Response.json({ error: "No slugs provided" }, { status: 400 });
  }
  
  try {
    const results: Record<string, any> = {};
    
    // Fetch in parallel but limit concurrency
    const batchSize = 10;
    for (let i = 0; i < slugs.length; i += batchSize) {
      const batch = slugs.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(vitalsFor));
      for (const r of batchResults) {
        results[r.slug] = r;
      }
    }
    
    return Response.json({ vitals: results });
  } catch (e) {
    return Response.json({ error: "Vitals unavailable" }, { status: 503 });
  }
}
