import { getVerdicts } from "@/lib/api-v2";

export const dynamic = "force-dynamic";

/**
 * GET /api/v2/verdicts
 * All projects with three-meter verdicts: proven delivery, outcome coverage,
 * kept among resolved, plus core finding and per-category breakdown.
 */
export async function GET() {
  try {
    return Response.json(await getVerdicts());
  } catch {
    return Response.json({ error: "Promise ledger unavailable" }, { status: 503 });
  }
}
