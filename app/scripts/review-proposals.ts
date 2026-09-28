/**
 * Review queue CLI for scanner proposals.
 *
 * Usage:
 *   npm run scan:review -- list
 *   npm run scan:review -- show <proposal-id>
 *   npm run scan:review -- approve <proposal-id>
 *   npm run scan:review -- reject <proposal-id> --reason "why"
 *
 * Reads/writes the scan_proposals table (migration 009). Falls back to the
 * JSON queue in db/research/scan-proposals when the database is unavailable.
 *
 * Approve does NOT write the published ledger. It marks the proposal approved
 * and prints the event JSON to feed into the normal publication flow
 * (publish_promise_history). Publication is what fires notifications:
 * after publishing, the fan-out runs automatically (see publish-timeline.ts).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const PROPOSAL_DIR = join(__dirname, '..', '..', 'db', 'research', 'scan-proposals');

interface StoredProposal {
  id: string;
  kind: string;
  project_slug: string;
  lineage: string;
  payload: Record<string, unknown>;
  reasoning: string;
  article_url: string | null;
  article_title: string | null;
  status: 'pending' | 'approved' | 'rejected';
  review_note: string | null;
  created_at: string;
}

function env(): { url: string; key: string } | null {
  if (existsSync('.env.local')) process.loadEnvFile('.env.local');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

// ---------------------------------------------------------------------------
// JSON queue fallback (local runs without the database)
// ---------------------------------------------------------------------------

function loadRuns(): Array<{ file: string; proposals: StoredProposal[] }> {
  if (!existsSync(PROPOSAL_DIR)) return [];
  const runs: Array<{ file: string; proposals: StoredProposal[] }> = [];
  for (const file of readdirSync(PROPOSAL_DIR).sort()) {
    if (!file.endsWith('.json')) continue;
    try {
      const run = JSON.parse(readFileSync(join(PROPOSAL_DIR, file), 'utf8'));
      runs.push({ file, proposals: run.proposals ?? [] });
    } catch { /* skip */ }
  }
  return runs;
}

function saveRun(run: { file: string; proposals: StoredProposal[] }) {
  const raw = JSON.parse(readFileSync(join(PROPOSAL_DIR, run.file), 'utf8'));
  raw.proposals = run.proposals;
  writeFileSync(join(PROPOSAL_DIR, run.file), JSON.stringify(raw, null, 2));
}

interface Queue {
  source: string;
  listPending(): Promise<StoredProposal[]>;
  get(id: string): Promise<StoredProposal | null>;
  setStatus(id: string, status: 'approved' | 'rejected', note: string | null): Promise<StoredProposal>;
}

function jsonQueue(): Queue {
  return {
    source: `JSON queue (${PROPOSAL_DIR})`,
    async listPending() {
      return loadRuns().flatMap((r) => r.proposals.filter((p) => p.status === 'pending'));
    },
    async get(id: string) {
      for (const run of loadRuns()) {
        const p = run.proposals.find((x) => x.id === id);
        if (p) return p;
      }
      return null;
    },
    async setStatus(id: string, status: 'approved' | 'rejected', note: string | null) {
      for (const run of loadRuns()) {
        const p = run.proposals.find((x) => x.id === id);
        if (p) {
          if (p.status !== 'pending') throw new Error(`Proposal is already ${p.status}`);
          p.status = status;
          p.review_note = note;
          saveRun(run);
          return p;
        }
      }
      throw new Error(`Proposal not found: ${id}`);
    },
  };
}

// ---------------------------------------------------------------------------
// Database queue (scan_proposals)
// ---------------------------------------------------------------------------

function dbQueue(db: SupabaseClient): Queue {
  const row = (r: Record<string, unknown>): StoredProposal => ({
    id: String(r.id),
    kind: String(r.kind),
    project_slug: String(r.project_slug),
    lineage: String(r.lineage),
    payload: (r.payload ?? {}) as Record<string, unknown>,
    reasoning: String(r.reasoning ?? ''),
    article_url: (r.article_url as string | null) ?? null,
    article_title: (r.article_title as string | null) ?? null,
    status: r.status as StoredProposal['status'],
    review_note: (r.review_note as string | null) ?? null,
    created_at: String(r.created_at ?? ''),
  });
  return {
    source: 'scan_proposals table',
    async listPending() {
      const { data, error } = await db
        .from('scan_proposals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw new Error(`Could not read proposals: ${error.message}`);
      return (data ?? []).map(row);
    },
    async get(id: string) {
      const { data, error } = await db.from('scan_proposals').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(`Could not read proposal: ${error.message}`);
      return data ? row(data) : null;
    },
    async setStatus(id: string, status: 'approved' | 'rejected', note: string | null) {
      const { data: current, error: readError } = await db.from('scan_proposals').select('status').eq('id', id).maybeSingle();
      if (readError) throw new Error(`Could not read proposal: ${readError.message}`);
      if (!current) throw new Error(`Proposal not found: ${id}`);
      if (current.status !== 'pending') throw new Error(`Proposal is already ${current.status}`);
      const { data, error } = await db
        .from('scan_proposals')
        .update({ status, review_note: note, reviewed_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw new Error(`Could not update proposal: ${error.message}`);
      return row(data);
    },
  };
}

async function resolveQueue(): Promise<Queue> {
  const creds = env();
  if (!creds) return jsonQueue();
  const db = createClient(creds.url, creds.key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await db.from('scan_proposals').select('id').limit(1);
  if (error && error.message.includes('Could not find the table')) {
    console.log('scan_proposals table not in the database yet; using the JSON queue.');
    return jsonQueue();
  }
  if (error) throw new Error(`Could not reach scan_proposals: ${error.message}`);
  return dbQueue(db);
}

function printProposal(p: StoredProposal) {
  console.log(`${p.id} [${p.kind}] ${p.project_slug}/${p.lineage}\n  ${p.article_title ?? '(no title)'}\n  ${p.article_url ?? ''}\n  ${p.reasoning}\n`);
}

async function main() {
  const [command, id, ...rest] = process.argv.slice(2);
  const queue = await resolveQueue();
  if (command === 'list') {
    const pending = await queue.listPending();
    console.log(`Source: ${queue.source}`);
    if (pending.length === 0) {
      console.log('No pending proposals.');
      return;
    }
    for (const p of pending) printProposal(p);
    return;
  }
  if (command === 'show') {
    const p = id ? await queue.get(id) : null;
    if (!p) throw new Error(`Proposal not found: ${id}`);
    console.log(JSON.stringify(p, null, 2));
    return;
  }
  if (command === 'approve' || command === 'reject') {
    if (!id) throw new Error('A proposal id is required');
    const reasonIdx = rest.indexOf('--reason');
    const reason = reasonIdx >= 0 ? rest.slice(reasonIdx + 1).join(' ').trim() : '';
    if (command === 'reject' && !reason) throw new Error('Reject requires --reason "..."');
    const p = await queue.setStatus(id, command === 'approve' ? 'approved' : 'rejected', reason || null);
    if (command === 'approve') {
      console.log(`Approved ${id} (${queue.source}). Feed this event into the normal publication flow (publish_promise_history).`);
      console.log('Event JSON:');
      console.log(JSON.stringify(p.payload, null, 2));
      console.log('\nAfter publishing, fan-out runs automatically (see publish-timeline.ts).');
    } else {
      console.log(`Rejected ${id}: ${reason}`);
    }
    return;
  }
  throw new Error('Usage: npm run scan:review -- <list|show|approve|reject> [proposal-id] [--reason "..."]');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Review failed');
  process.exitCode = 1;
});
