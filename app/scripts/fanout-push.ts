/**
 * Fan-out push notifications for one published promise-history revision.
 *
 * Usage: npm run push:fanout -- --revision-key <key> [--dry-run]
 *
 * Run this after publishing a ledger revision via publish_promise_history
 * (the SQL function), or let the HTTP hook at /api/push/fanout do it
 * (see db/migrations/009_push_notifications.sql for the trigger sketch).
 * It finds every matching push subscription, builds the factual copy, sends
 * via Web Push, and records deliveries so a revision is never notified twice.
 * Gone subscriptions (410/404) are removed.
 *
 * Notification triggers are ledger publications only. This script never fires
 * on market data, CODE/HYPE metrics, or price moves.
 */
import { existsSync } from 'node:fs';
import { fanoutRevisionByKey } from '../src/lib/push-fanout';

if (existsSync('.env.local')) process.loadEnvFile('.env.local');

async function main() {
  const args = process.argv.slice(2);
  const keyIdx = args.indexOf('--revision-key');
  const revisionKey = keyIdx >= 0 ? args[keyIdx + 1] : undefined;
  if (!revisionKey || args.some((a) => a.startsWith('--') && a !== '--revision-key' && a !== '--dry-run')) {
    throw new Error('Usage: npm run push:fanout -- --revision-key <key> [--dry-run]');
  }
  const dryRun = args.includes('--dry-run');
  const result = await fanoutRevisionByKey(revisionKey, { dryRun });
  if (dryRun) {
    console.log(
      `Dry run: ${result.planned} push(es) planned for revision ${revisionKey} (${result.subscriptions} subscriptions, ${result.alreadyNotified} accepted by provider, ${result.pending} pending review).`,
    );
    for (const p of result.previews ?? []) console.log(`- [${p.kind}] ${p.payload.title} :: ${p.payload.body}`);
    return;
  }
  console.log(`Sent ${result.sent} push(es) for revision ${revisionKey} (${result.removed} gone subscriptions removed, ${result.pending} pending review, ${result.skipped} concurrently reserved).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Fan-out failed');
  process.exitCode = 1;
});
