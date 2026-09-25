-- Additive, independent of legacy v0.2/v0.3 scores. Apply after 001.
BEGIN;
CREATE TABLE public.heart_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_key text NOT NULL UNIQUE CHECK (length(run_key) BETWEEN 1 AND 200),
  as_of timestamptz NOT NULL,
  methodology text NOT NULL CHECK (length(methodology) > 0),
  review_status text NOT NULL CHECK (review_status IN ('draft', 'published')),
  reviewed_by text,
  policy_ref text,
  payload jsonb NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  CHECK (review_status = 'draft' OR
    (length(trim(reviewed_by)) > 0 AND reviewed_by IS NOT NULL AND
     length(trim(policy_ref)) > 0 AND policy_ref IS NOT NULL))
);
CREATE TABLE public.heart_snapshots (
  run_id uuid NOT NULL REFERENCES public.heart_runs(id),
  project_id uuid NOT NULL REFERENCES public.projects(id),
  availability text NOT NULL CHECK (availability IN ('available','unavailable')),
  unavailable_reason text,
  capacity integer CHECK (capacity IN (5,10,20)),
  starting_allowance integer,
  years_since_fulfillment numeric CHECK (years_since_fulfillment >= 0 AND years_since_fulfillment < 'Infinity'::numeric),
  core_fulfilled boolean,
  earned integer CHECK (earned >= 0),
  allowance integer CHECK (allowance >= 0),
  filled integer CHECK (filled >= 0 AND filled <= capacity),
  assessment jsonb,
  PRIMARY KEY(run_id, project_id),
  CHECK ((availability = 'unavailable' AND length(trim(unavailable_reason)) > 0 AND unavailable_reason IS NOT NULL
    AND capacity IS NULL AND starting_allowance IS NULL AND years_since_fulfillment IS NULL
    AND core_fulfilled IS NULL AND earned IS NULL AND allowance IS NULL AND filled IS NULL AND assessment IS NULL)
    OR (availability = 'available' AND unavailable_reason IS NULL
    AND capacity IS NOT NULL AND starting_allowance IS NOT NULL AND years_since_fulfillment IS NOT NULL
    AND core_fulfilled IS NOT NULL AND earned IS NOT NULL AND allowance IS NOT NULL AND filled IS NOT NULL
    AND assessment IS NOT NULL AND starting_allowance BETWEEN 0 AND least(3,capacity/5)))
);
CREATE TABLE public.heart_market_observations (
  run_id uuid NOT NULL REFERENCES public.heart_runs(id),
  project_id uuid NOT NULL REFERENCES public.projects(id),
  observed_at timestamptz NOT NULL,
  source_url text NOT NULL CHECK (source_url ~ '^https?://'),
  price_usd numeric CHECK (price_usd >= 0 AND price_usd < 'Infinity'::numeric),
  market_cap_usd numeric CHECK (market_cap_usd >= 0 AND market_cap_usd < 'Infinity'::numeric),
  raw_payload jsonb NOT NULL CHECK (jsonb_typeof(raw_payload) = 'object'),
  PRIMARY KEY (run_id, project_id),
  FOREIGN KEY (run_id, project_id) REFERENCES public.heart_snapshots(run_id, project_id)
);
CREATE INDEX heart_runs_latest ON public.heart_runs(methodology, as_of DESC, recorded_at DESC, id DESC) WHERE review_status = 'published';
CREATE INDEX heart_snapshot_history ON public.heart_snapshots(project_id, run_id);

CREATE FUNCTION public.reject_heart_mutation() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN RAISE EXCEPTION 'Heart history is append-only; publish a new run for corrections'; END;
$$;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['heart_runs','heart_snapshots','heart_market_observations'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated, service_role', t);
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated, service_role', t);
    EXECUTE format('CREATE TRIGGER immutable_heart_rows BEFORE UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.reject_heart_mutation()', t);
  END LOOP;
END $$;
CREATE POLICY published_heart_runs ON public.heart_runs FOR SELECT TO anon, authenticated USING (review_status = 'published');
CREATE POLICY published_heart_snapshots ON public.heart_snapshots FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.heart_runs r WHERE r.id = run_id AND r.review_status = 'published'));
CREATE POLICY published_heart_markets ON public.heart_market_observations FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.heart_runs r WHERE r.id = run_id AND r.review_status = 'published'));

