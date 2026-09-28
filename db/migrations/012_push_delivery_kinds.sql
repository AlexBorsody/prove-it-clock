-- Widen push_deliveries.kind to include the scanner's "likely decisive" tier.
--
-- The news scanner records coin-level "resolution" tier deliveries as
-- 'resolution_likely' (see app/src/lib/push.ts FanoutKind), but migration 009
-- constrained push_deliveries.kind to ('status_change', 'news_mention'), so
-- those inserts were rejected. Additive; no scoring or ledger changes.
-- Apply only through the reviewed migration process, not by a public route.
BEGIN;

DO $$
DECLARE
  cname text;
BEGIN
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'public.push_deliveries'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%status_change%';
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.push_deliveries DROP CONSTRAINT %I', cname);
  END IF;
  ALTER TABLE public.push_deliveries
    ADD CONSTRAINT push_deliveries_kind_check
    CHECK (kind IN ('status_change', 'news_mention', 'resolution_likely'));
END
$$;

COMMIT;
