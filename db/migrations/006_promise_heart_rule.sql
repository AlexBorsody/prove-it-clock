-- 006: promise-heart rule (adopted 2026-09-25). One promise = one heart.
--
-- Capacity is no longer a fixed tier: it equals the promise count.
-- Rewards are gone (every fulfilled promise earns exactly one heart) and
-- allowance is gone (always 0). The core promise stays as the labeled
-- "main promise" but no longer gates the score.
--
-- Table CHECKs are relaxed so existing rows keep passing; the new
-- invariants are enforced in publish_heart_run for schema_version 3.
BEGIN;

-- Drop every CHECK on heart_snapshots (auto-named; tiers + allowance bands
-- no longer apply) and re-add the relaxed set.
DO $$ DECLARE c text; BEGIN
  FOR c IN SELECT conname FROM pg_constraint
           WHERE conrelid = 'public.heart_snapshots'::regclass AND contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE public.heart_snapshots DROP CONSTRAINT %I', c);
  END LOOP;
END $$;

ALTER TABLE public.heart_snapshots
  ADD CONSTRAINT heart_snapshots_capacity_check CHECK (capacity IS NULL OR capacity > 0),
  ADD CONSTRAINT heart_snapshots_filled_check CHECK (filled >= 0 AND (capacity IS NULL OR filled <= capacity)),
  ADD CONSTRAINT heart_snapshots_consistency_check CHECK (
    (availability = 'unavailable' AND length(trim(unavailable_reason)) > 0 AND unavailable_reason IS NOT NULL
      AND capacity IS NULL AND allowance IS NULL
      AND core_fulfilled IS NULL AND earned IS NULL AND filled IS NULL AND assessment IS NULL)
    OR (availability = 'available' AND unavailable_reason IS NULL
      AND capacity IS NOT NULL AND allowance IS NOT NULL
      AND core_fulfilled IS NOT NULL AND earned IS NOT NULL AND filled IS NOT NULL
      AND assessment IS NOT NULL));

-- Promise-heart rule: earned counts fulfilled promises, one each. Capacity
-- is the promise count; allowance is 0; no reward weighting; the core
-- promise is a label, not a gate. Schema version 3.
CREATE OR REPLACE FUNCTION public.publish_heart_run(document jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  rid uuid; existing jsonb; item jsonb; a jsonb; p jsonb; m jsonb; pid uuid;
  cap integer; n_promises integer; earned_hearts integer;
  core_done boolean; seen text[]; lineage text; st text;
BEGIN
  IF jsonb_typeof(document) IS DISTINCT FROM 'object' OR
     jsonb_typeof(document->'projects') IS DISTINCT FROM 'array' OR
     jsonb_array_length(document->'projects') NOT BETWEEN 1 AND 1000 OR
     document->>'schema_version' IS DISTINCT FROM '3' THEN
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
        jsonb_array_length(a->'promises') > 1000 OR
        coalesce(length(trim(a->>'rationale')),0) = 0 OR
        coalesce(length(trim(a->>'allowance_rationale')),0) = 0 THEN
        RAISE EXCEPTION 'Assessment needs promises, rationale and allowance rationale';
      END IF;
      cap := (a->>'capacity')::integer;
      n_promises := jsonb_array_length(a->'promises');
      -- Promise-heart rule: capacity is the promise count; allowance is gone.
      IF cap IS NULL OR cap <> n_promises THEN RAISE EXCEPTION 'Capacity must equal the promise count'; END IF;
      IF coalesce((a->>'allowance')::integer, -1) <> 0 THEN RAISE EXCEPTION 'Allowance must be 0'; END IF;
      earned_hearts := 0; core_done := NULL; seen := ARRAY[]::text[];
      FOR p IN SELECT value FROM jsonb_array_elements(a->'promises') LOOP
        lineage := p->>'lineage';
        IF coalesce(length(trim(lineage)),0) = 0 OR lineage = ANY(seen) THEN RAISE EXCEPTION 'Missing or duplicate promise lineage'; END IF;
        seen := array_append(seen,lineage);
        st := p->>'state';
        -- v3 publishes canonical states only. The legacy "active" (earning
        -- sense) collides with the canonical in-progress sense and is
        -- rejected at the boundary; relabel before publishing.
        IF st = 'unfulfilled' THEN st := 'open';
        ELSIF st = 'active' THEN RAISE EXCEPTION 'Ambiguous promise state: relabel active before publishing';
        END IF;
        IF st IS NULL OR st NOT IN ('open','active','fulfilled','lapsed','retired') OR
           p->>'claim_type' IS NULL OR p->>'claim_type' NOT IN ('milestone','ongoing') OR
           (p->>'claim_type' = 'milestone' AND st = 'lapsed') OR
           (p ? 'reward') OR
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
        -- One promise = one heart: every fulfilled promise earns exactly one.
        IF st = 'fulfilled' THEN earned_hearts := earned_hearts + 1; END IF;
        IF (p->>'core')::boolean THEN
          IF core_done IS NOT NULL THEN RAISE EXCEPTION 'At most one core promise'; END IF;
          core_done := st = 'fulfilled';
        END IF;
      END LOOP;
      IF core_done IS NULL THEN RAISE EXCEPTION 'Missing core promise'; END IF;
      INSERT INTO public.heart_snapshots(run_id,project_id,availability,capacity,allowance,
        core_fulfilled,earned,filled,assessment)
      VALUES(rid,pid,'available',cap,0,core_done,earned_hearts,earned_hearts,a);
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
COMMIT;
