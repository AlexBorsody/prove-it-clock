import { createClient } from "@supabase/supabase-js";
import { isSocialSlug, median, type SocialSnapshot } from "@/lib/social";

/**
 * GET /api/social/[slug] - Prove-It's own social metrics for a project.
 * Display only; never feeds the hearts score.
 *
 * Returns the two latest snapshots (for trend arrows) plus the
 * cross-project median of 7-day news mentions, which powers the
 * hype-vs-substance read. Empty table (migration not applied yet, or no
 * collector run) yields status "no_data" and the UI hides the section.
 */
export const dynamic = "force-dynamic";

function db() {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!isSocialSlug(slug)) {
    return Response.json({ error: "unknown project" }, { status: 404 });
  }

  let client;
  try {
    client = db();
  } catch {
    return Response.json({ status: "no_data" }, { status: 200 });
  }

  try {
    const { data: rows, error } = await client
      .from("social_snapshots")
      .select("project_slug, as_of, reddit_subscribers, telegram_members, news_mentions_7d, sources_ok")
      .eq("project_slug", slug)
      .order("as_of", { ascending: false })
      .limit(2);
    if (error) throw error;
    const snaps = (rows ?? []) as SocialSnapshot[];
    if (snaps.length === 0) {
      return Response.json({ status: "no_data" });
    }

    // Latest snapshot per project across the table, for the hype median.
    const { data: batchRows, error: batchError } = await client
      .from("social_snapshots")
      .select("project_slug, as_of, news_mentions_7d")
      .order("as_of", { ascending: false })
      .limit(64);
    if (batchError) throw batchError;
    const seen = new Set<string>();
    const batchMentions: number[] = [];
    for (const r of (batchRows ?? []) as Array<{ project_slug: string; news_mentions_7d: number | null }>) {
      if (seen.has(r.project_slug)) continue;
      seen.add(r.project_slug);
      if (r.news_mentions_7d != null) batchMentions.push(r.news_mentions_7d);
    }

    return Response.json(
      {
        status: "ok",
        latest: snaps[0],
        previous: snaps[1] ?? null,
        median_mentions_7d: median(batchMentions),
        batch_size: batchMentions.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return Response.json({ status: "no_data" });
  }
}
