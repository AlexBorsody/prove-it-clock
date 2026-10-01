import { getPromises } from "@/lib/api-v2";

export const dynamic = "force-dynamic";

/**
 * GET /api/v2/promises
 * The promise ledger with evidence. Filters: project, category, state.
 * Pagination: page (default 1), per_page (default 50, max 200).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const perPage = Math.min(
    200,
    Math.max(1, parseInt(url.searchParams.get("per_page") ?? "50", 10) || 50)
  );
  try {
    return Response.json(
      await getPromises({
        project: url.searchParams.get("project")?.toLowerCase() || undefined,
        category: url.searchParams.get("category") || undefined,
        state: url.searchParams.get("state") || undefined,
        page,
        perPage,
      })
    );
  } catch {
    return Response.json({ error: "Promise ledger unavailable" }, { status: 503 });
  }
}
