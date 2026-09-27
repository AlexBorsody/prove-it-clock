-- Promise event history. Additive to 001/002/006; no scoring changes.
-- Apply only through the reviewed migration process, not by a public route.
BEGIN;
CREATE TABLE public.promise_history_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_key text NOT NULL UNIQUE CHECK (length(trim(revision_key)) BETWEEN 1 AND 200),
  project_slug text NOT NULL REFERENCES public.projects(slug),
  ledger_run_id uuid NOT NULL REFERENCES public.heart_runs(id),
  previous_revision_id uuid REFERENCES public.promise_history_revisions(id),
  author text NOT NULL CHECK (length(trim(author)) > 0),
  events jsonb NOT NULL CHECK (jsonb_typeof(events) = 'array'),
  request jsonb NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX promise_history_latest ON public.promise_history_revisions(project_slug,recorded_at DESC,id DESC);
ALTER TABLE public.promise_history_revisions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.promise_history_revisions FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.promise_history_revisions TO anon,authenticated,service_role;
CREATE POLICY promise_history_read ON public.promise_history_revisions FOR SELECT USING (true);

CREATE FUNCTION public.reject_promise_history_mutation() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$
BEGIN RAISE EXCEPTION 'Promise history is append-only'; END;
$$;
CREATE TRIGGER immutable_promise_history BEFORE UPDATE OR DELETE ON public.promise_history_revisions
FOR EACH ROW EXECUTE FUNCTION public.reject_promise_history_mutation();
CREATE TRIGGER no_truncate_promise_history BEFORE TRUNCATE ON public.promise_history_revisions
FOR EACH STATEMENT EXECUTE FUNCTION public.reject_promise_history_mutation();

CREATE FUNCTION public.valid_promise_event_date(value text) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE SET search_path='' AS $$
DECLARE expanded text; parsed date;
BEGIN
  IF value IS NULL OR value !~ '^[0-9]{4}(-[0-9]{2}){0,2}$' THEN RETURN false; END IF;
  expanded := value || CASE length(value) WHEN 4 THEN '-01-01' WHEN 7 THEN '-01' ELSE '' END;
  parsed := expanded::date;
  RETURN to_char(parsed,'YYYY-MM-DD')=expanded;
EXCEPTION WHEN OTHERS THEN RETURN false;
END;
$$;

