-- Reviewed verdict publications. V3 remains readable and publishable unchanged.
-- No existing run is updated and no active methodology is selected by this migration.
BEGIN;
ALTER FUNCTION public.publish_heart_run(jsonb) RENAME TO publish_heart_run_v3;
REVOKE ALL ON FUNCTION public.publish_heart_run_v3(jsonb) FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION public.verdict_time(v jsonb, latest timestamptz DEFAULT NULL, nullable boolean DEFAULT false)
RETURNS timestamptz LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE t timestamptz;
BEGIN
  IF nullable AND v = 'null'::jsonb THEN RETURN NULL; END IF;
  IF jsonb_typeof(v) IS DISTINCT FROM 'string' OR (v #>> '{}') !~ '^\d{4}-\d{2}-\d{2}T.*(Z|[+-]\d{2}:\d{2})$' THEN
    RAISE EXCEPTION 'Invalid verdict timestamp';
  END IF;
  t := (v #>> '{}')::timestamptz;
  IF NOT isfinite(t) OR (latest IS NOT NULL AND t > latest) THEN RAISE EXCEPTION 'Future verdict timestamp'; END IF;
  RETURN t;
END $$;
CREATE FUNCTION public.verdict_sources(items jsonb, required boolean)
RETURNS void LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE e jsonb;
BEGIN
  IF jsonb_typeof(items) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Invalid source list'; END IF;
  IF required AND jsonb_array_length(items) = 0 THEN RAISE EXCEPTION 'Missing evidence'; END IF;
  FOR e IN SELECT value FROM jsonb_array_elements(items) LOOP
    IF jsonb_typeof(e) IS DISTINCT FROM 'object' OR
      coalesce(e->>'url','') !~ '^https?://[^/@[:space:]]+([/:?#]|$)' OR
      coalesce(e->>'url','') ~ '^https?://[^/]*@' OR
      coalesce(length(trim(e->>'summary')),0) = 0 OR coalesce(length(trim(e->>'locator')),0) = 0 THEN
      RAISE EXCEPTION 'Source needs safe URL, summary and locator';
    END IF;
    PERFORM public.verdict_time(e->'published_at',NULL,true);
  END LOOP;
END $$;
CREATE FUNCTION public.validate_verdict_promise(p jsonb, snapshot_at timestamptz)
RETURNS void LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE k text; expected text; importance jsonb; tier_weight integer; assessed timestamptz;
  tr jsonb; recorded timestamptz; deadline jsonb; has_miss boolean := false;
BEGIN
  IF jsonb_typeof(p) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid promise object'; END IF;
  FOREACH k IN ARRAY ARRAY['lineage','claim_text','criteria','rationale','author'] LOOP
    IF jsonb_typeof(p->k) IS DISTINCT FROM 'string' OR coalesce(length(trim(p->>k)),0) = 0 THEN RAISE EXCEPTION 'Missing promise field: %',k; END IF;
  END LOOP;
  IF coalesce(p->>'claim_type','') NOT IN ('milestone','ongoing') OR jsonb_typeof(p->'core') IS DISTINCT FROM 'boolean' OR
    coalesce(p->>'attribution','') NOT IN ('issuer','community') OR
    coalesce(p->>'outcome','') NOT IN ('kept','unkept','pending','unknown') OR
    coalesce(p->>'lifecycle','') NOT IN ('current','retired','archived','completed') THEN RAISE EXCEPTION 'Invalid claim or outcome'; END IF;
  expected := CASE p->>'outcome' WHEN 'kept' THEN 'fulfilled' WHEN 'pending' THEN 'open' WHEN 'unknown' THEN 'unknown'
    ELSE CASE p->>'unkept_reason' WHEN 'lapsed' THEN 'lapsed' WHEN 'retired_unmet' THEN 'retired' WHEN 'missed' THEN 'missed' END END;
  IF expected IS NULL OR p->>'state' IS DISTINCT FROM expected OR
    (p->>'outcome' <> 'unkept' AND p->'unkept_reason' IS DISTINCT FROM 'null'::jsonb) THEN RAISE EXCEPTION 'State/outcome mismatch'; END IF;
  IF (p->>'unkept_reason' = 'lapsed' AND (p->>'claim_type' <> 'ongoing' OR p->>'lifecycle' <> 'current')) OR
    (p->>'unkept_reason' = 'retired_unmet' AND p->>'lifecycle' <> 'retired') OR
    (p->>'outcome' = 'pending' AND p->>'lifecycle' <> 'current') OR
    (p->>'outcome' = 'kept' AND p->>'lifecycle' = 'retired') THEN RAISE EXCEPTION 'Outcome/lifecycle mismatch'; END IF;
  PERFORM public.verdict_time(p->'effective_at',snapshot_at);
  assessed := public.verdict_time(p->'assessed_at',snapshot_at);
  PERFORM public.verdict_time(p->'observed_at',assessed,true);
  PERFORM public.verdict_time(p->'evidence_valid_until',NULL,true);
  PERFORM public.verdict_time(p->'obligation_end_at',snapshot_at,true);
  IF p->>'outcome' IN ('kept','unkept') AND p->'observed_at' = 'null'::jsonb THEN RAISE EXCEPTION 'Resolved outcome needs observation date'; END IF;
  IF p->>'claim_type' = 'ongoing' AND p->>'outcome' = 'kept' THEN
    IF p->>'lifecycle' = 'archived' OR
      (p->>'lifecycle' = 'completed' AND p->'obligation_end_at' = 'null'::jsonb) OR
      (p->>'lifecycle' = 'current' AND (p->'evidence_valid_until' = 'null'::jsonb OR (p->>'evidence_valid_until')::timestamptz < snapshot_at)) THEN
      RAISE EXCEPTION 'Ongoing kept needs current evidence or completed bounded obligation';
    END IF;
  END IF;
  importance := p->'importance';
  IF importance IS DISTINCT FROM 'null'::jsonb THEN
    tier_weight := CASE importance->>'tier' WHEN 'supporting' THEN 1 WHEN 'material' THEN 2 WHEN 'core' THEN 4 END;
    IF jsonb_typeof(importance) IS DISTINCT FROM 'object' OR tier_weight IS NULL OR
      jsonb_typeof(importance->'weight') IS DISTINCT FROM 'number' OR (importance->>'weight')::numeric <> tier_weight OR
      ((importance->>'tier' = 'core') IS DISTINCT FROM (p->>'core')::boolean) OR
      coalesce(length(trim(importance->>'rationale')),0) = 0 OR coalesce(length(trim(importance->>'author')),0) = 0 THEN
      RAISE EXCEPTION 'Invalid importance';
    END IF;
  END IF;
  IF coalesce(p->'classification'->>'primary','') NOT IN ('money','payments','platform','defi','privacy','interoperability','governance','real-world','unclassified') OR
    coalesce(length(trim(p->'admission'->>'obligation_id')),0) = 0 THEN RAISE EXCEPTION 'Missing category or independent obligation'; END IF;
  FOREACH k IN ARRAY ARRAY['classification','admission'] LOOP
    IF jsonb_typeof(p->k) IS DISTINCT FROM 'object' OR coalesce(length(trim(p->k->>'rationale')),0) = 0 OR
      coalesce(length(trim(p->k->>'author')),0) = 0 THEN RAISE EXCEPTION 'Missing % rationale/author',k; END IF;
  END LOOP;
  IF p ? 'reward' OR p ? 'reward_hearts' OR p ? 'parent_id' THEN RAISE EXCEPTION 'No rewards or scored child units'; END IF;
  PERFORM public.verdict_sources(p->'claim_sources',true);
  PERFORM public.verdict_sources(p->'outcome_evidence',p->>'outcome' IN ('kept','unkept'));
  deadline := p->'deadline';
  IF deadline IS DISTINCT FROM 'null'::jsonb THEN
    IF jsonb_typeof(deadline) IS DISTINCT FROM 'object' OR coalesce(deadline->>'kind','') NOT IN ('target','essential') THEN RAISE EXCEPTION 'Invalid deadline'; END IF;
    PERFORM public.verdict_time(deadline->'at');
    PERFORM public.verdict_sources(jsonb_build_array(deadline->'source'),true);
  END IF;
  IF p->>'unkept_reason' = 'missed' AND (deadline = 'null'::jsonb OR (deadline->>'at')::timestamptz > snapshot_at) THEN RAISE EXCEPTION 'Miss needs past sourced deadline'; END IF;
  IF jsonb_typeof(p->'transitions') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Explicit transitions required'; END IF;
  FOR tr IN SELECT value FROM jsonb_array_elements(p->'transitions') LOOP
    IF coalesce(tr->>'event','') NOT IN ('kept','lapsed','retired','missed','recovered','corrected') OR
      coalesce(length(trim(tr->>'rationale')),0) = 0 OR coalesce(length(trim(tr->>'author')),0) = 0 THEN RAISE EXCEPTION 'Invalid transition'; END IF;
    recorded := public.verdict_time(tr->'recorded_at',snapshot_at);
    PERFORM public.verdict_time(tr->'effective_at',recorded,true);
    PERFORM public.verdict_sources(tr->'evidence',true);
    IF tr->>'event' = 'missed' THEN has_miss := true; END IF;
  END LOOP;
  IF p->>'unkept_reason' = 'missed' AND NOT has_miss THEN RAISE EXCEPTION 'Miss needs recorded transition'; END IF;
  IF p->>'outcome' = 'kept' AND deadline->>'kind' = 'essential' AND has_miss THEN RAISE EXCEPTION 'Essential missed deadline remains unmet'; END IF;
END $$;

CREATE FUNCTION public.publish_heart_run(document jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE rid uuid; existing jsonb; item jsonb; a jsonb; p jsonb; pid uuid; stamp timestamptz;
  slugs text[] := ARRAY[]::text[]; ids text[]; obligations text[]; n integer; earned_hearts integer; cores integer; core_done boolean; k text;
BEGIN
  IF document->>'schema_version' = '3' THEN RETURN public.publish_heart_run_v3(document); END IF;
  IF jsonb_typeof(document) IS DISTINCT FROM 'object' OR document->>'schema_version' IS DISTINCT FROM '4' OR
    document->>'methodology' IS DISTINCT FROM 'promise delivery v4 (2026-09-26; reviewed importance, outcome coverage, separate lifecycle)' OR
    document->'versions'->>'policy' IS DISTINCT FROM 'promise-verdict-v1' OR
    document->'versions'->>'importance' IS DISTINCT FROM 'importance-1-2-4-v1' OR
    document->'versions'->>'taxonomy' IS DISTINCT FROM 'atlas-taxonomy-v1' OR
    coalesce(length(trim(document->'versions'->>'assignments')),0) = 0 OR
    coalesce(length(trim(document->'versions'->>'admission')),0) = 0 OR
    coalesce(length(trim(document->>'run_key')),0) NOT BETWEEN 1 AND 200 OR
    coalesce(document->>'review_status','') NOT IN ('draft','published') THEN RAISE EXCEPTION 'Invalid verdict envelope'; END IF;
  IF document->>'review_status' = 'published' AND (coalesce(length(trim(document->>'reviewed_by')),0) = 0 OR
    coalesce(length(trim(document->>'policy_ref')),0) = 0) THEN RAISE EXCEPTION 'Published verdict needs reviewer and policy'; END IF;
  stamp := public.verdict_time(document->'as_of');
  IF jsonb_typeof(document->'projects') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Missing projects'; END IF;
  IF jsonb_array_length(document->'projects') NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Invalid project count'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(document->>'run_key',0));
  SELECT id,payload INTO rid,existing FROM public.heart_runs WHERE run_key = document->>'run_key';
  IF FOUND THEN
    IF existing <> document THEN RAISE EXCEPTION 'Conflicting run_key'; END IF;
    RETURN rid;
  END IF;
  INSERT INTO public.heart_runs(run_key,as_of,methodology,review_status,reviewed_by,policy_ref,payload)
    VALUES(document->>'run_key',stamp,document->>'methodology',document->>'review_status',document->>'reviewed_by',document->>'policy_ref',document) RETURNING id INTO rid;
  FOR item IN SELECT value FROM jsonb_array_elements(document->'projects') LOOP
    IF coalesce(item->>'slug','') !~ '^[a-z0-9-]+$' OR item->>'slug' = ANY(slugs) THEN RAISE EXCEPTION 'Invalid/duplicate project'; END IF;
    slugs := array_append(slugs,item->>'slug');
    SELECT id INTO pid FROM public.projects WHERE slug = item->>'slug';
    IF pid IS NULL THEN RAISE EXCEPTION 'Unknown project'; END IF;
    IF item->>'availability' = 'unavailable' THEN
      IF item->'assessment' IS NOT NULL AND item->'assessment' <> 'null'::jsonb THEN RAISE EXCEPTION 'Unavailable assessment'; END IF;
      INSERT INTO public.heart_snapshots(run_id,project_id,availability,unavailable_reason) VALUES(rid,pid,'unavailable',item->>'unavailable_reason');
      CONTINUE;
    END IF;
    IF item->>'availability' IS DISTINCT FROM 'available' OR item->>'unavailable_reason' IS NOT NULL THEN RAISE EXCEPTION 'Invalid availability'; END IF;
    a := item->'assessment';
    IF jsonb_typeof(a->'promises') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Missing promises'; END IF;
    n := jsonb_array_length(a->'promises');
    IF n NOT BETWEEN 1 AND 1000 OR jsonb_typeof(a->'capacity') IS DISTINCT FROM 'number' OR (a->>'capacity')::numeric <> n OR
      a->'allowance' IS DISTINCT FROM '0'::jsonb THEN RAISE EXCEPTION 'Capacity/allowance mismatch'; END IF;
    FOREACH k IN ARRAY ARRAY['rationale','allowance_rationale','research_scope'] LOOP
      IF coalesce(length(trim(a->>k)),0) = 0 THEN RAISE EXCEPTION 'Missing assessment field: %',k; END IF;
    END LOOP;
    ids := ARRAY[]::text[]; obligations := ARRAY[]::text[]; earned_hearts := 0; cores := 0; core_done := false;
    FOR p IN SELECT value FROM jsonb_array_elements(a->'promises') LOOP
      PERFORM public.validate_verdict_promise(p,stamp);
      IF p->>'lineage' = ANY(ids) OR p->'admission'->>'obligation_id' = ANY(obligations) THEN RAISE EXCEPTION 'Duplicate independent obligation'; END IF;
      ids := array_append(ids,p->>'lineage'); obligations := array_append(obligations,p->'admission'->>'obligation_id');
      IF p->>'outcome' = 'kept' THEN earned_hearts := earned_hearts + 1; END IF;
      IF (p->>'core')::boolean THEN cores := cores + 1; core_done := p->>'outcome' = 'kept'; END IF;
    END LOOP;
    IF cores <> 1 THEN RAISE EXCEPTION 'Exactly one core required'; END IF;
    INSERT INTO public.heart_snapshots(run_id,project_id,availability,capacity,allowance,core_fulfilled,earned,filled,assessment)
      VALUES(rid,pid,'available',n,0,core_done,earned_hearts,earned_hearts,a);
  END LOOP;
  RETURN rid;
END $$;
REVOKE ALL ON FUNCTION public.verdict_time(jsonb,timestamptz,boolean), public.verdict_sources(jsonb,boolean),
  public.validate_verdict_promise(jsonb,timestamptz), public.publish_heart_run(jsonb) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.publish_heart_run(jsonb) TO service_role;
COMMIT;
