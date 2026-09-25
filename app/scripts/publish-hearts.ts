/** npm run hearts:publish -- artifact.json [--dry-run]. No browser write API. */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { validateHeartPublication } from '../src/lib/heart-publication';

async function main() {
  const args = process.argv.slice(2);
  const file = args.find(arg => !arg.startsWith('--'));
  if (!file || args.some(arg => arg.startsWith('--') && arg !== '--dry-run')) {
    throw new Error('Usage: npm run hearts:publish -- artifact.json [--dry-run]');
  }
  const document: unknown = JSON.parse(readFileSync(resolve(file), 'utf8'));
  validateHeartPublication(document);
  if (args.includes('--dry-run')) {
    console.log(`Validated ${document.review_status} run ${document.run_key}: ${document.projects.length} projects. No database write.`);
    return;
  }
  // Node 22 parses the ignored local env file without printing secrets.
  if (existsSync('.env.local')) process.loadEnvFile('.env.local');
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in app/.env.local or environment');
  const db = createClient(url, key, {auth: {persistSession: false, autoRefreshToken: false}});
  const {data, error} = await db.rpc('publish_heart_run', {document});
  if (error) throw new Error(`Publication failed (${error.code}): ${error.message}`);
  if (typeof data !== 'string') throw new Error('Publication returned no run ID');
  console.log(`Stored ${document.review_status} run ${data}; all ${document.projects.length} projects committed atomically.`);
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Publication failed'); process.exitCode = 1; });
