/** Operator queue. Source acceptance does not publish or change a promise outcome. */
import { existsSync } from 'node:fs';
import { getSupabase } from '../src/lib/supabase';
import { UUID } from '../src/lib/feedback/security';
import { PUBLIC_COLUMNS } from '../src/lib/community/data';

async function main() {
  if (existsSync('.env.local')) process.loadEnvFile('.env.local');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw Error('A server-only Supabase service role is required.');
  const [command = 'list', id, ...args] = process.argv.slice(2);
  const db = getSupabase();
  if (command === 'list') {
    const { data, error } = await db.from('community_contributions').select(PUBLIC_COLUMNS)
      .in('status', ['pending', 'needs_info']).order('created_at').limit(100);
    if (error) throw Error('Could not load the review queue.');
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  if (!id || !UUID.test(id)) throw Error('Usage: community:review list | show <id> | accept|needs-info|reject <id> --reviewer <name> --note <reason>');
  if (command === 'show') {
    const { data, error } = await db.from('community_contributions').select(PUBLIC_COLUMNS).eq('id', id).single();
    if (error) throw Error('Contribution not found.');
    const history = await db.from('community_reviews').select('status,note,reviewer,created_at').eq('contribution_id', id).order('created_at');
    if (history.error) throw Error('Could not load review history.');
    console.log(JSON.stringify({ contribution: data, reviews: history.data }, null, 2));
    return;
  }
  const status = ({ accept: 'accepted', 'needs-info': 'needs_info', reject: 'rejected' } as Record<string, string>)[command];
  const option = (key: string) => { const index = args.indexOf(key); return index >= 0 ? args[index + 1] : undefined; };
  const reviewer = option('--reviewer'), note = option('--note');
  if (!status || !reviewer || reviewer.length < 2 || !note || note.length < 10) throw Error('A review action requires --reviewer and a substantive --note.');
  const { error } = await db.rpc('review_community_contribution', { p_id: id, p_status: status, p_note: note, p_reviewer: reviewer });
  if (error) throw Error('The review could not be saved.');
  console.log(`Review recorded: ${status}. Published outcomes are unchanged.`);
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Review failed.'); process.exitCode = 1; });
