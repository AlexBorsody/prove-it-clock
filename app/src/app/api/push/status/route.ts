/**
 * GET /api/push/status?endpoint=<url>&project_slug=<slug>
 * Returns the scopes this endpoint is subscribed to for the project, so the
 * "Notify me" toggles can render their current state.
 */
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { PushScope } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  let endpoint: string;
  try {
    const url = new URL(params.get("endpoint") ?? "");
    if (url.protocol !== "https:") throw new Error("endpoint must be https");
    endpoint = url.href;
  } catch {
    return NextResponse.json({ error: "endpoint must be a valid https URL" }, { status: 400 });
  }
  const projectSlug = params.get("project_slug") ?? "";
  if (!/^[a-z0-9-]{1,120}$/.test(projectSlug)) {
    return NextResponse.json({ error: "project_slug is required" }, { status: 400 });
  }
  let db;
  try {
    db = getSupabase();
  } catch {
    return NextResponse.json({ error: "Push service unavailable" }, { status: 503 });
  }
  const { data, error } = await db
    .from("push_subscriptions")
    .select("scope")
    .eq("endpoint", endpoint)
    .eq("scope->>project_slug", projectSlug);
  if (error) {
    return NextResponse.json({ error: "Could not read subscriptions" }, { status: 500 });
  }
  const scopes: PushScope[] = (data ?? []).map((row) => row.scope as PushScope);
  return NextResponse.json({ scopes });
}
