/**
 * GET /api/cron/scan-news — hourly promise-news scan (Vercel Cron).
 *
 * Guarded by CRON_SECRET (Vercel sets the Authorization header for cron
 * invocations; we also accept the x-cron-secret header for manual runs).
 * Runs the shared scan runner with live-scan settings: AI judgment required,
 * proposals deduped against the DB queue, no JSON run file on the serverless
 * filesystem.
 *
 * Proposal-only: drafts go to scan_proposals for human review. Nothing here
 * writes the published ledger. Promise-level news_mention pushes fire for
 * subscribers (observed facts, not judgments).
 */
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import { aiConfigured } from "@/lib/scan";
import { runPromiseNewsScan } from "@/lib/scan-runner";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const presented =
    req.headers.get("x-cron-secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";
  const a = Buffer.from(presented);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Fail fast with a clear message when the AI judge is missing; the runner
  // would refuse anyway (requireAi), but only after the Supabase check.
  if (!aiConfigured()) {
    return NextResponse.json(
      { ok: false, error: "AI judging required but SCANNER_AI_URL / SCANNER_AI_API_KEY are not set" },
      { status: 500 },
    );
  }
  const dryRun = req.nextUrl.searchParams.get("dry_run") === "1";
  try {
    const db = getSupabase();
    const summary = await runPromiseNewsScan(db, true, {
      dryRun,
      persistRunFile: false,
      dedupeFromDb: true,
      requireAi: true,
      log: (m) => console.log(`[scan-news] ${m}`),
    });
    return NextResponse.json({ ok: true, dry_run: dryRun, ...summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scan failed";
    console.error(`[scan-news] ${message}`);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
