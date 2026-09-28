/**
 * Review queue CLI for scanner proposals.
 *
 * Usage:
 *   npm run scan:review -- list
 *   npm run scan:review -- show <proposal-id>
 *   npm run scan:review -- approve <proposal-id>
 *   npm run scan:review -- reject <proposal-id> --reason "why"
 *   npm run scan:review -- --database list
 *   npm run scan:review -- --database show <proposal-id>
 *
 * --database is read-only inspection of the scheduled scan queue. File-based
 * approve/reject commands do not review or publish database proposals.
 *
 * Approve does NOT write the published ledger. It marks the proposal approved
 * and prints the event JSON to feed into the normal publication flow
 * (publish_promise_history). Publication is what fires notifications:
 * after publishing, run `npm run push:fanout -- --revision-key <key>`.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const PROPOSAL_DIR = join(__dirname, '..', '..', 'db', 'research', 'scan-proposals');

interface StoredProposal {
  id: string;
  kind: string;
  project_slug: string;
  lineage: string;
  payload: Record<string, unknown>;
  reasoning: string;
  article_url: string;
  article_title: string;
  status: 'pending' | 'approved' | 'rejected';
  review_note: string | null;
  created_at: string;
}

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

function find(id: string): { run: { file: string; proposals: StoredProposal[] }; proposal: StoredProposal } | null {
  for (const run of loadRuns()) {
    const proposal = run.proposals.find((p) => p.id === id);
    if (proposal) return { run, proposal };
  }
  return null;
}

function save(run: { file: string; proposals: StoredProposal[] }) {
  const raw = JSON.parse(readFileSync(join(PROPOSAL_DIR, run.file), 'utf8'));
  raw.proposals = run.proposals;
  writeFileSync(join(PROPOSAL_DIR, run.file), JSON.stringify(raw, null, 2));
}

async function inspectDatabase(command: string | undefined, id: string | undefined) {
  if (command !== 'list' && command !== 'show') {
    throw new Error('--database supports read-only list or show; publication requires reviewed events');
  }
  if (command === 'show' && !id) throw new Error('show requires a proposal ID');
  if (existsSync('.env.local')) process.loadEnvFile('.env.local');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for the private review queue');
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  if (command === 'show') {
    const { data, error } = await db.from('scan_proposals').select('*').eq('id', id!)
      .abortSignal(AbortSignal.timeout(20_000)).maybeSingle();
    if (error) throw new Error(`Could not read proposal: ${error.message}`);
    if (!data) throw new Error(`Proposal not found: ${id}`);
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  let count = 0;
  for (let offset = 0; ; offset += 200) {
    const { data, error } = await db.from('scan_proposals')
      .select('id,kind,project_slug,lineage,article_title,reasoning')
      .eq('status', 'pending').order('created_at').order('id').range(offset, offset + 199)
      .abortSignal(AbortSignal.timeout(20_000));
    if (error) throw new Error(`Could not read pending proposals: ${error.message}`);
    if (!data) throw new Error('Could not read pending proposals: missing response');
    for (const proposal of data) console.log(JSON.stringify(proposal));
    count += data.length;
    if (data.length < 200) break;
  }
  if (!count) console.log('No pending database proposals.');
}

async function main() {
  const args = process.argv.slice(2);
  const database = args.includes('--database');
  const [command, id, ...rest] = args.filter(arg => arg !== '--database');
  if (database) return inspectDatabase(command, id);
  if (command === 'list') {
    const pending = loadRuns().flatMap((r) => r.proposals.filter((p) => p.status === 'pending'));
    if (pending.length === 0) {
      console.log('No pending proposals.');
      return;
    }
    for (const p of pending) {
      console.log(`${p.id} [${p.kind}] ${p.project_slug}/${p.lineage}\n  ${p.article_title}\n  ${p.reasoning}\n`);
    }
    return;
  }
  if (command === 'show') {
    const found = id ? find(id) : null;
    if (!found) throw new Error(`Proposal not found: ${id}`);
    console.log(JSON.stringify(found.proposal, null, 2));
    return;
  }
  if (command === 'approve' || command === 'reject') {
    const found = id ? find(id) : null;
    if (!found) throw new Error(`Proposal not found: ${id}`);
    if (found.proposal.status !== 'pending') throw new Error(`Proposal is already ${found.proposal.status}`);
    const reasonIdx = rest.indexOf('--reason');
    const reason = reasonIdx >= 0 ? rest.slice(reasonIdx + 1).join(' ').trim() : '';
    if (command === 'reject' && !reason) throw new Error('Reject requires --reason "..."');
    found.proposal.status = command === 'approve' ? 'approved' : 'rejected';
    found.proposal.review_note = reason || null;
    save(found.run);
    if (command === 'approve') {
      console.log(`Approved ${id}. Feed this event into the normal publication flow (publish_promise_history).`);
      console.log('Event JSON:');
      console.log(JSON.stringify(found.proposal.payload, null, 2));
      console.log('\nAfter publishing, fan out notifications: npm run push:fanout -- --revision-key <key>');
    } else {
      console.log(`Rejected ${id}: ${reason}`);
    }
    return;
  }
  throw new Error('Usage: npm run scan:review -- <list|show|approve|reject> [proposal-id] [--reason "..."]');
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : 'Review failed');
  process.exitCode = 1;
});
