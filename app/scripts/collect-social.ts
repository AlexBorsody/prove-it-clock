/** npm run social:collect [--dry-run]. Polls free social sources, snapshots to Supabase. */
import { existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { collectAll } from '../src/lib/social-collect';

async function main() {
  const dry = process.argv.includes('--dry-run');
  if (existsSync('.env.local')) process.loadEnvFile('.env.local');

  const snapshots = await collectAll();
  for (const s of snapshots) {
    console.log(
      `${s.project_slug}: reddit=${s.reddit_subscribers ?? 'n/a'} ` +
      `telegram=${s.telegram_members ?? 'n/a'} ` +
      `news7d=${s.news_mentions_7d ?? 'n/a'} ` +
      `[${s.sources_ok.join(',') || 'none'}]`
    );
  }
  if (dry) {
    console.log(`Dry run: ${snapshots.length} snapshots, no database write.`);
    return;
  }

  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in app/.env.local or environment');
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const { error } = await db.from('social_snapshots').insert(
    snapshots.map(({ project_slug, as_of, reddit_subscribers, telegram_members, news_mentions_7d, sources_ok }) => ({
      project_slug, as_of, reddit_subscribers, telegram_members, news_mentions_7d, sources_ok,
    }))
  );
  if (error) throw new Error(`Insert failed (${error.code}): ${error.message}`);
  console.log(`Wrote ${snapshots.length} social snapshots.`);
}

main().catch(error => { console.error(error instanceof Error ? error.message : 'Collection failed'); process.exitCode = 1; });
