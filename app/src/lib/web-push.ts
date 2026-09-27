/**
 * Server-only Web Push sender. Never imported from client components.
 *
 * VAPID keys come from the server environment only:
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto: or https:)
 * Never commit keys; never expose the private key to the browser.
 */
import webpush from "web-push";
import type { PushPayload, PushSubscriptionRecord } from "./push";

let configured = false;

export function webPushConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT,
  );
}

function ensureConfigured(): void {
  if (!webPushConfigured()) {
    throw new Error("Web Push is not configured: set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT");
  }
  if (!configured) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT as string,
      process.env.VAPID_PUBLIC_KEY as string,
      process.env.VAPID_PRIVATE_KEY as string,
    );
    configured = true;
  }
}

export interface SendResult {
  ok: boolean;
  /** True when the push service says the subscription is gone (410/404). */
  gone: boolean;
  statusCode?: number;
}

/** Send one push. Throws only on unexpected transport errors. */
export async function sendPush(
  subscription: Pick<PushSubscriptionRecord, "endpoint" | "p256dh" | "auth">,
  payload: PushPayload,
): Promise<SendResult> {
  ensureConfigured();
  try {
    const res = await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify({ title: payload.title, body: payload.body, url: payload.url, tag: payload.tag }),
      { TTL: 7 * 24 * 3600 },
    );
    return { ok: true, gone: false, statusCode: res.statusCode };
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    if (statusCode === 404 || statusCode === 410) {
      return { ok: false, gone: true, statusCode };
    }
    throw err;
  }
}
