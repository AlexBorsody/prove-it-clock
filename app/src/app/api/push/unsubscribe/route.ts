/**
 * POST /api/push/unsubscribe — remove a push subscription.
 * Body: { endpoint, scope: { project_slug, lineage? } }
 * Idempotent: unsubscribing a missing subscription still returns ok.
 */
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { validateScope } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const body = (input ?? {}) as Record<string, unknown>;
  let endpoint: string;
  try {
    const url = new URL(String(body.endpoint ?? ""));
    if (url.protocol !== "https:") throw new Error("endpoint must be https");
    endpoint = url.href;
  } catch {
    return NextResponse.json({ error: "endpoint must be a valid https URL" }, { status: 400 });
  }
  let scope;
  try {
    scope = validateScope(body.scope);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid scope" }, { status: 400 });
  }
  let db;
  try {
    db = getSupabase();
  } catch {
    return NextResponse.json({ error: "Push service unavailable" }, { status: 503 });
  }
  const { error } = await db
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("scope", scope);
  if (error) {
    return NextResponse.json({ error: "Could not remove subscription" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
