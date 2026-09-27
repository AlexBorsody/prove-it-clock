# Push notifications + live AI status scanner — spec
2026-09-27 ~19:25 EDT. From Alex: "you work on push notifications."
Unparks the two items parked in `2026-09-27-promise-news-notifications.md`
(push channel, per-project/per-promise subscribe). Phase 1 in-app feed still stands.
Author: Habib. Implementation: Codex. Working tree only, no commit, no push.

## 1. What Alex wants

1. A user can subscribe to push notifications for a specific coin: every time a
   promise for that coin changes status, they get a push. (Trader hook: status
   changes are the events traders care about. This is the interest driver.)
2. A user can subscribe to push notifications for a specific promise: any time
   news mentions that promise, they get a push.
3. A live AI agent scan that determines on the fly when a promise's status has
   changed, so the notifications above fire on real events, not on a schedule
   someone has to remember.

## 2. Hard constraints

- The AI never writes to the published ledger. It proposes evidence and assessment
  changes with quoted sources into a review queue; a human approves; publication
  is what fires notifications. This is the trust moat: AI explains, never decides.
- Notification triggers are ledger publications only: new promise, new evidence,
  published assessment (state change). Never notify on market data, CODE/HYPE
  metric updates, or price moves.
- Push copy is factual: what changed, the evidence link. No price, no trading
  advice, no hype language, no em dashes.
- VAPID keys live in server env, never in the repo. (POC secrecy posture per Alex;
  rotate later.)
- No commit, no push. Verify mechanically: build passes, push flow smoke-tested
  end to end against a test subscription.

## 3. Subscription model

New table `push_subscriptions`:
- `id` uuid PK, `endpoint` text unique, `p256dh` text, `auth` text
- `scope` jsonb: `{ "project_slug": "link" }` for coin-level, or
  `{ "project_slug": "link", "lineage": "<promise lineage>" }` for promise-level
- `created_at` timestamptz. Unsubscribe = delete row. One row per (endpoint, scope).

UI:
- Project page: "Notify me" toggle → subscribes to all promise status changes for
  that coin.
- Promise row / promise detail: "Notify me about this promise" toggle → subscribes
  to news mentions + evidence + assessments for that lineage.
- Quiet, consistent with existing chrome. No urgency styling; promise news is slow.

## 4. Push plumbing

- Web Push via VAPID. Reuse the existing service worker (`/sw.js`, already
  registered in production via `sw-register.tsx`); add a `push` event handler that
  renders the notification and a `notificationclick` handler that deep-links to the
  promise/evidence in the ledger or timeline.
- Server-side sender (web-push library or equivalent) invoked from the publication
  path: after a ledger revision publishes, fan out to matching subscriptions.
- Dedupe: one push per (subscription, ledger revision). A revision already notified
  is never re-notified.
- Fan-out core lives in `app/src/lib/push-fanout.ts`, invoked two ways:
  `npm run push:fanout -- --revision-key <key>` (manual, after each publication)
  and `POST /api/push/fanout` with `{ revision_key }` plus header
  `x-fanout-secret: <PUSH_FANOUT_SECRET>` (HTTP hook for a Postgres trigger;
  the pg_net trigger sketch is a commented block at the end of
  `db/migrations/009_push_notifications.sql`). Until the trigger is enabled,
  the manual command is the publication step.

## 5. Live AI status-change scanner

A scheduled job (hourly to start; interval is config, not code):

1. For each project with open promises, pull the existing news pipeline
   (`newsFeedUrl` / `parseNewsFeed` in `lib/news-mentions.ts`).
2. For each article, determine which open promise lineage(s) it is relevant to,
   if any. Start with the existing headline matching; use the AI for the
   relevance judgment the regexes cannot make (paraphrase, implication,
   "this reads like delivery against promise X").
3. Where the article constitutes evidence for or against a promise, the agent
   drafts: an `evidence` event (quote, source URL, published date, stance) and a
   proposed `assessment` (open → fulfilled / missed, with reasoning quoting the
   evidence). Both go to a review queue, NOT the ledger.
4. Review queue UI (minimal, internal-facing): approve → goes through the normal
   publication flow → notifications fire. Reject → discarded with reason logged.
5. The scanner also proposes `claim_repeated` events when management restates a
   promise with narrowed/expanded wording.

The scanner is proposal-only. The published ledger remains the single source of
truth and the only notification trigger.

## 6. News-mention matching for promise-level subscribers

Same relevance judgment as the scanner (step 2 above). When an article matches a
promise lineage a user follows, they get a push with the headline and a link to
the promise. Matching must be conservative: false positives kill trust in the
channel faster than misses. Log every match decision with the article URL and the
reasoning so misses can be audited.

## 7. Acceptance

- [ ] Subscribe/unsubscribe per coin from a project page; per promise from a
      promise row. State persists; toggling twice is idempotent.
- [ ] Publishing an assessment that changes a promise's state delivers a push to
      that coin's subscribers with factual copy and a deep link. Verified with a
      test subscription, not just unit tests.
- [ ] A news article matching a followed promise lineage delivers a push with the
      headline and link.
- [ ] Scanner run produces evidence + assessment proposals in the review queue
      with quoted sources; nothing reaches the published ledger without approval.
- [ ] No push is ever generated for market, CODE, or HYPE changes.
- [ ] VAPID keys in env only. No commit, no push.
