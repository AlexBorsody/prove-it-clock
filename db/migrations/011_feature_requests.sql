-- Anonymous public ideas and atomic voting. Independent of migration 010.
BEGIN;
CREATE TABLE public.feature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 3 AND 120),
  body text NOT NULL CHECK (length(trim(body)) BETWEEN 10 AND 4000),
  why text NOT NULL DEFAULT '' CHECK (length(why) <= 1500),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','considering','planned','building','shipped','declined')),
  public boolean NOT NULL DEFAULT true,
  upvotes integer NOT NULL DEFAULT 0 CHECK (upvotes >= 0),
  user_id uuid
);
CREATE TABLE public.feature_request_votes (
  request_id uuid NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  ip_hash text NOT NULL CHECK (ip_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (request_id, ip_hash)
);
CREATE TABLE public.feature_request_activity (
  nonce uuid PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('request','vote')),
  ip_hash text NOT NULL CHECK (ip_hash ~ '^[a-f0-9]{64}$'),
  elapsed_ms integer NOT NULL,
  outcome text NOT NULL,
  request_id uuid REFERENCES public.feature_requests(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX feature_activity_rate ON public.feature_request_activity(ip_hash, created_at DESC);
CREATE INDEX feature_public_board ON public.feature_requests(created_at DESC) WHERE public;
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_request_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_request_activity ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.feature_requests, public.feature_request_votes, public.feature_request_activity FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.feature_requests, public.feature_request_votes, public.feature_request_activity TO service_role;
-- Operators can hide abusive comments. Network hashes never enter the public view.
CREATE VIEW public.feature_requests_public WITH (security_barrier = true) AS
  SELECT id, title, body, why, status, upvotes, created_at FROM public.feature_requests WHERE public = true;
REVOKE ALL ON public.feature_requests_public FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.feature_requests_public TO anon, authenticated, service_role;

CREATE FUNCTION public.submit_feature_feedback(p_kind text, p_nonce uuid, p_ip_hash text,
  p_elapsed_ms integer, p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_id uuid; v_votes integer; v_count integer; v_outcome text; v_prior record;
BEGIN
  IF p_kind IS NULL OR p_kind NOT IN ('request','vote') OR p_nonce IS NULL
     OR p_ip_hash IS NULL OR p_ip_hash !~ '^[a-f0-9]{64}$'
     OR p_elapsed_ms IS NULL OR p_elapsed_ms NOT BETWEEN 0 AND 600000
     OR p_payload IS NULL OR jsonb_typeof(p_payload) <> 'object' THEN
    RAISE EXCEPTION 'Invalid feedback request';
  END IF;
  -- Rate limits and votes stay atomic across serverless instances.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_ip_hash, 11));
  SELECT * INTO v_prior FROM feature_request_activity WHERE nonce = p_nonce;
  IF FOUND THEN
    IF v_prior.ip_hash = p_ip_hash AND v_prior.kind = p_kind AND v_prior.outcome = 'saved' THEN
      RETURN jsonb_build_object('outcome','saved','id',v_prior.request_id);
    END IF;
    RETURN jsonb_build_object('outcome','replayed');
  END IF;
  -- Short retention for abuse signals; no raw IPs or browser attributes are stored.
  DELETE FROM feature_request_activity WHERE created_at < now() - interval '30 days';
  SELECT count(*) INTO v_count FROM feature_request_activity
    WHERE ip_hash = p_ip_hash AND created_at > now() - interval '1 minute';
  IF v_count >= 100 THEN
    RETURN jsonb_build_object('outcome','rate_limited');
  END IF;
  IF p_kind = 'request' THEN
    SELECT count(*) INTO v_count FROM feature_request_activity WHERE ip_hash=p_ip_hash AND kind='request'
      AND outcome='saved' AND created_at > now() - interval '1 day';
    IF v_count >= 5 THEN v_outcome := 'rate_limited';
    ELSIF p_elapsed_ms < 2000 OR coalesce(p_payload->>'website','') <> '' THEN v_outcome := 'rejected';
    ELSE
      INSERT INTO feature_requests(title,body,why)
        VALUES(p_payload->>'title',p_payload->>'body',coalesce(p_payload->>'why',''))
        RETURNING id INTO v_id;
      v_outcome := 'saved';
    END IF;
  ELSE
    SELECT count(*) INTO v_count FROM feature_request_activity WHERE ip_hash=p_ip_hash AND kind='vote'
      AND outcome='voted' AND created_at > now() - interval '1 hour';
    IF v_count >= 30 THEN v_outcome := 'rate_limited';
    ELSE
      v_id := (p_payload->>'id')::uuid;
      -- Lock the request so moderation cannot race a vote against a hidden row.
      SELECT upvotes INTO v_votes FROM feature_requests WHERE id=v_id AND public FOR UPDATE;
      IF NOT FOUND THEN v_id:=null; v_outcome:='not_found';
      ELSE
        INSERT INTO feature_request_votes(request_id,ip_hash) VALUES(v_id,p_ip_hash) ON CONFLICT DO NOTHING;
        IF FOUND THEN
          UPDATE feature_requests SET upvotes=upvotes+1 WHERE id=v_id RETURNING upvotes INTO v_votes;
          v_outcome:='voted';
        ELSE v_outcome:='already_voted'; END IF;
      END IF;
    END IF;
  END IF;
  INSERT INTO feature_request_activity(nonce,kind,ip_hash,elapsed_ms,outcome,request_id)
    VALUES(p_nonce,p_kind,p_ip_hash,p_elapsed_ms,v_outcome,v_id);
  RETURN jsonb_build_object('outcome',v_outcome,'id',v_id,'upvotes',v_votes);
END;
$$;
REVOKE ALL ON FUNCTION public.submit_feature_feedback(text,uuid,text,integer,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_feature_feedback(text,uuid,text,integer,jsonb) TO service_role;
COMMIT;
