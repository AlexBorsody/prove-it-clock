/**
 * Live AI status-change scanner CLI. One run: open promises x recent news.
 *
 * Usage: npm run scan:news [--dry-run]
 *
 * Interval is config, not code: SCAN_INTERVAL_HOURS (default 1). The hourly
 * schedule lives in vercel.json (cron -> /api/cron/scan-news); this CLI is
 * the local/manual entry point.
 *
 * PROPOSAL-ONLY: the scanner drafts evidence / assessment / claim_repeated
 * events with quoted sources into the review queue. It never writes the
 * published ledger. A human approves via `npm run scan:review`; publication
 * is what fires notifications.
 */
import { existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { runPromiseNewsScan } from '../src/lib/scan-runner';

function env(): { url: string; key: string } | null {
  if (existsSync('.env.local')) process.loadEnvFile('.env.local');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const creds = env();
  if (!creds) throw new Error('SUPABASE_URL and a Supabase key are required to read the published ledger');
  const db = createClient(creds.url, creds.key, { auth: { persistSession: false, autoRefreshToken: false } });
  const canWriteDb = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  // Local runs keep working without the AI key (loud keyword-only warning);
  // the cron route passes requireAi: true.
  const summary = await runPromiseNewsScan(db, canWriteDb, {
    dryRun,
    persistRunFile: true,
    dedupeFromDb: false,
    requireAi: false,
    log: (m) => console.log(m),
  });
  console.log(
    `Scan complete: ${summary.projectsChecked} projects, ${summary.articlesSeen} articles, ` +
      `${summary.proposalsCreated} proposals, ${summary.pushesSent} news pushes.`,
  );
  console.log('Review with: npm run scan:review -- list');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Scan failed');
  process.exitCode = 1;
});
