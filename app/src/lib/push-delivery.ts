import type { SupabaseClient } from '@supabase/supabase-js';
import type { FanoutKind, PushPayload, PushSubscriptionRecord } from './push';
import { sendPush } from './web-push';

export type DeliveryResult = 'sent' | 'skipped' | 'removed';

/**
 * Claim before sending, using the existing unique(subscription, revision, kind).
 * A concurrent/repeated caller skips both pending and sent receipts. An uncertain
 * provider response or receipt update stays pending: automatic retries could
 * duplicate a push that already reached the provider. Operators must inspect it.
 * A confirmed client rejection releases only this claim for a later attempt.
 */
export async function deliverPushOnce(
  db: SupabaseClient,
  subscription: PushSubscriptionRecord,
  revisionKey: string,
  kind: FanoutKind,
  payload: PushPayload,
  sender: typeof sendPush = sendPush,
): Promise<DeliveryResult> {
  const { data: claim, error: claimError } = await db.from('push_deliveries').insert({
    subscription_id: subscription.id,
    revision_key: revisionKey,
    kind,
    delivery_status: 'pending',
    delivered_at: null,
  }).select('id').single();
  if (claimError?.code === '23505') return 'skipped';
  if (claimError || !claim) {
    throw new Error(`Could not reserve push delivery: ${claimError?.message ?? 'receipt missing'}`);
  }

  let result;
  try {
    result = await sender(subscription, payload);
  } catch (cause) {
    // web-push exposes statusCode after a complete provider response. A 4xx
    // rejection was not accepted. Request timeouts and server/gateway failures
    // remain uncertain, even if an HTTP status is present.
    const statusCode = cause && typeof cause === 'object'
      ? (cause as { statusCode?: unknown }).statusCode : undefined;
    if (typeof statusCode === 'number' && Number.isInteger(statusCode)
      && statusCode >= 400 && statusCode < 500 && statusCode !== 408) {
      const { data: released, error: releaseError } = await db.from('push_deliveries')
        .delete().eq('id', claim.id).eq('delivery_status', 'pending').select('id').single();
      if (releaseError || !released) {
        throw new Error(`Push provider rejected delivery ${claim.id} (HTTP ${statusCode}); reservation release could not be confirmed: ${releaseError?.message ?? 'receipt missing'}`, { cause });
      }
      throw new Error(`Push provider rejected delivery ${claim.id} (HTTP ${statusCode}); reservation released for a later retry`, { cause });
    }
    throw new Error(`Push delivery ${claim.id} is pending; provider acceptance is uncertain`, { cause });
  }
  if (result.gone) {
    const { error } = await db.from('push_subscriptions').delete().eq('id', subscription.id);
    if (error) throw new Error(`Could not remove expired push subscription: ${error.message}`);
    return 'removed';
  }
  if (!result.ok) throw new Error(`Push delivery ${claim.id} is pending; provider acceptance is unconfirmed`);

  const { data: receipt, error: receiptError } = await db.from('push_deliveries')
    .update({ delivery_status: 'sent', delivered_at: new Date().toISOString() })
    .eq('id', claim.id).eq('delivery_status', 'pending').select('id').single();
  if (receiptError || !receipt) {
    throw new Error(`Push provider accepted delivery ${claim.id}, but its receipt could not be confirmed: ${receiptError?.message ?? 'receipt missing'}`);
  }
  return 'sent';
}
