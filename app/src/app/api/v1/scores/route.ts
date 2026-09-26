import { getScoresList, parsePagination } from "@/lib/public-api";

export const dynamic = "force-dynamic";

/** GET /api/v1/scores — paginated public score list. */
export async function GET(req: Request) {
  const { page, perPage } = parsePagination(new URL(req.url));
  try {
    return Response.json(await getScoresList(page, perPage));
  } catch {
    return Response.json({ error: "Score database unavailable" }, { status: 503 });
  }
}