-- Only the backend writer can call this. One RPC transaction publishes the entire
-- explicit cohort, input evidence, market observations, and calculated results.
CREATE FUNCTION public.publish_heart_run(document jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  rid uuid; existing jsonb; item jsonb; a jsonb; p jsonb; m jsonb; pid uuid;
  cap integer; initial integer; elapsed numeric; earned_hearts integer;
  remaining integer; core_done boolean; seen text[]; lineage text;
BEGIN
  IF jsonb_typeof(document) IS DISTINCT FROM 'object' OR
     jsonb_typeof(document->'projects') IS DISTINCT FROM 'array' OR
     jsonb_array_length(document->'projects') NOT BETWEEN 1 AND 1000 OR
     document->>'schema_version' IS DISTINCT FROM '1' THEN
    RAISE EXCEPTION 'Invalid publication envelope';
  END IF;
  -- Serialize same-key retries. A conflicting retry must never silently win.
  PERFORM pg_advisory_xact_lock(hashtextextended(document->>'run_key', 0));
  SELECT id, payload INTO rid, existing FROM public.heart_runs WHERE run_key = document->>'run_key';
  IF FOUND THEN
    IF existing <> document THEN RAISE EXCEPTION 'Conflicting run_key'; END IF;
    RETURN rid;
  END IF;
  INSERT INTO public.heart_runs(run_key, as_of, methodology, review_status, reviewed_by, policy_ref, payload)
  VALUES(document->>'run_key',(document->>'as_of')::timestamptz,document->>'methodology',
    document->>'review_status',document->>'reviewed_by',document->>'policy_ref',document) RETURNING id INTO rid;
  FOR item IN SELECT value FROM jsonb_array_elements(document->'projects') LOOP
    SELECT id INTO pid FROM public.projects WHERE slug = item->>'slug';
    IF pid IS NULL THEN RAISE EXCEPTION 'Unknown project: %', item->>'slug'; END IF;
    IF item->>'availability' = 'unavailable' THEN
      IF item->'assessment' IS NOT NULL AND item->'assessment' <> 'null'::jsonb THEN RAISE EXCEPTION 'Unavailable assessment must be null'; END IF;
      INSERT INTO public.heart_snapshots(run_id, project_id, availability, unavailable_reason)
      VALUES(rid,pid,'unavailable',item->>'unavailable_reason');
    ELSIF item->>'availability' = 'available' THEN
      IF item->>'unavailable_reason' IS NOT NULL THEN RAISE EXCEPTION 'Available project cannot have unavailable reason'; END IF;
      a := item->'assessment';
      IF jsonb_typeof(a) IS DISTINCT FROM 'object' OR
        jsonb_typeof(a->'promises') IS DISTINCT FROM 'array' OR
        jsonb_array_length(a->'promises') = 0 OR
        coalesce(length(trim(a->>'rationale')),0) = 0 OR
        coalesce(length(trim(a->>'recency_rationale')),0) = 0 THEN
        RAISE EXCEPTION 'Assessment needs promises and capacity/recency rationale';
      END IF;
      cap := (a->>'capacity')::integer; initial := (a->>'starting_allowance')::integer;
      elapsed := (a->>'years_since_fulfillment')::numeric;
      earned_hearts := 0; core_done := NULL; seen := ARRAY[]::text[];
      FOR p IN SELECT value FROM jsonb_array_elements(a->'promises') LOOP
        lineage := p->>'lineage';
        IF coalesce(length(trim(lineage)),0) = 0 OR lineage = ANY(seen) THEN RAISE EXCEPTION 'Missing or duplicate promise lineage'; END IF;
        seen := array_append(seen,lineage);
        IF p->>'state' IS NULL OR p->>'state' NOT IN ('unfulfilled','fulfilled','abandoned') OR
           p->>'reward' IS NULL OR p->>'reward' NOT IN ('0','1','2') OR
           jsonb_typeof(p->'core') IS DISTINCT FROM 'boolean' OR
           coalesce(length(trim(p->>'criteria')),0) = 0 OR
           coalesce(length(trim(p->>'rationale')),0) = 0 OR
           jsonb_typeof(p->'evidence') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'evidence') = 0 OR
           p->>'effective_at' IS NULL OR (p->>'effective_at')::timestamptz > (document->>'as_of')::timestamptz THEN
          RAISE EXCEPTION 'Invalid promise assessment';
        END IF;
        IF EXISTS(SELECT 1 FROM jsonb_array_elements(p->'evidence') e
          WHERE coalesce(e->>'url','') !~ '^https?://' OR coalesce(length(trim(e->>'summary')),0) = 0) THEN
          RAISE EXCEPTION 'Evidence needs source URL and summary';
        END IF;
        IF (p->>'core')::boolean THEN
          IF core_done IS NOT NULL OR (p->>'reward')::integer <> 0 THEN RAISE EXCEPTION 'Exactly one zero-reward core required'; END IF;
          core_done := p->>'state' = 'fulfilled';
        ELSIF p->>'state' = 'fulfilled' THEN earned_hearts := earned_hearts + (p->>'reward')::integer;
        END IF;
      END LOOP;
      remaining := greatest(0,initial - floor(greatest(0,elapsed-2)));
      INSERT INTO public.heart_snapshots(run_id,project_id,availability,capacity,starting_allowance,
        years_since_fulfillment,core_fulfilled,earned,allowance,filled,assessment)
      VALUES(rid,pid,'available',cap,initial,elapsed,core_done,earned_hearts,remaining,
        least(earned_hearts+remaining, CASE WHEN core_done THEN cap ELSE cap-1 END),a);
    ELSE RAISE EXCEPTION 'Unknown availability'; END IF;
    m := item->'market';
    IF m IS NOT NULL AND m <> 'null'::jsonb THEN
      IF (m->>'observed_at')::timestamptz > (document->>'as_of')::timestamptz THEN RAISE EXCEPTION 'Market observation is after run as_of'; END IF;
      INSERT INTO public.heart_market_observations(run_id,project_id,observed_at,source_url,price_usd,market_cap_usd,raw_payload)
      VALUES(rid,pid,(m->>'observed_at')::timestamptz,m->>'source_url',(m->>'price_usd')::numeric,
        (m->>'market_cap_usd')::numeric,m->'raw_payload');
    END IF;
  END LOOP;
  RETURN rid;
