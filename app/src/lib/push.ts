/**
 * Push notifications: shared types, validation, and copy builders.
 *
 * Pure functions only (no I/O, no secrets) so the fan-out planning and copy
 * are unit-testable. The actual Web Push send lives in lib/web-push.ts
 * (server only); subscription storage lives in Supabase.
 *
 * Trust rules (from the spec):
 * - Notification triggers are ledger publications (new promise, new evidence,
 *   published assessment, claim revision) and news-scanner matches (any
 *   mention, or likely-decisive articles). Never market data, CODE/HYPE
 *   metrics, or price moves.
 * - Push copy is factual: what changed, the evidence link. No price, no
 *   trading advice, no hype language, no em dashes.
 */

import { isStockSlug } from "./social";

export interface PushScope {
  project_slug: string;
  /** Present for promise-level subscriptions; absent for coin-level. */
  lineage?: string;
  /**
   * News tier for coin-level subscriptions; absent for ledger status alerts.
   * - "news": any news article the scanner matches to a project promise.
   * - "resolution": only articles the scanner flags as likely decisive
   *   (proposed fulfilled/lapsed assessment).
   */
  kind?: "news" | "resolution";
}

export interface PushSubscriptionRecord {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  scope: PushScope;
}

/** Ledger revision as published by publish_promise_history (events array). */
export interface LedgerRevision {
  revision_key: string;
  project_slug: string;
  events: LedgerEvent[];
}

export interface LedgerEvent {
  id: string;
  kind: string;
  lineage?: string;
  summary?: string;
  state?: string;
  speaker?: string;
  source?: { url?: string; title?: string; publishedOn?: string };
  [key: string]: unknown;
}

export interface PushPayload {
  title: string;
  body: string;
  /** Deep link opened on notification click. */
  url: string;
  /** Groups/replaces repeat notifications for the same promise. */
  tag: string;
}

export type FanoutKind = "status_change" | "news_mention" | "resolution_likely";

export interface PlannedPush {
  subscription: PushSubscriptionRecord;
  payload: PushPayload;
  kind: FanoutKind;
}

const SLUG_RE = /^[a-z0-9-]{1,120}$/;
const LINEAGE_RE = /^[a-zA-Z0-9_-]{1,160}$/;

/** Coin-level subscription if lineage is absent, promise-level otherwise. */
export function scopeLevel(scope: PushScope): "coin" | "promise" {
  return scope.lineage ? "promise" : "coin";
}

export function validateScope(scope: unknown): PushScope {
  if (!scope || typeof scope !== "object" || Array.isArray(scope)) throw new Error("Scope must be an object");
  const s = scope as Record<string, unknown>;
  if (typeof s.project_slug !== "string" || !SLUG_RE.test(s.project_slug)) {
    throw new Error("scope.project_slug must be a valid project slug");
  }
  const out: PushScope = { project_slug: s.project_slug };
  if (s.lineage !== undefined) {
    if (typeof s.lineage !== "string" || !LINEAGE_RE.test(s.lineage)) {
      throw new Error("scope.lineage must be a valid promise lineage");
    }
    out.lineage = s.lineage;
  }
  if (s.kind !== undefined) {
    if (s.kind !== "news" && s.kind !== "resolution") {
      throw new Error('scope.kind must be "news" or "resolution"');
    }
    out.kind = s.kind;
  }
  return out;
}

export function validateSubscriptionInput(input: unknown): { endpoint: string; p256dh: string; auth: string; scope: PushScope } {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Subscription must be an object");
  const s = input as Record<string, unknown>;
  let endpoint: string;
  try {
    const url = new URL(String(s.endpoint ?? ""));
    if (url.protocol !== "https:") throw new Error("endpoint must be https");
    url.hash = "";
    endpoint = url.href;
  } catch {
    throw new Error("endpoint must be a valid https URL");
  }
  const p256dh = String(s.p256dh ?? "").trim();
  const auth = String(s.auth ?? "").trim();
  if (!p256dh || !auth) throw new Error("p256dh and auth keys are required");
  if (p256dh.length > 500 || auth.length > 500) throw new Error("Push keys too long");
  return { endpoint, p256dh, auth, scope: validateScope(s.scope) };
}

/** Human-readable promise label: criteria text when known, else the lineage. */
function promiseLabel(lineage: string | undefined, criteriaByLineage: Record<string, string>): string {
  if (lineage && criteriaByLineage[lineage]) return criteriaByLineage[lineage];
  return lineage ?? "a promise";
}

/** Deep link to the promise evidence section of the project page. */
export function promiseDeepLink(projectSlug: string, lineage?: string): string {
  const base = isStockSlug(projectSlug) ? `/stocks/${projectSlug}` : `/projects/${projectSlug}`;
  if (!lineage) return base;
  return `${base}?evidence=${encodeURIComponent(lineage)}#promise-${encodeURIComponent(lineage)}`;
}

