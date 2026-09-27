-- Push notification subscriptions + delivery dedupe + AI scanner review queue.
-- Additive; no scoring or ledger changes.
-- Apply only through the reviewed migration process, not by a public route.
BEGIN;

-- One row per (endpoint, scope). Unsubscribe = delete row.
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL CHECK (length(trim(endpoint)) BETWEEN 1 AND 2000),
  p256dh text NOT NULL CHECK (length(trim(p256dh)) BETWEEN 1 AND 500),
  auth text NOT NULL CHECK (length(trim(auth)) BETWEEN 1 AND 500),
  scope jsonb NOT NULL CHECK (
    jsonb_typeof(scope) = 'object'
    AND length(trim(scope->>'project_slug')) BETWEEN 1 AND 120
    AND (NOT scope ? 'lineage' OR length(trim(scope->>'lineage')) BETWEEN 1 AND 160)
  ),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (endpoint, scope)
);
CREATE INDEX push_subs_project ON public.push_subscriptions((scope->>'project_slug'));
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
-- No public access at all: writes and reads go through the service role only,
-- via the /api/push routes. service_role bypasses RLS by default.

-- Dedupe: one push per (subscription, ledger revision), ever.
CREATE TABLE public.push_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.push_subscriptions(id) ON DELETE CASCADE,
  revision_key text NOT NULL CHECK (length(trim(revision_key)) BETWEEN 1 AND 200),
  kind text NOT NULL CHECK (kind IN ('status_change', 'news_mention')),
  delivered_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (subscription_id, revision_key, kind)
);
CREATE INDEX push_deliveries_revision ON public.push_deliveries(revision_key);
ALTER TABLE public.push_deliveries ENABLE ROW LEVEL SECURITY;

-- AI scanner review queue: proposals only. Nothing here touches the published
-- ledger; approval happens through the normal publication flow.
CREATE TABLE public.scan_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('evidence', 'assessment', 'claim_repeated')),
  project_slug text NOT NULL CHECK (length(trim(project_slug)) BETWEEN 1 AND 120),
  lineage text NOT NULL CHECK (length(trim(lineage)) BETWEEN 1 AND 160),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  reasoning text NOT NULL CHECK (length(trim(reasoning)) > 0),
  article_url text CHECK (article_url IS NULL OR length(trim(article_url)) BETWEEN 1 AND 2000),
  article_title text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_note text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  reviewed_at timestamptz
);
CREATE INDEX scan_proposals_status ON public.scan_proposals(status, created_at DESC);
ALTER TABLE public.scan_proposals ENABLE ROW LEVEL SECURITY;

-- Audit trail for every news-match decision (conservative matching; misses auditable).
CREATE TABLE public.scan_match_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_slug text NOT NULL,
  lineage text,
  article_url text NOT NULL,
  article_title text,
  matched boolean NOT NULL,
  reasoning text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX scan_match_log_project ON public.scan_match_log(project_slug, created_at DESC);
ALTER TABLE public.scan_match_log ENABLE ROW LEVEL SECURITY;

-- Scanner run bookkeeping (one row per run).
CREATE TABLE public.scan_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  finished_at timestamptz,
  projects_checked int NOT NULL DEFAULT 0,
  articles_seen int NOT NULL DEFAULT 0,
  proposals_created int NOT NULL DEFAULT 0,
  pushes_sent int NOT NULL DEFAULT 0,
  error text
);
ALTER TABLE public.scan_runs ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ---------------------------------------------------------------------------
-- Publication hook (ops follow-up, NOT enabled by this migration).
--
-- To fire fan-out automatically on publication, enable pg_net and create a
-- trigger that POSTs the new revision_key to the app's /api/push/fanout hook
-- (guarded by the PUSH_FANOUT_SECRET server env var). Sketch:
--
--   create extension if not exists pg_net;
--   create or replace function public.notify_push_fanout()
--   returns trigger language plpgsql as $$
--   begin
--     perform net.http_post(
--       url := 'https://<app-host>/api/push/fanout',
--       headers := jsonb_build_object('x-fanout-secret', '<PUSH_FANOUT_SECRET>', 'Content-Type', 'application/json'),
--       body := jsonb_build_object('revision_key', new.revision_key)
--     );
--     return new;
--   end $$;
--   create trigger push_fanout_on_publish
--     after insert on public.promise_history_revisions
--     for each row execute function public.notify_push_fanout();
--
-- Until the trigger exists, run the fan-out manually after each publication:
--   npm run push:fanout -- --revision-key <key>
-- ---------------------------------------------------------------------------
