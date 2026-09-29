-- Axiora Protocol: ledger safety hardening (run AFTER 0004 in SQL editor).
-- Idempotent by design (IF NOT EXISTS / DROP IF EXISTS).

-- One blockchain transaction credits exactly once: duplicate detection on
-- tx_hash for all completed chain-observed rows. NULL hashes (manual or
-- off-chain rows) are unaffected by the partial unique index.
create unique index if not exists uq_wtx_tx_hash
  on public.wallet_transactions (tx_hash)
  where tx_hash is not null;

-- Withdrawal guardrails at the database layer (mirrors server validation in
-- src/lib/actions.ts). Amounts stay NUMERIC; nothing here moves funds.
do $$ begin
  alter table public.wallet_transactions
    add constraint wtx_withdrawal_min
    check (type <> 'withdrawal' or amount >= 1);
exception when duplicate_object then null;
end $$;

-- Faster reservation accounting: pending/processing outgoing holds per user.
create index if not exists idx_wtx_user_type_status
  on public.wallet_transactions (user_id, type, status);
