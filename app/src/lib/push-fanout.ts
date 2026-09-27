/**
 * Fan-out core: given a published promise_history_revisions row, find every
 * matching push subscription, build the factual copy, send via Web Push, and
 * record deliveries so a revision is never notified twice.
 *
 * Notification triggers are ledger publications only. This never fires on
 * market data, CODE/HYPE metrics, or price moves.
 *
 * Used by both the CLI script (app/scripts/fanout-push.ts) and the HTTP hook
 * (app/api/push/fanout/route.ts) that a publication trigger can call.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { sendPush, webPushConfigured } from './web-push';
import {
  planFanout,
  type LedgerEvent,
  type LedgerRevision,
  type PlannedPush,
  type PushSubscriptionRecord,
} from './push';

export interface FanoutSummary {
  revisionKey: string;
  subscriptions: number;
  planned: number;
  sent: number;
  removed: number;
  alreadyNotified: number;
}

async function getSupabase(): Promise<SupabaseClient> {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the server environment');
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function missingTablesMessage(db: SupabaseClient): Promise<string | null> {
  const { error } = await db.from('push_subscriptions').select('id').limit(1);
  if (error && error.message.includes('Could not find the table')) {
    return 'Push tables not in the database yet; apply db/migrations/009_push_notifications.sql first.';
  }
  return null;
}

/**
 * Plan the fan-out for one revision without sending. Safe to call for previews.
 */
export async function previewFanout(
  db: SupabaseClient,
  revisionKey: string,
): Promise<{ planned: PlannedPush[]; summary: FanoutSummary }> {
  const missing = await missingTablesMessage(db);
  if (missing) throw new Error(missing);

  const { data: revision, error: revError } = await db
    .from('promise_history_revisions')
    .select('revision_key, project_slug, ledger_run_id, events')
    .eq('revision_key', revisionKey)
    .maybeSingle();
  if (revError || !revision) throw new Error(`Revision not found: ${revisionKey}`);

  const { data: project } = await db.from('projects').select('slug,name').eq('slug', revision.project_slug).maybeSingle();
  const projectName = project?.name ?? revision.project_slug;

  const criteriaByLineage: Record<string, string> = {};
  const { data: snapshot } = await db
    .from('heart_snapshots')
    .select('assessment, project_id, projects!inner(slug)')
    .eq('run_id', revision.ledger_run_id)
    .eq('projects.slug', revision.project_slug)
    .maybeSingle();
  const promises =
    (snapshot?.assessment as { promises?: Array<{ lineage?: string; criteria?: string }> } | null)?.promises ?? [];
  for (const p of promises) {
    if (p.lineage && p.criteria) criteriaByLineage[p.lineage] = p.criteria;
  }

  const { data: subs, error: subError } = await db
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth, scope')
    .eq('scope->>project_slug', revision.project_slug);
  if (subError) throw new Error(`Could not read subscriptions: ${subError.message}`);
  const subscriptions = (subs ?? []) as PushSubscriptionRecord[];

  const { data: delivered } = await db
    .from('push_deliveries')
    .select('subscription_id')
    .eq('revision_key', revisionKey)
    .eq('kind', 'status_change');
  const alreadyDelivered = new Set((delivered ?? []).map((d) => d.subscription_id as string));

  const ledgerRevision: LedgerRevision = {
    revision_key: revision.revision_key,
    project_slug: revision.project_slug,
    events: (revision.events ?? []) as LedgerEvent[],
  };
  const planned = planFanout(ledgerRevision, projectName, subscriptions, criteriaByLineage, alreadyDelivered);
  return {
    planned,
    summary: {
      revisionKey,
      subscriptions: subscriptions.length,
      planned: planned.length,
      sent: 0,
      removed: 0,
      alreadyNotified: alreadyDelivered.size,
    },
  };
}

/**
 * Send the fan-out for one revision. Idempotent: push_deliveries dedupes so a
 * revision is never notified twice to the same subscription.
 */
export async function fanoutForRevision(
  db: SupabaseClient,
  revisionKey: string,
): Promise<FanoutSummary> {
  const { planned, summary } = await previewFanout(db, revisionKey);
  if (!webPushConfigured()) {
    throw new Error('Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT to send pushes');
  }
  let sent = 0;
  let removed = 0;
  for (const p of planned) {
    const result = await sendPush(p.subscription, p.payload);
    if (result.gone) {
      await db.from('push_subscriptions').delete().eq('id', p.subscription.id);
      removed++;
      continue;
    }
    await db.from('push_deliveries').insert({
      subscription_id: p.subscription.id,
      revision_key: revisionKey,
      kind: 'status_change',
    });
    sent++;
  }
  return { ...summary, sent, removed };
}

/** Convenience entry for callers that want the service-role client built for them. */
export async function fanoutRevisionByKey(
  revisionKey: string,
  opts: { dryRun?: boolean } = {},
): Promise<FanoutSummary & { previews?: PlannedPush[] }> {
  const db = await getSupabase();
  if (opts.dryRun) {
    const { planned, summary } = await previewFanout(db, revisionKey);
    return { ...summary, previews: planned };
  }
  return fanoutForRevision(db, revisionKey);
}
