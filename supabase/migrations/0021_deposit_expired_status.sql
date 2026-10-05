-- Allow the terminal provider state 'expired' on ledger rows.
-- Automatic NOWPayments deposits must reflect provider truth: waiting /
-- confirming / confirmed stay pending, finished completes, failed stays
-- failed, and expired becomes expired (previously impossible, which forced
-- expired provider payments to sit at pending forever).
DO $$
DECLARE cname text;
BEGIN
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'public.wallet_transactions'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%pending%'
    AND pg_get_constraintdef(oid) LIKE '%cancelled%';
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.wallet_transactions DROP CONSTRAINT %I', cname);
  END IF;
END $$;

ALTER TABLE public.wallet_transactions
  ADD CONSTRAINT wallet_transactions_status_check
  CHECK (status in ('pending','processing','completed','failed','cancelled','expired'));
