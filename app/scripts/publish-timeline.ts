/** Defaults to offline validation. Writes require --publish and an explicit target. */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { parseTimelineRow } from '../src/lib/promise-timeline';

async function main() {
  const args = process.argv.slice(2);
  const file = args.shift();
  const publish = args.includes('--publish');
  const check = args.includes('--check');
  const targetArg = args.find(arg => arg.startsWith('--target='));
  if (!file || file.startsWith('--') || (publish && check) || args.some(arg =>
    !['--publish', '--check'].includes(arg) && !arg.startsWith('--target='))) {
    throw new Error('Usage: npm run timeline:publish -- batch.json [--check | --publish --target=https://PROJECT.supabase.co]');
  }
  const document = JSON.parse(readFileSync(resolve(file), 'utf8'));
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!document || document.schema_version !== 1 ||
    typeof document.revision_key !== 'string' || !document.revision_key.trim() || document.revision_key.length > 200 ||
    typeof document.author !== 'string' || !document.author.trim() ||
    typeof document.project_slug !== 'string' || !/^[a-z0-9-]+$/.test(document.project_slug) ||
    !uuid.test(document.ledger_run_id ?? '') ||
    !(document.previous_revision_id === null || uuid.test(document.previous_revision_id ?? '')) ||
    !Array.isArray(document.events) || document.events.length < 1 || document.events.length > 500 ||
    Buffer.byteLength(JSON.stringify(document)) > 1_000_000) throw new Error('Invalid history envelope');
  const now = new Date().toISOString();
  for (const event of document.events) {
    if (!event || Object.hasOwn(event, 'recordedAt')) throw new Error('Recording timestamps belong to the database');
    for (const date of [event.occurredOn, event.source?.publishedOn]) {
      if (typeof date !== 'string' || date > now.slice(0, date.length)) throw new Error('Missing or future event/source date');
    }
  }
  let parentEvents: unknown[] = [];
  let db: SupabaseClient | undefined;
  if (check || publish) {
    if (existsSync('.env.local')) process.loadEnvFile('.env.local');
    const url = process.env.SUPABASE_URL;
    const key = publish ? process.env.SUPABASE_SERVICE_ROLE_KEY :
      process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error(publish
      ? 'Publication requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY locally'
      : 'Read-only check requires SUPABASE_URL and a publishable, anon or service key locally');
    if (publish && (!targetArg || targetArg.slice('--target='.length).replace(/\/$/, '') !== url.replace(/\/$/, ''))) {
      throw new Error('--publish requires --target matching SUPABASE_URL');
    }
    db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const {error: historyError} = await db.from('promise_history_revisions').select('id').eq('project_slug', document.project_slug).limit(1);
    if (historyError) throw new Error(`History table is unavailable (${historyError.code}); check migration 007 and read access`);
    if (document.previous_revision_id) {
      const {data, error} = await db.from('promise_history_revisions').select('*').eq('id', document.previous_revision_id).single();
      if (error) throw new Error(`Cannot read parent revision (${error.code})`);
      const parent = parseTimelineRow(data);
      if (parent.projectSlug !== document.project_slug) throw new Error('Parent belongs to another project');
      parentEvents = parent.events;
    }
    // Read the exact published run; the RPC repeats all checks atomically on write.
    const {data: run, error} = await db.from('heart_runs').select('id,review_status').eq('id', document.ledger_run_id).single();
    if (error || run?.review_status !== 'published') throw new Error('Ledger run is unavailable or not published');
  } else if (document.previous_revision_id) {
    throw new Error('Appending to history requires --check to validate against the stored parent; no write occurs');
  }
  // Temporary timestamps are validation-only; the original document is sent unchanged.
  parseTimelineRow({id: 'validation', project_slug: document.project_slug, ledger_run_id: document.ledger_run_id,
    recorded_at: now, events: [...parentEvents, ...document.events.map((event: object) => ({...event, recordedAt: now}))]});
  if (!publish) {
    console.log(`Validated ${document.events.length} events for ${document.project_slug}. No database write. ${check ? 'History table, published run and any parent checked; RPC will enforce lineage, state and concurrency on publication.' : 'Offline only; published run, lineage and state still require database validation.'}`);
    return;
  }
  const {data, error} = await db!.rpc('publish_promise_history', {document});
  if (error) throw new Error(`Publication rejected (${error.code}): ${error.message}`);
  if (typeof data !== 'string' || !uuid.test(data)) throw new Error('Publication returned no revision ID');
  console.log(`Published history revision ${data}. Verify /projects/${document.project_slug}?history=${data}#project-${document.project_slug}-timeline`);
}
main().catch(error => {console.error(error instanceof Error ? error.message : 'Timeline publication failed'); process.exitCode = 1;});
