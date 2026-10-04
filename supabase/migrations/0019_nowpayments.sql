-- 0019 NOWPayments provider rail: link ledger rows to provider payments,
-- track provider payouts for approved withdrawals, atomic idempotent credit.
--
-- Design: wallet_transactions stays the single ledger. Provider references
-- ride along as (provider, provider_ref) with a partial uniqueness guard.
-- Payouts (withdrawals) get their own table keyed 1:1 to the ledger row.

-- 1) Provider linkage on the ledger ---------------------------------------
ALTER TABLE wallet_transactions
  ADD COLUMN IF NOT EXISTS provider TEXT NULL,
  ADD COLUMN IF NOT EXISTS provider_ref TEXT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_wtx_provider_ref
  ON wallet_transactions (provider, provider_ref)
  WHERE provider_ref IS NOT NULL AND provider_ref <> '';

CREATE INDEX IF NOT EXISTS idx_wtx_provider_ref
  ON wallet_transactions (provider, provider_ref);

-- 2) Provider payouts (one per approved withdrawal ledger row) -------------
CREATE TABLE IF NOT EXISTS provider_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  withdrawal_tx_id UUID NOT NULL UNIQUE REFERENCES wallet_transactions (id),
  user_id UUID NOT NULL REFERENCES profiles (id),
  provider TEXT NOT NULL DEFAULT 'nowpayments',
  batch_id TEXT NULL,
  asset TEXT NOT NULL,
  network TEXT NOT NULL,
  destination TEXT NOT NULL,
  amount NUMERIC(20, 2) NOT NULL CHECK (amount > 0),
  fee_estimate NUMERIC(20, 2) NULL,
  status TEXT NOT NULL DEFAULT 'creating'
    CHECK (status IN ('creating', 'pending_verification', 'processing', 'sending', 'finished', 'failed', 'cancelled')),
  provider_status TEXT NULL,
  tx_hash TEXT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payout_batch
  ON provider_payouts (provider, batch_id)
  WHERE batch_id IS NOT NULL AND batch_id <> '';

CREATE INDEX IF NOT EXISTS idx_payout_user ON provider_payouts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payout_status ON provider_payouts (status, updated_at);

-- 3) RLS: owners read own rows; all writes server-side (service role) -----
ALTER TABLE provider_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payout_owner_read ON provider_payouts;
CREATE POLICY payout_owner_read ON provider_payouts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS payout_admin_all ON provider_payouts;
CREATE POLICY payout_admin_all ON provider_payouts
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 4) Atomic idempotent provider credit ------------------------------------
-- Records the provider event and, when told the payment reached the
-- crediting state, completes the ledger row exactly once. Retried IPNs
-- converge to 'already_credited' without duplicating money.
CREATE OR REPLACE FUNCTION apply_provider_credit(
  p_provider TEXT,
  p_payment_id TEXT,
  p_order_id TEXT,
  p_user_id UUID,
  p_asset TEXT,
  p_network TEXT,
  p_pay_address TEXT,
  p_expected NUMERIC,
  p_credit_amount NUMERIC,
  p_mark_completed BOOLEAN,
  p_provider_status TEXT,
  p_tx_hash TEXT,
  p_payload JSONB
) RETURNS TEXT AS $$
DECLARE
  v_id UUID;
  v_state TEXT;
BEGIN
  SELECT id, status INTO v_id, v_state
  FROM wallet_transactions
  WHERE provider = p_provider AND provider_ref = p_payment_id
  FOR UPDATE;

  IF v_id IS NULL THEN
    INSERT INTO wallet_transactions
      (user_id, type, asset, amount, status, network, address, provider, provider_ref, meta)
    VALUES
      (p_user_id, 'deposit', p_asset, p_expected, 'pending', p_network, p_pay_address,
       p_provider, p_payment_id,
       jsonb_build_object('order_id', p_order_id, 'provider_status', p_provider_status))
    RETURNING id INTO v_id;
    v_state := 'pending';
  ELSE
    UPDATE wallet_transactions
    SET meta = COALESCE(meta, '{}'::jsonb)
        || jsonb_build_object('provider_status', p_provider_status, 'order_id', p_order_id)
        || CASE WHEN p_tx_hash IS NOT NULL AND p_tx_hash <> ''
                THEN jsonb_build_object('tx_hash', lower(p_tx_hash)) ELSE '{}'::jsonb END,
        address = CASE WHEN p_pay_address IS NOT NULL AND p_pay_address <> ''
                       THEN p_pay_address ELSE address END
    WHERE id = v_id;
  END IF;

  IF v_state = 'completed' THEN
    RETURN 'already_credited';
  END IF;

  IF p_mark_completed THEN
    UPDATE wallet_transactions
    SET status = 'completed',
        amount = p_credit_amount,
        completed_at = now(),
        tx_hash = CASE WHEN p_tx_hash IS NOT NULL AND p_tx_hash <> ''
                       THEN lower(p_tx_hash) ELSE tx_hash END,
        meta = COALESCE(meta, '{}'::jsonb)
          || jsonb_build_object('provider_status', p_provider_status,
                                'credited_amount', p_credit_amount::text,
                                'expected_amount', p_expected::text)
    WHERE id = v_id;
    RETURN 'credited';
  END IF;

  RETURN 'recorded';
EXCEPTION
  WHEN unique_violation THEN
    -- Lost a race with a concurrent callback: re-read and converge.
    SELECT id, status INTO v_id, v_state
    FROM wallet_transactions
    WHERE provider = p_provider AND provider_ref = p_payment_id;
    IF v_state = 'completed' THEN
      RETURN 'already_credited';
    END IF;
    RETURN 'recorded';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION apply_provider_credit(
  TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT,
  NUMERIC, NUMERIC, BOOLEAN, TEXT, TEXT, JSONB
) FROM PUBLIC;
