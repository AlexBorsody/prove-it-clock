import { unstable_cache } from "next/cache";
import { isSocialSlug } from "@/lib/social";
import { fetchNewsMentions } from "@/lib/news-mentions";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSocialSlug(slug)) return Response.json({ error: "Unknown project" }, { status: 404 });
  try {
    // Cache the records and their real fetch timestamp together for one hour.
    const feed = await unstable_cache(() => fetchNewsMentions(slug), ["news-mentions-v2", slug], { revalidate: 3600 })();
    return Response.json(feed, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" } });
  } catch {
    return Response.json({ error: "News sources are temporarily unavailable. Please try again." }, {
      status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "60" },
    });
  }
}
