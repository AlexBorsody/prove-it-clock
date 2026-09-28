-- Reserve a notification before contacting the push provider. Existing receipts
-- remain sent; new callers explicitly claim pending with no delivered timestamp.
BEGIN;

ALTER TABLE public.push_deliveries
  DROP CONSTRAINT push_deliveries_kind_check,
  ADD CONSTRAINT push_deliveries_kind_check
    CHECK (kind IN ('status_change', 'news_mention', 'resolution_likely')),
  ADD COLUMN delivery_status text NOT NULL DEFAULT 'sent'
    CHECK (delivery_status IN ('pending', 'sent')),
  ALTER COLUMN delivered_at DROP NOT NULL,
  ADD CONSTRAINT push_delivery_status_timestamp CHECK (
    (delivery_status = 'pending' AND delivered_at IS NULL)
    OR (delivery_status = 'sent' AND delivered_at IS NOT NULL)
  );

COMMENT ON COLUMN public.push_deliveries.delivery_status IS
  'Pending reserves the unique subscription/revision/kind before sending. Transport or receipt uncertainty stays pending and is not retried automatically; operator review is required. Sent means the push provider accepted it, not that the device displayed it.';

COMMIT;
