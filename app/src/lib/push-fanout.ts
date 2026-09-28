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
import { webPushConfigured } from './web-push';
import { deliverPushOnce } from './push-delivery';
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
  pending: number;
  skipped: number;
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
  if (error) throw new Error(`Could not read push subscriptions: ${error.message}`);
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
    .select('revision_key, project_slug, ledger_run_id, request')
    .eq('revision_key', revisionKey)
    .maybeSingle();
  if (revError) throw new Error(`Could not read history revision: ${revError.message}`);
  if (!revision) throw new Error(`Revision not found: ${revisionKey}`);
  const request = revision.request as { events?: LedgerEvent[] } | null;
  if (!request || !Array.isArray(request.events)) {
    throw new Error(`History revision ${revisionKey} is missing its published event batch`);
  }

  const { data: project, error: projectError } = await db.from('projects').select('slug,name').eq('slug', revision.project_slug).maybeSingle();
  if (projectError) throw new Error(`Could not read project: ${projectError.message}`);
  const projectName = project?.name ?? revision.project_slug;

  const criteriaByLineage: Record<string, string> = {};
  const { data: snapshot, error: snapshotError } = await db
    .from('heart_snapshots')
    .select('assessment, project_id, projects!inner(slug)')
    .eq('run_id', revision.ledger_run_id)
    .eq('projects.slug', revision.project_slug)
    .maybeSingle();
  if (snapshotError) throw new Error(`Could not read promise snapshot: ${snapshotError.message}`);
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

  const { data: delivered, error: deliveredError } = await db
    .from('push_deliveries')
    .select('subscription_id, delivery_status')
    .eq('revision_key', revisionKey)
    .eq('kind', 'status_change');
  if (deliveredError) throw new Error(`Could not read push delivery receipts: ${deliveredError.message}`);
  const alreadyDelivered = new Set((delivered ?? []).map((d) => d.subscription_id as string));

  const ledgerRevision: LedgerRevision = {
    revision_key: revision.revision_key,
    project_slug: revision.project_slug,
    // The events column is cumulative. Only request.events belongs to this
    // publication; replaying accumulated assessments would send stale verdicts.
    events: request.events,
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
      alreadyNotified: (delivered ?? []).filter((d) => d.delivery_status === 'sent').length,
      pending: (delivered ?? []).filter((d) => d.delivery_status === 'pending').length,
      skipped: 0,
    },
  };
}

/**
 * Reserve each delivery before sending. Pending attempts need operator review,
 * rather than automatically retrying an uncertain provider response.
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
  let skipped = 0;
  for (const p of planned) {
    const result = await deliverPushOnce(db, p.subscription, revisionKey, p.kind, p.payload);
    if (result === 'sent') sent++;
    else if (result === 'removed') removed++;
    else skipped++;
  }
  return { ...summary, sent, removed, skipped };
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
