-- Community source intake. Does not write any published promise, run or outcome.
BEGIN;
CREATE TABLE public.community_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('promise','evidence','challenge')),
  project_slug text NOT NULL DEFAULT '' CHECK (length(project_slug) <= 100),
  project_name text NOT NULL CHECK (length(trim(project_name)) BETWEEN 2 AND 120),
  lineage text NOT NULL DEFAULT '' CHECK (length(lineage) <= 200),
  claim text NOT NULL CHECK (length(trim(claim)) BETWEEN 1 AND 2000),
  detail text NOT NULL CHECK (length(trim(detail)) BETWEEN 20 AND 4000),
  source_url text NOT NULL CHECK (source_url ~ '^https?://' AND length(source_url) <= 2000),
  source_date date,
  deadline text NOT NULL DEFAULT '' CHECK (length(deadline) <= 200),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','needs_info','rejected')),
  review_note text,
  CHECK (kind = 'promise' OR (project_slug <> '' AND lineage <> ''))
);
CREATE TABLE public.community_submission_activity (
  nonce uuid PRIMARY KEY,
  ip_hash text NOT NULL CHECK (ip_hash ~ '^[a-f0-9]{64}$'),
  payload jsonb NOT NULL,
  contribution_id uuid NOT NULL REFERENCES public.community_contributions(id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX community_submission_rate ON public.community_submission_activity(ip_hash, created_at DESC);
CREATE INDEX community_review_queue ON public.community_contributions(status, created_at DESC);
CREATE TABLE public.community_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id uuid NOT NULL REFERENCES public.community_contributions(id),
  status text NOT NULL CHECK (status IN ('accepted','needs_info','rejected')),
  note text NOT NULL CHECK (length(trim(note)) BETWEEN 10 AND 2000),
  reviewer text NOT NULL CHECK (length(trim(reviewer)) BETWEEN 2 AND 120),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE public.community_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_submission_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.community_contributions, public.community_submission_activity, public.community_reviews FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.community_contributions, public.community_submission_activity, public.community_reviews TO service_role;
-- Submission text and review history are not writable through the service REST API.
CREATE VIEW public.community_contributions_public WITH (security_barrier = true) AS
  SELECT id,kind,project_slug,project_name,lineage,claim,detail,source_url,source_date,deadline,
    created_at,status,review_note FROM public.community_contributions WHERE status = 'accepted';
REVOKE ALL ON public.community_contributions_public FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.community_contributions_public TO anon, authenticated, service_role;

CREATE FUNCTION public.submit_community_contribution(p_nonce uuid, p_ip_hash text, p_elapsed_ms integer, p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_prior record; v_id uuid; v_count integer;
BEGIN
  IF p_nonce IS NULL OR p_ip_hash IS NULL OR p_ip_hash !~ '^[a-f0-9]{64}$'
    OR p_elapsed_ms IS NULL OR p_elapsed_ms NOT BETWEEN 2000 AND 3600000
    OR p_payload IS NULL OR jsonb_typeof(p_payload) <> 'object'
    OR coalesce(p_payload->>'website','') <> '' THEN
    RETURN jsonb_build_object('outcome','rejected');
  END IF;
  -- Same nonce is serialized even if a caller supplies a different network.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_nonce::text, 13));
  SELECT * INTO v_prior FROM community_submission_activity WHERE nonce = p_nonce;
  IF FOUND THEN
    IF v_prior.ip_hash = p_ip_hash AND v_prior.payload = p_payload THEN
      RETURN jsonb_build_object('outcome','saved','id',v_prior.contribution_id);
    END IF;
    RETURN jsonb_build_object('outcome','conflict');
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_ip_hash, 14));
  DELETE FROM community_submission_activity WHERE created_at < now() - interval '30 days';
  SELECT count(*) INTO v_count FROM community_submission_activity
    WHERE ip_hash = p_ip_hash AND created_at > now() - interval '1 day';
  IF v_count >= 5 THEN RETURN jsonb_build_object('outcome','rate_limited'); END IF;
  INSERT INTO community_contributions(kind,project_slug,project_name,lineage,claim,detail,source_url,source_date,deadline)
    VALUES(p_payload->>'kind',p_payload->>'project_slug',p_payload->>'project_name',p_payload->>'lineage',
      p_payload->>'claim',p_payload->>'detail',p_payload->>'source_url',nullif(p_payload->>'source_date','')::date,p_payload->>'deadline')
    RETURNING id INTO v_id;
  INSERT INTO community_submission_activity(nonce,ip_hash,payload,contribution_id) VALUES(p_nonce,p_ip_hash,p_payload,v_id);
  RETURN jsonb_build_object('outcome','saved','id',v_id);
END;
$$;
CREATE FUNCTION public.review_community_contribution(p_id uuid, p_status text, p_note text, p_reviewer text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM id FROM community_contributions WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Contribution not found'; END IF;
  INSERT INTO community_reviews(contribution_id,status,note,reviewer) VALUES(p_id,p_status,p_note,p_reviewer);
  UPDATE community_contributions SET status = p_status, review_note = p_note WHERE id = p_id;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_community_contribution(uuid,text,integer,jsonb),
  public.review_community_contribution(uuid,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_community_contribution(uuid,text,integer,jsonb),
  public.review_community_contribution(uuid,text,text,text) TO service_role;
COMMIT;
