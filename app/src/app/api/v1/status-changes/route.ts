import { getStatusChanges, parsePagination } from "@/lib/public-api";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/status-changes — paginated public feed of published promise
 * status changes (new promise, new evidence, published assessment, claim
 * revision). Newest first. Optional ?project_slug= filter.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const { page, perPage } = parsePagination(url);
  const projectSlug = url.searchParams.get("project_slug")?.trim() || undefined;
  try {
    return Response.json(await getStatusChanges(page, perPage, projectSlug));
  } catch {
    return Response.json({ error: "Status-change feed unavailable" }, { status: 503 });
  }
}
