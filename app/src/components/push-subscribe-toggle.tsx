"use client";

/**
 * "Notify me" toggle for push subscriptions. Three scopes:
 * - coin-level:  { project_slug }               (all promise status changes)
 * - promise-level:{ project_slug, lineage }      (news mentions + evidence)
 * - news tier:   { project_slug, kind }          ("news": any mention,
 *                                                "resolution": likely decisive)
 *
 * Renders nothing when push is unsupported or the VAPID public key is not
 * configured. Quiet styling: a small text button, no urgency treatment.
 */
import { useCallback, useEffect, useRef, useState } from "react";

function base64UrlToBytes(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer as ArrayBuffer;
}

async function browserSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

interface Props {
  projectSlug: string;
  /** Omit for coin-level subscription. */
  lineage?: string;
  /** News tier for coin-level subscriptions; omit for ledger status alerts. */
  kind?: "news" | "resolution";
  label: string;
  /** Shown when subscribed; defaults to "Notifications on". */
  subscribedLabel?: string;
  /** Big blue primary treatment for the hero placement. */
  big?: boolean;
}

export default function PushSubscribeToggle({ projectSlug, lineage, kind, label, subscribedLabel = "Notifications on", big = false }: Props) {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  const [supported] = useState(
    () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && vapidKey.length > 0,
  );
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);
  const endpointRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    const sub = await browserSubscription().catch(() => null);
    if (!sub) {
      setSubscribed(false);
      return;
    }
    endpointRef.current = sub.endpoint;
    try {
      const res = await fetch(
        `/api/push/status?endpoint=${encodeURIComponent(sub.endpoint)}&project_slug=${encodeURIComponent(projectSlug)}`,
        { cache: "no-store" },
      );
      if (!res.ok) return;
      const data = (await res.json()) as { scopes: Array<{ lineage?: string; kind?: string }> };
      setSubscribed(
        data.scopes.some((s) =>
          lineage
            ? s.lineage === lineage && !s.kind
            : kind
              ? s.kind === kind && !s.lineage
              : !s.lineage && !s.kind,
        ),
      );
    } catch {
      /* status check failed; leave toggle off rather than lie */
    }
  }, [projectSlug, lineage, kind]);

  useEffect(() => {
    if (!supported) return;
    if (Notification.permission === "denied") setDenied(true);
    void refresh();
  }, [supported, refresh]);

  if (!supported || denied) return null;

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const scope: { project_slug: string; lineage?: string; kind?: "news" | "resolution" } = { project_slug: projectSlug };
      if (lineage) scope.lineage = lineage;
      if (kind) scope.kind = kind;
      if (subscribed) {
        const endpoint = endpointRef.current ?? (await browserSubscription().catch(() => null))?.endpoint;
        if (endpoint) {
          await fetch("/api/push/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint, scope }),
          });
        }
        setSubscribed(false);
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          if (permission === "denied") setDenied(true);
          return;
        }
        const registration = await navigator.serviceWorker.ready;
        const sub =
          (await registration.pushManager.getSubscription()) ??
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: base64UrlToBytes(vapidKey),
          }));
        endpointRef.current = sub.endpoint;
        const keys = sub.toJSON().keys ?? {};
        const res = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth,
            scope,
          }),
        });
        if (!res.ok) throw new Error("subscribe failed");
        setSubscribed(true);
      }
    } catch {
      /* network or push failure: leave the toggle in its prior state */
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`btn push-toggle${big ? " push-toggle-big" : ""}`}
      data-subscribed={subscribed ? "true" : "false"}
      aria-pressed={subscribed}
      disabled={busy}
      onClick={toggle}
    >
      {busy ? "Working" : subscribed ? subscribedLabel : label}
    </button>
  );
}
