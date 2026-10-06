import { fetchMarketsByIds, type UniverseRow } from "@/providers/coingecko";
import { MARKET_IDS } from "@/lib/market-ids";

export const dynamic = "force-dynamic";

/**
 * GET /api/market-caps?slugs=btc,eth,sol
 * Returns market caps for the requested slugs (lazy-loaded client-side).
 * Batches CoinGecko IDs to stay within API limits.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const slugsParam = url.searchParams.get("slugs") || "";
  const slugs = slugsParam.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  
  if (!slugs.length) {
    return Response.json({ error: "No slugs provided" }, { status: 400 });
  }
  
  // Map slugs to CoinGecko IDs
  const ids = [...new Set(
    slugs.map(s => MARKET_IDS[s]).filter(Boolean)
  )];
  
  if (!ids.length) {
    return Response.json({ caps: {} });
  }
  
  try {
    const caps: Record<string, number | null> = {};
    const batchSize = 50;
    
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const rows: UniverseRow[] = await fetchMarketsByIds(batch).catch(() => []);
      for (const row of rows) {
        // Map back from CoinGecko ID to slug
        const slug = Object.keys(MARKET_IDS).find(s => MARKET_IDS[s] === row.id);
        if (slug) {
          caps[slug] = typeof row.market_cap === 'number' ? row.market_cap : null;
        }
      }
    }
    
    return Response.json({ caps });
  } catch (e) {
    return Response.json({ error: "Market data unavailable" }, { status: 503 });
  }
}