function stateWord(state: string | undefined): string {
  switch ((state ?? "").toLowerCase()) {
    case "fulfilled": return "fulfilled";
    case "lapsed": return "lapsed";
    case "retired": return "retired";
    default: return "updated";
  }
}

/**
 * Build the factual push copy for one ledger event. Returns null for event
 * kinds that must never notify (anything that is not a promise publication).
 */
export function copyForEvent(
  projectSlug: string,
  projectName: string,
  event: LedgerEvent,
  criteriaByLineage: Record<string, string> = {},
): PushPayload | null {
  const label = promiseLabel(event.lineage, criteriaByLineage);
  const url = promiseDeepLink(projectSlug, event.lineage);
  const tag = `prove-value:${projectSlug}:${event.lineage ?? "project"}`;
  switch (event.kind) {
    case "assessment": {
      const word = stateWord(event.state);
      return {
        title: `${projectName}: promise ${word}`,
        body: `${label} is now ${word}.`,
        url,
        tag,
      };
    }
    case "promise_stated":
      return {
        title: `${projectName}: new promise tracked`,
        body: label,
        url,
        tag,
      };
    case "evidence":
      return {
        title: `${projectName}: new evidence`,
        body: `New evidence on ${label}.`,
        url,
        tag,
      };
    case "claim_repeated":
      return {
        title: `${projectName}: promise restated`,
        body: `${label} was restated.`,
        url,
        tag,
      };
    case "claim_revised":
      return {
        title: `${projectName}: guidance revised`,
        body: `${label} was revised.`,
        url,
        tag,
      };
    default:
      return null;
  }
}

/**
 * Plan the fan-out for one published ledger revision: which subscriptions get
 * which payload. Coin-level subscribers get every notifiable event for the
 * coin; promise-level subscribers get only events on their lineage.
 * `alreadyDelivered` is the set of subscription ids already notified for this
 * revision (dedupe; the DB unique constraint is the backstop).
 */
export function planFanout(
  revision: LedgerRevision,
  projectName: string,
  subscriptions: PushSubscriptionRecord[],
  criteriaByLineage: Record<string, string> = {},
  alreadyDelivered: Set<string> = new Set(),
): PlannedPush[] {
  const planned: PlannedPush[] = [];
  for (const sub of subscriptions) {
    if (sub.scope.project_slug !== revision.project_slug) continue;
    if (alreadyDelivered.has(sub.id)) continue;
    // News-tier subscriptions (kind "news" | "resolution") are served by the
    // news scanner, not by ledger publications.
    if (sub.scope.kind) continue;
    const relevant = revision.events.filter((e) =>
      sub.scope.lineage ? e.lineage === sub.scope.lineage : true,
    );
    // One push per subscription per revision: the most significant event wins.
    const pick = pickEvent(relevant);
    if (!pick) continue;
    const payload = copyForEvent(revision.project_slug, projectName, pick, criteriaByLineage);
    if (!payload) continue;
    planned.push({ subscription: sub, payload, kind: "status_change" });
  }
  return planned;
}

/** Most significant event first: assessment > promise_stated > claim_revised > evidence > claim_repeated. */
function pickEvent(events: LedgerEvent[]): LedgerEvent | null {
  const rank: Record<string, number> = {
    assessment: 0,
    promise_stated: 1,
    claim_revised: 2,
    evidence: 3,
    claim_repeated: 4,
  };
  let best: LedgerEvent | null = null;
  let bestRank = Infinity;
  for (const e of events) {
    const r = rank[e.kind];
    if (r === undefined) continue;
    if (r < bestRank) {
      bestRank = r;
      best = e;
    }
  }
  return best;
}

/** Copy for a news article matching a followed promise lineage. */
export function copyForNewsMention(
  projectSlug: string,
  projectName: string,
  lineage: string,
  criteriaByLineage: Record<string, string>,
  article: { title: string; publisher: string; url: string },
): PushPayload {
  const label = promiseLabel(lineage, criteriaByLineage);
  return {
    title: `${projectName}: news on a followed promise`,
    body: `${article.title} (${article.publisher}) relates to ${label}.`,
    url: promiseDeepLink(projectSlug, lineage),
    tag: `prove-value:news:${projectSlug}:${lineage}:${article.url}`,
  };
}

/**
 * Copy for a news article the scanner flags as likely decisive: the headline
 * carries explicit delivery/failure language and a fulfilled/lapsed assessment
 * was drafted (still pending human verification).
 */
export function copyForResolutionLikely(
  projectSlug: string,
  projectName: string,
  lineage: string,
  criteriaByLineage: Record<string, string>,
  article: { title: string; publisher: string; url: string },
  proposedState: string,
): PushPayload {
  const label = promiseLabel(lineage, criteriaByLineage);
  return {
    title: `${projectName}: news may decide a promise`,
    body: `${article.title} (${article.publisher}) looks like ${proposedState} for ${label}. Human verification pending.`,
    url: promiseDeepLink(projectSlug, lineage),
    tag: `prove-value:resolution:${projectSlug}:${lineage}:${article.url}`,
  };
}
