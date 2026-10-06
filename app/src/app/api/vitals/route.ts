import { fetchVitals } from "@/lib/vitals";
import { codeWord } from "@/lib/heart-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/vitals?slugs=btc,eth,sol
 * Returns GitHub vitals for the requested slugs (lazy-loaded client-side).
 */
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
      const batchResults = await Promise.all(
        batch.map(async (slug) => {
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
        })
      );
      for (const r of batchResults) {
        results[r.slug] = r;
      }
    }
    
    return Response.json({ vitals: results });
  } catch (e) {
    return Response.json({ error: "Vitals unavailable" }, { status: 503 });
  }
}