-- One project history revision is published atomically. Prior events are copied
-- unchanged; only newly supplied events receive a server-generated recordedAt.
CREATE FUNCTION public.publish_promise_history(document jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  rid uuid; previous public.promise_history_revisions; existing public.promise_history_revisions;
  event jsonb; prior jsonb; promise jsonb; assessment jsonb; run public.heart_runs;
  accumulated jsonb := '[]'::jsonb; ledger public.heart_runs; stamp timestamptz; field text;
BEGIN
  IF jsonb_typeof(document) IS DISTINCT FROM 'object' OR document->>'schema_version' IS DISTINCT FROM '1'
    OR jsonb_typeof(document->'events') IS DISTINCT FROM 'array'
    OR jsonb_array_length(document->'events') NOT BETWEEN 1 AND 500
    OR document::text IS NULL OR octet_length(document::text)>1000000
    OR coalesce(length(trim(document->>'revision_key')),0) NOT BETWEEN 1 AND 200
    OR coalesce(length(trim(document->>'author')),0)=0
    OR NOT document ? 'previous_revision_id' THEN RAISE EXCEPTION 'Invalid history envelope'; END IF;
  FOREACH field IN ARRAY ARRAY['revision_key','project_slug','ledger_run_id','author'] LOOP
    IF jsonb_typeof(document->field) IS DISTINCT FROM 'string' THEN RAISE EXCEPTION 'History envelope field must be text: %',field; END IF;
  END LOOP;
  PERFORM pg_advisory_xact_lock(hashtextextended('promise-history:'||(document->>'project_slug'),0));
  SELECT * INTO existing FROM public.promise_history_revisions WHERE revision_key=document->>'revision_key';
  IF FOUND THEN
    IF existing.request<>document THEN RAISE EXCEPTION 'Conflicting history revision key'; END IF;
    RETURN existing.id;
  END IF;
  SELECT * INTO previous FROM public.promise_history_revisions WHERE project_slug=document->>'project_slug'
    ORDER BY recorded_at DESC,id DESC LIMIT 1;
  IF previous.id IS DISTINCT FROM (document->>'previous_revision_id')::uuid THEN RAISE EXCEPTION 'Stale history revision'; END IF;
  IF previous.id IS NOT NULL THEN accumulated:=previous.events; END IF;
  stamp:=clock_timestamp();
  SELECT * INTO ledger FROM public.heart_runs WHERE id=(document->>'ledger_run_id')::uuid AND review_status='published';
  IF NOT FOUND THEN RAISE EXCEPTION 'Published ledger run required'; END IF;
  SELECT s.assessment INTO assessment FROM public.heart_snapshots s JOIN public.projects p ON p.id=s.project_id
    WHERE s.run_id=ledger.id AND p.slug=document->>'project_slug' AND s.availability='available';
  IF assessment IS NULL THEN RAISE EXCEPTION 'Published project assessment required'; END IF;
  FOR event IN SELECT value FROM jsonb_array_elements(document->'events') LOOP
    FOREACH field IN ARRAY ARRAY['id','lineage','occurredOn','summary','author','kind'] LOOP
      IF jsonb_typeof(event->field) IS DISTINCT FROM 'string' THEN RAISE EXCEPTION 'Event field must be text: %',field; END IF;
    END LOOP;
    FOREACH field IN ARRAY ARRAY['url','title','publishedOn'] LOOP
      IF jsonb_typeof(event->'source'->field) IS DISTINCT FROM 'string' THEN RAISE EXCEPTION 'Source field must be text: %',field; END IF;
    END LOOP;
    FOREACH field IN ARRAY ARRAY['quote','locator'] LOOP
      IF event->'source' ? field AND jsonb_typeof(event->'source'->field) IS DISTINCT FROM 'string' THEN RAISE EXCEPTION 'Invalid source location or quote'; END IF;
    END LOOP;
    IF jsonb_typeof(event) IS DISTINCT FROM 'object' OR event ? 'recordedAt'
      OR coalesce(event->>'id','') !~ '^[a-zA-Z0-9_-]{1,160}$'
      OR coalesce(length(trim(event->>'summary')),0)=0
      OR coalesce(length(trim(event->>'author')),0)=0
      OR NOT public.valid_promise_event_date(event->>'occurredOn')
      OR NOT public.valid_promise_event_date(event->'source'->>'publishedOn')
      OR coalesce(event->'source'->>'url','') !~ '^https?://[^/@[:space:]]+([/?#][^[:space:]]*)?$'
      OR coalesce(length(trim(event->'source'->>'title')),0)=0 THEN RAISE EXCEPTION 'Invalid sourced event'; END IF;
    IF ((event->>'occurredOn')||CASE length(event->>'occurredOn') WHEN 4 THEN '-01-01' WHEN 7 THEN '-01' ELSE '' END)::date > (stamp AT TIME ZONE 'UTC')::date
      OR ((event->'source'->>'publishedOn')||CASE length(event->'source'->>'publishedOn') WHEN 4 THEN '-01-01' WHEN 7 THEN '-01' ELSE '' END)::date > (stamp AT TIME ZONE 'UTC')::date THEN RAISE EXCEPTION 'Event/source date is in the future'; END IF;
    IF EXISTS(SELECT 1 FROM jsonb_array_elements(accumulated) e WHERE e->>'id'=event->>'id') THEN RAISE EXCEPTION 'Duplicate event identity'; END IF;
    SELECT p INTO promise FROM jsonb_array_elements(assessment->'promises') p WHERE p->>'lineage'=event->>'lineage';
    IF promise IS NULL THEN RAISE EXCEPTION 'Unknown promise lineage'; END IF;
    CASE event->>'kind'
      WHEN 'promise_stated' THEN
        IF event->>'claimType' IS DISTINCT FROM promise->>'claim_type'
          OR jsonb_typeof(event->'speaker') IS DISTINCT FROM 'string'
          OR coalesce(length(trim(event->>'speaker')),0)=0
          OR EXISTS(SELECT 1 FROM jsonb_array_elements(accumulated) e WHERE e->>'lineage'=event->>'lineage' AND e->>'kind'='promise_stated')
          THEN RAISE EXCEPTION 'Invalid or duplicate original statement'; END IF;
      WHEN 'promise_repeated' THEN
        IF jsonb_typeof(event->'originalId') IS DISTINCT FROM 'string' OR coalesce(event->>'wordingChange','') NOT IN ('same','narrowed','expanded') THEN RAISE EXCEPTION 'Repeated statement needs wording change'; END IF;
        SELECT e INTO prior FROM jsonb_array_elements(accumulated) e WHERE e->>'id'=event->>'originalId'
          AND e->>'lineage'=event->>'lineage' AND e->>'kind'='promise_stated';
        IF prior IS NULL THEN RAISE EXCEPTION 'Repeated statement needs its original'; END IF;
      WHEN 'evidence' THEN
        IF coalesce(event->>'stance','') NOT IN ('supports','refutes','context')
          OR jsonb_typeof(event->'provenance') IS DISTINCT FROM 'array'
          OR jsonb_array_length(event->'provenance')=0
          OR EXISTS(SELECT 1 FROM jsonb_array_elements(event->'provenance') p WHERE jsonb_typeof(p)<>'string' OR length(trim(p#>>'{}'))=0)
          THEN RAISE EXCEPTION 'Evidence needs stance and provenance'; END IF;
      WHEN 'assessment' THEN
        SELECT * INTO run FROM public.heart_runs WHERE id=(event->>'runId')::uuid AND review_status='published';
        SELECT p INTO promise FROM public.heart_snapshots s JOIN public.projects project ON project.id=s.project_id,
          LATERAL jsonb_array_elements(s.assessment->'promises') p
          WHERE s.run_id=run.id AND project.slug=document->>'project_slug' AND p->>'lineage'=event->>'lineage';
        IF run.id IS NULL OR promise IS NULL OR run.methodology NOT LIKE 'hearts promise-heart rule v3 (%'
          OR event->>'methodology' IS DISTINCT FROM run.methodology OR event->>'state' IS DISTINCT FROM promise->>'state'
          OR event->>'occurredOn' IS DISTINCT FROM to_char(run.recorded_at AT TIME ZONE 'UTC','YYYY-MM-DD')
          OR coalesce(event->>'state','') NOT IN ('open','fulfilled','lapsed','retired')
          OR NOT event ? 'supersedes' OR jsonb_typeof(event->'supersedes') NOT IN ('null','string') THEN RAISE EXCEPTION 'Assessment must match its actual published run and publication date'; END IF;
        IF event->>'supersedes' IS NOT NULL THEN
          SELECT e INTO prior FROM jsonb_array_elements(accumulated) e WHERE e->>'id'=event->>'supersedes'
            AND e->>'kind'='assessment' AND e->>'lineage'=event->>'lineage';
          IF prior IS NULL OR jsonb_typeof(event->'correctionReason') IS DISTINCT FROM 'string' OR coalesce(length(trim(event->>'correctionReason')),0)=0
            OR EXISTS(SELECT 1 FROM jsonb_array_elements(accumulated) e WHERE e->>'supersedes'=event->>'supersedes')
            THEN RAISE EXCEPTION 'Invalid assessment correction'; END IF;
        END IF;
      ELSE RAISE EXCEPTION 'Unknown event kind';
    END CASE;
    accumulated:=accumulated||jsonb_build_array(event||jsonb_build_object('recordedAt',stamp));
  END LOOP;
  INSERT INTO public.promise_history_revisions(revision_key,project_slug,ledger_run_id,previous_revision_id,author,events,request,recorded_at)
    VALUES(document->>'revision_key',document->>'project_slug',ledger.id,previous.id,document->>'author',accumulated,document,stamp)
    RETURNING id INTO rid;
  RETURN rid;
END;
$$;
REVOKE ALL ON FUNCTION public.publish_promise_history(jsonb),public.reject_promise_history_mutation(),public.valid_promise_event_date(text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.publish_promise_history(jsonb) TO service_role;
COMMIT;
