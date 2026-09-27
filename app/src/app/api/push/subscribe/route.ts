/**
 * POST /api/push/subscribe — store a push subscription for a coin or promise scope.
 * Body: { endpoint, p256dh, auth, scope: { project_slug, lineage? } }
 * Idempotent: re-subscribing the same (endpoint, scope) is a no-op.
 * Writes require the service-role key server-side; push_subscriptions has no
 * public RLS policy.
 */
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { validateSubscriptionInput } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  let parsed;
  try {
    parsed = validateSubscriptionInput(input);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid subscription" }, { status: 400 });
  }
  let db;
  try {
    db = getSupabase();
  } catch {
    return NextResponse.json({ error: "Push service unavailable" }, { status: 503 });
  }
  const { error } = await db.from("push_subscriptions").upsert(
    {
      endpoint: parsed.endpoint,
      p256dh: parsed.p256dh,
      auth: parsed.auth,
      scope: parsed.scope,
    },
    { onConflict: "endpoint,scope" },
  );
  if (error) {
    return NextResponse.json({ error: "Could not save subscription" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
