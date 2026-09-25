-- 005: canonical promise states in publish_heart_run.
--
-- Decided 2026-09-25: the canonical promise states are
-- open / active / fulfilled / lapsed / retired. The writer RPC must agree
-- with the TypeScript arithmetic (src/lib/hearts.ts): only "fulfilled"
-- earns hearts, and legacy publication values normalize at the boundary
-- ("unfulfilled" -> "open", the old earning "active" -> "fulfilled").
--
-- The stored assessment JSONB is kept verbatim (history is never
-- rewritten); only the derived earned/core_fulfilled columns use the
-- normalized state.
--
-- NOTE on the "active" collision: every stored "active" to date means the
-- legacy earning sense (= fulfilled). The in-progress sense of canonical
-- "active" has no stored instances and must not be published until a
-- backfill relabels stored rows.

CREATE OR REPLACE FUNCTION public.publish_heart_run(document jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  rid uuid; existing jsonb; item jsonb; a jsonb; p jsonb; m jsonb; pid uuid;
  cap integer; present integer; earned_hearts integer;
  core_done boolean; seen text[]; lineage text; st text;
BEGIN
  IF jsonb_typeof(document) IS DISTINCT FROM 'object' OR
     jsonb_typeof(document->'projects') IS DISTINCT FROM 'array' OR
     jsonb_array_length(document->'projects') NOT BETWEEN 1 AND 1000 OR
     document->>'schema_version' IS DISTINCT FROM '2' THEN
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
        coalesce(length(trim(a->>'allowance_rationale')),0) = 0 THEN
        RAISE EXCEPTION 'Assessment needs promises, rationale and allowance rationale';
      END IF;
      cap := (a->>'capacity')::integer; present := (a->>'allowance')::integer;
      earned_hearts := 0; core_done := NULL; seen := ARRAY[]::text[];
      FOR p IN SELECT value FROM jsonb_array_elements(a->'promises') LOOP
        lineage := p->>'lineage';
        IF coalesce(length(trim(lineage)),0) = 0 OR lineage = ANY(seen) THEN RAISE EXCEPTION 'Missing or duplicate promise lineage'; END IF;
        seen := array_append(seen,lineage);
        -- Canonical states, with legacy publication values normalized at the
        -- boundary exactly like the TypeScript arithmetic does.
        st := p->>'state';
        IF st = 'unfulfilled' THEN st := 'open';
        ELSIF st = 'active' THEN st := 'fulfilled';
        END IF;
        IF st IS NULL OR st NOT IN ('open','active','fulfilled','lapsed','retired') OR
           p->>'claim_type' IS NULL OR p->>'claim_type' NOT IN ('milestone','ongoing') OR
           (p->>'claim_type' = 'milestone' AND st = 'lapsed') OR
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
          core_done := st = 'fulfilled';
        ELSIF st = 'fulfilled' THEN earned_hearts := earned_hearts + (p->>'reward')::integer;
        END IF;
      END LOOP;
      IF core_done IS NULL THEN RAISE EXCEPTION 'Missing core promise'; END IF;
      INSERT INTO public.heart_snapshots(run_id,project_id,availability,capacity,allowance,
        core_fulfilled,earned,filled,assessment)
      VALUES(rid,pid,'available',cap,present,core_done,earned_hearts,
        least(earned_hearts+present, CASE WHEN core_done THEN cap ELSE cap-1 END),a);
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
