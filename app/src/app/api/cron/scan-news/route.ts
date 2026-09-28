import { timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { runNewsScan } from '@/lib/scan-news-run';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const headers = { 'Cache-Control': 'no-store' };

/** Vercel sends CRON_SECRET as a Bearer token. Never trust User-Agent alone. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const presented = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret ?? ''}`);
  if (!secret || presented.length !== expected.length || !timingSafeEqual(presented, expected)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (process.env.NEWS_SCAN_ENABLED !== 'true' || !url || !key) {
    return Response.json({ error: 'Scheduled news scan is not enabled or configured' }, { status: 503, headers });
  }

  try {
    const db = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => fetch(input, {
        ...init,
        signal: init?.signal
          ? AbortSignal.any([init.signal, AbortSignal.timeout(20_000)])
          : AbortSignal.timeout(20_000),
      }) },
    });
    const result = await runNewsScan(db, { signal: request.signal });
    return Response.json(result, { status: result.status === 'partial' ? 502 : 200, headers });
  } catch (error) {
    console.error('Scheduled news scan failed:', error);
    return Response.json({ error: 'News scan failed; inspect scan_runs and server logs' }, { status: 500, headers });
  }
}
