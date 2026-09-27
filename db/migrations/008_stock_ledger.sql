-- Stock ledger (Speculative Tech domain). Additive; no crypto tables touched.
-- Apply only through the reviewed migration process, not by a public route.
-- Mirrors 007's append-only envelope: stock_history_revisions is immutable once
-- recorded. valuation_models are versioned rows, never edits. Expectation gap
-- assessments are append-only model outputs, never observed facts.
BEGIN;

CREATE TABLE public.companies (
  slug text PRIMARY KEY CHECK (slug ~ '^[a-z0-9-]{1,60}$'),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 200),
  sector text NOT NULL CHECK (length(trim(sector)) BETWEEN 1 AND 120),
  listing text NOT NULL CHECK (listing IN ('public','private')),
  ticker text CHECK (ticker IS NULL OR ticker ~ '^[A-Z][A-Z0-9.\-]{0,9}$'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE public.stock_history_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_key text NOT NULL UNIQUE CHECK (length(trim(revision_key)) BETWEEN 1 AND 200),
  company_slug text NOT NULL REFERENCES public.companies(slug),
  previous_revision_id uuid REFERENCES public.stock_history_revisions(id),
  author text NOT NULL CHECK (length(trim(author)) > 0),
  events jsonb NOT NULL CHECK (jsonb_typeof(events) = 'array'),
  request jsonb NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX stock_history_latest ON public.stock_history_revisions(company_slug, recorded_at DESC, id DESC);

CREATE TABLE public.valuation_models (
  version text PRIMARY KEY CHECK (length(trim(version)) BETWEEN 1 AND 80),
  assumptions jsonb NOT NULL CHECK (jsonb_typeof(assumptions) = 'array'),
  methodology text NOT NULL CHECK (length(trim(methodology)) BETWEEN 1 AND 10000),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE public.expectation_gap_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug text NOT NULL REFERENCES public.companies(slug),
  model_version text NOT NULL REFERENCES public.valuation_models(version),
  as_of date NOT NULL,
  inputs jsonb NOT NULL CHECK (jsonb_typeof(inputs) = 'object'),
  embedded_expectations jsonb NOT NULL CHECK (jsonb_typeof(embedded_expectations) = 'array'),
  gap_summary text NOT NULL CHECK (length(trim(gap_summary)) BETWEEN 1 AND 10000),
  author text NOT NULL CHECK (length(trim(author)) > 0),
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX expectation_gap_latest ON public.expectation_gap_assessments(company_slug, model_version, as_of DESC, recorded_at DESC);

-- Append-only discipline, same as 007.
CREATE FUNCTION public.reject_stock_history_mutation() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$
BEGIN RAISE EXCEPTION 'Stock history is append-only'; END;
$$;
CREATE TRIGGER immutable_stock_history BEFORE UPDATE OR DELETE ON public.stock_history_revisions
FOR EACH ROW EXECUTE FUNCTION public.reject_stock_history_mutation();
CREATE TRIGGER no_truncate_stock_history BEFORE TRUNCATE ON public.stock_history_revisions
FOR EACH STATEMENT EXECUTE FUNCTION public.reject_stock_history_mutation();

CREATE FUNCTION public.reject_valuation_model_mutation() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$
BEGIN RAISE EXCEPTION 'Valuation models are versioned, never edited'; END;
$$;
CREATE TRIGGER immutable_valuation_models BEFORE UPDATE OR DELETE ON public.valuation_models
FOR EACH ROW EXECUTE FUNCTION public.reject_valuation_model_mutation();
CREATE TRIGGER no_truncate_valuation_models BEFORE TRUNCATE ON public.valuation_models
FOR EACH STATEMENT EXECUTE FUNCTION public.reject_valuation_model_mutation();

CREATE FUNCTION public.reject_expectation_gap_mutation() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$
BEGIN RAISE EXCEPTION 'Expectation gap assessments are append-only'; END;
$$;
CREATE TRIGGER immutable_expectation_gap BEFORE UPDATE OR DELETE ON public.expectation_gap_assessments
FOR EACH ROW EXECUTE FUNCTION public.reject_expectation_gap_mutation();
CREATE TRIGGER no_truncate_expectation_gap BEFORE TRUNCATE ON public.expectation_gap_assessments
FOR EACH STATEMENT EXECUTE FUNCTION public.reject_expectation_gap_mutation();

-- Read-only RLS for the public site; writes go through the pipeline only.
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_history_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valuation_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expectation_gap_assessments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.companies, public.stock_history_revisions,
  public.valuation_models, public.expectation_gap_assessments FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.companies, public.stock_history_revisions,
  public.valuation_models, public.expectation_gap_assessments TO anon, authenticated, service_role;
CREATE POLICY companies_read ON public.companies FOR SELECT USING (true);
CREATE POLICY stock_history_read ON public.stock_history_revisions FOR SELECT USING (true);
CREATE POLICY valuation_models_read ON public.valuation_models FOR SELECT USING (true);
CREATE POLICY expectation_gap_read ON public.expectation_gap_assessments FOR SELECT USING (true);

REVOKE ALL ON FUNCTION public.reject_stock_history_mutation(),
  public.reject_valuation_model_mutation(), public.reject_expectation_gap_mutation()
  FROM PUBLIC, anon, authenticated, service_role;

COMMIT;
