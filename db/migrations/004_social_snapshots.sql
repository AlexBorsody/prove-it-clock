-- 004: social_snapshots — Prove-It's proprietary social-metrics time series.
--
-- One row per project per collector run. Written by the social collector
-- (service role, via GitHub Action). Publicly readable. Display only:
-- social metrics never feed the hearts scoring algorithm.
--
-- Apply via the Supabase dashboard SQL editor (raw Postgres on 5432 is
-- blocked from the build workspace).

CREATE TABLE IF NOT EXISTS public.social_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_slug text NOT NULL,
  as_of timestamptz NOT NULL DEFAULT now(),
  reddit_subscribers integer,
  telegram_members integer,
  news_mentions_7d integer,
  sources_ok text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS social_snapshots_slug_asof
  ON public.social_snapshots (project_slug, as_of DESC);

ALTER TABLE public.social_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS public_social_snapshots ON public.social_snapshots;
CREATE POLICY public_social_snapshots ON public.social_snapshots
  FOR SELECT TO anon, authenticated USING (true);

-- No INSERT/UPDATE/DELETE policy: writes go through the service role only.
