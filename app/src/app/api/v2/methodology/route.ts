import { getMethodology } from "@/lib/api-v2";

export const dynamic = "force-dynamic";

/**
 * GET /api/v2/methodology
 * Methodology versions, meter formulas, weight tiers, and state partitions.
 * The human-readable contract behind every number in the API.
 */
export async function GET() {
  try {
    return Response.json(await getMethodology());
  } catch {
    return Response.json({ error: "Promise ledger unavailable" }, { status: 503 });
  }
}