END $$;
REVOKE ALL ON FUNCTION public.publish_heart_run(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_heart_run(jsonb) TO service_role;
REVOKE ALL ON FUNCTION public.reject_heart_mutation() FROM PUBLIC, anon, authenticated;

-- Rank is market capitalization within this run's cohort, not a fair-value or
-- heart ranking. Ties share rank; absent market data has no rank.
CREATE VIEW public.heart_rankings WITH (security_invoker = true) AS
SELECT r.id AS run_id,r.as_of,r.recorded_at,r.methodology,p.slug,p.name,p.symbol,
 s.availability,s.unavailable_reason,s.capacity,s.earned,s.allowance,s.filled,s.assessment,
 m.price_usd,m.market_cap_usd,m.observed_at AS market_observed_at,m.source_url AS market_source_url,
 CASE WHEN m.market_cap_usd IS NOT NULL THEN rank() OVER
 (PARTITION BY r.id ORDER BY m.market_cap_usd DESC NULLS LAST) END AS market_cap_rank
FROM public.heart_runs r JOIN public.heart_snapshots s ON s.run_id=r.id
JOIN public.projects p ON p.id=s.project_id
LEFT JOIN public.heart_market_observations m ON m.run_id=s.run_id AND m.project_id=s.project_id
WHERE r.review_status='published';
GRANT SELECT ON public.heart_rankings TO anon,authenticated,service_role;
COMMIT;
