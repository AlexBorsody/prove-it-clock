"use client";

/**
 * "Notify me" toggle for push subscriptions. Three scopes:
 * - coin-level:  { project_slug }               (all promise status changes)
 * - promise-level:{ project_slug, lineage }      (news mentions + evidence)
 * - news tier:   { project_slug, kind }          ("news": any mention,
 *                                                "resolution": likely decisive)
 *
 * Reports unsupported/blocked push on the project page and keeps toggle errors
 * visible so subscription failures are not silent.
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
  /** Explain why push is unavailable in contexts where that matters. */
  showUnavailable?: boolean;
  /** Big blue primary treatment for the hero placement. */
  big?: boolean;
}

export default function PushSubscribeToggle({ projectSlug, lineage, kind, label, subscribedLabel = "Notifications on", showUnavailable = false, big = false }: Props) {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  const [supported] = useState(
    () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && vapidKey.length > 0,
  );
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
      if (!res.ok) {
        setErrorMessage("Couldn't check notification status. Try again.");
        return;
      }
      setErrorMessage("");
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
      setErrorMessage("Couldn't check notification status. Try again.");
    }
  }, [projectSlug, lineage, kind]);

  useEffect(() => {
    if (!supported) return;
    if (Notification.permission === "denied") setDenied(true);
    void refresh();
  }, [supported, refresh]);

  if (!supported || denied) {
    if (!showUnavailable) return null;
    const message = denied
      ? "Notifications are blocked in your browser settings."
      : vapidKey.length === 0
        ? "Push notifications are not configured on this site."
        : "Push notifications are not supported in this browser.";
    return <span role="status" className="push-toggle-unavailable">{message}</span>;
  }

  const toggle = async () => {
    if (busy) return;
    setErrorMessage("");
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
      setErrorMessage("Couldn't update notifications. Check browser settings and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="push-toggle-wrap">
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
      {errorMessage ? <span role="status" className="push-toggle-error">{errorMessage}</span> : null}
    </span>
  );
}
