/**
 * POST /api/push/fanout — publication hook.
 *
 * A Postgres trigger (or the publish tooling) calls this after a new
 * promise_history_revisions row is published. Body: { revision_key }.
 * Guarded by PUSH_FANOUT_SECRET so only the database trigger / ops tooling
 * can invoke it. Supports ?dry_run=1 for safe previews.
 *
 * Sends factual status-change pushes to matching subscriptions, deduplicated
 * per revision via push_deliveries. Never fires on market or price data.
 */
import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { getSupabase } from '@/lib/supabase';
import { fanoutForRevision, previewFanout } from '@/lib/push-fanout';

function authorized(req: NextRequest): boolean {
  const secret = process.env.PUSH_FANOUT_SECRET;
  if (!secret) return false;
  const presented = req.headers.get('x-fanout-secret') ?? '';
  const a = Buffer.from(presented);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: { revision_key?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Expected JSON body with revision_key' }, { status: 400 });
  }
  const revisionKey = typeof body.revision_key === 'string' ? body.revision_key.trim() : '';
  if (!revisionKey) return NextResponse.json({ error: 'revision_key is required' }, { status: 400 });

  try {
    const db = getSupabase();
    const dryRun = req.nextUrl.searchParams.get('dry_run') === '1';
    if (dryRun) {
      const { summary } = await previewFanout(db, revisionKey);
      return NextResponse.json({ dry_run: true, ...summary });
    }
    const summary = await fanoutForRevision(db, revisionKey);
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fan-out failed';
    const status = message.includes('Unauthorized') ? 401 : message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
