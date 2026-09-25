import { fetchVitals, isVitalsSlug } from "@/lib/vitals";

/**
 * GET /api/vitals/[slug] - live project vitals (GitHub activity).
 * Display only; never feeds the hearts score.
 * Cached at the CDN for 6 hours; GitHub upstream is revalidated every 6h.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!isVitalsSlug(slug)) {
    return Response.json({ error: "unknown project" }, { status: 404 });
  }
  const data = await fetchVitals(slug);
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600",
    },
  });
}
